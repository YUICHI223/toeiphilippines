import React, { useState } from 'react'
import { auth, db } from '../lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      // Fetch user role from Firestore
      let userData = {}
      let userDocRef = doc(db, 'users', user.uid)
      const directDoc = await getDoc(userDocRef)
      if (directDoc.exists()) {
        userData = directDoc.data()
        // update lastActive
        await updateDoc(userDocRef, { lastActive: serverTimestamp() })
      } else {
        // fallback: find user by email
        const q = query(collection(db, 'users'), where('email', '==', user.email))
        const snap = await getDocs(q)
        if (!snap.empty) {
          const d = snap.docs[0]
          userData = d.data()
          userDocRef = doc(db, 'users', d.id)
          await updateDoc(userDocRef, { lastActive: serverTimestamp() })
        }
      }

      // Get role from Firestore - check 'roles' field on user document
      let extractedRoles = []
      
      // Priority 1: Check 'roles' field (can be array or string)
      const rolesField = userData?.roles
      console.log('User roles field:', rolesField, 'Type:', typeof rolesField)
      
      if (Array.isArray(rolesField)) {
        extractedRoles = rolesField.map(r => String(r || '').toLowerCase().trim()).filter(Boolean)
        console.log('✓ Parsed roles from array:', extractedRoles)
      } else if (rolesField && typeof rolesField === 'string') {
        extractedRoles = String(rolesField).toLowerCase().split(/[,;|\\/]+/).map(r => r.trim()).filter(Boolean)
        console.log('✓ Parsed roles from string:', extractedRoles)
      }
      
      // Priority 2: Try roleId lookup in roles collection if still empty
      if (extractedRoles.length === 0 && userData?.roleId) {
        try {
          const roleIdValue = userData.roleId
          console.log('Looking up roleId:', roleIdValue)
          
          // First try: direct document ID lookup
          let roleDoc = await getDoc(doc(db, 'roles', roleIdValue))
          
          // If not found, try searching for a role with id field matching roleIdValue
          if (!roleDoc.exists()) {
            console.log('Direct ID lookup failed, searching by id field...')
            const rolesSnap = await getDocs(query(collection(db, 'roles'), where('id', '==', roleIdValue)))
            if (!rolesSnap.empty) {
              roleDoc = rolesSnap.docs[0]
            }
          }
          
          if (roleDoc.exists()) {
            const roleName = roleDoc.data().name || ''
            if (roleName) {
              extractedRoles.push(String(roleName).toLowerCase().trim())
              console.log('✓ Found role by roleId:', roleName)
            }
          }
        } catch (e) {
          console.error('Error fetching role by roleId:', e.message)
        }
      }
      
      // Priority 3: Try jobTitle as final fallback
      if (extractedRoles.length === 0 && userData?.jobTitle) {
        const jobTitle = String(userData.jobTitle).toLowerCase().trim()
        if (jobTitle) extractedRoles.push(jobTitle)
        console.log('Fallback to jobTitle:', jobTitle)
      }

      // Build a normalized string for logging
      const userRole = extractedRoles.join(', ')

      console.log('FINAL: extractedRoles =', extractedRoles)
      console.log('Login: User data: roleId=' + userData?.roleId + ', roles=' + userData?.roles)

      // Redirect based on ROLE - check if role NAME CONTAINS key words
      // Priority: if user has 'artist' in their role name anywhere, send to artist dashboard
      const hasArtistRole = extractedRoles.some(r => r.includes('artist'))
      const hasAdminRole = extractedRoles.some(r => r.includes('administrator') || r.includes('admin'))

      console.log('Has artist role?', hasArtistRole)
      console.log('Has admin role?', hasAdminRole)

      if (hasArtistRole) {
        console.log('✓ Redirecting to Artist Dashboard (found "artist" in role name)')
        router.push('/dashboards/artist')
      } else if (hasAdminRole) {
        console.log('✓ Redirecting to Admin Dashboard')
        router.push('/dashboards/admin')
      } else {
        console.log('✓ Redirecting to Default Dashboard (no specific role match)')
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark">
      <form onSubmit={handleLogin} className="bg-panel-dark p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-white">Admin Login</h1>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-4 px-3 py-2 rounded bg-panel-muted text-gray-200"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-4 px-3 py-2 rounded bg-panel-muted text-gray-200"
          required
        />
        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-accent-blue text-white px-4 py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
