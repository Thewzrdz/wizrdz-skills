---
name: client-website-handoff
description: >
  Run a clean, complete handoff of a finished website project to a client.
  Use when wrapping up or delivering a client website, when someone asks
  "what should I give the client at the end of a web project", "how do I
  transfer a website to my client", "client handoff checklist", "how do I
  hand over hosting/domain/credentials", when a client wants to update their
  own site after launch, or when closing out a freelance/agency web project
  and offering ongoing maintenance. Covers deliverables, access and
  credential transfer, content-update documentation, deployment/DNS/SSL
  notes, completion sign-off, and an optional maintenance retainer offer.
---

# Client Website Handoff

A handoff is done when the client can operate, move, or re-staff their site
**without calling you** — and when you no longer hold access you shouldn't
have. The guiding principle: **the client owns everything, and it lives in
their accounts** — hosting, domain, repo, API keys, licenses. Anything that
sounds like vendor lock-in is the wrong answer. Paying slightly more
attention to clean ownership and a runbook now saves the client from paying
a future contractor to reverse-engineer your work.

## Guardrails

- Never transmit passwords in plain email or chat. Use a password manager
  share, the platform's own invite/transfer flow, or a one-time-secret link —
  and rotate anything that was ever shared insecurely during the project.
- Prefer **role-based access transfer over password sharing**: make the
  client the owner/admin in each platform, then remove or downgrade your own
  account. Accounts the client can't rename/revoke aren't transferred.
- Don't retain admin access after sign-off unless a maintenance agreement
  explicitly covers it — holding unneeded credentials is liability, not
  convenience.
- License keys purchased under your account (premium plugins/themes) must be
  disclosed: the client either gets their own license or knows updates stop.

## 1 — Deliverables inventory

Assemble before the handoff call:

- [ ] The live site, launched and verified
- [ ] Source/theme files or repo access (transferred to client ownership)
- [ ] All content and media in final form
- [ ] The handoff document (sections 2–5 below, as a single PDF/page)
- [ ] Any design assets (logos, source files) the engagement produced
- [ ] Written scope of what was and wasn't included

> TODO(Sebastian): confirm what your standard deliverables package actually
> includes per engagement type (e.g., do you hand over a repo, a zip, or
> host-level access only?).

## 2 — Access and credential transfer

Walk each platform, transfer ownership, then remove yourself:

| Platform | Transfer action |
|---|---|
| Domain registrar | Client account owns the domain; you are removed or delegated-only |
| DNS host (e.g., Cloudflare) | Client account owns the zone; invite yourself back only if retained |
| Hosting / cPanel | Client is primary account holder; billing in their name |
| WordPress admin | Client has their own admin user; delete shared/temp accounts |
| Database | Credentials documented; note where wp-config.php lives |
| Email service (if configured) | Client owns the mail admin console |
| Analytics / Search Console | Client's Google account is owner; you are user or removed |
| Premium plugin/theme licenses | In client's name, or expiry consequences documented |
| Payment/e-commerce (if any) | Client owns the processor account outright |

Then: **rotate every password that was shared during the project**, and have
the client enable 2FA on the accounts that matter (registrar, hosting, WP
admin, email).

## 3 — Content update documentation

The #1 post-launch support burden is "how do I change X?" Head it off with a
short, screenshot-light guide covering *this specific site*:

- Where each editable thing lives: pages, blog posts, menus, images/media,
  business info (hours, phone, address), forms and where submissions go
- What they should **not** touch (theme files, plugins, anything under
  Appearance → Editor — ideally file editing is disabled entirely)
- How to add a user safely (role choice: Editor, not Administrator)
- Update discipline: what auto-updates, what waits for a maintenance pass

> TODO(Sebastian): if you have a standard walkthrough template or record a
> Loom-style video per site, note that here as the default deliverable.

## 4 — Deployment, DNS, and SSL notes

The section a *future developer* will thank you for. One page:

- Hosting provider, plan, renewal date, and how deploys happen (SFTP? git
  push? host dashboard?)
- Staging environment: exists? where? how to push staging → production?
- DNS: where the zone lives, the records that matter, and anything
  non-obvious (proxied records, subdomains, mail hosted separately)
- SSL: who issues it (host auto-renew? Cloudflare? manual cert?), expiry, and
  what breaks if it lapses
- Backups: what runs, where they're stored, how to restore
- Cron/scheduled tasks and any external services the site calls

## 5 — Completion checklist and sign-off

Run together with the client, then get written acceptance:

- [ ] All scope items delivered and demonstrated
- [ ] Site loads correctly (desktop + mobile), forms tested end-to-end
- [ ] Client logged into every transferred account **themselves, during the
      call** — untested access is untransferred access
- [ ] Client can perform one real content edit unassisted
- [ ] Backups verified (restore tested or at minimum a manual backup taken
      at handoff)
- [ ] Handoff document delivered
- [ ] Your temporary accounts/keys removed; shared passwords rotated
- [ ] Final invoice and written sign-off ("project accepted as complete")

## 6 — Optional: the maintenance retainer offer

Make the offer at handoff, framed honestly — maintenance is a **security
service, not babysitting**. The client's real question is "who watches this
when I'm not?" A reasonable structure to present:

- What's covered: core/plugin updates on a staged cadence, uptime and
  malware/file-integrity monitoring, backups, small content edits, priority
  incident response
- What's not: redesigns, new features (quoted separately)
- The alternative, stated plainly: no retainer means the client owns update
  discipline and incident response themselves — fine for some, but say it out
  loud so it's a decision, not an accident

> TODO(Sebastian): your actual retainer tiers/pricing and response-time
> commitments aren't in the vault yet — fill in before using this section
> verbatim with a client.

## Anti-patterns to avoid

- Handing over a single shared "admin/admin123"-style login for everything
- Keeping the domain or hosting in your own account "for convenience"
- A handoff that's a credentials dump with no runbook — the next developer
  reverse-engineers, the client pays for it
- Sign-off by silence: no written acceptance means the project reopens the
  next time anything breaks
