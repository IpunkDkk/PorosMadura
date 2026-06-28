import { checkAllDueSourceLinks } from '@/lib/source-link-check'

async function run() {
  const result = await checkAllDueSourceLinks({
    limit: Number(process.env.SOURCE_LINK_CHECK_LIMIT || 50),
    maxAgeHours: Number(process.env.SOURCE_LINK_CHECK_MAX_AGE_HOURS || 24),
    detectContentChanges: process.env.SOURCE_LINK_CHECK_DETECT_CHANGES !== 'false',
  })

  console.log(JSON.stringify(result, null, 2))
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
