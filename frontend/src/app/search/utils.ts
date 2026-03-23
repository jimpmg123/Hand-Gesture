import { maxUploadSizeBytes } from './data'

export function getUploadValidationError(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Only image files are allowed in this mock flow.'
  }

  if (file.size > maxUploadSizeBytes) {
    return 'Only image files up to 30MB are accepted right now.'
  }

  return null
}
