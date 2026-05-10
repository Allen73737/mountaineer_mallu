import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '../locales/en.json';
import mlTranslation from '../locales/ml.json';
import deTranslation from '../locales/de.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ml: { translation: mlTranslation },
      de: { translation: deTranslation },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
