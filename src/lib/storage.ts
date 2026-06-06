type StorageDriver = 'local' | 's3'

interface StorageConfig {
  driver: StorageDriver
}

export function getStorageConfig(): StorageConfig {
  const driver = (process.env.STORAGE_DRIVER as StorageDriver) || 'local'
  return { driver }
}

export function getMediaUrl(filename: string): string {
  const config = getStorageConfig()
  if (config.driver === 's3') {
    const baseUrl = process.env.S3_PUBLIC_URL || ''
    return `${baseUrl}/${filename.replace(/^\//, '')}`
  }
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '/media'
  return `${baseUrl}/${filename.replace(/^\//, '')}`
}
