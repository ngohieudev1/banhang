import React from 'react'
import type { I18n } from '@payloadcms/translations'

export const BeforeLogin: React.FC<{ i18n?: I18n }> = ({ i18n }) => {
  const t = (key: string) => (i18n ? (i18n.t as (k: string) => string)(`custom:${key}`) : key)

  return (
    <div>
      <p>
        <b>{t('loginWelcome')}</b>
        {t('loginIntro')}
        <a href={`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/login`}>{t('loginLink')}</a>
        {t('loginOutro')}
      </p>
    </div>
  )
}
