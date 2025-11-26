// src/pages/shared/SettingsPage.tsx
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as 'en' | 'tr';
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const currentLang = i18n.language.startsWith('tr') ? 'tr' : 'en';

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('settings.subtitle')}
        </p>
      </div>

      <section className="max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('settings.languageSectionTitle')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('settings.languageSectionDescription')}
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.languageSectionTitle')}
          </label>
          <select
            value={currentLang}
            onChange={handleLanguageChange}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="en">{t('settings.english')}</option>
            <option value="tr">{t('settings.turkish')}</option>
          </select>
        </div>
      </section>
    </div>
  );
}
