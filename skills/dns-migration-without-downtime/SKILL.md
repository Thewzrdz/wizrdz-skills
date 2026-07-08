---
name: dns-migration-without-downtime
description: >
  Plan and execute a DNS migration without breaking a working website or —
  the classic casualty — client email. Use when someone is changing
  nameservers, adding Cloudflare in front of a site, moving a domain to a new
  registrar or host, repointing a domain at a new server, or asking questions
  like "will changing my DNS break my email", "my email stopped working after
  I switched to Cloudflare", "how do I move my site without downtime", or
  "emails going to spam after moving hosts". Centers on inventorying every
  existing record (especially MX, SPF, DKIM, DMARC) BEFORE cutover, TTL
  staging, verification, and a rollback plan. Defensive/operational use only.
---

# DNS Migration Without Downtime

The number-one way DNS migrations hurt small businesses is not the website —
it's **email**. A site that's down for an hour is an annoyance; invoices
silently landing in spam for three weeks because SPF/DKIM records didn't
survive the nameserver change is a business problem the client discovers late
and blames on you. This skill front-loads the email inventory so that can't
happen.

## Guardrails

- Only operate on domains the user owns or is authorized to manage.
- Never suggest lowering another party's deliverability or hijacking DNS.
- Never make the cutover before the full inventory (below) is captured and
  saved somewhere outside the current DNS host — after cutover, the old zone
  may become unreadable.
- Treat registrar and DNS-host credentials as sensitive: never paste them into
  notes, tickets, or chat logs.

## Phase 1 — Full record inventory (BEFORE touching anything)

Capture the complete current zone and store it in a dated text file. If the
current DNS host offers a zone export, use it. Either way, verify from the
outside with `dig` so you're recording what the world actually sees, not what
a dashboard claims:

```bash
DOMAIN=example.com
dig NS  $DOMAIN +short
dig A   $DOMAIN +short
dig AAAA $DOMAIN +short
dig CNAME www.$DOMAIN +short
dig MX  $DOMAIN +short
dig TXT $DOMAIN +short                    # SPF lives here
dig TXT _dmarc.$DOMAIN +short             # DMARC
```

DKIM records are per-provider and use selectors, so you must know (or
discover) every service that sends mail for the domain:

```bash
# Common selectors — check each sending service the client uses
dig TXT google._domainkey.$DOMAIN +short   # Google Workspace
dig TXT k1._domainkey.$DOMAIN +short       # Mailchimp (also k2)
dig TXT s1._domainkey.$DOMAIN +short       # SendGrid (also s2)
dig TXT selector1._domainkey.$DOMAIN +short # Microsoft 365 (also selector2)
```

**The email checklist — every item must be answered before cutover:**

- [ ] Where is mail hosted (MX targets)? Google Workspace, M365, the current
      web host's mail server (dangerous — moving hosts kills it), other?
- [ ] Exact SPF record captured verbatim. Remember: a domain gets exactly
      **one** SPF record, and SPF breaks silently past **10 DNS lookups** —
      don't "merge" records at the new host without checking this.
- [ ] Every DKIM selector for every sending service (marketing platform, CRM,
      invoicing tool, transactional mail). Ask the client what tools send
      email "from" their domain — they always forget one.
- [ ] DMARC record and its current `p=` policy (`none`/`quarantine`/`reject`).
      If the domain is at `p=quarantine` or `p=reject` and you drop a DKIM or
      SPF record during migration, legitimate mail will be actively junked or
      bounced — highest-stakes records in the zone.
- [ ] Any TXT verification records (Google site verification, M365 domain
      proof, etc.) — dropping these can deauthorize connected services.
- [ ] Subdomains in active use (`mail.`, `ftp.`, `api.`, staging hosts,
      `autodiscover`/`autoconfig` for M365/mail clients).

Run the domain through MXToolbox (mxtoolbox.com SuperTool) as a second
opinion — it flags syntactically invalid SPF and the 10-lookup overflow.

## Phase 2 — Recreate the zone at the destination first

Whether the destination is Cloudflare, a new registrar's DNS, or a new host:

1. Create the zone at the destination and **recreate every record from the
   Phase 1 inventory** before changing nameservers. Cloudflare's import scan
   is helpful but incomplete — it commonly misses DKIM selectors and secondary
   TXT records. Verify against your inventory line by line.
2. For Cloudflare specifically: MX targets and records that mail or non-HTTP
   services depend on must be **DNS-only (grey cloud), not proxied**. Proxying
   a mail-related record breaks mail. Web records (A/CNAME for the site) can
   be proxied (orange cloud).
3. Diff the destination zone against the inventory. Every line accounted for.

## Phase 3 — TTL staging

Standard practice: lower TTLs ahead of the change so mistakes propagate (and
can be reverted) in minutes instead of days.

- Well before cutover, drop TTL on the records being changed (e.g., to 300s),
  then wait out the *old* TTL so resolvers everywhere have picked up the low
  value before you make the real change.
- After the migration has soaked and verified, raise TTLs back to normal.

> TODO(Sebastian): confirm the exact TTL values and lead time you use in real
> engagements (e.g., 300s set 24–48h ahead?), and whether you stage
> nameserver changes differently from record changes — NS TTLs are controlled
> at the registry and can't be shortened the same way.

## Phase 4 — Cutover

- Change nameservers at the registrar (or repoint records, if staying on the
  same DNS host).
- Schedule for a low-traffic window in the client's timezone.
- Keep the old zone/hosting **live and paid for** until verification passes —
  it is your rollback.

> TODO(Sebastian): registrar-specific gotchas you've hit (lock/unlock steps,
> propagation quirks, hosts that auto-delete zones on nameserver change) —
> not yet documented in the vault.

## Phase 5 — Verification

Immediately after cutover, and again a few hours later:

```bash
dig NS $DOMAIN +short          # new nameservers answering?
dig MX $DOMAIN +short          # mail targets intact?
dig TXT $DOMAIN +short         # SPF intact, still exactly one record?
dig TXT _dmarc.$DOMAIN +short  # DMARC intact?
# ...and every DKIM selector from the inventory
```

Functional checks, in order of business impact:

1. **Send a test email from the domain to a Gmail address** and inspect the
   headers ("Show original"): SPF `pass`, DKIM `pass`, DMARC `pass`. This one
   check catches most migration email damage.
2. Receive an email at the domain.
3. Load the site (and the `www` variant) — check SSL is valid at the new
   destination.
4. Test any discovered subdomains/services.
5. If the client sends volume to Gmail: watch Google Postmaster Tools
   (postmaster.google.com) for authentication pass-rate dips over the
   following days — ground truth for how Gmail sees the domain.

## Phase 6 — Rollback plan (written before cutover, not during the incident)

Minimum viable rollback: revert nameservers to the old provider (which is why
the old zone stays untouched until sign-off). With staged low TTLs, record
changes revert in minutes; nameserver reverts take longer (registry TTLs).

> TODO(Sebastian): your actual rollback trigger criteria (how long you wait
> on a failing verification before reverting) and any partial-rollback moves
> you've used (e.g., restoring only MX at the new host vs. full NS revert).

## Common failure modes to warn about

- SPF/DKIM/DMARC silently absent at the new host → mail "works" but lands in
  spam; discovered weeks later. This is why Phase 1 exists.
- Two SPF records after a sloppy merge → both invalid.
- SPF pushed past 10 lookups by adding the new host's include → silent fail.
- Cloudflare proxying (orange-clouding) a mail-related record → broken mail.
- Verification TXT records dropped → Google/M365 services deauthorize later.
- DMARC at `p=reject` while DKIM is broken → legitimate mail actively bounced.
