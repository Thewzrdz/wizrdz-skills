/**
 * End-to-end x402 purchase test (Base Sepolia testnet)
 *
 * Prerequisites:
 *   1. Fund test wallet with testnet USDC at https://faucet.circle.com
 *      Wallet: 0x1edC08c3C7428a791973b96C35bf2aE425BEe0F6  (Base Sepolia)
 *   2. Fund test wallet with Base Sepolia ETH (for gas) at https://www.alchemy.com/faucets/base-sepolia
 *
 * Run:
 *   node scripts/test-buy.js
 */

import { wrapFetchWithPayment, createSigner } from 'x402-fetch';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia, base } from 'viem/chains';
import { createWalletClient, http } from 'viem';

const ENV = process.env.ENV || 'staging';
const BASE_URL = ENV === 'production'
  ? 'https://wizrdz-skills-gate.thewizrdz.workers.dev'
  : 'https://wizrdz-skills-gate-staging.thewizrdz.workers.dev';
const SKILL = 'client-website-handoff';  // cheapest: $2 USDC
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) { console.error('Set PRIVATE_KEY env var'); process.exit(1); }

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY);
  console.log('Buyer wallet:', account.address);

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  const fetchWithPayment = wrapFetchWithPayment(
    fetch,
    walletClient,
    BigInt(10_000_000), // max $10 USDC
  );

  const url = `${STAGING_URL}/skills/${SKILL}/SKILL.md`;
  console.log(`\nRequesting: ${url}`);
  console.log('Expecting 402 → auto-paying → 200...\n');

  try {
    const response = await fetchWithPayment(url);
    console.log('Status:', response.status);

    if (response.ok) {
      const text = await response.text();
      console.log('\n✓ Purchase successful! First 300 chars of SKILL.md:\n');
      console.log(text.slice(0, 300) + '...\n');
    } else {
      const body = await response.text();
      console.log('Response body:', body);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
