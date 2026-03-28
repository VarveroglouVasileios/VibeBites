/**
 * useMediaUpload – Supabase Storage upload helper
 */
export function useMediaUpload() {
  const supabase = useSupabaseClient()
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

  function validateFile(file: File): string | null {
    const allAllowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
    if (!allAllowed.includes(file.type)) {
      return `File type ${file.type} is not supported.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum size is 50MB.`
    }
    return null
  }

  async function uploadFile(
    file: File,
    bucket: string,
    folder: string
  ): Promise<string | null> {
    error.value = null

    const validationError = validateFile(file)
    if (validationError) {
      error.value = validationError
      return null
    }

    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    uploading.value = true
    progress.value = 0

    try {
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        error.value = uploadError.message
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      progress.value = 100
      return urlData.publicUrl
    } catch (err: any) {
      error.value = err.message || 'Upload failed'
      return null
    } finally {
      uploading.value = false
    }
  }

  async function uploadMultiple(
    files: File[],
    bucket: string,
    folder: string
  ): Promise<string[]> {
    const urls: string[] = []

    for (let i = 0; i < files.length; i++) {
      progress.value = Math.round((i / files.length) * 100)
      const url = await uploadFile(files[i], bucket, folder)
      if (url) urls.push(url)
    }

    progress.value = 100
    return urls
  }

  return {
    uploading: readonly(uploading),
    progress: readonly(progress),
    error: readonly(error),
    uploadFile,
    uploadMultiple,
    validateFile,
  }
}
