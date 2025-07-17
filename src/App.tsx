import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ChatInterface from './pages/ChatInterface'
import PDFLibrary from './pages/PDFLibrary'
import Settings from './pages/Settings'
import LessonPlan from './pages/LessonPlan'
import SkillTest from './pages/SkillTest'
import ProgressTracking from './pages/ProgressTracking'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Educational PDF Assistant</h1>
          <p className="text-lg text-gray-600 mb-8">Sign in to access your personalized learning experience</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/chat/:sessionId" element={<ChatInterface />} />
          <Route path="/library" element={<PDFLibrary />} />
          <Route path="/progress" element={<ProgressTracking />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/lesson/:topicId" element={<LessonPlan />} />
          <Route path="/test/:topicId" element={<SkillTest />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App