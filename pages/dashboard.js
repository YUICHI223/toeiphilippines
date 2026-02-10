import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard(){
  const router = useRouter()
  
  useEffect(() => {
    router.push('/dashboards/admin')
  }, [router])

  return <div></div>
}
