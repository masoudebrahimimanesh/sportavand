import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { SPORTAVAND_BRAND, toPersianDigits } from '../config/brand';

export interface FooterProps {
  /**
   * Dynamic name of the current section or active module in Persian
   * e.g. 'اسپورتاوند بسکتبال' or 'هسته پلتفرم و مدیریت داده'
   */
  sectionFa: string;
  /**
   * Dynamic name of the current section or active module in English
   * e.g. 'Sportavand Basketball' or 'Core Platform & Data Engine'
   */
  sectionEn: string;
  /**
   * Optional initial language ('fa' | 'en')
   */
  defaultLang?: 'fa' | 'en';
}

/**
 * Reusable Footer & Creator Attribution Component
 * Reads version from SPORTAVAND_BRAND single source of truth, formats digits in Persian for FA UI,
 * dynamically displays current section/module and current Gregorian year, and uses © symbol.
 */
export const Footer: React.FC<FooterProps> = ({
  sectionFa,
  sectionEn,
  defaultLang = 'fa',
}) => {
  const [lang, setLang] = useState<'fa' | 'en'>(defaultLang);
  const currentYear = new Date().getFullYear();

  // Read version from WordPress localized settings if available, otherwise from canonical brand config
  const rawVersion =
    (typeof window !== 'undefined' && (window as any).sportavandSettings?.version) ||
    SPORTAVAND_BRAND.version;

  const persianVersion = toPersianDigits(rawVersion);

  return (
    <footer
      className="spv-footer border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-400"
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-1.5">
        {lang === 'fa' ? (
          <>
            <div className="text-slate-200 font-semibold leading-relaxed">
              اسپورتاوند | Sportavand — سامانه جامع مدیریت ورزش · {sectionFa} · نسخه {persianVersion}
            </div>
            <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
              طراحی و توسعه: {SPORTAVAND_BRAND.creator} ·{' '}
              <a
                href={SPORTAVAND_BRAND.domainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 transition underline-offset-2 hover:underline font-mono"
              >
                {SPORTAVAND_BRAND.domain}
              </a>{' '}
              · © {currentYear}
            </div>
          </>
        ) : (
          <>
            <div className="text-slate-200 font-semibold leading-relaxed font-sans">
              Sportavand — Sports Management Platform · {sectionEn} · Version {rawVersion}
            </div>
            <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Designed &amp; Developed by {SPORTAVAND_BRAND.creator} ·{' '}
              <a
                href={SPORTAVAND_BRAND.domainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 transition underline-offset-2 hover:underline font-mono"
              >
                {SPORTAVAND_BRAND.domain}
              </a>{' '}
              · © {currentYear}
            </div>
          </>
        )}

        {/* Language Toggle for verifying both FA and EN official footer templates */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-amber-300 transition"
            title="تغییر زبان نمایش پابرگ (فارسی / English)"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{lang === 'fa' ? 'English Footer' : 'پابرگ فارسی'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
