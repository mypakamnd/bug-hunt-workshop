# Skill 2 — Generate Detail · PROJECT: quickshift

> ปรับจาก `generate-test-cases/projects/daywork_app` (2026-10-06) ให้เป็นตัวอย่างเอกสารของแอป QuickShift ใน workshop

> **What this skill does:** fill **Test Type / Test Step / Test Data /
> Expected Result** (columns **E, H, I, J**) for cases that already have names,
> on an `F##_*` feature tab.
>
> **Templates:** `prompt_detail.txt` (this folder) — what Steps / Data / Expected
> look like per Test Type. **Read it before generating.**
>
> **Product facts:** `domain.md` (this folder) — how the app behaves, and the
> open questions. Read it before writing an Expected Result, and put any
> *product* correction there rather than in this file.
>
> **Not this skill:** producing the case *names* — that is **Skill 1 — Create
> Test Case** (`generate_tc.md` + `prompt_tc.txt`), which writes columns F:G on a
> naming tab. Never invent a case name from here.
>
> **This project is the QuickShift mobile app** (หางานพาร์ทไทม์รายวัน, ผู้ใช้คือผู้หางาน).
> Default opener is **`เปิดแอป QuickShift`**, navigation is by app screens and taps
> (แท็บล่าง "หางาน" / "งานที่สมัคร").

## Keeping this spec current

Every correction the user makes gets written back **in the same turn**, into
**both** this file (the rule, where it applies) and `prompt_detail.txt` (the same
rule in the QA prompt's own voice). A fix that only lands in the sheet is a fix
that will be re-made next run.

## ⛔ Preflight — never generate without these

1. **Project** — which project / spreadsheet.
2. **What** — `detail` (this skill) or `tc` (`generate_tc.md`).
3. **Tab** — the exact `F##_*` feature tab. **Never guess it**; ask if the user
   has not said which tab.
4. **Flow *and* UI** — both are required input. Ask for whatever is missing.

## Generate content for each row

Read `prompt_detail.txt` (in this same folder) — that is the user's QA
prompt template. For each fetched row produce: `test_type` (only if the input
was empty), `steps`, `test_data`, `expected`. Use the `ui` field, when present,
to name UI elements precisely.

**When column K (`ui`) is present, read EVERY element on that UI and reuse it
across sibling cases.** A UI screenshot/spec is usually attached to only **one**
case of a screen — typically the first/display case (e.g. case 1). When a row
has `ui`, enumerate **all** of its elements (top-to-bottom, including section
หัวข้อ and buttons) and treat that UI as the **source of truth for every related
case on the same screen/scenario**, even though those sibling rows have an empty
column K. So if case 1 carries the UI and case 2 is the same screen, generate
case 2's Steps/Expected from case 1's UI elements too — don't guess or omit
elements that case 1's UI already told you. Only the case-specific action differs
between siblings; the screen's element set stays consistent with the UI.

**Test Steps MUST begin with the row's `pre_steps`** (numbered `1. 2. ...`),
then continue with the case-specific actions, then the submit/tap step. The
`pre_steps` come from `pre_steps.json` — do not invent or abbreviate them; copy
them verbatim as the first steps. If `pre_steps` is empty, start from the
case's own first step (default opener `เปิดแอป QuickShift`).

Generate in Thai unless the input is clearly in another language. The user is
QA — they read the output directly, so quality matters more than batch size.
If there are many rows, batch in groups of ~10 so the user sees progress.

## Generation format

The full per-type spec lives in **`prompt_detail.txt`** (this folder). Summary:

- **Test Type** (col E, only if empty): one of `POSITIVE`, `NEGATIVE`,
  `EDGE CASE`, `FUNCTIONAL`, `SECURITY`, `INTEGRATION`, `USABILITY`,
  `PERFORMANCE`. If you can't classify with confidence, use `FUNCTIONAL`.
- **Test Steps** (col H): numbered `1. ...\n2. ...`, in Thai. Include the setup
  prefix (default opener `เปิดแอป QuickShift`). For NEGATIVE, focus only on
  the offending field. For EDGE CASE, put the boundary value in the step. For a
  field-focused case that submits with `กดปุ่ม "บันทึก"`, insert
  `กรอก/เลือกข้อมูลอื่นๆ ครบ` right before the submit step (skip the full-form case
  and no-submit display/modal cases) — see `prompt_detail.txt`.
- **Test Data** (col I): the concrete input values the steps exercise — not a
  restating of the steps. Empty string when the case has no real input. See the
  "Test Data" section of `prompt_detail.txt`.
- **Expected Result** (col J): numbered `1. ...\n2. ...`. Name UI elements
  explicitly. For NEGATIVE, the exact inline-validation copy
  (`โปรดระบุ <field>` / `โปรดเลือก <field>`). For EDGE CASE, the explicit
  restriction. For a **modal** display case, list the modal's หัวข้อ (title),
  คำอธิบาย (description) and every button as a sub-list (see `prompt_detail.txt` §1).
  The **delete button** is labelled `ปุ่ม "ลบข้อมูล"` (not `"ลบ"`) — use it in the
  element list and the delete-action step (`กดปุ่ม "ลบข้อมูล"`).
  An **on-screen message / empty-state text** element is written quoted like a
  button: `ข้อความ "<exact text>"` (not the prose `ข้อความแจ้งว่า…`).
  For a **save-success** case where the UI (column K) shows a **toast**, write two
  lines: `1. ระบบบันทึกข้อมูลสำเร็จและแสดงข้อมูลที่<field>ถูกต้อง` then
  `2. ระบบแสดง toast "บันทึกข้อมูลสำเร็จ"`. When an **optional input/select** is left
  blank but the save still succeeds, append the display fallback: write line 1 as
  `1. ระบบบันทึกข้อมูลสำเร็จและแสดงข้อมูลที่บันทึกถูกต้องและแสดง<field>เป็น "-"` (e.g.
  `…และแสดงวิดิโอแนะนำตัวเป็น "-"`) — input/select only, NOT a blank file upload.
  For a **system-error** case (save fails),
  write `1. ระบบบันทึกข้อมูลไม่สำเร็จ` then
  `2. ระบบแสดง toast "เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้, โปรดลองอีกครั้งในภายหลัง"`.
  For a **cancel/leave-modal outcome** case (result of pressing ยืนยัน/ยกเลิก on
  the modal), use the terse fixed wording by action — **add**:
  `1. ระบบยกเลิกการเพิ่มและออกจากหน้าโดยไม่บันทึก`; **edit**:
  `1. ระบบยกเลิกการแก้ไขข้อมูลและออกจากหน้าโดยไม่บันทึก`; **delete-cancel**:
  `1. ระบบปิด modal และยกเลิกการลบข้อมูล` (see `prompt_detail.txt` §1).

There is **no Note column** in this sheet — the `Note` blocks in the templates
are internal guidance only; never write them back.

## Automation tagging — column F (Test Level)

Column **F (Test Level)** marks how each case should be covered when building an
automation suite. Write one of four values; `test_level` is writable via
`tc_tools.py set` (so you can re-tag any case by `tc_id`).

| Value | Meaning | In the auto backlog? |
| ----- | ------- | -------------------- |
| `Automate`  | Deterministic UI (incl. file uploads) — automate directly     | ✅ yes |
| `Semi-Auto` | Automatable but needs a route-mock to force a server error    | ✅ yes |
| `Merged`    | A redundant happy-path success folded into one per-form test  | ❌ no (kept for manual/doc) |
| `Manual`    | Not practical to automate                                     | ❌ no |

### How to classify (apply top-to-bottom; first match wins)

1. **`Manual`** — description contains **`ปิด Browser`** / close-app (can't
   meaningfully assert unsaved-data-on-close in a normal automation run).
2. **`Semi-Auto`** — description contains **`เกิดข้อผิดพลาด`** (system / server
   error) → needs route-mocking to force a 5xx. This is the **only** Semi-Auto
   trigger.
3. **`Automate`** — everything else, **including file uploads**: `อัปโหลด…`, a
   wrong-file-type (`นอกเหนือจากไฟล์`), an over-size file (`เกิน 10 MB`), or a
   file-dependent display (`เป็นไฟล์ …`, `รูปภาพ N ภาพ/รายการ`, `รูปภาพเกิน`). Also:
   display checks, field validations (inline copy), text-length / phone /
   number-range EDGE, cancel/leave-modal display + confirm + stay, delete modal +
   confirm + cancel, optional-blank `"-"`.

> **App note:** confirm the app's automation driver (Appium/Detox/Maestro) —
> the fixture/route-mock mechanics above are worded for web/Playwright and may
> need adapting. Refine this section as the app suite takes shape.

### Merge redundant successes → one happy-path per form (`Merged`)

Within each **add** and each **edit** scenario, the multiple
`…สำเร็จ กรณี{field}` cases each fill the whole form (focus field +
`กรอก/เลือกข้อมูลอื่นๆ ครบ`), so they all exercise the **same** happy path. Keep
**one** as `Automate` and tag the rest **`Merged`**. Prefer the
**`กรณีมี{section} 1 {unit}`** minimal-add case as the kept `Automate` happy-path
(e.g. `…สำเร็จ กรณีมีทักษะด้านภาษา 1 ภาษา`, `…สำเร็จ กรณีระบุทักษะ 1 รายการ`) — it adds
exactly one item end-to-end, the cleanest path to automate; if no such case
exists, keep the first `…สำเร็จ`. A case is a merge candidate when its description
has `ตรวจสอบการเพิ่ม…`/`ตรวจสอบการแก้ไข…` **and** `สำเร็จ` (and not `ไม่สำเร็จ`).
**Keep separate (do NOT merge):**
- the **`กรณีไม่มี{section}`** radio-branch success — it's a different code path;
- **file-upload** successes (`อัปโหลด…`) — distinct file-handling coverage, each
  `Automate` on its own.

## Don't (generation)

- Don't fabricate `precondition` if the source cell is empty — write steps
  that are valid given no stated precondition.
- Don't write a Note column — it doesn't exist in this sheet.
- Don't invent or abbreviate `pre_steps`; copy them verbatim as the first steps.
- Don't reuse web-only display conventions (`เปิดเว็บไซต์`, `ปิด Browser`) — QuickShift
  is an app.
