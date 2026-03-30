import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Heart, MessageCircle, Bookmark, Send, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Reels() {
  const { user } = useAuth()
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReels() }, [])

  const fetchReels = async () => {
    const { data } = await supabase.from('posts')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(20)
    setReels(data || [])
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <Navbar />
      <div className="md:hidden" style={{ height: 56 }} />
      <div className="md:ml-64" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 420, height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }} className="scrollbar-hide">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : reels.map(reel => (
            <ReelCard key={reel.id} reel={reel} user={user} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ReelCard({ reel, user }) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchLikes()
    fetchSaved()
  }, [reel.id])

  const fetchLikes = async () => {
    const { data } = await supabase.from('likes').select('*').eq('post_id', reel.id)
    setLikesCount(data?.length || 0)
    setLiked(data?.some(l => l.user_id === user?.id))
  }

  const fetchSaved = async () => {
    const { data } = await supabase.from('saved_posts').select('*').eq('post_id', reel.id).eq('user_id', user?.id)
    setSaved(data?.length > 0)
  }

  const toggleLike = async () => {
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', reel.id).eq('user_id', user.id)
      setLikesCount(c => c - 1)
    } else {
      await supabase.from('likes').insert({ post_id: reel.id, user_id: user.id })
      setLikesCount(c => c + 1)
    }
    setLiked(!liked)
  }

  const toggleSave = async () => {
    if (saved) {
      await supabase.from('saved_posts').delete().eq('post_id', reel.id).eq('user_id', user.id)
    } else {
      await supabase.from('saved_posts').insert({ post_id: reel.id, user_id: user.id })
    }
    setSaved(!saved)
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', scrollSnapAlign: 'start', flexShrink: 0 }}>
      <img src={reel.image_url} alt="reel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)' }} />

      {/* Right actions */}
      <div style={{ position: 'absolute', right: 16, bottom: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <button onClick={toggleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Heart size={28} style={{ color: liked ? '#ef4444' : 'white', fill: liked ? '#ef4444' : 'none', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.4))' }} />
          <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{likesCount}</span>
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <MessageCircle size={28} style={{ color: 'white', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.4))' }} />
          <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>0</span>
        </button>

        <button onClick={toggleSave} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Bookmark size={28} style={{ color: 'white', fill: saved ? 'white' : 'none', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.4))' }} />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Send size={26} style={{ color: 'white', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.4))' }} />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <MoreHorizontal size={26} style={{ color: 'white', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.4))' }} />
        </button>
      </div>

      {/* Bottom info */}
      <div style={{ position: 'absolute', bottom: 24, left: 16, right: 72 }}>
        <Link to={`/profile/${reel.profiles?.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 10 }}>
          {reel.profiles?.avatar_url
            ? <img src={reel.profiles.avatar_url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
            : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)' }} />
          }
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            {reel.profiles?.username}
          </span>
        </Link>
        {reel.caption && (
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            {reel.caption}
          </p>
        )}
      </div>
    </div>
  )
}