# Diagnostic Completion Agent

A two-part system that captures completed diagnostics and follows up by
emailing people **in cohorts grouped by their result category**.

- **`Code.gs`** — Google Apps Script backend. Contains both the ingest
  endpoint (`doPost`) and the batch processor (`processDiagnosticCohorts`).
- **`frontend-capture.js`** — vanilla JS snippet for the landing page that
  transmits each completion to the endpoint.

> This folder is a **standalone reference implementation** built to the spec.
> It is independent of the live diagnostic on this site (which already logs to
> a Sheet). Wire it up on its own Sheet/Doc, or adapt it as needed.

## Google Sheet layout

| Col | Header | Meaning |
| --- | --- | --- |
| A | Email Address | recipient email |
| B | First Name | recipient first name |
| C | Timestamp | when the diagnostic was completed |
| D | Diagnostic Completed? | `Yes` / `No` |
| E | Diagnostic Result Category | e.g. `Category A` |
| F | Cohort Processed? | `Yes` once grouped + emailed |
| G | Cohort Doc URL | link to the cohort tracking doc (written by the batch job) |

## Master template Doc format

Create one Google Doc, put its ID in `TEMPLATE_DOC_ID`. One section per
category, delimited by a dashed header. First non-blank line under a header is
the **Subject**; everything below is the **Body**.

```
--- CATEGORY A ---
Tu resultado: Categoría A
Hola, gracias por completar el diagnóstico...

--- CATEGORY B ---
Tu resultado: Categoría B
Hola, aquí está tu siguiente paso...
```

The header label must match Column E (case/spacing-insensitive).

## Setup

1. Open your Google Sheet → **Extensions → Apps Script**. Paste `Code.gs`.
2. Set `TEMPLATE_DOC_ID` (and `DATA_SHEET_NAME` if your tab isn't `Datos`).
3. **Deploy → New deployment → Web app** (Execute as **Me**, Access
   **Anyone**). Copy the `/exec` URL.
4. Put that URL in `frontend-capture.js` (`ENDPOINT_URL`) and add the snippet
   to your page; edit the selectors to match your form.
5. Run `processDiagnosticCohorts` once from the editor (authorize when asked),
   or run `createDailyTrigger` to schedule it automatically.

## How the batch job works

1. Reads every row and parses the template Doc into `{category: {subject, body}}`.
2. Selects rows where **Completed = Yes** and **Processed ≠ Yes**.
3. Groups those rows by their exact result category (Column E).
4. For each group: creates a `Diagnostic Cohort - <Category> - <date>` Doc
   listing the members, then sends **one** email with the whole group in
   **BCC** (recipients stay private to each other).
5. Stamps **Processed = Yes** and the **Cohort Doc URL** on every row in the
   batch, so nobody is ever emailed twice.
