import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es }
};

// Get saved language from localStorage (check both possible keys)
const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'es';

  // First check the dedicated language key
  const directLanguage = localStorage.getItem('farmacia-language');
  if (directLanguage) return directLanguage;

  // Then check if it's stored in the Zustand store
  try {
    const storeData = localStorage.getItem('farmacia-store');
    if (storeData) {
      const parsed = JSON.parse(storeData);
      if (parsed.state?.language) return parsed.state.language;
    }
  } catch {
    // Ignore parse errors
  }

  return 'es';
};

const savedLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
