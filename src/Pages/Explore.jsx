import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Explore() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchExplorePosts() }, [])

  useEffect(() => {
    if (query.trim()) searchUsers()
    else setUsers([])
  }, [query])

  const fetchExplorePosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(30)
    setPosts(data || [])
    setLoading(false)
  }

  const searchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').ilike('username', `%${query}%`).neq('id', user.id).limit(10)
    setUsers(data || [])
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div className="md:hidden" style={{ height: 56 }} />
      <div className="md:ml-64" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 100px' }}>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface2)', border: '1.5px solid var(--border)',
          borderRadius: 12, padding: '10px 16px', marginBottom: 24,
        }}>
          <Search size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search results */}
        {query.trim() ? (
          <div className="card" style={{ borderRadius: 16, overflow: 'hidden' }}>
            {users.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: 14 }}>No users found.</p>
            ) : (
              users.map(u => (
                <Link key={u.id} to={`/profile/${u.username}`} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', textDecoration: 'none', color: 'var(--text)',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {u.avatar_url
                    ? <img src={u.avatar_url} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)' }} />
                  }
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.full_name}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 0 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {posts.map(post => (
              <div key={post.id} style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.querySelector('.overlay').style.opacity = 1}
                onMouseLeave={e => e.currentTarget.querySelector('.overlay').style.opacity = 0}
              >
                <img src={post.image_url} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div className="overlay" style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s ease',
                }}>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>View</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}