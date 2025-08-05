import { supabase } from '../supabase'

export const uploadAvatar = async (file, userId) => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file')
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Replace existing file
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Avatar upload error:', error)
    return { success: false, error: error.message }
  }
}

export const deleteAvatar = async (userId) => {
  try {
    // Delete all files in user's folder
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list(userId)

    if (listError) throw listError

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${userId}/${file.name}`)
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filePaths)

      if (deleteError) throw deleteError
    }

    return { success: true }
  } catch (error) {
    console.error('Avatar delete error:', error)
    return { success: false, error: error.message }
  }
}
