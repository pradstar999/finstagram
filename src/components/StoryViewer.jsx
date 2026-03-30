import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function StoryViewer({ stories, profile, onClose }) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          if (current < stories.length - 1) {
            setCurrent(c => c + 1)
          } else {
            onClose()
          }
          return 0
        }
        return p + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [current])

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full max-w-sm h-full max-h-screen">

        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/40 rounded">
              <div
                className="h-full bg-white rounded transition-all"
                style={{ width: i < current ? '100%' : i === current ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover border border-white" />
              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
            }
            <span className="text-white font-semibold text-sm">{profile?.username}</span>
          </div>
          <button onClick={onClose}>
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Story image */}
        <img
          src={stories[current]?.image_url}
          alt="story"
          className="w-full h-full object-cover"
        />

        {/* Tap left/right to navigate */}
        <div className="absolute inset-0 flex">
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={() => {
              if (current > 0) setCurrent(c => c - 1)
            }}
          />
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={() => {
              if (current < stories.length - 1) setCurrent(c => c + 1)
              else onClose()
            }}
          />
        </div>
      </div>
    </div>
  )
}