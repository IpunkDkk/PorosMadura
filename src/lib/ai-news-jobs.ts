import { randomUUID } from 'crypto'
import { generateAiPostDraft, type AiNewsTaxonomyOption } from '@/lib/ai-news'
import { getRedisClient } from '@/lib/cache'
import { importRemoteImageToMedia } from '@/lib/media-import'

const WORKER_VERSION = 'taxonomy-suggestions-v2'
const QUEUE_KEY = `ai-news:queue:${WORKER_VERSION}`
const JOB_KEY_PREFIX = 'ai-news:job:'
const JOB_TTL_SECONDS = 60 * 60

type AiNewsJobStatus = 'queued' | 'running' | 'completed' | 'failed'

export type AiNewsJobSnapshot = {
  id: string
  status: AiNewsJobStatus
  stage: string
  progress: number
  message: string
  articleUrl: string
  importImage: boolean
  categories?: AiNewsTaxonomyOption[]
  tags?: AiNewsTaxonomyOption[]
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
  failedAt?: string
  error?: string
  draft?: unknown
}

type WorkerGlobal = typeof globalThis & {
  __porosAiNewsWorkerStarted?: boolean
  __porosAiNewsWorkerVersion?: string
}

function jobKey(id: string) {
  return `${JOB_KEY_PREFIX}${id}`
}

function nowIso() {
  return new Date().toISOString()
}

function parseSnapshot(id: string, fields: Record<string, string>): AiNewsJobSnapshot | null {
  if (!fields.status) return null

  return {
    id,
    status: fields.status as AiNewsJobStatus,
    stage: fields.stage || 'queued',
    progress: Number(fields.progress || 0),
    message: fields.message || '',
    articleUrl: fields.articleUrl || '',
    importImage: fields.importImage === 'true',
    categories: fields.categories ? JSON.parse(fields.categories) : undefined,
    tags: fields.tags ? JSON.parse(fields.tags) : undefined,
    createdAt: fields.createdAt || '',
    updatedAt: fields.updatedAt || '',
    startedAt: fields.startedAt || undefined,
    completedAt: fields.completedAt || undefined,
    failedAt: fields.failedAt || undefined,
    error: fields.error || undefined,
    draft: fields.draft ? JSON.parse(fields.draft) : undefined,
  }
}

async function updateJob(
  id: string,
  fields: Partial<Omit<AiNewsJobSnapshot, 'id' | 'draft'>> & { draft?: unknown },
) {
  const redis = getRedisClient()
  if (!redis) return

  const values: Record<string, string> = {
    updatedAt: nowIso(),
  }

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue
    values[key] = key === 'draft' ? JSON.stringify(value) : String(value)
  }

  await redis.hset(jobKey(id), values)
  await redis.expire(jobKey(id), JOB_TTL_SECONDS)
}

export async function enqueueAiNewsJob(articleUrl: string, options: {
  importImage?: boolean
  categories?: AiNewsTaxonomyOption[]
  tags?: AiNewsTaxonomyOption[]
} = {}) {
  const redis = getRedisClient()
  if (!redis) {
    throw new Error('Redis tidak tersedia untuk menjalankan AI worker')
  }

  startAiNewsWorker()

  const id = randomUUID()
  const createdAt = nowIso()
  await redis.hset(jobKey(id), {
    status: 'queued',
    stage: 'queued',
    progress: '3',
    message: 'Job AI masuk antrean',
    articleUrl,
    importImage: options.importImage ? 'true' : 'false',
    categories: JSON.stringify(options.categories || []),
    tags: JSON.stringify(options.tags || []),
    createdAt,
    updatedAt: createdAt,
  })
  await redis.expire(jobKey(id), JOB_TTL_SECONDS)
  await redis.rpush(QUEUE_KEY, id)

  return id
}

export async function getAiNewsJob(id: string) {
  const redis = getRedisClient()
  if (!redis) return null

  startAiNewsWorker()

  const fields = await redis.hgetall(jobKey(id))
  return parseSnapshot(id, fields)
}

async function processJob(id: string) {
  const snapshot = await getAiNewsJob(id)
  if (!snapshot || snapshot.status !== 'queued') return

  await updateJob(id, {
    status: 'running',
    stage: 'starting',
    progress: 5,
    message: 'Worker mulai memproses artikel',
    startedAt: nowIso(),
  })

  try {
    const draft = await generateAiPostDraft(
      snapshot.articleUrl,
      (progress) => updateJob(id, progress),
      {
        categories: snapshot.categories,
        tags: snapshot.tags,
      },
    )
    const warnings: string[] = []

    if (snapshot.importImage && draft.source.imageUrl) {
      await updateJob(id, {
        stage: 'image',
        progress: 96,
        message: 'Mengimpor gambar sumber ke Media Library',
      })

      try {
        const imported = await importRemoteImageToMedia({
          imageUrl: draft.source.imageUrl,
          alt: draft.form.title,
          caption: `Diimpor dari ${draft.source.siteName}`,
          credit: draft.source.siteName,
        })
        draft.form.featuredImageId = imported.id
        draft.form.ogImageId = imported.id
        ;(draft as typeof draft & { importedMedia?: typeof imported }).importedMedia = imported
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal mengimpor gambar sumber'
        warnings.push(message)
      }
    } else if (snapshot.importImage) {
      warnings.push('Artikel sumber tidak menyediakan gambar yang bisa diimpor')
    }

    if (warnings.length) {
      draft.diagnostics.warnings = warnings
    }

    await updateJob(id, {
      status: 'completed',
      stage: 'complete',
      progress: 100,
      message: 'Draft artikel AI selesai',
      completedAt: nowIso(),
      draft,
    })
  } catch (error) {
    console.error('AI news job failed:', error)
    await updateJob(id, {
      status: 'failed',
      stage: 'failed',
      progress: Math.max(snapshot.progress || 0, 5),
      message: 'Gagal menjalankan pipeline AI',
      failedAt: nowIso(),
      error: error instanceof Error ? error.message : 'Gagal menjalankan pipeline AI',
    })
  }
}

async function workerLoop() {
  const redis = getRedisClient()
  if (!redis) return

  while (true) {
    try {
      const id = await redis.lpop(QUEUE_KEY)
      if (id) {
        await processJob(id)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('AI news worker loop error:', error)
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }
}

export function startAiNewsWorker() {
  const globalForWorker = globalThis as WorkerGlobal
  if (
    globalForWorker.__porosAiNewsWorkerStarted &&
    globalForWorker.__porosAiNewsWorkerVersion === WORKER_VERSION
  ) return
  if (!getRedisClient()) return

  globalForWorker.__porosAiNewsWorkerStarted = true
  globalForWorker.__porosAiNewsWorkerVersion = WORKER_VERSION
  void workerLoop()
}
