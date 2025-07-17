export interface User {
  id: string
  email: string
  displayName?: string
  createdAt: string
}

export interface PDFDocument {
  id: string
  userId: string
  filename: string
  title: string
  uploadedAt: string
  fileUrl: string
  extractedText?: string
  processed: boolean
}

export interface ChatMessage {
  id: string
  userId: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  documentIds?: string[]
}

export interface ChatSession {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

export interface UserSettings {
  id: string
  userId: string
  openaiApiKey?: string
  preferredModel: string
  maxTokens: number
  temperature: number
  updatedAt: string
}

export interface Course {
  id: string
  name: string
  description: string
  color: string
  topics: string[]
}

export interface SavedNote {
  id: string
  userId: string
  title: string
  content: string
  course?: string
  topic?: string
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  userId: string
  course: string
  topic: string
  startTime: string
  endTime?: string
  notesCount: number
  questionsAsked: number
}

export interface LessonPlan {
  id: string
  topicId: string
  title: string
  description: string
  estimatedDuration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  sections: LessonSection[]
  prerequisites?: string[]
  learningObjectives: string[]
  createdAt: string
}

export interface LessonSection {
  id: string
  title: string
  type: 'video' | 'reading' | 'exercise' | 'quiz'
  content: string
  videoUrl?: string
  duration: number // in minutes
  order: number
  completed?: boolean
}

export interface LearningProgress {
  id: string
  userId: string
  topicId: string
  lessonPlanId: string
  completedSections: string[]
  currentSection: string
  startedAt: string
  lastAccessedAt: string
  completionPercentage: number
  timeSpent: number // in minutes
  testScore?: number
  testCompleted: boolean
}

export interface SkillTest {
  id: string
  topicId: string
  title: string
  description: string
  questions: TestQuestion[]
  passingScore: number
  timeLimit: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface TestQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  options?: string[] // for multiple choice
  correctAnswer: string | string[]
  explanation: string
  points: number
}

export interface TestAttempt {
  id: string
  userId: string
  testId: string
  topicId: string
  answers: TestAnswer[]
  score: number
  totalPoints: number
  completedAt: string
  timeSpent: number
  passed: boolean
}

export interface TestAnswer {
  questionId: string
  answer: string | string[]
  isCorrect: boolean
  pointsEarned: number
}

export interface Topic {
  id: string
  name: string
  description: string
  course: string
  color: string
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // in hours
  hasLessonPlan: boolean
  hasTest: boolean
  prerequisites?: string[]
}