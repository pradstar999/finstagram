import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Send, ArrowLeft, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Messages() {
  const { user, profile } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages()
      const unsub = subscribeToMessages()
      return unsub
    }
  }, [selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    const { data } = await supabase.from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, username, avatar_url), receiver:profiles!messages_receiver_id_fkey(id, username, avatar_url)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    const seen = new Set()
    const unique = []
    data?.forEach(msg => {
      const other = msg.sender_id === user.id ? msg.receiver : msg.sender
      if (!seen.has(other.id)) {
        seen.add(other.id)
        unique.push({ user: other, lastMessage: msg })
      }
    })
    setConversations(unique)
    setLoading(false)
  }

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const subscribeToMessages = () => {
    const channel = supabase.channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const msg = payload.new
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
          (msg.sender_id === selectedUser.id && msg.receiver_id === user.id)
        ) {
          setMessages(prev => [...prev, msg])
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    await supabase.from('messages').insert({ sender_id: user.id, receiver_id: selectedUser.id, content: newMessage })
    setNewMessage('')
    fetchConversations()
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  return (
    <div style={{ height: '100vh', background: 'var(--surface)', display: 'flex', overflow: 'hidden' }}>
      <Navbar />

      <div className="md:ml-64" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: 360, borderRight: '1px solid var(--border)',
          display: selectedUser ? 'none' : 'flex',
          flexDirection: 'column',
          background: 'var(--surface)',
        }} className="md:flex">

          <div style={{ padding: '20px 20px 12px' }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 16 }}>
              {profile?.username}
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface2)', borderRadius: 10,
              padding: '8px 12px', border: '1px solid var(--border)',
            }}>
              <Search size={14} style={{ color: 'var(--text-secondary)' }} />
              <input placeholder="Search messages" style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', flex: 1,
              }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 10, width: '70%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No messages yet</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Follow people and start chatting!</p>
              </div>
            ) : conversations.map(({ user: otherUser, lastMessage }) => (
              <button key={otherUser.id} onClick={() => setSelectedUser(otherUser)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 20px', background: selectedUser?.id === otherUser.id ? 'var(--surface2)' : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (selectedUser?.id !== otherUser.id) e.currentTarget.style.background = 'var(--surface2)' }}
              onMouseLeave={e => { if (selectedUser?.id !== otherUser.id) e.currentTarget.style.background = 'none' }}
              >
                {otherUser.avatar_url
                  ? <img src={otherUser.avatar_url} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{otherUser.username}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lastMessage.content} · {timeAgo(lastMessage.created_at)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        {selectedUser ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

            {/* Chat header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <button onClick={() => setSelectedUser(null)} className="md:hidden"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex' }}>
                <ArrowLeft size={20} />
              </button>
              <Link to={`/profile/${selectedUser.username}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                {selectedUser.avatar_url
                  ? <img src={selectedUser.avatar_url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)' }} />
                }
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{selectedUser.username}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active now</p>
                </div>
              </Link>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map((msg, i) => {
                const isMine = msg.sender_id === user.id
                const showAvatar = !isMine && (i === 0 || messages[i - 1]?.sender_id !== msg.sender_id)
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                    {!isMine && (
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showAvatar && (
                          selectedUser.avatar_url
                            ? <img src={selectedUser.avatar_url} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                            : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)' }} />
                        )}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '65%', padding: '10px 14px', borderRadius: 20,
                      background: isMine ? 'var(--accent)' : 'var(--surface)',
                      color: isMine ? 'white' : 'var(--text)',
                      fontSize: 14, lineHeight: 1.5,
                      border: isMine ? 'none' : '1px solid var(--border)',
                      borderBottomRightRadius: isMine ? 4 : 20,
                      borderBottomLeftRadius: isMine ? 20 : 4,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 20px', borderTop: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                style={{
                  flex: 1, background: 'var(--surface2)', border: '1.5px solid var(--border)',
                  borderRadius: 24, padding: '10px 18px',
                  fontSize: 14, color: 'var(--text)', outline: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--text-secondary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button type="submit" disabled={!newMessage.trim()} style={{
                width: 40, height: 40, borderRadius: '50%',
                background: newMessage.trim() ? 'var(--accent)' : 'var(--surface2)',
                border: 'none', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}>
                <Send size={16} style={{ color: newMessage.trim() ? 'white' : 'var(--text-secondary)' }} />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '2px solid var(--text)', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Send size={32} style={{ color: 'var(--text)' }} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Your Messages</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Select a conversation to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}