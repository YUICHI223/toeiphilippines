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

      // Get role from Firestore using the direct role field first, then try roleId
      // User documents should have a 'role' field for quick access
      let userRole = userData?.role || ''
      
      // If no direct role field, try to fetch from roles collection using roleId
      if (!userRole && userData?.roleId) {
        try {
          console.log('Attempting to fetch role with ID:', userData.roleId)
          const roleDoc = await getDoc(doc(db, 'roles', userData.roleId))
          if (roleDoc.exists()) {
            userRole = roleDoc.data().name || ''
            console.log('✓ Fetched role from roles collection:', userRole)
          }
        } catch (e) {
          console.error('Error fetching role:', e.message)
        }
      }

      console.log('FINAL: userRole =', userRole)
      console.log('Login: User data:', { 
        roleId: userData?.roleId, 
        role: userData?.role,
        jobId: userData?.jobId,
        jobTitle: userData?.jobTitle 
      })

      // Redirect based on ROLE only
      const normalizedRole = (userRole || '').toLowerCase().trim()
      
      console.log('Normalized role:', normalizedRole)
      
      if (normalizedRole.includes('administrator') || normalizedRole === 'admin') {
        console.log('✓ Redirecting to Admin Dashboard')
        router.push('/dashboards/admin')
      } else if (normalizedRole.includes('artist')) {
        console.log('✓ Redirecting to Artist Dashboard (role contains "artist")')
        router.push('/dashboards/artist')
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
