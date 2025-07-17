import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Upload, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Plus,
  Clock,
  Search,
  BookOpen,
  Award,
  Play,
  Target,
  Zap,
  Brain,
  Code,
  Database,
  Globe,
  Sparkles
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import PersonalizedLessonPlanGenerator from '../components/PersonalizedLessonPlanGenerator'
import { blink } from '../blink/client'
import type { Topic, LessonPlan } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalChats: 0,
    recentActivity: []
  })
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showPersonalizedGenerator, setShowPersonalizedGenerator] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await blink.auth.me()
        setUser(userData)
        
        // Mock stats for now - will be replaced with real data
        setStats({
          totalDocuments: 5,
          totalChats: 12,
          recentActivity: [
            { type: 'upload', title: 'Machine Learning Basics.pdf', time: '2 hours ago' },
            { type: 'chat', title: 'Discussion about Neural Networks', time: '4 hours ago' },
            { type: 'upload', title: 'Data Structures.pdf', time: '1 day ago' },
          ]
        })

        // Mock available topics
        const mockTopics: Topic[] = [
          {
            id: 'ml-fundamentals',
            name: 'Machine Learning Fundamentals',
            description: 'Learn the core concepts of machine learning including supervised and unsupervised learning, algorithms, and practical applications.',
            course: 'computer-science',
            color: '#3B82F6',
            icon: '🤖',
            difficulty: 'intermediate',
            estimatedTime: 8,
            hasLessonPlan: true,
            hasTest: true,
            prerequisites: ['Statistics Basics', 'Python Programming']
          },
          {
            id: 'react-advanced',
            name: 'Advanced React Patterns',
            description: 'Master advanced React concepts including hooks, context, performance optimization, and modern patterns.',
            course: 'web-development',
            color: '#06B6D4',
            icon: '⚛️',
            difficulty: 'advanced',
            estimatedTime: 12,
            hasLessonPlan: true,
            hasTest: true,
            prerequisites: ['React Basics', 'JavaScript ES6+']
          },
          {
            id: 'data-structures',
            name: 'Data Structures & Algorithms',
            description: 'Comprehensive guide to essential data structures and algorithms for technical interviews and software development.',
            course: 'computer-science',
            color: '#8B5CF6',
            icon: '🔗',
            difficulty: 'intermediate',
            estimatedTime: 15,
            hasLessonPlan: true,
            hasTest: true,
            prerequisites: ['Programming Fundamentals']
          },
          {
            id: 'database-design',
            name: 'Database Design & SQL',
            description: 'Learn database design principles, normalization, and advanced SQL queries for real-world applications.',
            course: 'database',
            color: '#10B981',
            icon: '🗄️',
            difficulty: 'beginner',
            estimatedTime: 10,
            hasLessonPlan: true,
            hasTest: true
          },
          {
            id: 'system-design',
            name: 'System Design Principles',
            description: 'Understand how to design scalable, distributed systems with real-world examples and case studies.',
            course: 'software-engineering',
            color: '#F59E0B',
            icon: '🏗️',
            difficulty: 'advanced',
            estimatedTime: 20,
            hasLessonPlan: true,
            hasTest: true,
            prerequisites: ['Database Design', 'Networking Basics']
          },
          {
            id: 'ai-ethics',
            name: 'AI Ethics & Responsible AI',
            description: 'Explore the ethical implications of AI technology and learn to build responsible AI systems.',
            course: 'artificial-intelligence',
            color: '#EF4444',
            icon: '🤔',
            difficulty: 'beginner',
            estimatedTime: 6,
            hasLessonPlan: true,
            hasTest: true
          }
        ]
        
        setAvailableTopics(mockTopics)
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }

    loadUserData()
  }, [])

  const filteredTopics = availableTopics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.course.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCourseIcon = (course: string) => {
    switch (course) {
      case 'computer-science': return <Brain className="h-4 w-4" />
      case 'web-development': return <Code className="h-4 w-4" />
      case 'database': return <Database className="h-4 w-4" />
      case 'software-engineering': return <Zap className="h-4 w-4" />
      case 'artificial-intelligence': return <Target className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const handlePersonalizedLessonPlan = (topic: Topic) => {
    setSelectedTopic(topic)
    setShowPersonalizedGenerator(true)
  }

  const handleLessonPlanGenerated = (lessonPlan: LessonPlan) => {
    setShowPersonalizedGenerator(false)
    setSelectedTopic(null)
    // In a real app, you would save the lesson plan and navigate to it
    navigate(`/lesson/${lessonPlan.topicId}`)
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
          </h1>
          <p className="text-gray-600">
            Your AI-powered learning assistant is ready to help you explore your educational materials.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upload PDF</CardTitle>
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <CardDescription>
                Add new educational materials to your library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/library">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Start Chat</CardTitle>
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <CardDescription>
                Begin a new conversation with your AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/chat">
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Browse Library</CardTitle>
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <CardDescription>
                Explore your collection of educational documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/library">
                <Button className="w-full" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  View Library
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                PDFs in your library
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChats}</div>
              <p className="text-xs text-muted-foreground">
                Conversations with AI
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                Documents processed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest interactions with the AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    {activity.type === 'upload' ? (
                      <Upload className="h-5 w-5 text-blue-600" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Topics Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Learning Topics</h2>
              <p className="text-gray-600">Choose a topic to start your personalized learning journey</p>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <Card 
                key={topic.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4"
                style={{ borderLeftColor: topic.color }}
                onClick={() => navigate(`/lesson/${topic.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{topic.icon}</span>
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {topic.name}
                        </CardTitle>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          {getCourseIcon(topic.course)}
                          <span className="ml-1 capitalize">{topic.course.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getDifficultyColor(topic.difficulty)} capitalize text-xs`}
                    >
                      {topic.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {topic.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {topic.estimatedTime}h estimated
                    </div>
                    <div className="flex items-center space-x-3">
                      {topic.hasLessonPlan && (
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1 text-blue-500" />
                          <span>Lesson Plan</span>
                        </div>
                      )}
                      {topic.hasTest && (
                        <div className="flex items-center">
                          <Award className="h-3 w-3 mr-1 text-green-500" />
                          <span>Skill Test</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {topic.prerequisites && topic.prerequisites.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                      <div className="flex flex-wrap gap-1">
                        {topic.prerequisites.map((prereq, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/lesson/${topic.id}`)
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="px-3 border-purple-200 text-purple-600 hover:bg-purple-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePersonalizedLessonPlan(topic)
                      }}
                      title="Create personalized lesson plan"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No topics found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse all available topics.
              </p>
            </div>
          )}
        </div>

        {/* Personalized Lesson Plan Generator Modal */}
        {showPersonalizedGenerator && selectedTopic && (
          <PersonalizedLessonPlanGenerator
            topic={selectedTopic}
            onLessonPlanGenerated={handleLessonPlanGenerated}
            onClose={() => {
              setShowPersonalizedGenerator(false)
              setSelectedTopic(null)
            }}
          />
        )}
      </div>
    </Layout>
  )
}