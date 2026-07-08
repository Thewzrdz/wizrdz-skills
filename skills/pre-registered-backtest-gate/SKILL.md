---
name: pre-registered-backtest-gate
version: 0.1.0
description: >
  Use this skill when the user wants to run a backtest, evaluate a trading
  strategy, validate a signal hypothesis, or check whether a new trading rule
  actually works. Also fires when the user says "my backtest looks good, should I
  deploy it?", "I want to test this strategy on historical data", "how do I know
  if my results are real?", or "I keep finding signals that work in backtests but
  fail live." Guides the user through pre-registering their success bar before
  running any analysis, enforcing the Wilson Report discipline: commit to the
  threshold, run the test once, honor the result — including when it fails.
author: thewizrdz.io
license: MIT
---

# Pre-Registered Backtest Gate

A methodology for testing trading hypotheses without fooling yourself. You commit
to a success bar — in writing, before the data exists — then run once and honor
the result. If it passes, you have evidence. If it fails, you have information.
Either outcome is worth more than a p-hacked result you can't trust.

This is the discipline that stops you deploying a strategy that looked good in
backtests and loses money live. Almost nobody does it consistently; most retail
accounts pay for the lesson in real capital.

---

## Phase 1 — Pre-registration (do this BEFORE touching the data)

**The rule:** Write the following into a journal entry, commit, or dated document
BEFORE you run any analysis. The act of writing it down first is what makes the
result valid.

### 1a. State the hypothesis in one sentence
What do you believe is true, in falsifiable form.

Example: *"Stocks that see unusual options sweep volume in the 30 minutes before
close have positive expected return at T+3 close."*

### 1b. Define the success bar
The bar has three components — ALL required:

```
METRIC:    mean R (R-multiple = (exit - entry) / entry, or PnL / max-risk for spread strategies)
BAR:       mean R > 0  AND  t-statistic ≥ 2.0
DROP-BEST: result must survive removing the single best trade
           (i.e., drop-best mean R > 0  AND  drop-best t ≥ 2.0)
SAMPLE:    n ≥ 20 resolved trades minimum
```

Why t ≥ 2? At n ≥ 20, t ≥ 2 ≈ p < 0.05 two-tailed. Not strict, but a real bar.
Why drop-best? A single outsized winner can carry an entire mean. One lucky trade
is not an edge. Drop-best tests whether the edge is distributed across the sample,
not concentrated in one event.

### 1c. Name the fill model (be honest)
Don't assume you'll fill at the mid. Commit to a specific fill assumption before
you see the results. Standard conservative model:

- **Entry:** mid + (ask − bid) × 0.25  (assume you pay 25% of the spread)
- **Exit:** mid − (ask − bid) × 0.25
- **Skip rows:** entry mid < $0.10 (untradeable liquidity)

### 1d. Set the exit rule
Commit to one primary exit, report one sensitivity:

- **Primary:** T+3 close (or your chosen horizon)
- **Sensitivity:** T+1 and/or T+5 (reported but cannot rescue a failed primary bar)

### 1e. Define the scope
Exactly which rows are in scope. No cherry-picking the universe after results exist.
Write: universe, date range, filter criteria.

### 1f. Lock it
Write the date. Don't change the bar after you see any results.

---

## Phase 2 — Run the test (once)

Run it. Get the results. Write them down verbatim — full numbers, not a summary.

If you hit a bug that prevents the test from running (wrong data, dead endpoint,
code error): **that is NOT a failed test.** Log it as UNTESTABLE-AS-SPECIFIED
and fix the bug before re-running. Do not let "couldn't get it to fire" become
"strategy didn't work." Those are different verdicts.

Log the estimate-vs-actual runtime if you predicted a runtime — tracking
prediction accuracy improves future estimates.

---

## Phase 3 — Apply the decision tree (locked before results existed)

Evaluate each pre-registered bar in order:

```
1. Is n ≥ 20?
   NO  → INSUFFICIENT DATA. Do not conclude anything. Accumulate more.
   YES → continue

2. Is mean R > 0 with t ≥ 2.0?
   NO  → FAIL. Log the bar, log the actual values, move to action.
   YES → continue

3. Does it survive drop-best (drop-best mean R > 0, drop-best t ≥ 2.0)?
   NO  → FAIL. One trade is carrying the result. Not a real edge.
   YES → PASS — this is evidence. Deploy per your staging plan.
```

### When it PASSES:
- Document the result verbatim in the journal / ledger.
- Deploy only in the mode your pre-registration specified (paper first, then
  live at minimum viable size, then size-up after n ≥ 30 live trades).
- Set a forward-validation bar before you increase position size.

### When it FAILS:
- Log the actual values verbatim. Do not say "close enough" or "it almost
  passed." Honor the bar you set.
- Do NOT re-run with loosened parameters and call it a new test. That is
  p-hacking. If you want to test a relaxed version, write a new pre-registration
  first.
- **Sensitivity checks cannot rescue a failed primary bar.** If T+3 fails but T+5
  looks good — that's a hypothesis for a future pre-registered test, not a rescue.

### What "UNTESTABLE" means (distinct from FAIL):
If the test couldn't run due to missing data, a broken data feed, or a bug in
the test harness, log it as UNTESTABLE-AS-SPECIFIED. Fix the bug and re-run
cleanly. Do not collapse this into FAIL — you haven't learned that the strategy
doesn't work; you've learned that you couldn't test it yet.

---

## Phase 4 — Distinguish exploratory from confirmatory

Backtests will surface patterns you didn't pre-register. These are hypotheses,
not findings. Label them clearly:

**EXPLORATORY (reported, hypothesis-generating only):**
- A sub-bucket that shows a strong signal
- A parameter value that works better than the one you pre-registered
- An interaction effect you noticed mid-analysis

**Rule for exploratory findings:** note them in the journal with the caveat
"exploratory — pre-register before testing" and leave them there. They cannot
trigger deployment, they cannot "rescue" a failed test, and they are not evidence
of anything until they survive their own pre-registered test on out-of-sample data.

Why: you looked at the data and noticed something. Your brain's pattern-recognition
fired. That is not the same as testing a hypothesis you formed before looking.

---

## Phase 5 — Forward validation (after a PASS)

Passing a backtest is permission to run the strategy on paper, not permission to
size up. The forward-validation bar is what tells you whether the edge was real
or historical artifact:

- **Minimum sample:** n ≥ 30 live (paper or small-size real) trades
- **Bar:** rolling 30-trade win rate or mean R stays above your deployment floor
- **Auto-pause rule:** if the rolling metric drops below the floor for two
  consecutive 30-trade windows, stop trading and re-evaluate

Set the forward-validation bar before you deploy. Write it in the same document
as the backtest pre-registration.

---

## Phase 6 — What to log (the ledger)

Every hypothesis test should produce a dated, append-only record with:

```
Date:         YYYY-MM-DD (when bars were locked)
Hypothesis:   one sentence
Universe:     (scope — tickers, date range, filter)
Fill model:   (entry slip, exit slip, skip rules)
Primary bar:  mean R > 0, t ≥ 2.0, drop-best mean R > 0, drop-best t ≥ 2.0
Sensitivity:  (T+1 / T+5 / other — for reporting only)
Results:
  n resolved: XX
  mean R: +X.XX
  t-stat: +X.XX
  drop-best mean R: +X.XX
  drop-best t: +X.XX
Verdict:      PASS / FAIL / UNTESTABLE-AS-SPECIFIED
Action:       (deploy to paper / log-only / cancel subscription / new hypothesis)
```

Lock the entry. No edits after the fact. This log is the difference between a
disciplined process and a collection of cherry-picked wins.

---

## Guardrails

- This skill describes **hypothesis testing methodology only.** It does not
  recommend specific trading strategies, securities, position sizes, or trade timing.
- Nothing here constitutes financial advice. Past backtest results do not guarantee
  future performance.
- The pre-registration process is a tool for intellectual honesty. It does not
  make a losing strategy profitable; it tells you accurately whether you have
  evidence of an edge.
- If a test fails and you feel the urge to "just try one more thing" before
  accepting the verdict — that urge is p-hacking. Log the failed test, step away,
  and write a new pre-registration before doing anything else.
- The discipline described here is most valuable precisely when you don't want
  to follow it (when results are close, when you've invested weeks in a strategy,
  when the alternative is admitting you don't have an edge yet). Follow it anyway.
