import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { X, ImagePlus, ArrowLeft } from 'lucide-react'
import Navbar from './Navbar'

export default function CreatePost() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleImage = (file) => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleImage(file)
  }

  const handleSubmit = async () => {
    if (!image) return setError('Please select an image')
    setLoading(true)
    setError('')
    try {
      const ext = image.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, image)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName)
      const { error: postError } = await supabase.from('posts').insert({ user_id: user.id, image_url: publicUrl, caption })
      if (postError) throw postError
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ paddingLeft: 0, paddingTop: 0 }} className="md:ml-64">
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 100px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'DM Sans, sans-serif' }}>
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>New Post</h1>
            <button onClick={handleSubmit} disabled={loading || !image} className="btn-primary">
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>

          <div className="card" style={{ overflow: 'hidden', borderRadius: 16 }}>

            {/* Drop zone */}
            {!preview ? (
              <label
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  height: 360, cursor: 'pointer',
                  background: dragOver ? 'var(--surface2)' : 'var(--surface)',
                  transition: 'background 0.2s ease',
                  borderBottom: '1px solid var(--border)',
                }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--surface2)', border: '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <ImagePlus size={32} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>
                  Drag & drop or click to upload
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>PNG, JPG, WEBP up to 10MB</p>
                <input type="file" accept="image/*" onChange={e => handleImage(e.target.files[0])} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{ position: 'relative' }}>
                <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }} />
                <button onClick={() => { setImage(null); setPreview(null) }} style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                  width: 32, height: 32, cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Caption */}
            <div style={{ padding: '16px' }}>
              <textarea
                placeholder="Write a caption..."
                value={caption}
                onChange={e => setCaption(e.target.value)}
                rows={3}
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  resize: 'none', fontSize: 14, color: 'var(--text)',
                  fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6,
                }}
              />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', color: '#ef4444', fontSize: 13 }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}