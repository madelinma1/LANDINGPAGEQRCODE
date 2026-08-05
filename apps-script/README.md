# Visible — Unified Backend (capture + cohort follow-up)

The live diagnostic on this site already logs every `Inició` / `Completó`
event to a Google Sheet. This backend **merges** that capture with an
automatic follow-up that groups the people who **completed** into cohorts by
their result (`Nivel VP`) and emails each cohort.

- **`Code.gs`** — the unified Google Apps Script: the `doPost` ingest endpoint
  the site already posts to **plus** the `processDiagnosticCohorts` batch job.
- **`frontend-capture.js`** — *optional*. The current site captures via its
  React app, so you don't need this. It's only for embedding the diagnostic on
  a non-React page (a web builder, a plain HTML page, etc.).

## How the two halves connect

| Site sends (per event) | Sheet column | Used by the batch job for |
| --- | --- | --- |
| `evento` (`Inició`/`Completó`) | B `Evento` | "completed?" filter (`Completó`) |
| `nombre` | C `Nombre` | cohort member list |
| `email` | D `Email` | recipient |
| `nivel` (VP level) | K `Nivel VP` | **the category cohorts are grouped by** |

Two columns are added and managed by the batch job:

| Col | Header | Meaning |
| --- | --- | --- |
| L | Cohort Procesado | `Yes` once grouped + emailed |
| M | Cohort Doc URL | link to the cohort tracking doc |

## Email template Docs (one per Nivel VP)

There is **one Google Doc per `Nivel VP` level**, mapped in `TEMPLATE_DOC_IDS`
at the top of `Code.gs`. Each Doc holds that level's email:

- **Line 1** = the email **Subject**
- **Everything below** = the email **Body**, sent verbatim

```
Estás lista para VP — activemos tu siguiente movimiento

Hola,
Gracias por completar el diagnóstico Visible...
```

Edit these Docs anytime — whatever you type is exactly what gets emailed. Don't
add a preamble at the very top (line 1 is the subject). The map keys must match
the `Nivel VP` values (accents / case / spacing are ignored when matching).

## Setup (keeps the site's existing endpoint URL)

1. Open the Sheet the site writes to → **Extensions → Apps Script**.
2. Paste `Code.gs` **into that same project** (it already contains the site's
   `doPost`; this version keeps it and adds the cohort logic). Save.
3. Confirm the four Doc IDs in `TEMPLATE_DOC_IDS` (already filled in), and edit
   the four Docs' wording to taste.
4. **Deploy → Manage deployments →** edit the existing Web app deployment →
   **Deploy**. This publishes the new code on the **same `/exec` URL**, so the
   live site keeps posting with no change.
5. Run `processDiagnosticCohorts` once from the editor (authorize when asked),
   or run `createDailyTrigger` to schedule it daily.

## How the batch job works

1. Reads all rows and loads each level's email from its Doc into
   `{ level: {subject, body} }`.
2. Selects rows where **Evento = Completó** and **Cohort Procesado ≠ Yes**.
3. Groups them by **Nivel VP** (Column K).
4. Per group: creates a `Diagnostic Cohort - <level> - <date>` tracking Doc
   listing the members, then sends **one** email (that level's Doc text) with
   the whole group in **BCC**.
5. Stamps **Cohort Procesado = Yes** + the **Cohort Doc URL** on each row, so
   nobody is ever emailed twice.
