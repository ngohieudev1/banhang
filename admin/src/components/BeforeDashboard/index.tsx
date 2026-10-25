import { Banner } from '@payloadcms/ui'
import type { I18n } from '@payloadcms/translations'
import React from 'react'

import { DatabaseBackup } from './DatabaseBackup'
import { SeedButton } from './SeedButton'
import { CatalogImport } from '../CatalogImport'
import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC<{ i18n?: I18n }> = ({ i18n }) => {
  const t = (key: string) => (i18n ? (i18n.t as (k: string) => string)(`custom:${key}`) : key)

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>{t('dashboardWelcome')}</h4>
      </Banner>
      <DatabaseBackup isVietnamese={i18n?.language === 'vi'} />
      <CatalogImport />
      {t('nextSteps')}
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {t('seedSuffix')}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">{t('visitWebsite')}</a>
          {t('seeResults')}
        </li>
        <li>{t('manageContent')}</li>
      </ul>
    </div>
  )
}
