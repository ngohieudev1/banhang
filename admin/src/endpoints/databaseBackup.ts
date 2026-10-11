import { gunzipSync, gzipSync } from 'zlib'
import { EJSON } from 'bson'
import type { Endpoint } from 'payload'

import { checkRole } from '@/access/utilities'

const requireAdmin = (req: Parameters<Endpoint['handler']>[0]) => checkRole(['admin'], req.user)

export const databaseBackupDownloadEndpoint: Endpoint = {
  method: 'get',
  path: '/database-backup',
  handler: async (req) => {
    if (!requireAdmin(req)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const collections: Record<string, unknown[]> = {}
    for (const { slug } of req.payload.config.collections) {
      const collection = req.payload.db.collections[slug]?.collection
      if (!collection) throw new Error(`Mongo collection is not available: ${slug}`)
      collections[slug] = await collection.find({}).toArray()
    }

    const globals: Record<string, unknown> = {}
    for (const { slug } of req.payload.config.globals) {
      globals[slug] = await req.payload.findGlobal({
        slug,
        depth: 0,
        overrideAccess: true,
      })
    }

    const payload = {
      version: 2,
      generatedAt: new Date().toISOString(),
      collections,
      globals,
    }
    const compressed = gzipSync(EJSON.stringify(payload, { relaxed: false }))
    const date = new Date().toISOString().slice(0, 10)

    return new Response(compressed as BodyInit, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="dungbn-backup-${date}.json.gz"`,
        'Cache-Control': 'no-store',
      },
    })
  },
}

export const databaseBackupRestoreEndpoint: Endpoint = {
  method: 'post',
  path: '/database-backup',
  handler: async (req) => {
    if (!requireAdmin(req)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
      const formData = await (req as Request).formData()
      const file = formData.get('file')
      if (!(file instanceof File)) {
        return Response.json({ error: 'A backup file is required' }, { status: 400 })
      }
      if (file.size > 100 * 1024 * 1024) {
        return Response.json({ error: 'Backup file is too large' }, { status: 413 })
      }

      const input = Buffer.from(await file.arrayBuffer())
        const json = file.name.endsWith('.gz') ? gunzipSync(input).toString('utf8') : input.toString('utf8')
        const backup = EJSON.parse(json) as {
          version?: number
          collections?: Record<string, unknown>
          globals?: Record<string, unknown>
        }
        const configuredCollections = new Set<string>(req.payload.config.collections.map(({ slug }) => slug))
        const configuredGlobals = new Set<string>(req.payload.config.globals.map(({ slug }) => slug))

        if (backup.version !== 2 || !backup.collections || typeof backup.collections !== 'object') {
          return Response.json({ error: 'Unsupported backup format' }, { status: 400 })
        }
        for (const [slug, documents] of Object.entries(backup.collections)) {
          if (!configuredCollections.has(slug) || !Array.isArray(documents)) {
            return Response.json({ error: `Invalid collection: ${slug}` }, { status: 400 })
          }
        }
        if (backup.globals && typeof backup.globals !== 'object') {
          return Response.json({ error: 'Invalid globals' }, { status: 400 })
        }
        for (const slug of Object.keys(backup.globals || {})) {
          if (!configuredGlobals.has(slug)) {
            return Response.json({ error: `Invalid global: ${slug}` }, { status: 400 })
          }
        }

        for (const { slug } of req.payload.config.collections) {
          const documents = backup.collections[slug]
          const collection = req.payload.db.collections[slug]?.collection
          if (!collection) throw new Error(`Mongo collection is not available: ${slug}`)
          await collection.deleteMany({})
          if (Array.isArray(documents) && documents.length > 0) {
            await collection.insertMany(documents as never[])
          }
        }
        for (const [slug, data] of Object.entries(backup.globals || {})) {
          await req.payload.updateGlobal({
            slug: slug as 'header' | 'footer' | 'site-settings',
            data: data as Record<string, unknown>,
            depth: 0,
            overrideAccess: true,
          })
        }

      return Response.json({ ok: true })
    } catch (error) {
      req.payload.logger.error({ err: error }, 'Database restore failed')
      return Response.json({ error: 'Could not import backup' }, { status: 400 })
    }
  },
}