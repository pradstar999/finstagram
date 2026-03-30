import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Send } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function PostCard({ post }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [likeAnimating, setLikeAnimating] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const lastTap = useRef(0)

  useEffect(() => {
    fetchLikes()
    fetchSaved()
    fetchComments()
  }, [post.id])

  const fetchLikes = async () => {
    const { data } = await supabase.from('likes').select('*').eq('post_id', post.id)
    setLikesCount(data?.length || 0)
    setLiked(data?.some(l => l.user_id === user?.id))
  }

  const fetchSaved = async () => {
    const { data } = await supabase.from('saved_posts').select('*')
      .eq('post_id', post.id).eq('user_id', user?.id)
    setSaved(data?.length > 0)
  }

  const fetchComments = async () => {
    const { data } = await supabase.from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  const toggleLike = async () => {
    setLikeAnimating(true)
    setTimeout(() => setLikeAnimating(false), 400)
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      setLikesCount(c => c - 1)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
      setLikesCount(c => c + 1)
    }
    setLiked(!liked)
  }

  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      if (!liked) {
        toggleLike()
      }
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 1000)
    }
    lastTap.current = now
  }

  const toggleSave = async () => {
    if (saved) {
      await supabase.from('saved_posts').delete().eq('post_id', post.id).eq('user_id', user.id)
    } else {
      await supabase.from('saved_posts').insert({ post_id: post.id, user_id: user.id })
    }
    setSaved(!saved)
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    await supabase.from('comments').insert({ post_id: post.id, user_id: user.id, content: newComment })
    setNewComment('')
    fetchComments()
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="card fade-up" style={{ marginBottom: 16, overflow: 'hidden', borderRadius: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <Link to={`/profile/${post.profiles?.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)' }}>
          <div className="story-ring">
            <div className="story-ring-inner">
              {post.profiles?.avatar_url
                ? <img src={post.profiles.avatar_url} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)' }} />
              }
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{post.profiles?.username}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{timeAgo(post.created_at)}</p>
          </div>
        </Link>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Image with double tap */}
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleDoubleTap}>
        <img src={post.image_url} alt="post" style={{ width: '100%', display: 'block', maxHeight: 600, objectFit: 'cover' }} />

        {/* Double tap heart */}
        {showHeart && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <Heart size={80} style={{
              fill: 'white', color: 'white',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
              animation: 'likePop 0.8s ease forwards',
            }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 16px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* Like */}
            <button onClick={toggleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
              className={likeAnimating ? 'like-pop' : ''}>
              <Heart size={26}
                style={{ color: liked ? '#ef4444' : 'var(--text)', fill: liked ? '#ef4444' : 'none', transition: 'all 0.2s ease' }}
              />
            </button>

            {/* Comment */}
            <button onClick={() => setShowComments(!showComments)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex', padding: 0 }}>
              <MessageCircle size={26} />
            </button>

            {/* Share */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex', padding: 0 }}>
              <Send size={24} />
            </button>
          </div>

          {/* Save */}
          <button onClick={toggleSave}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
            <Bookmark size={26}
              style={{ color: 'var(--text)', fill: saved ? 'var(--text)' : 'none', transition: 'all 0.2s ease' }}
            />
          </button>
        </div>

        {/* Likes count */}
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </p>

        {/* Caption */}
        {post.caption && (
          <p style={{ fontSize: 14, marginBottom: 6, lineHeight: 1.5 }}>
            <Link to={`/profile/${post.profiles?.username}`}
              style={{ fontWeight: 600, marginRight: 6, color: 'var(--text)', textDecoration: 'none' }}>
              {post.profiles?.username}
            </Link>
            {post.caption}
          </p>
        )}

        {/* View comments */}
        {comments.length > 0 && !showComments && (
          <button onClick={() => setShowComments(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, padding: 0, marginBottom: 4 }}>
            View all {comments.length} comments
          </button>
        )}

        {/* Comments */}
        {showComments && (
          <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 8 }}>
            {comments.map(comment => (
              <div key={comment.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                {comment.profiles?.avatar_url
                  ? <img src={comment.profiles.avatar_url} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)', flexShrink: 0 }} />
                }
                <p style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600, marginRight: 6 }}>{comment.profiles?.username}</span>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment input */}
      <form onSubmit={submitComment} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px',
        borderTop: '1px solid var(--border)',
      }}>
        {user?.user_metadata?.avatar_url
          ? <img src={user.user_metadata.avatar_url} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)', flexShrink: 0 }} />
        }
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: 14, color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
          }}
        />
        {newComment && (
          <button type="submit" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--accent)', fontWeight: 600, fontSize: 14,
            fontFamily: 'DM Sans, sans-serif',
          }}>Post</button>
        )}
      </form>
    </div>
  )
}