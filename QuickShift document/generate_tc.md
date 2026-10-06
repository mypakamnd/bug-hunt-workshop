# Skill 1 — Create Test Case · PROJECT: quickshift

> ปรับจาก `generate-test-cases/projects/daywork_app` (2026-10-06) ให้เป็นตัวอย่างเอกสารของแอป QuickShift ใน workshop
> ยังไม่ได้ลงทะเบียนเป็น project ใน skill จริง จึงยังไม่มี Google Sheet ของ QuickShift — ส่วน "Write procedure" เป็นตัวอย่างวิธีเขียนลง sheet

> **What this skill does:** produce the **Test Case ID + Test Case Name** list for
> a scenario, from a **Flow chart** and **UI screenshots**, and write it into the
> naming tab **the user names**, columns **F:G**.
>
> **Grammar:** `prompt_tc.txt` (this folder) — the field-type templates,
> FUNCTIONAL vs DISPLAY ordering, and worked Example 1. **Read it first.** This
> file adds what the grammar does not cover: how to turn a **flow chart** into a
> case list, and how to write the result back.
>
> **Product facts:** `domain.md` (this folder) — how the feature behaves (counter
> rules, timing boundaries, mutually-exclusive statuses, open questions). Read it
> before deciding which cases must exist, and put any *product* correction there
> rather than in this file.
>
> **Not this skill:** filling Test Type / Test Step / Test Data / Expected Result
> on an `F##_*` feature tab — that is **Skill 2 — Generate Detail**
> (`generate_detail.md` + `prompt_detail.txt`). The names
> produced here become
> the Test Case Descriptions that skill reads. Never write Steps/Expected from
> here; never invent a name from there. See the root `SKILL.md` for the split.

## Keeping this spec current

Every correction the user makes to a case list gets written back **in the same
turn**, into **both**:

- **this file** (`generate_tc.md`) — the rule, stated once, where it applies; and
- **`prompt_tc.txt`** — the same rule in the QA prompt's own voice (Thai),
  under `ขั้นตอนที่ 2.5`.

Correct the existing wording rather than appending a contradicting rule, update
any worked example the change invalidates (case counts, numbering, row ranges),
and say in the reply which files you updated. A fix that only lands in the sheet
is a fix that will be re-made next run.

## When to use

The user says something like:

- "เขียน Test Case ใน Sheet QuickShift Tab:<tab>" (+ attaches a Flow and a UI image)
- "ช่วยตั้งชื่อ Test Case ของ Scenario …"

and the sheet already has **Story ID / Feature / Group / Scenario ID / Scenario
Topic** filled in. You supply columns **F (Test Case ID)** and **G (Test Case
Name)** only.

## ⛔ Preflight — four things, before writing anything

All four must be known before a single case is generated. **Ask for whatever is
missing — every time.** Never infer, never carry an answer over from an earlier
run in the same conversation.

1. **Project** — which project / spreadsheet.
2. **What** — `tc` (this skill: case *names*) or `detail` (`generate_detail.md`).
   Don't assume from the phrasing; confirm it.
3. **Tab** — the exact naming tab. `Train_AI` and `Traceability_Record` are tabs
   previous runs happened to use; they are examples, never defaults. Do not infer
   it from the sheet's tab list or from the feature name.
4. **Flow *and* UI** — both are required input, not a bonus. The flow decides
   which branches become cases (see the Method below — it is built entirely on
   decisions, boundaries and example boxes); the UI supplies the element names
   for the display and navigation cases. If either is missing, **ask whether it
   exists**. If there genuinely is none, say what it costs — unverifiable
   branches, invented element names — and record the gap as an assumption in
   `domain.md`.

`naming_tab.py` backs up #3: it refuses a feature tab, and refuses any tab whose
header row is not a naming layout — so a wrong `<TAB>` fails loudly instead of
writing case names over someone's data. Nothing backs up #1, #2 and #4 but you
asking.

## Naming-tab contract

Different layout from the `F##_*` feature tabs — do not reuse the feature-tab
column map here. Header is row 1; data starts row 2.

| Col | Letter | Field           | R/W                      |
| --- | ------ | --------------- | ------------------------ |
| 1   | A      | Story ID        | read (given)             |
| 2   | B      | Feature         | read (given)             |
| 3   | C      | Group           | read (given)             |
| 4   | D      | Scenario ID     | read (given)             |
| 5   | E      | Scenario Topic  | read (given)             |
| 6   | F      | Test Case ID    | **write**                |
| 7   | G      | Test Case Name  | **write**                |
| 8   | H      | Status          | not touched              |
| 9   | I      | Execute Sprint  | not touched              |
| 10  | J      | Remark          | not touched              |
| 11  | K      | Defect ID       | not touched              |

- A naming tab does **not** match `^(AI_)?F\d{2}_`, so `generate.py` /
  `tc_tools.py` cannot see it. Use **`naming_tab.py`** (see "Write procedure").
- **Test Case ID** = `<StoryID without the dash>-<ScenarioID suffix>-TC###`, e.g.
  Story `QS-101` + Scenario `QS101-SC01` → `QS101-SC01-TC001`. Numbering
  restarts at `TC001` for every Scenario ID.
- Only the **first row of a scenario** carries A–E; continuation rows leave them
  empty (matching the existing rows in the tab).
- **Locate the scenario by its Scenario ID from a fresh read**, never by a
  hardcoded row number — rows get inserted between runs.
- If a scenario has fewer blank rows than it has cases, `insertDimension` the
  missing rows **immediately before the next scenario's header row**, then write.
  Do not trim the case list to fit the blank rows that happen to be there.

## Method — flow chart → case list

A flow chart is a spec written as decisions. Walk it mechanically; do not
free-associate.

1. **Split by flow section.** Each titled band in the diagram (e.g.
   `การ์ดเข้างานแล้ว (X/Y คน)`, `การ์ดรอจ่ายค่าแรง`) maps to one Scenario ID. Match
   the band to the Scenario Topic before writing anything.
2. **Name the object from the flow, not from your own vocabulary.** If the band
   is titled `การ์ดเข้างานแล้ว`, the cases say `การ์ดเข้างานแล้ว` — it keeps the names
   traceable to the spec the user handed you.
3. **Every decision diamond = at least two cases** — the Yes branch and the No
   branch. A diamond whose No branch loops back is still a case: it asserts that
   nothing changed.
4. **Every boundary in a diamond = its own case.** `ก่อนถึงเวลาเริ่มงาน 60 นาที`
   yields both *outside the window* (cannot check in) and *inside the window*
   (can check in).
5. **Every worked example printed in a box = a case.** The boxes carry the real
   arithmetic — `งาน A ยืนยัน 2 คน งาน B ยืนยัน 3 คน แสดง 0/5` is the multi-job
   aggregation case; `จาก 1/5 จะกลายเป็น 0/3` is the end-of-job clearing case.
   These are the highest-value cases in the whole list; never drop them.
6. **Counters get the partial / full / empty trio.** For an `X/Y` counter:
   none counted, some counted, all counted — plus whatever clears it.
7. **A removal condition implies a retention case.** If the only exit from a card
   is `ประเมินและจ่ายค่าแรง`, then "still there after everything else" is a case
   (e.g. carried over from a previous day).
8. **An event drawn anywhere in the flow is a case on every object it could
   touch — including where the answer is "nothing changes".** `พนักงานออกงาน` is
   drawn in band 2, but it still has to be asserted against band 1's card:
   checking out *before* the end time must not decrement `X`, and checking out
   *after* it must not put the worker back. A case whose expected result is "the
   count does not move" is a **required** case, not a redundant one — an
   untested no-op is exactly where a regression hides. When the event has a
   timing boundary, write **both sides** of it (ก่อน / หลัง).
9. **Read the UI for the display case and for navigation.** The first case of a
   scenario is the plain display case (`ตรวจสอบการแสดงผล[Object]`) and it owns the
   full element list from the screenshot. Every tappable element on that object
   (the card's arrow button) earns a navigation case, written as a **display**
   case — `ตรวจสอบการแสดงผลหน้า[Target Page]`, never `เข้าสู่หน้า…` (see
   `prompt_tc.txt` §5 of the DISPLAY list).
10. **When the flow and the UI disagree on a label, use the UI's.** A flow chart
   is written in the spec's vocabulary; the screen is what the tester will be
   looking at. Flow `แทบรอตอบรับ` vs UI tab `รอพิจารณา` → the case says `รอพิจารณา`.
   Report the discrepancy — it is often a stale flow chart.
11. **When a diamond's Yes/No polarity is ambiguous, name by state, not by
   outcome.** `บัญชีผู้สมัครมีคำเตือนไหม` routing *Yes* onward to "show" and *No* to
   "ไม่แสดง" reads backwards, and a screenshot may contradict it (a card with a
   `คำเตือน` banner *is* on screen). Write one case per state — ปกติ / มีคำเตือน /
   มีความเสี่ยง / ติดบัญชีดำ — which is correct whichever way the gate resolves, and
   ask which branch shows the applicant before the Expected Results get written.
   Chained gates do **not** imply combined states — check whether the states are
   mutually exclusive before writing one. A Daywork applicant account (ตัวอย่างจาก daywork_app) is
   ปกติ *or* มีคำเตือน *or* มีความเสี่ยง *or* ติดบัญชีดำ, never two at once, so there is
   **no** `มีคำเตือนและมีความเสี่ยง` case.
12. **Do not invent UI.** If neither the flow nor the screenshot names an element,
   it does not go in a case. State the assumption to the user instead.

### Ordering within a scenario

DISPLAY scenario (what dashboard/card scenarios are):

```
1  display ปกติ (full element list from the UI)
2  no-data / empty state
3  base state with data
4… each flow decision in flow order (aggregation → window → boundary → counting)
n-1 terminal transitions (end of job, cleared, moved out)
n  navigation to the target page
```

FUNCTIONAL scenario (form/CRUD): follow `prompt_tc.txt` §2 — display → happy
path → field-by-field (success then fail, in on-screen field order) → special
sections → cancel/abort.

**Patterns this project keeps hitting** (full templates in `prompt_tc.txt` §2 4️⃣):

- **Section sub-page** — a screen opened from a section of a parent form has two
  entry states (`เพิ่ม` with nothing filled, `แก้ไข` with data) and must end with
  `ตรวจสอบการแสดงผลหน้า[ฟอร์มแม่] กรณีบันทึก[Section]สำเร็จ` — asserting the saved data
  actually lands back on the parent. That last one is the one that gets forgotten.
- **Multi-entry-point section** — one section reachable several ways (add new /
  pick existing / Work From Home) gives **one success case per route**, never one
  merged case.
- **Draft vs Reuse** — resuming unsaved work and prefilling from an existing
  record are two different mechanisms. Each gets its own branch pair and its own
  success case.
- **A prohibition written into the spec** ("ต้องไม่ดึงข้อมูลส่วนนี้มา") is **its own
  case**. It is the easiest thing in a spec to miss, because every happy path
  still passes while it is broken.

**A screen with more than one input always gets the full per-field series.** A
flow chart usually collapses a whole form into one box ("กรอกข้อมูล → บันทึก"), so
this is the rule most easily lost when the input is a flow rather than a field
spec — see `prompt_tc.txt` §2.5 rule 12. Per screen:

| | Case |
| - | ---- |
| 1 | `สำเร็จ กรณีกรอกข้อมูลครบถ้วนทั้งหมด` — once per screen |
| 2 | `สำเร็จ กรณีกรอก[Input A]` — **the one most often missed** |
| 3 | `ไม่กรอก[Input A]` — required → `ไม่สำเร็จ`; optional → `สำเร็จ`. **Always present**, whichever it is |
| 4–5 | `ไม่สำเร็จ กรณีกรอก[Input A]` wrong spec / over limit, per the field type |
| … | then repeat 2–5 for Input B, in on-screen order |

Derived / preview cases the flow names (postcode auto-filling
จังหวัด-อำเภอ-ตำบล, a map preview) are inserted **at the field they belong to**, not
collected at the end. If a field's required/optional status or its limit is
unknown, **ask** — write the success + not-filled pair, but never invent a limit
for a wrong-spec case.

### What belongs in an Expected Result, not in a case of its own

A state change usually **forbids** something afterwards — confirming a row locks
its fields, sending for review closes the upload. Assert that inside the
**Expected Result of the action that caused it**, not as a separate case:

- ❌ `ตรวจสอบการแก้ไขเวลาเข้า-ออก กรณียืนยันรายชื่อแล้ว`
- ✅ folded into `ตรวจสอบการยืนยันรายชื่อสำเร็จ` → `…และระบบไม่ให้แก้ไขเวลาเข้า-ออก`

**This is not a contradiction of rule 8.** Rule 8 is about a *different object*
the event touches — another card, tab or counter that could silently fail to
update; those keep their own case. This is about the *same object's* own
attributes immediately after the action, which are simply what that action
resulted in.

**Summary counters and stat cards are always Expected Results, never cases.**
The screen's tally boxes (`แถวที่อ่านได้จากกระดาษ` · `ผูกกับคนในงานแล้ว` · `ยืนยันแล้ว 0/18`)
move as a *result* of confirming, un-confirming, linking or deleting, so the
movement belongs in that action's Expected Result — `…และจำนวนยืนยันแล้วเพิ่มขึ้น 1`.
Writing one case per counter per action burns the case budget on assertions the
action case already has to make.

**Status badges and chips follow the same rule** — `ผูกแล้ว`, `ผูกซ้ำ (เซ็น N ที่)`,
`ไม่พบลายเซ็น`, `เพิ่มจากใบรายชื่อ · คนในระบบ`, a row landing in another group, a modal
staying open after a save. Each is something an action *produced* or something a
screen simply shows, so it is an Expected Result of that action or of the screen's
display case — not a case called `ตรวจสอบการแสดงผลสถานะ…`.

What does keep its own case is the **initial display** of a screen, a modal or a
table, once. The same goes for who did it and when (`ผู้ยืนยัน`,
`ผู้ยกเลิกการยืนยัน`): that is what the action produced, so it is its Expected
Result.

The exception is a **state the record can genuinely sit in**, where each state
changes what is allowed next — a file that is `ยังไม่บันทึก` / `กำลังตรวจ` /
`ตรวจเสร็จ` / `ตรวจไม่สำเร็จ`, where removal is blocked in exactly one of them.
Those are states, not badges, and each earns a case.

## Write procedure

Use `naming_tab.py` — it resolves scenario blocks from a fresh read, does the
row arithmetic, and enforces the tab guards. Never hand-roll the Sheets calls.

```bash
cd ~/.claude/skills/generate-test-cases
PY=.venv/bin/python

# 1. confirm the tab with the user, then read what is already there
$PY naming_tab.py get <SPREADSHEET_ID|PROJECT> <TAB> [SCENARIO_ID ...]

# 2. see the row arithmetic before committing to it
echo "$PAYLOAD" | $PY naming_tab.py set <SPREADSHEET_ID|PROJECT> <TAB> --dry-run

# 3. write
echo "$PAYLOAD" | $PY naming_tab.py set <SPREADSHEET_ID|PROJECT> <TAB>
```

`$PAYLOAD` is a JSON array, one item per scenario:

```json
[{"scenario_id": "QS101-SC01", "names": ["ตรวจสอบ…", "ตรวจสอบ…"]}]
```

Ids are generated as `<id_prefix or scenario_id>-TC001, -TC002, …`; the block is
grown or shrunk to exactly `len(names)` rows; blocks are written bottom-up so an
insert never disturbs a scenario not yet written. Only **F:G** is touched.

### Verdict coloring (column G, automatic)

`set` paints the verdict word as it writes, and `recolor` re-applies it to rows
that already exist:

| Verdict | Colored | Extent |
| ------- | ------- | ------ |
| `สำเร็จ` | green **#11734b** | the word only |
| `ไม่สำเร็จ` | red **#ff0000** | from the word to the **end of the name** |

Only the **verdict slot** counts — the สำเร็จ / ไม่สำเร็จ standing before the first
`กรณี`, i.e. the `ตรวจสอบการ[Action][Object]สำเร็จ กรณี…` position. A สำเร็จ inside
the `กรณี` clause is a *condition*, not a verdict
(`ตรวจสอบการแสดงผลหน้าสร้างงาน กรณีบันทึกรายละเอียดงานสำเร็จ` is a display case), so it
stays black. `ไม่สำเร็จ` is matched before `สำเร็จ` because it contains it —
matching the shorter word first would paint every failure case green.

```bash
$PY naming_tab.py recolor <SPREADSHEET_ID|PROJECT> <TAB> [SCENARIO_ID ...]
```

`recolor` touches only `textFormatRuns`, never a cell value.

Then **report** per scenario: case count, row range, and every assumption you
made (missing UI, flow/UI label conflicts, ambiguous branches) — and add the
open ones to `domain.md`.

## Recommend Cases — close every run with this

**Every generate ends with a "เคสที่แนะนำเพิ่ม" section. Never skip it**, not even
when the list looks complete — especially then. It is an analysis of what is
*missing*, with a reason for each, not a pile of speculative cases.

Sweep all nine:

| # | Look for |
| - | -------- |
| 1 | fields whose spec is unknown → the missing wrong-format / over-limit cases |
| 2 | fields assumed **required** → if any is actually optional, its `ไม่กรอก` case flips to `สำเร็จ` |
| 3 | screens or steps the flow *names* but gives no band → no cases exist for them at all |
| 4 | exits: cancel, close, back, kill the app — a flow chart almost never draws these |
| 5 | system-failure cases (save fails on a server error) — almost never in a flow either |
| 6 | no-data / empty state for every list screen |
| 7 | collisions: duplicate name, double-tap save, two people editing at once |
| 8 | roles / permissions, when the feature has more than one |
| 9 | numeric and date boundaries the spec has not pinned down |

Report them in **two groups**, so the user can act on the first without answering
anything:

- **เพิ่มได้เลย** — enough is known; only needs a yes.
- **ต้องได้คำตอบก่อน** — state the exact question that blocks it.

**Never write these into the sheet on your own.** Recommend, then let the user
decide — an unreviewed case is worse than a missing one, because it looks tested.

## Don't

- Don't write anything outside F:G on this tab.
- Don't renumber or re-word an existing scenario's cases unless asked.
- Don't pad the list with cases the flow and UI do not support, and don't cut
  real cases to fit pre-allocated blank rows.
- Don't copy case names from a sibling tab (`Traceability_Record`,
  `F##_*`) when the user asked for names generated from the Flow/UI — the point
  of a `Train_AI` run is the independent derivation.

---

## Worked example — QS-101 · ตรวจสอบการค้นหางาน (QS101-SC01)

ตัวอย่างนี้ใช้ในสไลด์หัวข้อ 2 (Test Matrix) และตรงกับแอปใน workshop

**Input:** หน้ารายการงานของแอป (UI) + requirement REQ-01 ถึง REQ-06 (`domain.md`) ไม่มี flow chart แยก

**1. หามิติที่ผู้ใช้เลือกได้บนหน้าจอ** (กฎข้อ 3 และ 9)

| มิติ | ค่า |
| ---- | --- |
| คำค้น | ชื่องาน · สถานที่ · คำที่ไม่ตรงกับงานใด · ไม่กรอก |
| เรียงตาม | ล่าสุด · ค่าจ้างสูงสุด |

**2. แตกเป็น matrix 4 × 2 = 8 case** แล้วเติม display + navigation ตาม "Ordering within a scenario"

| TC | Case |
| -- | ---- |
| TC001 | ตรวจสอบการแสดงผลหน้ารายการงาน |
| TC002 | ตรวจสอบการค้นหางานสำเร็จ กรณีค้นหาด้วยชื่องาน และเรียงตามล่าสุด |
| TC003 | ตรวจสอบการค้นหางานสำเร็จ กรณีค้นหาด้วยชื่องาน และเรียงตามค่าจ้างสูงสุด |
| TC004 | ตรวจสอบการค้นหางานสำเร็จ กรณีค้นหาด้วยสถานที่ และเรียงตามล่าสุด |
| TC005 | ตรวจสอบการค้นหางานสำเร็จ กรณีค้นหาด้วยสถานที่ และเรียงตามค่าจ้างสูงสุด |
| TC006 | ตรวจสอบการค้นหางานไม่สำเร็จ กรณีค้นหาด้วยคำที่ไม่ตรงกับงานใด และเรียงตามล่าสุด |
| TC007 | ตรวจสอบการค้นหางานไม่สำเร็จ กรณีค้นหาด้วยคำที่ไม่ตรงกับงานใด และเรียงตามค่าจ้างสูงสุด |
| TC008 | ตรวจสอบการค้นหางานสำเร็จ กรณีไม่กรอกคำค้น และเรียงตามล่าสุด |
| TC009 | ตรวจสอบการค้นหางานสำเร็จ กรณีไม่กรอกคำค้น และเรียงตามค่าจ้างสูงสุด |
| TC010 | ตรวจสอบการแสดงผลหน้ารายละเอียดงาน |

**3. สิ่งที่ไม่แยกเป็น case** (หัวข้อ "What belongs in an Expected Result")

- ข้อความ "พบ X งาน" เป็นตัวนับ → อยู่ใน Expected ของ TC002–TC009 ทุกข้อ
- ป้าย "ด่วน" และ "ปิดรับแล้ว" เป็นสิ่งที่หน้าจอแสดง → อยู่ใน Expected ของ TC001

**4. สมมติฐานที่บันทึกไว้ใน `domain.md` → Open questions**

- "ล่าสุด" เรียงตามวันโพสต์หรือวันเริ่มงาน (REQ-01)
- ค้นหาด้วยคำบางส่วนได้ไหม (REQ-02)
- "งานทั้งหมด" รวมงานที่ปิดรับไหม (REQ-01 กับ REQ-07)

**5. เคสที่แนะนำเพิ่ม**

- **เพิ่มได้เลย:** ค้นหาด้วยคำบางส่วนของชื่องาน · ค้นหาแล้วล้างคำค้น
- **ต้องได้คำตอบก่อน:** ค้นหาภาษาอังกฤษ / ตัวพิมพ์เล็กใหญ่ · จำนวนงานที่แสดงสูงสุดต่อหน้า
