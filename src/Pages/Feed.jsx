import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import Navbar from '../components/Navbar'
import PostCard from '../components/PostCard'
import Stories from '../components/Stories'

export default function Feed() {
  const { user, profile } = useAuth()
  const { sidebarOpen } = useSidebar()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
    const followingIds = follows?.map(f => f.following_id) || []
    followingIds.push(user.id)
    const { data } = await supabase.from('posts')
      .select('*, profiles(username, avatar_url)')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const sidebarWidth = sidebarOpen ? 256 : 80

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {/* Mobile top spacer */}
      <div className="md:hidden" style={{ height: 56 }} />

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        display: 'flex',
        justifyContent: 'center',
        transition: 'margin-left 0.3s ease',
      }}>
        <div style={{ width: '100%', maxWidth: 470, padding: '24px 12px 80px' }}>
          <Stories />

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card" style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
                    <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 10, width: '25%' }} />
                    </div>
                  </div>
                  <div className="skeleton" style={{ height: 300, borderRadius: 0 }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 12, width: '30%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 80 }}>
              <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Welcome to Finstagram!</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Follow people to see their posts here.</p>
            </div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Desktop right sidebar */}
        <div className="hidden lg:block" style={{ width: 300, paddingTop: 24, paddingLeft: 32, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)' }} />
            }
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{profile?.username}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{profile?.full_name}</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>© 2026 Finstagram</p>
        </div>
      </div>
    </div>
  )
}