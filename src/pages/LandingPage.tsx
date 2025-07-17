import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  BookOpen, 
  Brain, 
  Sparkles, 
  ArrowRight,
  Microscope,
  Calculator,
  Globe,
  Atom,
  Dna,
  Beaker,
  History,
  Languages,
  PenTool,
  Music,
  Palette
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

// Mock course data - in real app this would come from database
const courses = [
  {
    id: 'biology',
    name: 'Biology',
    icon: Dna,
    color: 'bg-green-500',
    description: 'Study of living organisms and life processes',
    topics: [
      'Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Anatomy', 
      'Molecular Biology', 'Botany', 'Zoology', 'Microbiology', 'Biochemistry'
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: Beaker,
    color: 'bg-blue-500',
    description: 'Science of matter and its interactions',
    topics: [
      'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 
      'Analytical Chemistry', 'Biochemistry', 'Chemical Bonding', 'Thermodynamics'
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: Atom,
    color: 'bg-purple-500',
    description: 'Study of matter, energy, and their interactions',
    topics: [
      'Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Physics', 
      'Relativity', 'Optics', 'Nuclear Physics', 'Particle Physics'
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: Calculator,
    color: 'bg-red-500',
    description: 'Study of numbers, structures, and patterns',
    topics: [
      'Algebra', 'Calculus', 'Geometry', 'Statistics', 'Trigonometry', 
      'Linear Algebra', 'Differential Equations', 'Number Theory'
    ]
  },
  {
    id: 'history',
    name: 'History',
    icon: History,
    color: 'bg-amber-500',
    description: 'Study of past events and civilizations',
    topics: [
      'World History', 'Ancient Civilizations', 'Medieval History', 
      'Modern History', 'American History', 'European History', 'Asian History'
    ]
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: Globe,
    color: 'bg-teal-500',
    description: 'Study of Earth and its features',
    topics: [
      'Physical Geography', 'Human Geography', 'Cartography', 'Climate', 
      'Geology', 'Environmental Geography', 'Urban Geography'
    ]
  },
  {
    id: 'literature',
    name: 'Literature',
    icon: PenTool,
    color: 'bg-indigo-500',
    description: 'Study of written works and language',
    topics: [
      'Poetry', 'Drama', 'Fiction', 'Non-fiction', 'Literary Analysis', 
      'Creative Writing', 'World Literature', 'Classical Literature'
    ]
  },
  {
    id: 'languages',
    name: 'Languages',
    icon: Languages,
    color: 'bg-pink-500',
    description: 'Study of communication and linguistics',
    topics: [
      'English', 'Spanish', 'French', 'German', 'Mandarin', 
      'Japanese', 'Arabic', 'Linguistics', 'Grammar', 'Phonetics'
    ]
  }
]

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCourses, setFilteredCourses] = useState(courses)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses)
    } else {
      const filtered = courses.filter(course => 
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredCourses(filtered)
    }
  }, [searchQuery])

  const handleCourseSelect = (course) => {
    setSelectedCourse(course)
  }

  const handleTopicSelect = (course, topic) => {
    // Navigate to chat interface with selected course and topic
    navigate(`/chat?course=${course.id}&topic=${encodeURIComponent(topic)}`)
  }

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Back to Courses
                </Button>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${selectedCourse.color} text-white`}>
                    <selectedCourse.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedCourse.name}</h1>
                    <p className="text-gray-600">{selectedCourse.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore {selectedCourse.name} Topics
            </h2>
            <p className="text-lg text-gray-600">
              Select a topic to start learning with AI-powered assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCourse.topics.map((topic, index) => (
              <Card 
                key={index}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 border-2 hover:border-indigo-200"
                onClick={() => handleTopicSelect(selectedCourse, topic)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
                      {topic}
                    </CardTitle>
                    <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Brain className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Start AI-powered learning session
                    </p>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Chat Preview */}
          <div className="mt-12">
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">AI Learning Assistant</CardTitle>
                    <CardDescription>
                      Get personalized explanations, summaries, and answers to your questions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 w-fit mx-auto mb-3">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">Smart Summarization</h3>
                    <p className="text-sm text-gray-600">
                      Get concise summaries of complex topics
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 w-fit mx-auto mb-3">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">Semantic Search</h3>
                    <p className="text-sm text-gray-600">
                      Find relevant information across your materials
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 w-fit mx-auto mb-3">
                      <Brain className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">Interactive Learning</h3>
                    <p className="text-sm text-gray-600">
                      Ask questions and get detailed explanations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI-Powered Learning
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Enhance Your
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {' '}Learning Skills
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Discover courses, explore topics, and learn with AI-powered assistance. 
                  Get personalized summaries, ask questions, and save your progress.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for courses like Biology, Chemistry, Physics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-indigo-500 rounded-xl shadow-sm"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">50+</div>
                  <div className="text-sm text-gray-600">Subjects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-600">Topics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">AI</div>
                  <div className="text-sm text-gray-600">Powered</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1573497490701-f84eda04e280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYW1lcmljYW4lMjBzdHVkZW50JTIwc3R1ZHlpbmclMjBib29rcyUyMGxlYXJuaW5nJTIwZWR1Y2F0aW9uJTIwZm9jdXNlZHxlbnwwfDB8fHwxNzUyNzc2NDE0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="African American student studying with books"
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-bounce">
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-pulse">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive collection of subjects and dive deep into topics that interest you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card 
              key={course.id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 border-2 hover:border-indigo-200"
              onClick={() => handleCourseSelect(course)}
            >
              <CardHeader className="text-center pb-3">
                <div className={`w-16 h-16 rounded-full ${course.color} text-white flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <course.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                  {course.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {course.topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {course.topics.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{course.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-600">
                      {course.topics.length} topics
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              Try searching for different keywords or browse all available courses
            </p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our AI Learning Assistant?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the future of personalized education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white w-fit mx-auto mb-6">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Summarization</h3>
              <p className="text-gray-600">
                Get concise, easy-to-understand summaries of complex topics and save them for later review
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white w-fit mx-auto mb-6">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Semantic Search</h3>
              <p className="text-gray-600">
                Find relevant information across all your study materials with intelligent search capabilities
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 text-white w-fit mx-auto mb-6">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Interactive Learning</h3>
              <p className="text-gray-600">
                Ask questions, get detailed explanations, and engage in meaningful conversations about any topic
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}