# wizrdz-skills — by Thewizrdz.io

Field-tested Claude Code skills from real engagements. Five runbooks across WordPress security,
DNS operations, federal IT job applications, and disciplined trading methodology.

## Skills

| Skill | Price (USDC) | What it does |
|---|---|---|
| `wordpress-malware-incident-response` | $5 | Full IR runbook for hacked WordPress: containment, forensic snapshot, self-healing backdoor detection (mu-plugins, wp_options payloads, malicious cron), eradication, hardening, Google reputation recovery, 14-day re-check. |
| `dns-migration-without-downtime` | $3 | Nameserver / Cloudflare / host migrations that don't silently break email. MX/SPF/DKIM/DMARC inventory before cutover, TTL staging, verification, rollback plan. |
| `client-website-handoff` | $2 | Clean project closeout: deliverables, ownership-first credential transfer, content-update docs, deployment/DNS/SSL notes, sign-off checklist, maintenance retainer offer. |
| `pre-registered-backtest-gate` | $5 | Pre-registration discipline for trading strategy backtests. Commit to success bar before touching data, run once, honor the result — stops p-hacking and strategy deployment without real evidence. |
| `federal-2210-star-application` | $3 | GS-2210 IT Security application runbook: resume formatting, USAJobs application, HR specialist screen, STAR panel interview with 5 real-engagement stories (malware IR, fleet ops, debugging, communication, risk). |

## Install (Claude Code plugin marketplace)

```
/plugin marketplace add thewizrdz/wizrdz-skills
```

Skills activate automatically when your conversation matches their territory, or invoke directly:

```
/smb-wordpress-ops:wordpress-malware-incident-response
/smb-wordpress-ops:dns-migration-without-downtime
/smb-wordpress-ops:client-website-handoff
/pre-registered-backtest-gate
/federal-2210-star-application
```

## Buy a single skill (x402 — AI-native micropayments)

Any AI agent that speaks [x402](https://x402.org) can purchase individual skills with USDC on Base.
No account, no subscription — pay per file.

```
GET https://wizrdz-skills.thewizrdz.workers.dev/skills/<name>/SKILL.md
```

The server returns HTTP 402 with payment requirements; the agent pays and retries.
See [`x402/`](./x402/) for the Cloudflare Worker source.

## Design principles

- **One self-contained SKILL.md per skill.** No scripts, no dependencies — nothing executes on your machine.
- **Defensive/remedial only.** Every skill has an explicit guardrails section.
- **From real engagements.** Steps from documented field work are stated plainly; standard practice is framed as such.

## About

Built by [Thewizrdz.io](https://thewizrdz.io) — WordPress security, DNS operations, and IT consulting for small businesses.

## License

Copyright © 2026 Thewizrdz.io. Purchased copies are licensed for use by the purchaser; redistribution or resale is not permitted.
