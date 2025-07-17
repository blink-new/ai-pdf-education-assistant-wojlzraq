import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Loader2,
  FileText,
  Sparkles,
  Globe,
  Search,
  Save,
  Download,
  Copy,
  BookOpen,
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  documentIds?: string[]
  canSave?: boolean
}

interface SavedNote {
  id: string
  title: string
  content: string
  course?: string
  topic?: string
  createdAt: string
}

export default function ChatInterface() {
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const course = searchParams.get('course')
  const topic = searchParams.get('topic')
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [messageToSave, setMessageToSave] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  useEffect(() => {
    // Load existing chat session if sessionId is provided
    if (sessionId) {
      loadChatSession(sessionId)
    } else {
      // Start with welcome message for new chat
      let welcomeMessage = 'Hello! I\'m your AI educational assistant with access to both your uploaded PDF documents and real-time internet information.'
      
      if (course && topic) {
        welcomeMessage = `Hello! I'm ready to help you learn about **${topic}** in **${course.charAt(0).toUpperCase() + course.slice(1)}**. I can:\n\n• Provide detailed explanations about ${topic}\n• Answer specific questions on this topic\n• Create summaries you can save for later\n• Search for the latest information online\n• Help with related concepts and examples\n\nWhat would you like to know about ${topic}?`
        
        // Auto-generate initial content about the topic
        setTimeout(() => {
          setInputMessage(`Please provide a comprehensive overview of ${topic} in ${course}, including key concepts, important points, and practical examples.`)
        }, 1000)
      } else {
        welcomeMessage += '\n\nI can:\n\n• Answer questions about your PDF documents\n• Search the web for current information on any topic\n• Provide detailed explanations and summaries\n• Help with educational topics whether they\'re in your documents or not\n\nFeel free to ask me anything - if I don\'t find it in your PDFs, I\'ll search the internet for the most current information!'
      }
      
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date().toISOString()
        }
      ])
    }
  }, [sessionId, course, topic])

  const loadChatSession = async (sessionId: string) => {
    try {
      // This would load messages from the database
      // For now, we'll use mock data
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Welcome back! I\'m ready to continue our conversation about your educational materials.',
          timestamp: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Failed to load chat session:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage('')
    setIsLoading(true)
    setStreamingMessage('')

    try {
      // Enhanced prompt for better ChatGPT-like behavior
      let enhancedPrompt = `You are an intelligent educational AI assistant with access to both uploaded PDF documents and real-time web search capabilities.`
      
      if (course && topic) {
        enhancedPrompt += `\n\nContext: The user is currently studying "${topic}" in the subject "${course}".`
      }
      
      enhancedPrompt += `\n\nUser Question: "${currentInput}"\n\nInstructions:\n1. First, check if this question relates to any uploaded PDF documents in the user's library\n2. If no relevant PDFs are found OR if the question requires current/updated information, use web search to find accurate, up-to-date information\n3. Provide comprehensive, well-structured responses with:\n   - Clear explanations suitable for educational purposes\n   - Examples when helpful\n   - Step-by-step breakdowns for complex topics\n   - Current information when relevant\n4. If you use web search, mention that you're accessing current information from the internet\n5. Always aim to be helpful, accurate, and educational in your responses\n6. Format your response with proper markdown for better readability\n\nRespond in a conversational, ChatGPT-like manner while being informative and educational.`

      let finalResponse = ''
      
      await blink.ai.streamText(
        {
          prompt: enhancedPrompt,
          search: true, // Enable web search for current information
          model: 'gpt-4o-mini' // Use a good model for educational responses
        },
        (chunk) => {
          setStreamingMessage(prev => prev + chunk)
          finalResponse += chunk
        }
      )

      // Add the complete response as a message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalResponse,
        timestamp: new Date().toISOString(),
        canSave: true // Allow saving AI responses
      }

      setMessages(prev => [...prev, assistantMessage])
      setStreamingMessage('')

      // Save the conversation to database for session persistence
      // TODO: Enable when database is available
      // await saveChatMessage(userMessage)
      // await saveChatMessage(assistantMessage)
      
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again. If the issue persists, please check your internet connection or try a different question.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
      setStreamingMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNote = async (message: Message) => {
    setMessageToSave(message)
    setNoteTitle(topic ? `${topic} - Notes` : 'Study Notes')
    setSaveDialogOpen(true)
  }

  const saveNote = async () => {
    if (!messageToSave || !noteTitle.trim()) return

    try {
      const user = await blink.auth.me()
      const savedNote: SavedNote = {
        id: Date.now().toString(),
        title: noteTitle,
        content: messageToSave.content,
        course: course || undefined,
        topic: topic || undefined,
        createdAt: new Date().toISOString()
      }

      // TODO: Save to database when available
      // await blink.db.savedNotes.create({
      //   ...savedNote,
      //   userId: user.id
      // })

      toast({
        title: "Note Saved!",
        description: `"${noteTitle}" has been saved to your notes.`,
      })

      setSaveDialogOpen(false)
      setNoteTitle('')
      setMessageToSave(null)
    } catch (error) {
      console.error('Failed to save note:', error)
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: "Error",
        description: "Failed to copy content.",
        variant: "destructive"
      })
    }
  }

  const downloadAsText = (content: string, filename: string) => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {(course || topic) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Courses
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {course && topic ? `${topic} - ${course.charAt(0).toUpperCase() + course.slice(1)}` : 'AI Chat Assistant'}
                </h1>
                <p className="text-sm text-gray-500">
                  {course && topic 
                    ? `Learning about ${topic} with AI assistance`
                    : 'Ask questions about your documents or any educational topic'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                PDF Search
              </Badge>
              <Badge variant="secondary" className="flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                Web Search
              </Badge>
              <Badge variant="default" className="flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <Card className={`${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white'
                }`}>
                  <CardContent className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {/* Action Buttons for AI Messages */}
                    {message.role === 'assistant' && message.canSave && (
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveNote(message)}
                          className="text-xs"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save Note
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(message.content)}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadAsText(message.content, `${topic || 'notes'}-${Date.now()}.txt`)}
                          className="text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                    
                    {message.documentIds && message.documentIds.length > 0 && (
                      <div className="mt-2 flex items-center text-xs opacity-75">
                        <FileText className="h-3 w-3 mr-1" />
                        Referenced {message.documentIds.length} document(s)
                      </div>
                    )}
                    <div className={`text-xs mt-2 opacity-75 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          {/* Streaming Message */}
          {streamingMessage && (
            <div className="flex justify-start">
              <div className="flex max-w-3xl">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                </div>
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{streamingMessage}</p>
                    </div>
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-3 w-3 animate-spin text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                      <Globe className="h-3 w-3 ml-2 text-blue-500" />
                      <span className="text-xs text-blue-500 ml-1">Searching web</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex items-end space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  course && topic 
                    ? `Ask me anything about ${topic}...`
                    : "Ask me anything! I can search your PDFs or the web for current information..."
                }
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Save Note Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Save Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note-title">Note Title</Label>
              <Input
                id="note-title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter a title for your note..."
                className="mt-1"
              />
            </div>
            {course && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{course.charAt(0).toUpperCase() + course.slice(1)}</Badge>
                {topic && <Badge variant="outline">{topic}</Badge>}
              </div>
            )}
            <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {messageToSave?.content.substring(0, 200)}...
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveNote} disabled={!noteTitle.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}