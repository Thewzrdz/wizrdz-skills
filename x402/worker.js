/**
 * x402 payment gate for wizrdz-skills SKILL.md files
 * Deploy: wrangler deploy
 * Docs: https://x402.org
 *
 * Env vars to set in Cloudflare dashboard (or wrangler.toml [vars]):
 *   PAYMENT_ADDRESS  — your Base mainnet wallet address (0x...)
 *   FACILITATOR_URL  — https://facilitator.x402.org (Coinbase's free verifier)
 */

const USDC_BASE = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const NETWORK   = 'base-mainnet';

const SKILLS = {
  'wordpress-malware-incident-response': { price: 5_000_000, desc: 'WordPress Malware IR Runbook — Thewizrdz.io' },
  'dns-migration-without-downtime':      { price: 3_000_000, desc: 'DNS Migration Without Downtime — Thewizrdz.io' },
  'client-website-handoff':             { price: 2_000_000, desc: 'Client Website Handoff Runbook — Thewizrdz.io' },
  'pre-registered-backtest-gate':        { price: 5_000_000, desc: 'Pre-Registered Backtest Gate — Thewizrdz.io' },
  'federal-2210-star-application':       { price: 3_000_000, desc: 'Federal 2210 STAR Application Runbook — Thewizrdz.io' },
};

// Skill file contents are stored as Worker KV or inlined at deploy time.
// See README for how to populate SKILL_KV namespace.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route: GET /skills/:name/SKILL.md
    const match = url.pathname.match(/^\/skills\/([^/]+)\/SKILL\.md$/);
    if (!match) {
      return new Response('Not found. Available: /skills/<name>/SKILL.md', { status: 404 });
    }

    const skillName = match[1];
    const skill = SKILLS[skillName];
    if (!skill) {
      return new Response(`Unknown skill: ${skillName}`, { status: 404 });
    }

    const paymentHeader = request.headers.get('X-Payment');

    // No payment header — return 402 with payment requirements
    if (!paymentHeader) {
      const requirements = {
        version: 'x402-v1',
        scheme: 'exact',
        network: NETWORK,
        maxAmountRequired: String(skill.price),
        resource: url.pathname,
        description: skill.desc,
        mimeType: 'text/markdown',
        payTo: env.PAYMENT_ADDRESS,
        maxTimeoutSeconds: 300,
        asset: USDC_BASE,
        extra: { name: skillName, version: '0.1.0' },
      };

      return new Response(
        JSON.stringify({ error: 'Payment required', x402: requirements }),
        {
          status: 402,
          headers: {
            'Content-Type': 'application/json',
            'X-Payment-Required': JSON.stringify(requirements),
          },
        }
      );
    }

    // Payment header present — verify with facilitator
    try {
      const facilitatorUrl = env.FACILITATOR_URL || 'https://facilitator.x402.org';
      const verifyRes = await fetch(`${facilitatorUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: JSON.parse(paymentHeader),
          requirements: {
            scheme: 'exact',
            network: NETWORK,
            maxAmountRequired: String(skill.price),
            resource: url.pathname,
            payTo: env.PAYMENT_ADDRESS,
            asset: USDC_BASE,
            maxTimeoutSeconds: 300,
          },
        }),
      });

      const result = await verifyRes.json();

      if (!result.isValid) {
        return new Response(
          JSON.stringify({ error: 'Payment invalid', reason: result.invalidReason }),
          { status: 402, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', detail: err.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Payment verified — serve the skill file from KV
    const content = await env.SKILL_KV?.get(skillName);
    if (!content) {
      return new Response('Skill content not found in KV. Run: npm run upload-skills', { status: 503 });
    }

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'X-Payment-Receipt': 'verified',
        'Cache-Control': 'no-store',
      },
    });
  },
};
