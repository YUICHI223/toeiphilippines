import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ArtistDashboard(){
  const router = useRouter()
  
  useEffect(() => {
    router.push('/dashboards/artist')
  }, [router])

  return <div></div>
}
