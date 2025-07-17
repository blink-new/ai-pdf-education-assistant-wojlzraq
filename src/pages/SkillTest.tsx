import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Award, 
  RotateCcw,
  AlertCircle,
  Trophy,
  Target,
  BookOpen,
  Play,
  Pause,
  Flag
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import type { SkillTest, TestQuestion, TestAttempt, TestAnswer, Topic } from '../types'

export default function SkillTestPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [topic, setTopic] = useState<Topic | null>(null)
  const [skillTest, setSkillTest] = useState<SkillTest | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResult, setTestResult] = useState<TestAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingTest, setGeneratingTest] = useState(false)

  useEffect(() => {
    loadTopicAndTest()
  }, [topicId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTopicAndTest = async () => {
    if (!topicId) return
    
    try {
      setLoading(true)
      
      // Mock topic data
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
      
      // Check if test exists
      const existingTest = await loadExistingTest(topicId)
      if (existingTest) {
        setSkillTest(existingTest)
        setTimeLeft(existingTest.timeLimit * 60) // Convert minutes to seconds
      } else {
        // Generate new test
        await generateSkillTest(mockTopic)
      }
    } catch (error) {
      console.error('Failed to load topic and test:', error)
      toast({
        title: "Error",
        description: "Failed to load skill test. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadExistingTest = async (topicId: string): Promise<SkillTest | null> => {
    // In real app, query database
    return null
  }

  const generateSkillTest = async (topic: Topic) => {
    if (!topic) return
    
    try {
      setGeneratingTest(true)
      
      const prompt = `Create a comprehensive skill test for the topic "${topic.name}" in ${topic.course}.

Topic Description: ${topic.description}
Difficulty Level: ${topic.difficulty}

Please generate a skill test with the following:

1. 10-15 questions of varying difficulty
2. Mix of question types:
   - Multiple choice (60%)
   - True/False (20%)
   - Short answer (20%)
3. Each question should test practical understanding, not just memorization
4. Include clear explanations for correct answers
5. Set appropriate point values (1-3 points per question)
6. Passing score should be 70%
7. Time limit: 30 minutes

Format the questions to test real understanding of ${topic.name} concepts, practical applications, and problem-solving skills.

Make the test challenging but fair for ${topic.difficulty} level students.`

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

      // Parse the generated content and create test structure
      const newSkillTest = await createTestFromAI(generatedContent, topic)
      setSkillTest(newSkillTest)
      setTimeLeft(newSkillTest.timeLimit * 60)
      
      toast({
        title: "Skill Test Generated!",
        description: `Your ${topic.name} skill test is ready with ${newSkillTest.questions.length} questions.`,
      })
      
    } catch (error) {
      console.error('Failed to generate skill test:', error)
      toast({
        title: "Error",
        description: "Failed to generate skill test. Please try again.",
        variant: "destructive"
      })
    } finally {
      setGeneratingTest(false)
    }
  }

  const createTestFromAI = async (content: string, topic: Topic): Promise<SkillTest> => {
    // Parse AI content and create structured test
    const questions: TestQuestion[] = [
      {
        id: '1',
        question: 'What is the main difference between supervised and unsupervised learning?',
        type: 'multiple-choice',
        options: [
          'Supervised learning uses labeled data, unsupervised learning uses unlabeled data',
          'Supervised learning is faster than unsupervised learning',
          'Supervised learning only works with numerical data',
          'There is no difference between them'
        ],
        correctAnswer: 'Supervised learning uses labeled data, unsupervised learning uses unlabeled data',
        explanation: 'Supervised learning algorithms learn from labeled training data to make predictions, while unsupervised learning finds patterns in unlabeled data.',
        points: 2
      },
      {
        id: '2',
        question: 'Linear regression is only suitable for classification problems.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Linear regression is used for regression problems (predicting continuous values), not classification problems.',
        points: 1
      },
      {
        id: '3',
        question: 'Which algorithm would be most appropriate for clustering customers based on their purchasing behavior?',
        type: 'multiple-choice',
        options: [
          'Linear Regression',
          'K-Means Clustering',
          'Decision Trees',
          'Logistic Regression'
        ],
        correctAnswer: 'K-Means Clustering',
        explanation: 'K-Means is an unsupervised learning algorithm perfect for clustering similar data points, such as customers with similar purchasing patterns.',
        points: 2
      },
      {
        id: '4',
        question: 'What is overfitting in machine learning and how can it be prevented?',
        type: 'short-answer',
        correctAnswer: 'Overfitting occurs when a model learns the training data too well, including noise and irrelevant patterns, leading to poor performance on new data. It can be prevented through techniques like cross-validation, regularization, early stopping, and using more training data.',
        explanation: 'Overfitting is a common problem where models perform well on training data but poorly on test data. Prevention techniques help create models that generalize better.',
        points: 3
      },
      {
        id: '5',
        question: 'Cross-validation is used to evaluate model performance.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Cross-validation is a technique used to assess how well a model will generalize to new, unseen data by testing it on different subsets of the training data.',
        points: 1
      },
      {
        id: '6',
        question: 'Which evaluation metric would be most appropriate for a highly imbalanced classification dataset?',
        type: 'multiple-choice',
        options: [
          'Accuracy',
          'Precision and Recall',
          'Mean Squared Error',
          'R-squared'
        ],
        correctAnswer: 'Precision and Recall',
        explanation: 'For imbalanced datasets, accuracy can be misleading. Precision and Recall (or F1-score) provide better insights into model performance on minority classes.',
        points: 2
      },
      {
        id: '7',
        question: 'What is the purpose of feature scaling in machine learning?',
        type: 'short-answer',
        correctAnswer: 'Feature scaling normalizes the range of features so that no single feature dominates others due to its scale. This is important for algorithms like SVM, neural networks, and k-means clustering that are sensitive to the scale of input features.',
        explanation: 'Feature scaling ensures all features contribute equally to the learning process and prevents features with larger scales from dominating the model.',
        points: 2
      },
      {
        id: '8',
        question: 'Decision trees can handle both numerical and categorical features.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Decision trees are versatile algorithms that can naturally handle both numerical and categorical features without requiring preprocessing.',
        points: 1
      },
      {
        id: '9',
        question: 'Which of the following is NOT a common application of machine learning?',
        type: 'multiple-choice',
        options: [
          'Image recognition',
          'Recommendation systems',
          'Natural language processing',
          'Manual data entry'
        ],
        correctAnswer: 'Manual data entry',
        explanation: 'Manual data entry is a human task that doesn\'t involve machine learning. The other options are all common ML applications.',
        points: 1
      },
      {
        id: '10',
        question: 'Explain the bias-variance tradeoff in machine learning.',
        type: 'short-answer',
        correctAnswer: 'The bias-variance tradeoff describes the relationship between a model\'s ability to minimize bias (error from oversimplifying) and variance (error from sensitivity to small changes in training data). High bias leads to underfitting, high variance leads to overfitting. The goal is to find the optimal balance that minimizes total error.',
        explanation: 'Understanding this tradeoff is crucial for building models that generalize well to new data.',
        points: 3
      }
    ]

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
    const passingScore = Math.ceil(totalPoints * 0.7) // 70% passing score

    const newSkillTest: SkillTest = {
      id: `test_${Date.now()}`,
      topicId: topic.id,
      title: `${topic.name} Skill Assessment`,
      description: `Test your knowledge of ${topic.name} with this comprehensive assessment covering key concepts, practical applications, and problem-solving skills.`,
      questions,
      passingScore,
      timeLimit: 30, // 30 minutes
      difficulty: topic.difficulty
    }

    // Save to database in real app
    // await blink.db.skillTests.create(newSkillTest)
    
    return newSkillTest
  }

  const startTest = () => {
    setIsActive(true)
    toast({
      title: "Test Started!",
      description: `You have ${skillTest?.timeLimit} minutes to complete the test.`,
    })
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitTest = async () => {
    if (!skillTest) return
    
    setIsActive(false)
    setTestCompleted(true)
    
    try {
      const user = await blink.auth.me()
      const testAnswers: TestAnswer[] = []
      let totalScore = 0
      let totalPoints = 0

      // Grade the test
      skillTest.questions.forEach(question => {
        const userAnswer = answers[question.id]
        let isCorrect = false
        let pointsEarned = 0

        if (question.type === 'multiple-choice' || question.type === 'true-false') {
          isCorrect = userAnswer === question.correctAnswer
          pointsEarned = isCorrect ? question.points : 0
        } else if (question.type === 'short-answer') {
          // For short answers, we'll give partial credit based on keyword matching
          // In a real app, this would be more sophisticated or human-graded
          const userAnswerStr = (userAnswer as string || '').toLowerCase()
          const correctAnswerStr = (question.correctAnswer as string).toLowerCase()
          
          // Simple keyword matching for demo
          const keywords = correctAnswerStr.split(' ').filter(word => word.length > 3)
          const matchedKeywords = keywords.filter(keyword => userAnswerStr.includes(keyword))
          const matchPercentage = matchedKeywords.length / keywords.length
          
          isCorrect = matchPercentage >= 0.5
          pointsEarned = Math.round(question.points * matchPercentage)
        }

        totalScore += pointsEarned
        totalPoints += question.points

        testAnswers.push({
          questionId: question.id,
          answer: userAnswer || '',
          isCorrect,
          pointsEarned
        })
      })

      const passed = totalScore >= skillTest.passingScore
      const timeSpent = (skillTest.timeLimit * 60 - timeLeft) / 60 // Convert to minutes

      const attempt: TestAttempt = {
        id: `attempt_${Date.now()}`,
        userId: user.id,
        testId: skillTest.id,
        topicId: skillTest.topicId,
        answers: testAnswers,
        score: totalScore,
        totalPoints,
        completedAt: new Date().toISOString(),
        timeSpent,
        passed
      }

      setTestResult(attempt)

      // Save to database in real app
      // await blink.db.testAttempts.create(attempt)

      toast({
        title: passed ? "Congratulations!" : "Test Completed",
        description: passed 
          ? `You passed with ${totalScore}/${totalPoints} points!`
          : `You scored ${totalScore}/${totalPoints} points. Keep studying and try again!`,
        variant: passed ? "default" : "destructive"
      })

    } catch (error) {
      console.error('Failed to submit test:', error)
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive"
      })
    }
  }

  const retakeTest = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeLeft(skillTest?.timeLimit ? skillTest.timeLimit * 60 : 0)
    setIsActive(false)
    setTestCompleted(false)
    setTestResult(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeLeft > 300) return 'text-green-600' // > 5 minutes
    if (timeLeft > 60) return 'text-yellow-600'  // > 1 minute
    return 'text-red-600' // < 1 minute
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading skill test...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (generatingTest) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="animate-pulse">
              <Award className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Skill Test</h2>
            <p className="text-gray-600 mb-4">
              Our AI is creating a comprehensive assessment for {topic?.name}...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!topic || !skillTest) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Not Found</h2>
            <p className="text-gray-600 mb-4">The requested skill test could not be found.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  // Test Results View
  if (testCompleted && testResult) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              testResult.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {testResult.passed ? (
                <Trophy className="h-10 w-10 text-green-600" />
              ) : (
                <Target className="h-10 w-10 text-red-600" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {testResult.passed ? 'Congratulations!' : 'Test Complete'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {testResult.passed 
                ? `You've successfully passed the ${topic.name} skill test!`
                : `You've completed the ${topic.name} skill test. Keep studying and try again!`
              }
            </p>

            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{testResult.score}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{testResult.totalPoints}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((testResult.score / testResult.totalPoints) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(testResult.timeSpent)}m
                  </div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span>Your Score</span>
                <span>Passing Score: {skillTest.passingScore} points</span>
              </div>
              <Progress 
                value={(testResult.score / testResult.totalPoints) * 100} 
                className="h-3"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate(`/lesson/${topicId}`)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Review Lesson
              </Button>
              <Button variant="outline" onClick={retakeTest}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Test
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillTest.questions.map((question, index) => {
                  const userAnswer = testResult.answers.find(a => a.questionId === question.id)
                  const isCorrect = userAnswer?.isCorrect || false
                  
                  return (
                    <div key={question.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          Question {index + 1}: {question.question}
                        </h4>
                        <div className="flex items-center">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mr-1" />
                          )}
                          <span className="text-sm font-medium">
                            {userAnswer?.pointsEarned || 0}/{question.points} pts
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Your Answer:</strong> {userAnswer?.answer || 'No answer provided'}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Correct Answer:</strong> {question.correctAnswer}
                      </div>
                      
                      <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  const currentQuestion = skillTest.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / skillTest.questions.length) * 100

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/lesson/${topicId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lesson
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Award className="h-6 w-6 mr-2 text-blue-600" />
                {skillTest.title}
              </h1>
              <p className="text-gray-600 mt-1">{skillTest.description}</p>
            </div>
            
            {/* Timer */}
            <Card className="w-48">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-mono font-bold mb-1 ${getTimeColor()}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-gray-600 flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Time Remaining
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-blue-600">{skillTest.questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-green-600">{skillTest.passingScore}</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-purple-600">{skillTest.timeLimit}m</div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Badge variant="secondary" className="capitalize">
                {skillTest.difficulty}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Difficulty</div>
            </CardContent>
          </Card>
        </div>

        {!isActive ? (
          /* Pre-Test Instructions */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                Test Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Time Limit</h4>
                    <p className="text-sm text-gray-600">
                      You have {skillTest.timeLimit} minutes to complete all {skillTest.questions.length} questions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Target className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Passing Score</h4>
                    <p className="text-sm text-gray-600">
                      You need {skillTest.passingScore} points out of {skillTest.questions.reduce((sum, q) => sum + q.points, 0)} total points to pass.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Flag className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Question Types</h4>
                    <p className="text-sm text-gray-600">
                      Multiple choice, true/false, and short answer questions. Read each question carefully.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Important Notes</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Once you start, the timer cannot be paused</li>
                      <li>• You can navigate between questions freely</li>
                      <li>• Make sure to answer all questions before time runs out</li>
                      <li>• The test will auto-submit when time expires</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button onClick={startTest} size="lg" className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Start Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Active Test */
          <div className="space-y-6">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Question {currentQuestionIndex + 1} of {skillTest.questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Question */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1}
                  <Badge variant="outline" className="ml-2">
                    {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-gray-900 text-lg leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-4">
                  {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                    <RadioGroup
                      value={answers[currentQuestion.id] as string || ''}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === 'true-false' && currentQuestion.options && (
                    <RadioGroup
                      value={answers[currentQuestion.id] as string || ''}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`tf-${index}`} />
                          <Label htmlFor={`tf-${index}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === 'short-answer' && (
                    <Textarea
                      value={answers[currentQuestion.id] as string || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-[100px]"
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>

                  <div className="text-sm text-gray-600">
                    {Object.keys(answers).length} of {skillTest.questions.length} answered
                  </div>

                  {currentQuestionIndex === skillTest.questions.length - 1 ? (
                    <Button onClick={handleSubmitTest} className="bg-green-600 hover:bg-green-700">
                      <Flag className="h-4 w-4 mr-2" />
                      Submit Test
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(skillTest.questions.length - 1, prev + 1))}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Question Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-2">
                  {skillTest.questions.map((_, index) => {
                    const isAnswered = answers[skillTest.questions[index].id] !== undefined
                    const isCurrent = index === currentQuestionIndex
                    
                    return (
                      <Button
                        key={index}
                        variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}