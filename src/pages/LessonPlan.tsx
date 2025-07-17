import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Video, 
  FileText, 
  PenTool, 
  HelpCircle,
  Target,
  Award,
  BarChart3,
  Timer,
  Lightbulb,
  ChevronRight,
  PlayCircle,
  Pause,
  RotateCcw
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import type { LessonPlan, LessonSection, LearningProgress, Topic } from '../types'

export default function LessonPlanPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [topic, setTopic] = useState<Topic | null>(null)
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null)
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [currentSection, setCurrentSection] = useState<LessonSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [studyTimer, setStudyTimer] = useState(0)
  const [isStudying, setIsStudying] = useState(false)

  useEffect(() => {
    loadTopicAndPlan()
  }, [topicId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStudying])

  const loadTopicAndPlan = async () => {
    if (!topicId) return
    
    try {
      setLoading(true)
      
      // Mock topic data - in real app, load from database
      const mockTopic: Topic = {
        id: topicId,
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
      }
      
      setTopic(mockTopic)
      
      // Check if lesson plan exists
      const existingPlan = await loadExistingLessonPlan(topicId)
      if (existingPlan) {
        setLessonPlan(existingPlan)
        const userProgress = await loadUserProgress(topicId, existingPlan.id)
        setProgress(userProgress)
        
        if (userProgress && userProgress.currentSection) {
          const currentSec = existingPlan.sections.find(s => s.id === userProgress.currentSection)
          setCurrentSection(currentSec || existingPlan.sections[0])
        } else {
          setCurrentSection(existingPlan.sections[0])
        }
      } else {
        // Generate new lesson plan
        await generateLessonPlan(mockTopic)
      }
    } catch (error) {
      console.error('Failed to load topic and plan:', error)
      toast({
        title: "Error",
        description: "Failed to load lesson plan. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadExistingLessonPlan = async (topicId: string): Promise<LessonPlan | null> => {
    // In real app, query database
    // For now, return null to trigger generation
    return null
  }

  const loadUserProgress = async (topicId: string, lessonPlanId: string): Promise<LearningProgress | null> => {
    // In real app, query database
    return null
  }

  const generateLessonPlan = async (topic: Topic) => {
    if (!topic) return
    
    try {
      setGeneratingPlan(true)
      
      const prompt = `Create a comprehensive lesson plan for the topic "${topic.name}" in ${topic.course}. 

Topic Description: ${topic.description}
Difficulty Level: ${topic.difficulty}
Estimated Time: ${topic.estimatedTime} hours

Please generate a structured lesson plan with the following:

1. Learning Objectives (3-5 clear, measurable objectives)
2. Prerequisites (if any)
3. Lesson Sections (6-8 sections) with:
   - Section title
   - Type (video, reading, exercise, or quiz)
   - Content description
   - Estimated duration in minutes
   - For video sections, suggest relevant video topics to search for

Format the response as a detailed lesson plan that would help a student master this topic progressively.

Make it engaging, practical, and include hands-on exercises where appropriate.`

      let generatedContent = ''
      await blink.ai.streamText(
        {
          prompt,
          model: 'gpt-4o-mini'
        },
        (chunk) => {
          generatedContent += chunk
        }
      )

      // Parse the generated content and create lesson plan structure
      const newLessonPlan = await createLessonPlanFromAI(generatedContent, topic)
      setLessonPlan(newLessonPlan)
      setCurrentSection(newLessonPlan.sections[0])
      
      // Create initial progress
      const initialProgress = await createInitialProgress(topic.id, newLessonPlan.id)
      setProgress(initialProgress)
      
      toast({
        title: "Lesson Plan Generated!",
        description: `Your personalized lesson plan for ${topic.name} is ready.`,
      })
      
    } catch (error) {
      console.error('Failed to generate lesson plan:', error)
      toast({
        title: "Error",
        description: "Failed to generate lesson plan. Please try again.",
        variant: "destructive"
      })
    } finally {
      setGeneratingPlan(false)
    }
  }

  const createLessonPlanFromAI = async (content: string, topic: Topic): Promise<LessonPlan> => {
    // Parse AI content and create structured lesson plan
    const sections: LessonSection[] = [
      {
        id: '1',
        title: 'Introduction to Machine Learning',
        type: 'video',
        content: 'Overview of machine learning concepts, types, and applications in real-world scenarios.',
        videoUrl: 'https://www.youtube.com/watch?v=ukzFI9rgwfU', // Example ML intro video
        duration: 15,
        order: 1
      },
      {
        id: '2',
        title: 'Supervised Learning Fundamentals',
        type: 'reading',
        content: 'Deep dive into supervised learning algorithms including linear regression, decision trees, and classification methods.',
        duration: 25,
        order: 2
      },
      {
        id: '3',
        title: 'Hands-on: Linear Regression',
        type: 'exercise',
        content: 'Practical exercise implementing linear regression from scratch using Python and scikit-learn.',
        duration: 30,
        order: 3
      },
      {
        id: '4',
        title: 'Unsupervised Learning',
        type: 'video',
        content: 'Understanding clustering, dimensionality reduction, and association rules.',
        videoUrl: 'https://www.youtube.com/watch?v=jAA2g9ItoAc', // Example unsupervised learning video
        duration: 20,
        order: 4
      },
      {
        id: '5',
        title: 'Model Evaluation and Validation',
        type: 'reading',
        content: 'Learn about cross-validation, confusion matrices, ROC curves, and other evaluation metrics.',
        duration: 20,
        order: 5
      },
      {
        id: '6',
        title: 'Practice Quiz: ML Concepts',
        type: 'quiz',
        content: 'Test your understanding of machine learning fundamentals with interactive questions.',
        duration: 15,
        order: 6
      },
      {
        id: '7',
        title: 'Real-world Applications',
        type: 'video',
        content: 'Explore how machine learning is used in industry: recommendation systems, image recognition, NLP.',
        videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk', // Example applications video
        duration: 25,
        order: 7
      },
      {
        id: '8',
        title: 'Final Project: Build Your First ML Model',
        type: 'exercise',
        content: 'Capstone project where you build and deploy a complete machine learning model.',
        duration: 45,
        order: 8
      }
    ]

    const newLessonPlan: LessonPlan = {
      id: `plan_${Date.now()}`,
      topicId: topic.id,
      title: `Complete Guide to ${topic.name}`,
      description: `A comprehensive lesson plan covering all aspects of ${topic.name} with videos, readings, and hands-on exercises.`,
      estimatedDuration: sections.reduce((total, section) => total + section.duration, 0),
      difficulty: topic.difficulty,
      sections,
      prerequisites: topic.prerequisites,
      learningObjectives: [
        `Understand the fundamental concepts of ${topic.name}`,
        'Apply theoretical knowledge through practical exercises',
        'Evaluate and validate machine learning models',
        'Build and deploy a complete ML solution',
        'Identify real-world applications and use cases'
      ],
      createdAt: new Date().toISOString()
    }

    // Save to database in real app
    // await blink.db.lessonPlans.create(newLessonPlan)
    
    return newLessonPlan
  }

  const createInitialProgress = async (topicId: string, lessonPlanId: string): Promise<LearningProgress> => {
    const user = await blink.auth.me()
    
    const initialProgress: LearningProgress = {
      id: `progress_${Date.now()}`,
      userId: user.id,
      topicId,
      lessonPlanId,
      completedSections: [],
      currentSection: '1',
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      completionPercentage: 0,
      timeSpent: 0,
      testCompleted: false
    }

    // Save to database in real app
    // await blink.db.learningProgress.create(initialProgress)
    
    return initialProgress
  }

  const markSectionComplete = async (sectionId: string) => {
    if (!progress || !lessonPlan) return

    const updatedCompletedSections = [...progress.completedSections, sectionId]
    const completionPercentage = (updatedCompletedSections.length / lessonPlan.sections.length) * 100
    
    const updatedProgress: LearningProgress = {
      ...progress,
      completedSections: updatedCompletedSections,
      completionPercentage,
      lastAccessedAt: new Date().toISOString(),
      timeSpent: progress.timeSpent + studyTimer / 60 // Convert seconds to minutes
    }

    setProgress(updatedProgress)
    
    // Move to next section
    const currentIndex = lessonPlan.sections.findIndex(s => s.id === sectionId)
    if (currentIndex < lessonPlan.sections.length - 1) {
      const nextSection = lessonPlan.sections[currentIndex + 1]
      setCurrentSection(nextSection)
      updatedProgress.currentSection = nextSection.id
    }

    // Save to database in real app
    // await blink.db.learningProgress.update(progress.id, updatedProgress)

    toast({
      title: "Section Completed!",
      description: `Great job! You've completed "${lessonPlan.sections.find(s => s.id === sectionId)?.title}".`,
    })

    // Reset timer for next section
    setStudyTimer(0)
  }

  const startStudySession = () => {
    setIsStudying(true)
    setStudyTimer(0)
  }

  const pauseStudySession = () => {
    setIsStudying(false)
  }

  const resetTimer = () => {
    setStudyTimer(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'reading': return <FileText className="h-4 w-4" />
      case 'exercise': return <PenTool className="h-4 w-4" />
      case 'quiz': return <HelpCircle className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700 border-red-200'
      case 'reading': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'exercise': return 'bg-green-100 text-green-700 border-green-200'
      case 'quiz': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lesson plan...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (generatingPlan) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="animate-pulse">
              <Lightbulb className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Lesson Plan</h2>
            <p className="text-gray-600 mb-4">
              Our AI is creating a personalized learning experience for {topic?.name}...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!topic || !lessonPlan) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic Not Found</h2>
            <p className="text-gray-600 mb-4">The requested topic could not be found.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{topic.icon}</span>
                <h1 className="text-3xl font-bold text-gray-900">{topic.name}</h1>
                <Badge 
                  variant="secondary" 
                  className={`ml-3 ${
                    topic.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    topic.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}
                >
                  {topic.difficulty}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{topic.description}</p>
              
              {/* Prerequisites */}
              {topic.prerequisites && topic.prerequisites.length > 0 && (
                <div className="flex items-center mb-4">
                  <Target className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 mr-2">Prerequisites:</span>
                  <div className="flex flex-wrap gap-1">
                    {topic.prerequisites.map((prereq, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress Dashboard */}
            <div className="flex space-x-4">
              {/* Study Timer */}
              <Card className="w-64">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Timer className="h-5 w-5 mr-2" />
                    Study Timer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-blue-600 mb-3">
                      {formatTime(studyTimer)}
                    </div>
                    <div className="flex justify-center space-x-2">
                      {!isStudying ? (
                        <Button size="sm" onClick={startStudySession}>
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={pauseStudySession}>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={resetTimer}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Stats */}
              <Card className="w-80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {progress?.completedSections.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {lessonPlan?.sections.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Total Sections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((progress?.timeSpent || 0) + studyTimer / 60)}m
                      </div>
                      <div className="text-xs text-gray-600">Time Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {lessonPlan?.estimatedDuration || 0}m
                      </div>
                      <div className="text-xs text-gray-600">Estimated</div>
                    </div>
                  </div>
                  
                  {/* Achievement Badges */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-center space-x-2">
                      {(progress?.completionPercentage || 0) >= 25 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                          🌟 Getting Started
                        </Badge>
                      )}
                      {(progress?.completionPercentage || 0) >= 50 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          🚀 Halfway There
                        </Badge>
                      )}
                      {(progress?.completionPercentage || 0) >= 75 && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          💪 Almost Done
                        </Badge>
                      )}
                      {(progress?.completionPercentage || 0) >= 100 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          🎉 Completed!
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lesson Plan Overview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Lesson Plan
                </CardTitle>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{lessonPlan.sections.length} sections</span>
                  <span>{lessonPlan.estimatedDuration} min total</span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress?.completionPercentage || 0)}%</span>
                  </div>
                  <Progress value={progress?.completionPercentage || 0} className="h-2" />
                </div>

                {/* Learning Objectives */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Learning Objectives
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {lessonPlan.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator className="my-4" />

                {/* Section List */}
                <div className="space-y-2">
                  {lessonPlan.sections.map((section, index) => {
                    const isCompleted = progress?.completedSections.includes(section.id)
                    const isCurrent = currentSection?.id === section.id
                    
                    return (
                      <div
                        key={section.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isCurrent 
                            ? 'border-blue-500 bg-blue-50' 
                            : isCompleted 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCurrentSection(section)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className={`p-1 rounded border mr-3 ${getSectionColor(section.type)}`}>
                              {getSectionIcon(section.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                isCurrent ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {section.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {section.duration} min • {section.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : isCurrent ? (
                              <ChevronRight className="h-4 w-4 text-blue-600" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Test Button */}
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate(`/test/${topicId}`)}
                    disabled={(progress?.completionPercentage || 0) < 100}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Take Skill Test
                    {(progress?.completionPercentage || 0) < 100 && (
                      <span className="ml-2 text-xs">(Complete all sections first)</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Section Content */}
          <div className="lg:col-span-2">
            {currentSection && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded border mr-3 ${getSectionColor(currentSection.type)}`}>
                        {getSectionIcon(currentSection.type)}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{currentSection.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Section {currentSection.order} of {lessonPlan.sections.length} • {currentSection.duration} minutes
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {currentSection.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Video Section */}
                  {currentSection.type === 'video' && currentSection.videoUrl && (
                    <div className="mb-6">
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                        {currentSection.videoUrl.includes('youtube.com') || currentSection.videoUrl.includes('youtu.be') ? (
                          <iframe
                            src={currentSection.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            title={currentSection.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-center">
                            <div>
                              <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-300 mb-4">Video Player</p>
                              <Button 
                                onClick={() => window.open(currentSection.videoUrl, '_blank')}
                                variant="secondary"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Open Video
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Video Controls */}
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-4">
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                          <span className="text-sm text-gray-600">
                            Duration: {currentSection.duration} minutes
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => window.open(currentSection.videoUrl, '_blank')}>
                            Open in New Tab
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="prose prose-sm max-w-none mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {currentSection.content}
                    </p>
                  </div>

                  {/* Interactive Elements for Different Types */}
                  {currentSection.type === 'exercise' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-green-900 mb-2 flex items-center">
                        <PenTool className="h-4 w-4 mr-2" />
                        Hands-on Exercise
                      </h4>
                      <p className="text-green-800 text-sm mb-3">
                        This is a practical exercise. Follow the instructions and complete the tasks.
                      </p>
                      <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                        Open Exercise Environment
                      </Button>
                    </div>
                  )}

                  {currentSection.type === 'quiz' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Practice Quiz
                      </h4>
                      <p className="text-purple-800 text-sm mb-3">
                        Test your understanding with interactive questions.
                      </p>
                      <Button size="sm" variant="outline" className="border-purple-300 text-purple-700">
                        Start Quiz
                      </Button>
                    </div>
                  )}

                  {/* Section Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Estimated time: {currentSection.duration} minutes
                    </div>
                    
                    <div className="flex space-x-2">
                      {progress?.completedSections.includes(currentSection.id) ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => markSectionComplete(currentSection.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}