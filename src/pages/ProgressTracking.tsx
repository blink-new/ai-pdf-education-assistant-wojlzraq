import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  BookOpen,
  Video,
  PenTool,
  HelpCircle,
  Flame,
  Trophy,
  Star,
  ChevronRight,
  Play,
  CheckCircle
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { blink } from '../blink/client'
import type { LearningProgress, Topic, LessonPlan } from '../types'

interface ProgressStats {
  totalTopicsStarted: number
  totalTopicsCompleted: number
  totalTimeSpent: number // in minutes
  currentStreak: number
  longestStreak: number
  averageSessionTime: number
  completionRate: number
  weeklyGoalProgress: number
}

interface WeeklyActivity {
  date: string
  timeSpent: number
  topicsStudied: string[]
  sectionsCompleted: number
}

export default function ProgressTracking() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState<LearningProgress[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [stats, setStats] = useState<ProgressStats>({
    totalTopicsStarted: 0,
    totalTopicsCompleted: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSessionTime: 0,
    completionRate: 0,
    weeklyGoalProgress: 0
  })
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    loadProgressData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadProgressData = async () => {
    try {
      setLoading(true)
      const userData = await blink.auth.me()
      setUser(userData)

      // Mock data - in real app, load from database
      const mockTopics: Topic[] = [
        {
          id: 'ml-fundamentals',
          name: 'Machine Learning Fundamentals',
          description: 'Learn the core concepts of machine learning',
          course: 'computer-science',
          color: '#3B82F6',
          icon: '🤖',
          difficulty: 'intermediate',
          estimatedTime: 8,
          hasLessonPlan: true,
          hasTest: true
        },
        {
          id: 'react-advanced',
          name: 'Advanced React Patterns',
          description: 'Master advanced React concepts',
          course: 'web-development',
          color: '#06B6D4',
          icon: '⚛️',
          difficulty: 'advanced',
          estimatedTime: 12,
          hasLessonPlan: true,
          hasTest: true
        },
        {
          id: 'data-structures',
          name: 'Data Structures & Algorithms',
          description: 'Essential data structures and algorithms',
          course: 'computer-science',
          color: '#8B5CF6',
          icon: '🔗',
          difficulty: 'intermediate',
          estimatedTime: 15,
          hasLessonPlan: true,
          hasTest: true
        }
      ]

      const mockProgressData: LearningProgress[] = [
        {
          id: 'progress_1',
          userId: userData.id,
          topicId: 'ml-fundamentals',
          lessonPlanId: 'plan_1',
          completedSections: ['1', '2', '3', '4', '5'],
          currentSection: '6',
          startedAt: '2024-01-15T10:00:00Z',
          lastAccessedAt: '2024-01-20T14:30:00Z',
          completionPercentage: 62.5,
          timeSpent: 180, // 3 hours
          testCompleted: false
        },
        {
          id: 'progress_2',
          userId: userData.id,
          topicId: 'react-advanced',
          lessonPlanId: 'plan_2',
          completedSections: ['1', '2', '3', '4', '5', '6', '7', '8'],
          currentSection: '8',
          startedAt: '2024-01-10T09:00:00Z',
          lastAccessedAt: '2024-01-18T16:45:00Z',
          completionPercentage: 100,
          timeSpent: 420, // 7 hours
          testScore: 85,
          testCompleted: true
        },
        {
          id: 'progress_3',
          userId: userData.id,
          topicId: 'data-structures',
          lessonPlanId: 'plan_3',
          completedSections: ['1', '2'],
          currentSection: '3',
          startedAt: '2024-01-22T11:00:00Z',
          lastAccessedAt: '2024-01-22T12:30:00Z',
          completionPercentage: 20,
          timeSpent: 90, // 1.5 hours
          testCompleted: false
        }
      ]

      const mockWeeklyActivity: WeeklyActivity[] = [
        { date: '2024-01-15', timeSpent: 60, topicsStudied: ['ml-fundamentals'], sectionsCompleted: 2 },
        { date: '2024-01-16', timeSpent: 45, topicsStudied: ['ml-fundamentals'], sectionsCompleted: 1 },
        { date: '2024-01-17', timeSpent: 90, topicsStudied: ['react-advanced'], sectionsCompleted: 3 },
        { date: '2024-01-18', timeSpent: 75, topicsStudied: ['react-advanced'], sectionsCompleted: 2 },
        { date: '2024-01-19', timeSpent: 0, topicsStudied: [], sectionsCompleted: 0 },
        { date: '2024-01-20', timeSpent: 120, topicsStudied: ['ml-fundamentals', 'data-structures'], sectionsCompleted: 4 },
        { date: '2024-01-21', timeSpent: 60, topicsStudied: ['data-structures'], sectionsCompleted: 1 }
      ]

      setTopics(mockTopics)
      setProgressData(mockProgressData)
      setWeeklyActivity(mockWeeklyActivity)

      // Calculate stats
      const totalTimeSpent = mockProgressData.reduce((sum, progress) => sum + progress.timeSpent, 0)
      const completedTopics = mockProgressData.filter(p => p.completionPercentage === 100).length
      const completionRate = mockProgressData.length > 0 ? 
        (mockProgressData.reduce((sum, p) => sum + p.completionPercentage, 0) / mockProgressData.length) : 0

      // Calculate streak
      const currentStreak = calculateCurrentStreak(mockWeeklyActivity)
      const longestStreak = calculateLongestStreak(mockWeeklyActivity)

      setStats({
        totalTopicsStarted: mockProgressData.length,
        totalTopicsCompleted: completedTopics,
        totalTimeSpent,
        currentStreak,
        longestStreak,
        averageSessionTime: totalTimeSpent / mockProgressData.length,
        completionRate,
        weeklyGoalProgress: Math.min(100, (totalTimeSpent / (10 * 60)) * 100) // 10 hours weekly goal
      })

    } catch (error) {
      console.error('Failed to load progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCurrentStreak = (activity: WeeklyActivity[]): number => {
    let streak = 0
    const sortedActivity = activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    for (const day of sortedActivity) {
      if (day.timeSpent > 0) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const calculateLongestStreak = (activity: WeeklyActivity[]): number => {
    let longestStreak = 0
    let currentStreak = 0
    
    for (const day of activity) {
      if (day.timeSpent > 0) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
    
    return longestStreak
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getTopicById = (topicId: string): Topic | undefined => {
    return topics.find(topic => topic.id === topicId)
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 50) return 'text-blue-600'
    if (percentage >= 25) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥'
    if (streak >= 14) return '⚡'
    if (streak >= 7) return '🌟'
    if (streak >= 3) return '💪'
    return '🎯'
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your progress...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Progress</h1>
          <p className="text-gray-600">
            Track your learning journey and celebrate your achievements.
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <span className="mr-2">{getStreakEmoji(stats.currentStreak)}</span>
                {stats.currentStreak} days
              </div>
              <p className="text-xs text-muted-foreground">
                Longest: {stats.longestStreak} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatTime(Math.round(stats.averageSessionTime))} per topic
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topics Completed</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTopicsCompleted}/{stats.totalTopicsStarted}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(stats.completionRate)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.weeklyGoalProgress)}%</div>
              <Progress value={stats.weeklyGoalProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Goal: 10 hours per week
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)} className="mb-8">
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-6">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weeklyActivity.map((day, index) => {
                    const date = new Date(day.date)
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                    const intensity = Math.min(100, (day.timeSpent / 120) * 100) // Max 2 hours for full intensity
                    
                    return (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-600 mb-1">{dayName}</div>
                        <div 
                          className={`h-12 rounded border-2 flex items-center justify-center text-xs font-medium ${
                            day.timeSpent > 0 
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-gray-100 border-gray-200 text-gray-400'
                          }`}
                          title={`${formatTime(day.timeSpent)} - ${day.sectionsCompleted} sections`}
                        >
                          {day.timeSpent > 0 ? formatTime(day.timeSpent) : '0m'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {day.sectionsCompleted} sections
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="month">
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly View</h3>
                <p className="text-gray-600">Monthly progress charts coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-8 text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Time Stats</h3>
                <p className="text-gray-600">Comprehensive analytics coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Current Topics Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Current Learning Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.map((progress) => {
                const topic = getTopicById(progress.topicId)
                if (!topic) return null

                return (
                  <div 
                    key={progress.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/lesson/${topic.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{topic.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{topic.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(progress.timeSpent)}
                          </span>
                          <span className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {progress.completedSections.length} sections
                          </span>
                          {progress.testCompleted && progress.testScore && (
                            <span className="flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              Test: {progress.testScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getProgressColor(progress.completionPercentage)}`}>
                          {Math.round(progress.completionPercentage)}%
                        </div>
                        <Progress value={progress.completionPercentage} className="w-24" />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {progress.completionPercentage === 100 ? (
                          <Badge variant="default" className="bg-green-600">
                            <Trophy className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Play className="h-3 w-3 mr-1" />
                            Continue
                          </Button>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {progressData.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No learning progress yet</h3>
                <p className="text-gray-600 mb-4">
                  Start learning a topic to see your progress here.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Browse Topics
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.currentStreak >= 7 && (
                <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-2xl mr-3">🔥</div>
                  <div>
                    <div className="font-medium text-orange-900">Week Warrior</div>
                    <div className="text-sm text-orange-700">7-day learning streak!</div>
                  </div>
                </div>
              )}
              
              {stats.totalTopicsCompleted >= 1 && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-2xl mr-3">🎯</div>
                  <div>
                    <div className="font-medium text-green-900">First Victory</div>
                    <div className="text-sm text-green-700">Completed your first topic!</div>
                  </div>
                </div>
              )}
              
              {stats.totalTimeSpent >= 300 && (
                <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-2xl mr-3">⏰</div>
                  <div>
                    <div className="font-medium text-blue-900">Time Master</div>
                    <div className="text-sm text-blue-700">5+ hours of learning!</div>
                  </div>
                </div>
              )}
            </div>
            
            {stats.currentStreak < 7 && stats.totalTopicsCompleted === 0 && stats.totalTimeSpent < 300 && (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Earn Your First Achievement</h3>
                <p className="text-gray-600">
                  Keep learning to unlock achievements and celebrate your progress!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}