/*************************************************************************
 * VISIBLE — UNIFIED BACKEND (Google Apps Script)
 * ------------------------------------------------------------------------
 * This is the MERGED system: the live diagnostic site already POSTs every
 * "Inició" / "Completó" event into this same Google Sheet, and this script
 * both (a) receives those posts and (b) batch-groups the people who
 * COMPLETED into cohorts by their result and emails each cohort.
 *
 *   doPost(e)                  -> ingest endpoint the live site already uses.
 *                                 Appends one row per event (Inició/Completó).
 *
 *   processDiagnosticCohorts() -> batch job. Finds completed people not yet
 *                                 processed, GROUPS them by their result
 *                                 category (the "Nivel VP" column), creates a
 *                                 tracking Google Doc per group, and sends one
 *                                 BCC broadcast per group from a master
 *                                 template Doc. Marks each row processed.
 *
 * IMPORTANT: paste this into the SAME Apps Script project that is already
 * deployed for the site (the one whose /exec URL the page posts to), so the
 * existing endpoint keeps working and the cohort logic is added on top.
 * Keep the SAME deployment (Deploy > Manage deployments > edit > Deploy) so
 * the site's endpoint URL does not change.
 *************************************************************************/


/* =======================================================================
 * GLOBAL CONFIGURATION
 * ===================================================================== */

// ONE Google Doc per Nivel VP. In each Doc: the FIRST non-blank line is the
// email Subject; everything below it is the email Body, sent verbatim.
// Edit these Docs freely — whatever you type is exactly what gets emailed.
// The keys must match the "Nivel VP" values the site produces (accents/case
// are ignored when matching).
var TEMPLATE_DOC_IDS = {
  'Lista para VP':               '1oMZMGRGc2OpEew95QmBDEVntDrcYVRiT-c436SVDZAY',
  'En construcción estratégica': '1zA1F2eJmdoooCqxucalwZx2lAnIMHYcXMoGqtneK7tA',
  'Zona de reenfoque':           '1iaXJNZGcsid3ZnH8pWUtUZnF0AVi__HLYtI5iHPYPqs',
  'Inicio del recorrido':        '1NrV9xScGMXbCxd_aqPaZJdKP7RLlZLEOsAmAJkHqztc'
};

// The tab the live site writes to.
var DATA_SHEET_NAME = 'Datos';

// Visible "To:" of each broadcast (BCC keeps the cohort private). Defaults to
// the account that owns/runs the script — i.e. you.
var BROADCAST_TO_ADDRESS = Session.getEffectiveUser().getEmail();
var SENDER_NAME = 'Madelin Santana';

// ---- Column positions for the EXISTING sheet layout (1-based) ----
var COL_FECHA      = 1;  // A: Fecha (timestamp of the event)
var COL_EVENTO     = 2;  // B: Evento ("Inició" / "Completó")
var COL_NOMBRE     = 3;  // C: Nombre
var COL_EMAIL      = 4;  // D: Email
var COL_OVERS      = 5;  // E: 3 Overs
var COL_P          = 6;  // F: P
var COL_E          = 7;  // G: E
var COL_A          = 8;  // H: A
var COL_K          = 9;  // I: K
var COL_TOTAL      = 10; // J: Total PEAK
var COL_NIVEL      = 11; // K: Nivel VP   <-- used as the result CATEGORY

// ---- New columns the batch job manages (created automatically) ----
var COL_PROCESSED  = 12; // L: Cohort Procesado?  ('Yes' once emailed)
var COL_COHORT_URL = 13; // M: Cohort Doc URL

// Which column holds the value we GROUP cohorts by. Nivel VP by default.
var CATEGORY_COL = COL_NIVEL;

// The value in "Evento" that means the person finished the diagnostic.
var COMPLETED_EVENT = 'Completó';

var HEADER_ROWS = 1;

// The header row the site uses, plus the two cohort columns.
var HEADERS = ['Fecha', 'Evento', 'Nombre', 'Email', '3 Overs', 'P', 'E', 'A',
               'K', 'Total PEAK', 'Nivel VP', 'Cohort Procesado', 'Cohort Doc URL'];


/* =======================================================================
 * INGEST ENDPOINT  (doPost) — the live site already posts here.
 * Appends one row per event. "Inició" rows have blank scores; "Completó"
 * rows carry the full result. Cohort columns (L/M) start blank.
 * ===================================================================== */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getDataSheet();

    // First run: lay down the header row.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    // The site sends JSON as text/plain (avoids a CORS preflight).
    var d = {};
    try { d = JSON.parse(e.postData.contents); } catch (err) { d = {}; }

    // Match the site's payload keys exactly (evento, nombre, email, overs,
    // p, e, a, k, totalPeak, nivel). Missing scores stay blank (Inició rows).
    sheet.appendRow([
      new Date(),                               // A Fecha
      d.evento || '',                           // B Evento
      d.nombre || d.firstName || '',            // C Nombre
      d.email  || '',                           // D Email
      (d.overs     != null ? d.overs     : ''), // E 3 Overs
      (d.p         != null ? d.p         : ''), // F P
      (d.e         != null ? d.e         : ''), // G E
      (d.a         != null ? d.a         : ''), // H A
      (d.k         != null ? d.k         : ''), // I K
      (d.totalPeak != null ? d.totalPeak : ''), // J Total PEAK
      d.nivel  || ''                            // K Nivel VP
      // L (Cohort Procesado) and M (Cohort Doc URL) intentionally left blank.
    ]);

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}


/* =======================================================================
 * BATCH PROCESSOR  (processDiagnosticCohorts)
 * Group completed-but-unprocessed people by Nivel VP -> doc + BCC -> mark.
 * ===================================================================== */
function processDiagnosticCohorts() {
  var sheet = getDataSheet();

  // Make sure the two cohort-tracking headers exist (L and M).
  ensureHeader(sheet, COL_PROCESSED, 'Cohort Procesado');
  ensureHeader(sheet, COL_COHORT_URL, 'Cohort Doc URL');

  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROWS) { Logger.log('No data rows to process.'); return; }

  // ---- STEP 1: read all rows in one batch + parse the template Doc. ----
  var numRows = lastRow - HEADER_ROWS;
  var values  = sheet.getRange(HEADER_ROWS + 1, 1, numRows, COL_COHORT_URL).getValues();
  var templates = loadTemplates();

  // ---- STEP 2 + 3: select COMPLETED + not-yet-processed rows; GROUP them
  //      by the result category (Nivel VP). ----
  var completedKey = normalizeKey(COMPLETED_EVENT);
  var groups = {}; // { normalizedCategory: { label, members:[{sheetRow,email,firstName}] } }

  for (var i = 0; i < values.length; i++) {
    var row       = values[i];
    var evento    = normalizeKey(row[COL_EVENTO   - 1]);
    var processed = normalizeKey(row[COL_PROCESSED - 1]);
    var category  = String(row[CATEGORY_COL - 1]).trim();
    var email     = String(row[COL_EMAIL    - 1]).trim();

    var isCompleted = (evento === completedKey);
    var isProcessed = (processed === 'yes' || processed === 'sí' || processed === 'si');

    if (isCompleted && !isProcessed && category !== '' && email !== '') {
      var key = normalizeKey(category);
      if (!groups[key]) groups[key] = { label: category, members: [] };
      groups[key].members.push({
        sheetRow:  HEADER_ROWS + 1 + i,
        email:     email,
        firstName: String(row[COL_NOMBRE - 1]).trim()
      });
    }
  }

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var cohortCount = 0, totalEmailed = 0;

  // ---- STEP 4: one tracking Doc + one BCC broadcast per group. ----
  for (var groupKey in groups) {
    var group = groups[groupKey], members = group.members;
    if (!members.length) continue;
    cohortCount++;

    // 4a/4b — create the cohort Doc and list every member for your records.
    var doc  = DocumentApp.create('Diagnostic Cohort - ' + group.label + ' - ' + today);
    var body = doc.getBody();
    body.appendParagraph('Diagnostic Cohort — ' + group.label)
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('Generated: ' + new Date());
    body.appendParagraph('Recipients in this cohort: ' + members.length);
    body.appendParagraph('');
    members.forEach(function (m, idx) {
      body.appendParagraph((idx + 1) + '. ' + (m.firstName || '(sin nombre)') +
                           '   <' + m.email + '>');
    });
    doc.saveAndClose();
    var docUrl = doc.getUrl();

    // 4c/4d/4e — general subject+body for this category -> BCC broadcast.
    var tmpl   = templates[groupKey];
    var emails = members.map(function (m) { return m.email; });
    if (tmpl) {
      GmailApp.sendEmail(
        BROADCAST_TO_ADDRESS,     // visible To: (you)
        tmpl.subject,             // general subject
        tmpl.body,                // general plain-text body
        { bcc: emails.join(','),  // whole cohort, hidden from each other
          name: SENDER_NAME }
      );
      totalEmailed += emails.length;
    } else {
      Logger.log('No template section for "' + group.label +
                 '". Cohort Doc created, but no email sent.');
    }

    // STEP 5 — mark processed + log the Doc URL so nobody is emailed twice.
    members.forEach(function (m) {
      sheet.getRange(m.sheetRow, COL_PROCESSED).setValue('Yes');
      sheet.getRange(m.sheetRow, COL_COHORT_URL).setValue(docUrl);
    });

    Logger.log('Cohort "' + group.label + '": ' + members.length +
               ' user(s). Doc: ' + docUrl);
  }

  Logger.log('Batch complete. Cohorts: ' + cohortCount +
             ', emailed: ' + totalEmailed + ' user(s).');
}


/* =======================================================================
 * TEMPLATE LOADER — reads ONE Google Doc per Nivel VP.
 * Returns { normalizedLevel: {subject, body} }. In each Doc the first
 * non-blank line is the Subject; everything after it is the Body (verbatim).
 * ===================================================================== */
function loadTemplates() {
  var templates = {};
  for (var level in TEMPLATE_DOC_IDS) {
    var docId = TEMPLATE_DOC_IDS[level];
    if (!docId || docId.indexOf('YOUR_') === 0) {
      Logger.log('Template Doc ID not set for "' + level + '" — skipping.');
      continue;
    }
    var text = DocumentApp.openById(docId).getBody().getText();
    templates[normalizeKey(level)] = parseSubjectBody(text);
  }
  return templates;
}

// First non-blank line = Subject; everything after it = Body (sent verbatim).
function parseSubjectBody(text) {
  var lines = text.split('\n');
  var subject = '', bodyStart = 0;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '') { subject = lines[i].trim(); bodyStart = i + 1; break; }
  }
  var body = lines.slice(bodyStart).join('\n').trim();
  return { subject: subject, body: body };
}


/* =======================================================================
 * SMALL HELPERS
 * ===================================================================== */
function getDataSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = DATA_SHEET_NAME ? ss.getSheetByName(DATA_SHEET_NAME) : ss.getSheets()[0];
  if (!sheet && DATA_SHEET_NAME) sheet = ss.insertSheet(DATA_SHEET_NAME);
  return sheet;
}

function ensureHeader(sheet, col, label) {
  if (String(sheet.getRange(1, col).getValue()).trim() === '') {
    sheet.getRange(1, col).setValue(label);
  }
}

// Normalize for matching: trim, lowercase, collapse spaces, and strip accents
// so "Lista para VP" matches a header written "lista para vp", and Spanish
// accents in the Nivel VP values line up with the template headers.
function normalizeKey(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/\s+/g, ' ');
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/* =======================================================================
 * OPTIONAL: schedule the batch to run daily. Run ONCE from the editor.
 * ===================================================================== */
function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processDiagnosticCohorts') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processDiagnosticCohorts')
    .timeBased().everyDays(1).atHour(8).create();
  Logger.log('Daily trigger created for processDiagnosticCohorts().');
}


/* =======================================================================
 * TEMPLATE DOC FORMAT
 * There is ONE Google Doc per Nivel VP (see TEMPLATE_DOC_IDS at the top).
 * Each Doc holds only that level's email. Inside every Doc:
 *
 *   Línea 1  ->  el ASUNTO del correo
 *   (línea en blanco)
 *   El resto ->  el CUERPO del correo (se envía tal cual)
 *
 * Example (contents of the "Lista para VP" Doc):
 *
 *   Estás lista para VP — activemos tu siguiente movimiento
 *
 *   Hola,
 *   Gracias por completar el diagnóstico Visible...
 *
 * Rules:
 *   • The Doc's key in TEMPLATE_DOC_IDS must match the "Nivel VP" value
 *     (accents/case/spacing are ignored when matching).
 *   • The FIRST non-blank line is the Subject.
 *   • Everything after it is the Body, emailed verbatim.
 *   • Do NOT put any preamble/instructions at the very top — line 1 is the
 *     subject.
 * ===================================================================== */
