import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LngDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n.use(HttpBackend)
  .use(LngDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    debug: false,
    interpolation: {
      escapeValue: false, // already react safes from xss
    },
    load: 'currentOnly',
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      lookupCookie: 'lang',
      lookupLocalStorage: 'lang',
      lookupSessionStorage: 'lang',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,

      caches: ['localStorage', 'cookie'],

      lookupQuerystring: 'l',
    },
    supportedLngs: ['en-US', 'de-DE', 'tr'],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
