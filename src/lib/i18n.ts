import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend) // Loads translations from /public/locales
  .use(LanguageDetector) // Detects user browser language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "de", "ru"],
    debug: import.meta.env.DEV, // Logs issues in development mode
    interpolation: {
      escapeValue: false, // React already safeguards against XSS
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
