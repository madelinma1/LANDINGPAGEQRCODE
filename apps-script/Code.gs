/*************************************************************************
 * DIAGNOSTIC COMPLETION AGENT — BACKEND (Google Apps Script)
 * ------------------------------------------------------------------------
 * Two responsibilities live in this single script:
 *
 *   1) doPost(e)                  -> the "spreadsheet integration endpoint".
 *                                    The landing page (Part 2) POSTs each
 *                                    completed diagnostic here; we append a
 *                                    row to the sheet.
 *
 *   2) processDiagnosticCohorts() -> the BATCH processor. It scans the sheet
 *                                    for people who finished but haven't been
 *                                    emailed yet, GROUPS them by their result
 *                                    category, creates one tracking Google Doc
 *                                    per group, and sends ONE broadcast email
 *                                    per group (BCC so recipients stay private).
 *                                    Run it manually or on a time-based trigger.
 *
 * Everything is written from scratch and commented so you can follow exactly
 * how grouping, document creation, and batch messaging work together.
 *************************************************************************/


/* =======================================================================
 * GLOBAL CONFIGURATION
 * ===================================================================== */

// The single master Google Doc that holds one preset email per category.
// (See the "TEMPLATE DOC FORMAT" note at the bottom of this file.)
var TEMPLATE_DOC_ID = 'YOUR_SINGLE_TEMPLATE_DOC_ID_HERE';

// Name of the tab that holds the data. Leave '' to use the first sheet.
var DATA_SHEET_NAME = 'Datos';

// The visible "To:" of each broadcast. BCC keeps the cohort hidden from
// each other, so we send the message "to" yourself. Session.getEffectiveUser()
// resolves to the account that owns/runs the script.
var BROADCAST_TO_ADDRESS = Session.getEffectiveUser().getEmail();

// The friendly "from name" shown to recipients.
var SENDER_NAME = 'Madelin Santana';

// Column positions (1-based). Adjust here if your sheet layout ever changes.
var COL_EMAIL      = 1; // A: Email Address
var COL_FIRST_NAME = 2; // B: First Name
var COL_TIMESTAMP  = 3; // C: Timestamp (diagnostic completed)
var COL_COMPLETED  = 4; // D: Diagnostic Completed?  ('Yes' / 'No')
var COL_CATEGORY   = 5; // E: Diagnostic Result Category ('Category A', ...)
var COL_PROCESSED  = 6; // F: Cohort Processed?  ('Yes' once emailed)
var COL_COHORT_URL = 7; // G: Cohort Doc URL (written by the batch job)

var HEADER_ROWS = 1;    // how many header rows to skip at the top


/* =======================================================================
 * PART 1a — INGEST ENDPOINT  (doPost)
 * The landing page posts here. We append one row per completed diagnostic.
 * ===================================================================== */
function doPost(e) {
  // A lock prevents two simultaneous submissions from writing to the same
  // row / corrupting each other.
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getDataSheet();

    // First run: lay down the header row so the sheet is self-describing.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Email Address', 'First Name', 'Timestamp',
        'Diagnostic Completed?', 'Diagnostic Result Category',
        'Cohort Processed?', 'Cohort Doc URL'
      ]);
    }

    // The frontend sends JSON as text/plain (avoids a CORS preflight).
    var d = {};
    try { d = JSON.parse(e.postData.contents); } catch (err) { d = {}; }

    // Append exactly in the A–G column order. F and G stay blank until the
    // batch job processes this person.
    sheet.appendRow([
      d.email    || '',                 // A
      d.firstName || d.nombre || '',    // B (accept either key)
      new Date(),                       // C
      d.completed || 'Yes',             // D
      d.category  || d.result || '',    // E
      '',                               // F (Cohort Processed? -> blank)
      ''                                // G (Cohort Doc URL     -> blank)
    ]);

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}


/* =======================================================================
 * PART 1b — BATCH PROCESSOR  (processDiagnosticCohorts)
 * Group unprocessed completers by category -> doc + broadcast -> mark done.
 * ===================================================================== */
function processDiagnosticCohorts() {
  var sheet = getDataSheet();

  // Make sure the "Cohort Doc URL" header exists in column G.
  if (String(sheet.getRange(1, COL_COHORT_URL).getValue()).trim() === '') {
    sheet.getRange(1, COL_COHORT_URL).setValue('Cohort Doc URL');
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROWS) {
    Logger.log('No data rows to process.');
    return;
  }

  // ---- STEP 1: read all rows in one batch, and parse the template doc. ----
  var numRows = lastRow - HEADER_ROWS;
  var values  = sheet.getRange(HEADER_ROWS + 1, 1, numRows, COL_COHORT_URL).getValues();
  var templates = parseTemplateDoc(TEMPLATE_DOC_ID);

  // ---- STEP 2 + 3: find unprocessed completers and GROUP them by category.
  // groups = { "category a": [ {sheetRow, email, firstName}, ... ], ... }
  var groups = {};
  for (var i = 0; i < values.length; i++) {
    var row       = values[i];
    var completed = String(row[COL_COMPLETED - 1]).trim().toLowerCase();
    var processed = String(row[COL_PROCESSED - 1]).trim().toLowerCase();
    var category  = String(row[COL_CATEGORY  - 1]).trim();
    var email     = String(row[COL_EMAIL     - 1]).trim();

    // Only people who FINISHED ('Yes') and are NOT yet processed, and who
    // actually have a category and an email, are eligible.
    var eligible = (completed === 'yes') && (processed !== 'yes') &&
                   (category !== '') && (email !== '');
    if (!eligible) continue;

    // Use a normalized key so "Category A" and "category a " land together,
    // but keep the original label for the doc title / logs.
    var key = normalizeKey(category);
    if (!groups[key]) {
      groups[key] = { label: category, members: [] };
    }
    groups[key].members.push({
      sheetRow:  HEADER_ROWS + 1 + i,               // absolute row in the sheet
      email:     email,
      firstName: String(row[COL_FIRST_NAME - 1]).trim()
    });
  }

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var totalEmailed = 0;
  var cohortCount  = 0;

  // ---- STEP 4: process each category group that has at least one member. --
  for (var groupKey in groups) {
    var group   = groups[groupKey];
    var members = group.members;
    if (!members.length) continue;
    cohortCount++;

    // 4a + 4b. Create ONE tracking Google Doc for this cohort and write a
    //          clean list of everyone in it (for your records/logging).
    var doc     = DocumentApp.create('Diagnostic Cohort - ' + group.label + ' - ' + today);
    var docBody = doc.getBody();
    docBody.appendParagraph('Diagnostic Cohort — ' + group.label)
           .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    docBody.appendParagraph('Generated: ' + new Date());
    docBody.appendParagraph('Recipients in this cohort: ' + members.length);
    docBody.appendParagraph(''); // spacer
    members.forEach(function (m, idx) {
      docBody.appendParagraph(
        (idx + 1) + '. ' + (m.firstName || '(no name)') + '   <' + m.email + '>'
      );
    });
    doc.saveAndClose();
    var docUrl = doc.getUrl();

    // 4c. Pull the GENERAL subject + body for this category from the template.
    //     (No per-user personalization tags are processed — one message per group.)
    var tmpl = templates[groupKey];

    // 4d. Compile the cohort's email addresses into a clean array.
    var emails = members.map(function (m) { return m.email; });

    // 4e. Send ONE broadcast. BCC = everyone gets it, nobody sees the others.
    if (tmpl) {
      GmailApp.sendEmail(
        BROADCAST_TO_ADDRESS,        // visible To: (yourself)
        tmpl.subject,                // general subject line
        tmpl.body,                   // general plain-text body
        {
          bcc:  emails.join(','),    // the whole cohort, hidden from each other
          name: SENDER_NAME
        }
      );
      totalEmailed += emails.length;
    } else {
      // No matching template: we still log the cohort doc + mark processed,
      // but we do NOT email (nothing to send). Fix the template and re-run
      // after clearing column F for those rows if you want to email them.
      Logger.log('No template found for category "' + group.label +
                 '". Cohort doc created, but no email sent.');
    }

    // 5. Mark every member's row as processed and stamp the cohort doc URL,
    //    so no one is ever double-emailed on a future run.
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
 * TEMPLATE PARSER
 * Reads the master Doc and splits it into { normalizedCategory: {subject, body} }.
 * Segments are delimited by header lines like:  --- CATEGORY A ---
 * The FIRST non-blank line under a header is the Subject; everything after
 * it (until the next header) is the Body.
 * ===================================================================== */
function parseTemplateDoc(docId) {
  if (!docId || docId === 'YOUR_SINGLE_TEMPLATE_DOC_ID_HERE') {
    throw new Error('TEMPLATE_DOC_ID is not set. Paste your master template Doc ID at the top of the script.');
  }

  var text  = DocumentApp.openById(docId).getBody().getText();
  var lines = text.split('\n');

  // Matches "--- CATEGORY A ---", "-- Category B --", etc. Captures the label.
  var headerRegex = /^\s*-{2,}\s*(.+?)\s*-{2,}\s*$/;

  var templates       = {};
  var currentKey      = null;
  var subject         = '';
  var bodyLines       = [];
  var subjectCaptured = false;

  // Save the section we've been accumulating into the templates map.
  function flush() {
    if (currentKey !== null) {
      templates[currentKey] = {
        subject: subject.trim(),
        body:    bodyLines.join('\n').trim()
      };
    }
  }

  for (var i = 0; i < lines.length; i++) {
    var line  = lines[i];
    var match = line.match(headerRegex);

    if (match) {
      // New category header: bank the previous one, then reset accumulators.
      flush();
      currentKey      = normalizeKey(match[1]);
      subject         = '';
      bodyLines       = [];
      subjectCaptured = false;
      continue;
    }

    if (currentKey === null) continue;   // ignore any preamble before 1st header

    if (!subjectCaptured) {
      if (line.trim() === '') continue;  // skip blank lines until we hit the subject
      subject = line.trim();             // first non-blank line = Subject
      subjectCaptured = true;
    } else {
      bodyLines.push(line);              // everything else = Body
    }
  }
  flush(); // don't forget the final section

  return templates;
}


/* =======================================================================
 * SMALL HELPERS
 * ===================================================================== */

// Resolve the data tab (named tab if configured, else the first sheet).
function getDataSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = DATA_SHEET_NAME ? ss.getSheetByName(DATA_SHEET_NAME) : ss.getSheets()[0];
  if (!sheet && DATA_SHEET_NAME) {
    // Auto-create the tab if it doesn't exist yet (handy on first deploy).
    sheet = ss.insertSheet(DATA_SHEET_NAME);
  }
  return sheet;
}

// Normalize a category label so minor spacing/case differences still group.
function normalizeKey(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, ' ');
}

// Standard JSON response for the Web App.
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/* =======================================================================
 * OPTIONAL: install a daily automatic run of the batch processor.
 * Run this ONCE (from the editor) to schedule processDiagnosticCohorts()
 * every day at ~8am in the script's timezone.
 * ===================================================================== */
function createDailyTrigger() {
  // Remove any existing triggers for this function to avoid duplicates.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processDiagnosticCohorts') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('processDiagnosticCohorts')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  Logger.log('Daily trigger created for processDiagnosticCohorts().');
}


/* =======================================================================
 * TEMPLATE DOC FORMAT  (put this content in the Doc referenced by
 * TEMPLATE_DOC_ID). One section per result category:
 *
 *   --- CATEGORY A ---
 *   Tu resultado: Categoría A
 *   Hola, gracias por completar el diagnóstico...
 *   (as many body lines as you want)
 *
 *   --- CATEGORY B ---
 *   Tu resultado: Categoría B
 *   Hola, aquí está tu siguiente paso...
 *
 * Rules:
 *   • The header label between the dashes must match Column E exactly
 *     (case/spacing-insensitive), e.g. "Category A".
 *   • First non-blank line under a header = Subject.
 *   • Everything below that (until the next header) = Body.
 * ===================================================================== */
