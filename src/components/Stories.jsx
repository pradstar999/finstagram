import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import StoryViewer from './StoryViewer'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Stories() {
  const { user, profile } = useAuth()
  const [stories, setStories] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => { fetchStories() }, [])

  const fetchStories = async () => {
    const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
    const followingIds = follows?.map(f => f.following_id) || []
    followingIds.push(user.id)

    const { data } = await supabase.from('stories')
      .select('*, profiles(username, avatar_url)')
      .in('user_id', followingIds)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    const grouped = {}
    data?.forEach(story => {
      if (!grouped[story.user_id]) grouped[story.user_id] = { profile: story.profiles, stories: [] }
      grouped[story.user_id].stories.push(story)
    })
    setStories(Object.values(grouped))
  }

  return (
    <>
      <div className="card" style={{ padding: '16px', marginBottom: 16, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 16 }}>

          {/* Add story */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 'fit-content' }}>
            <Link to="/create" style={{ textDecoration: 'none' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)' }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f09433, #bc1888)' }} />
                  }
                </div>
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--accent)', border: '2px solid var(--surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Plus size={12} color="white" strokeWidth={3} />
                </div>
              </div>
            </Link>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 60, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Your story
            </span>
          </div>

          {/* Stories */}
          {stories.map((item, index) => (
            <button key={index} onClick={() => setSelectedUser(item)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 'fit-content', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div className="story-ring">
                <div className="story-ring-inner">
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden' }}>
                    {item.profile?.avatar_url
                      ? <img src={item.profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f09433, #bc1888)' }} />
                    }
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text)', maxWidth: 60, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.profile?.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedUser && (
        <StoryViewer stories={selectedUser.stories} profile={selectedUser.profile} onClose={() => setSelectedUser(null)} />
      )}
    </>
  )
}