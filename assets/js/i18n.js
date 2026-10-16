function getNestedValue(object, path) {
  return path.split('.').reduce((current, part) => current?.[part], object);
}

function loadTranslations() {
  return Promise.resolve(window.CROCHET_DATA?.translations || {});
}

function t(translations, key, replacements = []) {
  const fallback = getNestedValue(translations.en, key);
  const value = fallback ?? key;

  if (typeof value !== 'string') {
    return key;
  }

  return replacements.reduce(
    (formatted, replacement, index) => formatted.replace(`{${index}}`, replacement),
    value
  );
}

window.loadTranslations = loadTranslations;
window.t = t;
