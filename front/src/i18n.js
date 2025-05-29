// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import en from './locales/en/translation.json';
import zh from './locales/zh/translation.json';
import hi from './locales/hi/translation.json';

const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
  hi: {
    translation: hi,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en', // use en if detected lng is not available
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;