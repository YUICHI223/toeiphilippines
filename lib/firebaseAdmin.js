import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK
let adminApp = null

// Only initialize on server side
if (typeof window === 'undefined') {
  try {
    if (!admin.apps.length) {
      const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK
      
      if (!serviceAccountJson) {
        console.error('FIREBASE_ADMIN_SDK environment variable is not set!')
      } else {
        try {
          const serviceAccount = JSON.parse(serviceAccountJson)
          console.log('Initializing Firebase Admin SDK for project:', serviceAccount.project_id)
          
          adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
          })
          
          console.log('Firebase Admin SDK initialized successfully')
        } catch (parseError) {
          console.error('Failed to parse FIREBASE_ADMIN_SDK JSON:', parseError.message)
        }
      }
    } else {
      adminApp = admin.app()
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message)
  }
}

export const getAdminAuth = () => {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Check FIREBASE_ADMIN_SDK environment variable.')
  }
  try {
    return admin.auth()
  } catch (error) {
    console.error('Error getting admin auth:', error)
    throw error
  }
}

export const getAdminDb = () => {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized')
  }
  return admin.firestore()
}

export default adminApp
