'use client'

import React, { Fragment, useCallback, useState, MouseEvent } from 'react'
import { toast, useTranslation } from '@payloadcms/ui'

import './index.scss'

export const SeedButton: React.FC = () => {
  const { i18n } = useTranslation()
  const t = useCallback(
    (key: string, vars?: Record<string, unknown>) =>
      (i18n.t as (k: string, v?: Record<string, unknown>) => string)(`custom:${key}`, vars),
    [i18n],
  )

  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const handleClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (seeded) {
        toast.info(t('seedAlready'))
        return
      }
      if (loading) {
        toast.info(t('seedInProgress'))
        return
      }
      if (error) {
        toast.error(t('seedRefresh'))
        return
      }

      setLoading(true)

      try {
        toast.promise(
          new Promise((resolve, reject) => {
            try {
              fetch('/next/seed', { method: 'POST', credentials: 'include' })
                .then((res) => {
                  if (res.ok) {
                    resolve(true)
                    setSeeded(true)
                  } else {
                    reject(t('seedFailed'))
                  }
                })
                .catch((error) => {
                  reject(error)
                })
            } catch (error) {
              reject(error)
            }
          }),
          {
            loading: t('seedLoading'),
            success: (
              <div>
                {t('seedSuccess')}
                <a target="_blank" href="/">
                  {t('visitWebsite')}
                </a>
              </div>
            ),
            error: t('seedFailed'),
          },
        )
      } catch (err) {
        setError(err)
      }
    },
    [loading, seeded, error, t],
  )

  let message = ''
  if (loading) message = t('seeding')
  if (seeded) message = t('seedDone')
  if (error) message = t('seedErrorSuffix', { error: String(error) })

  return (
    <Fragment>
      <button className="seedButton" onClick={handleClick}>
        {t('seedButton')}
      </button>
      {message}
    </Fragment>
  )
}
