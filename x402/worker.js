/**
 * x402 payment gate for wizrdz-skills SKILL.md files
 * Deploy: wrangler deploy --env=""          (production, base-mainnet)
 *         wrangler deploy --env="staging"   (testnet, base-sepolia)
 */

const USDC_MAINNET = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const USDC_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

const SKILLS = {
  'wordpress-malware-incident-response': { price: 5_000_000, desc: 'WordPress Malware IR Runbook — Thewizrdz.io' },
  'dns-migration-without-downtime':      { price: 3_000_000, desc: 'DNS Migration Without Downtime — Thewizrdz.io' },
  'client-website-handoff':             { price: 2_000_000, desc: 'Client Website Handoff Runbook — Thewizrdz.io' },
  'pre-registered-backtest-gate':        { price: 5_000_000, desc: 'Pre-Registered Backtest Gate — Thewizrdz.io' },
  'federal-2210-star-application':       { price: 3_000_000, desc: 'Federal 2210 STAR Application Runbook — Thewizrdz.io' },
};

async function incrementStat(kv, skillName) {
  const key = `stats:${skillName}`;
  const current = parseInt(await kv.get(key) || '0', 10);
  await kv.put(key, String(current + 1));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const NETWORK   = env.NETWORK  || 'base-mainnet';
    const USDC_BASE = NETWORK === 'base-sepolia' ? USDC_SEPOLIA : USDC_MAINNET;

    // Route: GET /stats
    if (url.pathname === '/stats') {
      const stats = {};
      let totalSales = 0;
      let totalRevenue = 0;

      for (const [name, skill] of Object.entries(SKILLS)) {
        const count = parseInt(await env.SKILL_KV?.get(`stats:${name}`) || '0', 10);
        const revenue = (count * skill.price) / 1_000_000;
        stats[name] = { sales: count, price_usdc: skill.price / 1_000_000, revenue_usdc: revenue };
        totalSales += count;
        totalRevenue += revenue;
      }

      return new Response(
        JSON.stringify({ network: NETWORK, total_sales: totalSales, total_revenue_usdc: totalRevenue, skills: stats }, null, 2),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /skills/:name/SKILL.md
    const match = url.pathname.match(/^\/skills\/([^/]+)\/SKILL\.md$/);
    if (!match) {
      return new Response('Not found. Routes: /skills/<name>/SKILL.md  |  /stats', { status: 404 });
    }

    const skillName = match[1];
    const skill = SKILLS[skillName];
    if (!skill) {
      return new Response(`Unknown skill: ${skillName}`, { status: 404 });
    }

    const paymentHeader = request.headers.get('X-PAYMENT');

    // No payment — return x402 v1 compliant 402
    if (!paymentHeader) {
      const requirements = {
        scheme: 'exact',
        network: NETWORK,
        maxAmountRequired: String(skill.price),
        resource: url.href,
        description: skill.desc,
        mimeType: 'text/markdown',
        payTo: env.PAYMENT_ADDRESS,
        maxTimeoutSeconds: 300,
        asset: USDC_BASE,
        extra: { name: skillName, version: '0.1.0' },
      };

      return new Response(
        JSON.stringify({ x402Version: 1, error: 'Payment Required', accepts: [requirements] }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Payment header present — settle with facilitator
    try {
      const facilitatorUrl = env.FACILITATOR_URL || 'https://x402.org/facilitator';
      const requirements = {
        scheme: 'exact',
        network: NETWORK,
        maxAmountRequired: String(skill.price),
        resource: url.href,
        description: skill.desc,
        mimeType: 'text/markdown',
        payTo: env.PAYMENT_ADDRESS,
        maxTimeoutSeconds: 300,
        asset: USDC_BASE,
        extra: { name: skillName, version: '0.1.0' },
      };

      let paymentPayload;
      try {
        paymentPayload = JSON.parse(atob(paymentHeader));
      } catch {
        paymentPayload = JSON.parse(paymentHeader);
      }

      const settleRes = await fetch(`${facilitatorUrl}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPayload, paymentRequirements: requirements }),
      });

      const result = await settleRes.json();

      if (!settleRes.ok || result.error) {
        return new Response(
          JSON.stringify({ x402Version: 1, error: result.error || 'Payment settlement failed' }),
          { status: 402, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', detail: err.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Settled — increment counter and serve skill
    await incrementStat(env.SKILL_KV, skillName);

    const content = await env.SKILL_KV?.get(skillName);
    if (!content) {
      return new Response('Skill content not found in KV.', { status: 503 });
    }

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'X-Payment-Response': 'settled',
        'Cache-Control': 'no-store',
      },
    });
  },
};
