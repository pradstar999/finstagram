import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Grid, Bookmark, Camera } from 'lucide-react'

export default function Profile() {
  const { user, profile: myProfile } = useAuth()
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [tab, setTab] = useState('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const isOwner = myProfile?.username === username

  useEffect(() => { fetchProfile() }, [username])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: profileData } = await supabase.from('profiles').select('*').eq('username', username).single()
    setProfile(profileData)
    if (!profileData) return setLoading(false)

    const { data: postsData } = await supabase.from('posts').select('*').eq('user_id', profileData.id).order('created_at', { ascending: false })
    setPosts(postsData || [])

    const { data: followers } = await supabase.from('follows').select('*').eq('following_id', profileData.id)
    setFollowersCount(followers?.length || 0)
    setIsFollowing(followers?.some(f => f.follower_id === user.id))

    const { data: following } = await supabase.from('follows').select('*').eq('follower_id', profileData.id)
    setFollowingCount(following?.length || 0)

    if (isOwner) {
      const { data: saved } = await supabase.from('saved_posts').select('*, posts(*)').eq('user_id', user.id)
      setSavedPosts(saved?.map(s => s.posts) || [])
    }
    setLoading(false)
  }

  const toggleFollow = async () => {
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.id)
      setFollowersCount(c => c - 1)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id })
      setFollowersCount(c => c + 1)
    }
    setIsFollowing(!isFollowing)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${ext}`
    await supabase.storage.from('avatars').upload(fileName, file)
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    setProfile(p => ({ ...p, avatar_url: publicUrl }))
  }

  const Spinner = () => (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </div>
  )

  if (loading) return <Spinner />
  if (!profile) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
        <p style={{ color: 'var(--text-secondary)' }}>User not found.</p>
      </div>
    </div>
  )

  const displayPosts = tab === 'posts' ? posts : savedPosts

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div className="md:hidden" style={{ height: 56 }} />
      <div className="md:ml-64" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 100px' }}>

        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginBottom: 44 }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="story-ring">
              <div className="story-ring-inner" style={{ padding: 3 }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)' }} />
                }
              </div>
            </div>
            {isOwner && (
              <label style={{
                position: 'absolute', bottom: 2, right: 2,
                background: 'var(--surface)', border: '2px solid var(--border)',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <Camera size={14} style={{ color: 'var(--text)' }} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 400, color: 'var(--text)' }}>{profile.username}</h2>
              {isOwner ? (
                <button className="btn-secondary" style={{ fontSize: 13 }}>Edit profile</button>
              ) : (
                <button
                  onClick={toggleFollow}
                  className={isFollowing ? 'btn-secondary' : 'btn-primary'}
                  style={{ fontSize: 13 }}>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
              {[
                { label: 'posts', value: posts.length },
                { label: 'followers', value: followersCount },
                { label: 'following', value: followingCount },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{value}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginLeft: 4 }}>{label}</span>
                </div>
              ))}
            </div>

            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{profile.full_name}</p>
            {profile.bio && <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{profile.bio}</p>}
            {profile.website && (
              <a href={profile.website} style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>{profile.website}</a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)', marginBottom: 4 }}>
          {[
            { key: 'posts', icon: Grid, label: 'Posts' },
            ...(isOwner ? [{ key: 'saved', icon: Bookmark, label: 'Saved' }] : []),
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '14px 20px', background: 'none', border: 'none',
              borderTop: `2px solid ${tab === key ? 'var(--text)' : 'transparent'}`,
              cursor: 'pointer', color: tab === key ? 'var(--text)' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
              fontFamily: 'DM Sans, sans-serif',
              marginTop: -1,
            }}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {displayPosts.map(post => (
            <div key={post.id} onClick={() => setSelectedPost(post)}
              style={{ aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
              onMouseEnter={e => e.currentTarget.querySelector('.overlay').style.opacity = 1}
              onMouseLeave={e => e.currentTarget.querySelector('.overlay').style.opacity = 0}
            >
              <img src={post.image_url} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div className="overlay" style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s ease',
              }}>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>View</p>
              </div>
            </div>
          ))}
        </div>

        {displayPosts.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No posts yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}