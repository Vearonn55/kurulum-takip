// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../locales/en/common';
import trCommon from '../locales/tr/common';

const resources = {
  en: { common: enCommon },
  tr: { common: trCommon },
};

const storedLang = (localStorage.getItem('lang') as 'en' | 'tr') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: storedLang,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
