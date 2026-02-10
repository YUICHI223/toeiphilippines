import { getAdminAuth } from '../../lib/firebaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { uid, newEmail } = req.body

    console.log('updateUserEmail API called with:', { uid, newEmail })

    if (!uid || !newEmail) {
      return res.status(400).json({ error: 'UID and newEmail are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    try {
      console.log('Getting admin auth...')
      const auth = getAdminAuth()
      console.log('Admin auth obtained. Updating user...')
      
      await auth.updateUser(uid, { email: newEmail })
      
      console.log(`Successfully updated email for user ${uid} to ${newEmail}`)
      return res.status(200).json({ 
        success: true, 
        message: `Email updated successfully to ${newEmail}` 
      })
    } catch (adminError) {
      console.error('Firebase Admin error:', adminError.code, adminError.message)
      
      if (adminError.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'Email is already in use' })
      }
      if (adminError.code === 'auth/invalid-email') {
        return res.status(400).json({ error: 'Invalid email format' })
      }
      if (adminError.code === 'auth/user-not-found') {
        return res.status(404).json({ error: 'User not found in authentication' })
      }
      
      throw adminError
    }
  } catch (error) {
    console.error('Error updating email:', error)
    
    if (error.message.includes('not initialized')) {
      console.error('Firebase Admin SDK not initialized!')
      return res.status(503).json({ 
        error: 'Firebase Admin SDK not configured',
        message: 'Check FIREBASE_ADMIN_SDK environment variable',
        details: error.message
      })
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to update email',
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
