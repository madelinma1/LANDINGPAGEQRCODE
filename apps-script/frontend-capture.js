/*************************************************************************
 * DIAGNOSTIC COMPLETION AGENT — FRONTEND CAPTURE (vanilla JavaScript)
 * ------------------------------------------------------------------------
 * OPTIONAL. The current Visible site already captures completions from its
 * React app, so you do NOT need this for that site. Use this snippet only to
 * embed the diagnostic on a DIFFERENT page (a web builder, a plain static
 * HTML page, etc.) and feed the same unified backend (Code.gs).
 *
 * Drop this snippet into any static page / web builder that hosts the
 * diagnostic (e.g. a GitHub Pages site at https://<user>.github.io/...).
 *
 * What it does:
 *   • Waits for the DOM to be ready.
 *   • When the user submits their FINAL diagnostic answers, it reads their
 *     email, first name, and computed result category, then transmits the
 *     payload { email, firstName, completed:'Yes', category } directly to
 *     the Apps Script Web App endpoint (Part 1's doPost), which appends a
 *     row to the Google Sheet.
 *
 * It is intentionally dependency-free (no jQuery, no frameworks) and
 * "fire-and-forget": logging never blocks or breaks the page for the user.
 *
 * >>> EDIT the CONFIG block below to match YOUR page's fields. <<<
 *************************************************************************/
(function () {
  'use strict';

  /* ===================== CONFIG — EDIT THESE ========================= */

  // 1) Your Apps Script Web App URL.
  //    In Apps Script: Deploy > New deployment > Web app
  //      - Execute as: Me
  //      - Who has access: Anyone
  //    Copy the URL ending in /exec and paste it here.
  var ENDPOINT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

  // 2) CSS selectors for the inputs/controls on YOUR page.
  //    Change these to match your actual form markup.
  var EMAIL_SELECTOR  = 'input[type="email"]';       // <-- the email field
  var NAME_SELECTOR   = 'input[name="firstName"]';   // <-- the first-name field
  var SUBMIT_SELECTOR = 'button[type="submit"]';     // <-- the FINAL submit button

  // 3) (Optional) If your form is a real <form>, set its selector here and we
  //    will also listen for the native "submit" event. Leave '' to skip.
  var FORM_SELECTOR   = 'form';

  /* ================================================================== */


  // Run once the DOM is ready.
  window.addEventListener('DOMContentLoaded', function () {
    // Attach to the final submit button, if present.
    var submitBtn = document.querySelector(SUBMIT_SELECTOR);
    if (submitBtn) {
      submitBtn.addEventListener('click', handleCompletion);
    } else {
      console.warn('[diagnostic-capture] submit button not found for selector:', SUBMIT_SELECTOR);
    }

    // Also attach to the <form> submit event, if you use a real form.
    if (FORM_SELECTOR) {
      var form = document.querySelector(FORM_SELECTOR);
      if (form) {
        form.addEventListener('submit', handleCompletion);
      }
    }
  });


  /**
   * Gather the payload and send it. Called on final submit.
   * Guarded so it only sends once per submission.
   */
  var alreadySent = false;
  function handleCompletion() {
    if (alreadySent) return;

    var email     = readValue(EMAIL_SELECTOR);
    var firstName = readValue(NAME_SELECTOR);
    var category  = getResultCategory();

    // Don't send junk: require at least an email.
    if (!email) {
      console.warn('[diagnostic-capture] no email found — not sending.');
      return;
    }

    alreadySent = true;
    sendToSheet({
      email:     email,
      firstName: firstName,
      completed: 'Yes',       // this fires only on completion
      category:  category     // the computed Score / Result Category
    });
  }


  /**
   * EDIT THIS to return the computed result category from your quiz logic.
   * Common patterns (uncomment/adjust whichever matches your setup):
   */
  function getResultCategory() {
    // (a) Your quiz code sets a global when it finishes:
    if (window.diagnosticResult) return String(window.diagnosticResult);

    // (b) You store it in a hidden input the quiz fills in:
    var hidden = document.querySelector('input[name="resultCategory"]');
    if (hidden && hidden.value) return String(hidden.value).trim();

    // (c) You keep it in a data-attribute on some element:
    var el = document.querySelector('[data-result-category]');
    if (el) return String(el.getAttribute('data-result-category')).trim();

    // Fallback: empty (the batch job will simply not group an empty category).
    return '';
  }


  /** Read + trim the value of the first element matching a selector. */
  function readValue(selector) {
    var el = document.querySelector(selector);
    return el ? String(el.value || '').trim() : '';
  }


  /**
   * POST the payload to the Apps Script endpoint.
   *   - mode:'no-cors'  -> Apps Script Web Apps don't return CORS headers, so
   *                        we send fire-and-forget (we don't read the response).
   *   - text/plain body -> avoids a CORS preflight (OPTIONS) request, which
   *                        Apps Script would reject.
   */
  function sendToSheet(payload) {
    try {
      fetch(ENDPOINT_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body:    JSON.stringify(payload)
      }).catch(function (err) {
        console.warn('[diagnostic-capture] send failed:', err);
      });
    } catch (err) {
      // Never let logging break the user's experience.
      console.warn('[diagnostic-capture] unexpected error:', err);
    }
  }

})();
