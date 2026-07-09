// Debug script — shows the raw 402 response and what X-PAYMENT looks like
import { createPaymentHeader, selectPaymentRequirements } from 'x402/client';
import { PaymentRequirementsSchema } from 'x402/types';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { createWalletClient, http } from 'viem';

const STAGING_URL = 'https://wizrdz-skills-gate-staging.thewizrdz.workers.dev';
const SKILL = 'client-website-handoff';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) { console.error('Set PRIVATE_KEY env var'); process.exit(1); }

const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http() });

const url = `${STAGING_URL}/skills/${SKILL}/SKILL.md`;

// Step 1: raw 402
const r1 = await fetch(url);
console.log('Step 1 — status:', r1.status);
const body = await r1.json();
console.log('Step 1 — body:', JSON.stringify(body, null, 2));

// Step 2: build payment header
const reqs = body.accepts.map(x => PaymentRequirementsSchema.parse(x));
const selected = selectPaymentRequirements(reqs, 'base-sepolia', 'exact');
console.log('\nStep 2 — selected requirement:', JSON.stringify(selected, null, 2));

const paymentHeader = await createPaymentHeader(walletClient, body.x402Version, selected);
console.log('\nStep 3 — X-PAYMENT header (first 200 chars):', paymentHeader.slice(0, 200));

// Step 4: hit facilitator directly to see raw error
const facilitatorRes = await fetch('https://x402.org/facilitator/settle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ paymentPayload: paymentHeader, paymentRequirements: selected }),
});
console.log('\nStep 4 — facilitator status:', facilitatorRes.status);
console.log('Step 4 — facilitator body:', await facilitatorRes.text());
