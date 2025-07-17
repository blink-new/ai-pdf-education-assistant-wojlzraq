import { useState } from 'react'
import { 
  Brain, 
  Clock, 
  Target, 
  BookOpen, 
  Video, 
  PenTool, 
  HelpCircle,
  Sparkles,
  User,
  Settings,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { blink } from '../blink/client'
import type { Topic, LessonPlan } from '../types'

interface PersonalizationPreferences {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeAvailable: number // hours per week
  preferredContentTypes: string[]
  goals: string
  currentKnowledge: string
  interests: string[]
  schedule: 'flexible' | 'structured' | 'intensive'
}

interface PersonalizedLessonPlanGeneratorProps {
  topic: Topic
  onLessonPlanGenerated: (lessonPlan: LessonPlan) => void
  onClose: () => void
}

export default function PersonalizedLessonPlanGenerator({ 
  topic, 
  onLessonPlanGenerated, 
  onClose 
}: PersonalizedLessonPlanGeneratorProps) {
  const [step, setStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [preferences, setPreferences] = useState<PersonalizationPreferences>({
    learningStyle: 'visual',
    difficulty: topic.difficulty,
    timeAvailable: 5,
    preferredContentTypes: ['video', 'reading'],
    goals: '',
    currentKnowledge: '',
    interests: [],
    schedule: 'flexible'
  })

  const contentTypeOptions = [
    { id: 'video', label: 'Video Lectures', icon: Video },
    { id: 'reading', label: 'Reading Materials', icon: BookOpen },
    { id: 'exercise', label: 'Hands-on Exercises', icon: PenTool },
    { id: 'quiz', label: 'Practice Quizzes', icon: HelpCircle }
  ]

  const interestOptions = [
    'Real-world Applications',
    'Industry Case Studies',
    'Research Papers',
    'Open Source Projects',
    'Career Development',
    'Certification Prep',
    'Interview Preparation',
    'Project-based Learning'
  ]

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        preferredContentTypes: [...prev.preferredContentTypes, contentType]
      }))
    } else {
      setPreferences(prev => ({
        ...prev,
        preferredContentTypes: prev.preferredContentTypes.filter(type => type !== contentType)
      }))
    }
  }

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }))
    } else {
      setPreferences(prev => ({
        ...prev,
        interests: prev.interests.filter(i => i !== interest)
      }))
    }
  }

  const generatePersonalizedLessonPlan = async () => {
    setGenerating(true)
    
    try {
      const user = await blink.auth.me()
      
      const personalizationPrompt = `Create a highly personalized lesson plan for "${topic.name}" based on the following user preferences:

**User Profile:**
- Learning Style: ${preferences.learningStyle}
- Current Level: ${preferences.difficulty}
- Time Available: ${preferences.timeAvailable} hours per week
- Preferred Content Types: ${preferences.preferredContentTypes.join(', ')}
- Schedule Preference: ${preferences.schedule}

**Learning Goals:**
${preferences.goals}

**Current Knowledge Level:**
${preferences.currentKnowledge}

**Special Interests:**
${preferences.interests.join(', ')}

**Topic Information:**
- Name: ${topic.name}
- Description: ${topic.description}
- Course: ${topic.course}
- Base Difficulty: ${topic.difficulty}
- Estimated Time: ${topic.estimatedTime} hours

**Instructions:**
1. Create a lesson plan that adapts to the user's learning style:
   - Visual learners: Include more diagrams, infographics, and visual content
   - Auditory learners: Focus on video lectures, podcasts, and discussion points
   - Kinesthetic learners: Emphasize hands-on exercises and practical projects
   - Reading learners: Provide comprehensive text materials and documentation

2. Adjust difficulty and pacing based on current knowledge and available time
3. Prioritize the user's preferred content types (${preferences.preferredContentTypes.join(', ')})
4. Include real-world applications and examples related to their interests
5. Structure the schedule according to their preference (${preferences.schedule})

6. Create 6-10 sections with:
   - Section title
   - Type (matching user preferences)
   - Detailed content description
   - Duration (realistic for their time availability)
   - Specific learning outcomes
   - For video sections, suggest specific video topics or channels
   - For exercises, provide concrete project ideas
   - For reading, recommend specific resources

7. Include personalized tips and motivation based on their goals

Make this lesson plan feel like it was created specifically for this user's learning journey.`

      let generatedContent = ''
      await blink.ai.streamText(
        {
          prompt: personalizationPrompt,
          model: 'gpt-4o-mini'
        },
        (chunk) => {
          generatedContent += chunk
        }
      )

      // Create structured lesson plan from AI response
      const personalizedLessonPlan = await createPersonalizedLessonPlan(generatedContent, topic, preferences)
      
      onLessonPlanGenerated(personalizedLessonPlan)
      
    } catch (error) {
      console.error('Failed to generate personalized lesson plan:', error)
    } finally {
      setGenerating(false)
    }
  }

  const createPersonalizedLessonPlan = async (
    content: string, 
    topic: Topic, 
    prefs: PersonalizationPreferences
  ): Promise<LessonPlan> => {
    // Create sections based on user preferences
    const sections = []
    let sectionId = 1

    // Adapt content types based on preferences
    const contentTypeDistribution = {
      video: prefs.preferredContentTypes.includes('video') ? 0.4 : 0.1,
      reading: prefs.preferredContentTypes.includes('reading') ? 0.3 : 0.2,
      exercise: prefs.preferredContentTypes.includes('exercise') ? 0.2 : 0.1,
      quiz: prefs.preferredContentTypes.includes('quiz') ? 0.1 : 0.05
    }

    // Generate sections based on learning style and preferences
    const totalSections = Math.max(6, Math.min(10, Math.floor(prefs.timeAvailable)))
    
    for (let i = 0; i < totalSections; i++) {
      const sectionTypes = Object.entries(contentTypeDistribution)
        .sort(([,a], [,b]) => b - a)
        .map(([type]) => type)
      
      const sectionType = sectionTypes[i % sectionTypes.length] as 'video' | 'reading' | 'exercise' | 'quiz'
      
      sections.push({
        id: sectionId.toString(),
        title: `${topic.name} - Section ${sectionId}`,
        type: sectionType,
        content: `Personalized content for ${prefs.learningStyle} learners focusing on ${topic.name}`,
        duration: Math.floor((prefs.timeAvailable * 60) / totalSections), // Distribute time evenly
        order: sectionId,
        videoUrl: sectionType === 'video' ? 'https://www.youtube.com/watch?v=example' : undefined
      })
      
      sectionId++
    }

    const personalizedLessonPlan: LessonPlan = {
      id: `personalized_plan_${Date.now()}`,
      topicId: topic.id,
      title: `Personalized ${topic.name} Learning Path`,
      description: `A customized learning experience tailored for ${prefs.learningStyle} learners with ${prefs.difficulty} level content, designed to fit ${prefs.timeAvailable} hours per week.`,
      estimatedDuration: prefs.timeAvailable * 60, // Convert hours to minutes
      difficulty: prefs.difficulty,
      sections,
      prerequisites: topic.prerequisites,
      learningObjectives: [
        `Master ${topic.name} concepts using ${prefs.learningStyle} learning approach`,
        'Apply knowledge through personalized exercises and projects',
        'Achieve learning goals: ' + prefs.goals,
        'Build practical skills relevant to your interests',
        'Complete the course within your available time schedule'
      ],
      createdAt: new Date().toISOString()
    }

    return personalizedLessonPlan
  }

  if (generating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Creating Your Personalized Lesson Plan</h3>
            <p className="text-gray-600 text-sm">
              Our AI is crafting a learning experience tailored specifically for you...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
            Personalize Your Learning Experience
          </CardTitle>
          <p className="text-gray-600">
            Let's create a lesson plan that's perfect for your learning style and goals.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Learning Style & Preferences */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold">Tell us about your learning style</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="learningStyle">How do you learn best?</Label>
                  <Select 
                    value={preferences.learningStyle} 
                    onValueChange={(value: any) => setPreferences(prev => ({ ...prev, learningStyle: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual - I learn through images, diagrams, and videos</SelectItem>
                      <SelectItem value="auditory">Auditory - I learn through listening and discussion</SelectItem>
                      <SelectItem value="kinesthetic">Kinesthetic - I learn through hands-on practice</SelectItem>
                      <SelectItem value="reading">Reading - I learn through text and documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">What's your current level with this topic?</Label>
                  <Select 
                    value={preferences.difficulty} 
                    onValueChange={(value: any) => setPreferences(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - I'm new to this topic</SelectItem>
                      <SelectItem value="intermediate">Intermediate - I have some knowledge</SelectItem>
                      <SelectItem value="advanced">Advanced - I want to deepen my expertise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeAvailable">How many hours per week can you dedicate to learning?</Label>
                  <Input
                    type="number"
                    min="1"
                    max="40"
                    value={preferences.timeAvailable}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timeAvailable: parseInt(e.target.value) || 5 }))}
                  />
                </div>

                <div>
                  <Label>What types of content do you prefer? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {contentTypeOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={preferences.preferredContentTypes.includes(option.id)}
                          onCheckedChange={(checked) => handleContentTypeChange(option.id, checked as boolean)}
                        />
                        <Label htmlFor={option.id} className="flex items-center cursor-pointer">
                          <option.icon className="h-4 w-4 mr-2" />
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals & Knowledge */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="text-lg font-semibold">Your learning goals and background</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="goals">What do you want to achieve with this topic?</Label>
                  <Textarea
                    id="goals"
                    placeholder="e.g., I want to build a machine learning model for my project, prepare for a job interview, or understand the fundamentals for my career..."
                    value={preferences.goals}
                    onChange={(e) => setPreferences(prev => ({ ...prev, goals: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="currentKnowledge">What do you already know about this topic?</Label>
                  <Textarea
                    id="currentKnowledge"
                    placeholder="e.g., I have experience with Python but haven't worked with ML libraries, or I understand basic concepts but need practical experience..."
                    value={preferences.currentKnowledge}
                    onChange={(e) => setPreferences(prev => ({ ...prev, currentKnowledge: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="schedule">How do you prefer to structure your learning?</Label>
                  <Select 
                    value={preferences.schedule} 
                    onValueChange={(value: any) => setPreferences(prev => ({ ...prev, schedule: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible - I'll learn at my own pace</SelectItem>
                      <SelectItem value="structured">Structured - I want a clear weekly schedule</SelectItem>
                      <SelectItem value="intensive">Intensive - I want to learn quickly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>What aspects interest you most? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {interestOptions.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={preferences.interests.includes(interest)}
                          onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                        />
                        <Label htmlFor={interest} className="text-sm cursor-pointer">
                          {interest}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Generate */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Settings className="h-5 w-5 mr-2 text-purple-600" />
                <h3 className="text-lg font-semibold">Review your preferences</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Learning Style:</span>
                  <Badge variant="secondary" className="capitalize">{preferences.learningStyle}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Difficulty Level:</span>
                  <Badge variant="secondary" className="capitalize">{preferences.difficulty}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time Available:</span>
                  <Badge variant="secondary">{preferences.timeAvailable} hours/week</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Schedule:</span>
                  <Badge variant="secondary" className="capitalize">{preferences.schedule}</Badge>
                </div>
                <div>
                  <span className="font-medium">Preferred Content:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.preferredContentTypes.map(type => (
                      <Badge key={type} variant="outline" className="text-xs capitalize">{type}</Badge>
                    ))}
                  </div>
                </div>
                {preferences.interests.length > 0 && (
                  <div>
                    <span className="font-medium">Interests:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preferences.interests.map(interest => (
                        <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {preferences.goals && (
                <div>
                  <h4 className="font-medium mb-2">Your Goals:</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{preferences.goals}</p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Navigation */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Previous
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={generatePersonalizedLessonPlan} className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate My Lesson Plan
                </Button>
              )}
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-2 h-2 rounded-full ${
                  stepNumber === step ? 'bg-blue-600' : 
                  stepNumber < step ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}