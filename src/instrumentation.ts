export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startAiNewsWorker } = await import('@/lib/ai-news-jobs')
    startAiNewsWorker()
  }
}
