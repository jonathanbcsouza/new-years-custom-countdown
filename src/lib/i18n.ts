import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import pt from '@/locales/pt.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import ja from '@/locales/ja.json';
import zh from '@/locales/zh.json';
import hi from '@/locales/hi.json';
import ar from '@/locales/ar.json';
import bn from '@/locales/bn.json';
import ru from '@/locales/ru.json';
import id from '@/locales/id.json';
import ko from '@/locales/ko.json';
import tr from '@/locales/tr.json';
import vi from '@/locales/vi.json';
import it from '@/locales/it.json';
import th from '@/locales/th.json';
import pl from '@/locales/pl.json';
import nl from '@/locales/nl.json';
import uk from '@/locales/uk.json';
import mi from '@/locales/mi.json';

// Top languages by number of speakers + Maori for New Zealand
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'mi', name: 'Māori', nativeName: 'Te Reo Māori' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
] as const;

export type LanguageCode = (typeof supportedLanguages)[number]['code'];

// Get stored language or detect from browser
const getInitialLanguage = (): LanguageCode => {
  const stored = localStorage.getItem('app-language');
  if (stored && supportedLanguages.some((lang) => lang.code === stored)) {
    return stored as LanguageCode;
  }

  // Detect from browser
  const browserLang = navigator.language.split('-')[0];
  const matched = supportedLanguages.find((lang) => lang.code === browserLang);
  return matched ? matched.code : 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    mi: { translation: mi },
    es: { translation: es },
    pt: { translation: pt },
    fr: { translation: fr },
    de: { translation: de },
    ja: { translation: ja },
    zh: { translation: zh },
    hi: { translation: hi },
    ar: { translation: ar },
    bn: { translation: bn },
    ru: { translation: ru },
    id: { translation: id },
    ko: { translation: ko },
    tr: { translation: tr },
    vi: { translation: vi },
    it: { translation: it },
    th: { translation: th },
    pl: { translation: pl },
    nl: { translation: nl },
    uk: { translation: uk },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
