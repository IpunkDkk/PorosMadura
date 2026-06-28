import { checkAllDueSourceLinks } from '@/lib/source-link-check'

const runHour = Number(process.env.SOURCE_LINK_CHECK_CRON_HOUR || 2)
const runMinute = Number(process.env.SOURCE_LINK_CHECK_CRON_MINUTE || 0)

function nextRunDelayMs() {
  const now = new Date()
  const next = new Date(now)
  next.setHours(runHour, runMinute, 0, 0)

  if (next <= now) {
    next.setDate(next.getDate() + 1)
  }

  return next.getTime() - now.getTime()
}

async function runOnce() {
  const startedAt = new Date()
  console.log(`[source-links:cron] Started at ${startedAt.toISOString()}`)

  const result = await checkAllDueSourceLinks({
    limit: Number(process.env.SOURCE_LINK_CHECK_LIMIT || 100),
    maxAgeHours: Number(process.env.SOURCE_LINK_CHECK_MAX_AGE_HOURS || 24),
    detectContentChanges: process.env.SOURCE_LINK_CHECK_DETECT_CHANGES !== 'false',
  })

  console.log(`[source-links:cron] Finished at ${new Date().toISOString()}`)
  console.log(JSON.stringify(result, null, 2))
}

async function loop() {
  console.log(`[source-links:cron] Waiting for daily run at ${String(runHour).padStart(2, '0')}:${String(runMinute).padStart(2, '0')}`)

  while (true) {
    const delay = nextRunDelayMs()
    console.log(`[source-links:cron] Next run in ${Math.round(delay / 1000)} seconds`)
    await new Promise((resolve) => setTimeout(resolve, delay))

    try {
      await runOnce()
    } catch (error) {
      console.error('[source-links:cron] Failed', error)
    }
  }
}

loop().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
