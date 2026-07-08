# SMB WordPress Ops — by Thewizrdz.io

Field-tested Claude Code skills for freelancers and small agencies who run
WordPress sites for small businesses. Every skill is distilled from real
client engagements — not theory.

## What's in the bundle

| Skill | What it does |
|---|---|
| `wordpress-malware-incident-response` | Full IR runbook for hacked WordPress sites: containment, forensic snapshot, finding self-healing backdoors (mu-plugins, wp_options payloads, malicious cron), eradication, hardening, Google reputation recovery, 14-day re-check. |
| `dns-migration-without-downtime` | Nameserver / Cloudflare / host migrations that don't silently break client email. MX/SPF/DKIM/DMARC inventory before cutover, TTL staging, verification, rollback plan. |
| `client-website-handoff` | Clean project closeout: deliverables, ownership-first credential transfer, content-update docs, deployment/DNS/SSL notes, sign-off checklist, maintenance retainer offer. |

## Install

In Claude Code:

```
/plugin marketplace add thewizrdz/wizrdz-skills
/plugin install smb-wordpress-ops@wizrdz-skills
```

The skills activate automatically when your conversation matches their
territory ("my wordpress site is redirecting to a spam page", "will switching
to cloudflare break my email", "what do I hand the client at the end of the
project"), or invoke them directly:

```
/smb-wordpress-ops:wordpress-malware-incident-response
/smb-wordpress-ops:dns-migration-without-downtime
/smb-wordpress-ops:client-website-handoff
```

## Design principles

- **One self-contained SKILL.md per skill.** No scripts, no dependencies —
  easy to security-audit, nothing executes on your machine.
- **Defensive/remedial only.** Each skill carries an explicit guardrails
  section. These are cleanup and operations runbooks, not attack tooling.
- **From real engagements.** Where a step comes from documented field work
  it's stated plainly; where it's standard practice it's framed as such.

## About

Built by [Thewizrdz.io](https://thewizrdz.io) — WordPress security incident
response, email deliverability (SPF/DKIM/DMARC), and site operations for
small businesses.

## License

Copyright © 2026 Thewizrdz.io. Purchased copies are licensed for use by the
purchaser; redistribution or resale is not permitted.
