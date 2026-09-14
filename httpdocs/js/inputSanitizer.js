/*
 * Wonderful Apps client-side plain-text sanitizer.
 *
 * Purpose: defense-in-depth against XSS/malicious HTML entered into ordinary
 * text fields. Passwords, numbers, dates, checkboxes, file inputs, and other
 * non-text controls are intentionally not modified.
 *
 * Important: client-side sanitization can be bypassed. Backend validation,
 * parameterized SQL, authorization, and safe output rendering remain required.
 */
(function () {
  'use strict';

  const TEXT_INPUT_SELECTOR = [
    'input:not([type])',
    'input[type="text"]',
    'input[type="search"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="url"]',
    'textarea'
  ].join(', ');

  function plainText(value) {
    if (!window.DOMPurify) {
      console.error('WA sanitizer: DOMPurify is not available.');
      return String(value ?? '');
    }

    return DOMPurify.sanitize(String(value ?? ''), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  function sanitizeElement(element) {
    if (!element || !element.matches || !element.matches(TEXT_INPUT_SELECTOR)) {
      return;
    }

    const cleanValue = plainText(element.value);
    if (cleanValue !== element.value) {
      element.value = cleanValue;
    }
  }

  function sanitizeScope(scope) {
    if (!scope || !scope.querySelectorAll) {
      return;
    }

    scope.querySelectorAll(TEXT_INPUT_SELECTOR).forEach(sanitizeElement);
  }

  // Sanitize after ordinary editing is completed.
  document.addEventListener('blur', (event) => {
    sanitizeElement(event.target);
  }, true);

  document.addEventListener('change', (event) => {
    sanitizeElement(event.target);
  }, true);

  // Sanitize before any normal form submission.
  document.addEventListener('submit', (event) => {
    sanitizeScope(event.target);
  }, true);

  // Many WA pages save through button click handlers rather than native form
  // submission. Capture the click first so those handlers receive clean text.
  document.addEventListener('click', (event) => {
    const button = event.target.closest && event.target.closest(
      'button, input[type="button"], input[type="submit"]'
    );

    if (button) {
      sanitizeScope(button.form || document);
    }
  }, true);

  // Covers Enter-key actions that may run custom handlers without a submit.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sanitizeElement(event.target);
    }
  }, true);

  window.WASanitize = Object.freeze({
    plainText,
    sanitizeElement,
    sanitizeScope
  });
})();
