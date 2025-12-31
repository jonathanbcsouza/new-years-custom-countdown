import { useState, useCallback } from 'react';
import { Languages, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type LanguageCode } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Language selector component with dropdown
 */
export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === i18n.language
  ) || supportedLanguages[0];

  const handleLanguageChange = useCallback(
    (langCode: LanguageCode) => {
      i18n.changeLanguage(langCode);
      localStorage.setItem('app-language', langCode);
      setIsOpen(false);
    },
    [i18n]
  );

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-white/10 backdrop-blur-sm border border-white/20
                   text-white hover:bg-white/20 transition-all
                   min-w-[120px] md:min-w-[140px]"
      >
        <Languages className="h-4 w-4 text-white/70 shrink-0" />
        <span className="truncate text-sm flex-1 text-left">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/70 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
      onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div
            className="absolute top-full left-0 mt-2 z-50
                          w-[280px] md:w-[320px] max-h-[60vh]
                          bg-card/95 backdrop-blur-md border border-border
                          rounded-xl shadow-2xl overflow-hidden
                          animate-in fade-in-0 zoom-in-95"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  {t('language.select')}
                </h3>
                <button
      onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Language List */}
            <div className="max-h-[calc(60vh-60px)] overflow-y-auto p-2">
              {supportedLanguages.map((lang) => {
                const isSelected = lang.code === i18n.language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg',
                      'text-sm transition-colors text-left',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground/80 hover:bg-muted'
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{lang.nativeName}</span>
                      <span
                        className={cn(
                          'text-xs',
                          isSelected
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        )}
                      >
                        {lang.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-current" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

