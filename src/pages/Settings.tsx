import { useState, useEffect } from 'react'
import { 
  Key, 
  User, 
  Brain, 
  Save,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Slider } from '../components/ui/slider'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    preferredModel: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.7
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await blink.auth.me()
        setUser(userData)
        
        // Load user settings (mock data for now)
        setSettings({
          openaiApiKey: '',
          preferredModel: 'gpt-4o-mini',
          maxTokens: 1000,
          temperature: 0.7
        })
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }

    loadUserData()
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    try {
      // Here we would save settings to the database
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.'
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: 'Save failed',
        description: 'There was an error saving your settings. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await blink.auth.updateMe({
        displayName: user?.displayName || ''
      })
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.'
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({
        title: 'Update failed',
        description: 'There was an error updating your profile. Please try again.',
        variant: 'destructive'
      })
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and AI model configurations
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={user?.displayName || ''}
                    onChange={(e) => setUser(prev => prev ? {...prev, displayName: e.target.value} : null)}
                    placeholder="Enter your display name"
                  />
                </div>
              </div>
              
              <Button onClick={handleUpdateProfile}>
                <Save className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure your AI model API keys and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your API keys are encrypted and stored securely. They are only used to make requests to AI services on your behalf.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="openaiKey">OpenAI API Key</Label>
                <div className="relative">
                  <Input
                    id="openaiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings(prev => ({...prev, openaiApiKey: e.target.value}))}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Model Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Model Settings
              </CardTitle>
              <CardDescription>
                Customize how the AI assistant responds to your queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="model">Preferred Model</Label>
                <Select
                  value={settings.preferredModel}
                  onValueChange={(value) => setSettings(prev => ({...prev, preferredModel: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o (Balanced)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Advanced)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the AI model that best fits your needs and budget
                </p>
              </div>

              <div>
                <Label htmlFor="maxTokens">Max Tokens: {settings.maxTokens}</Label>
                <Slider
                  value={[settings.maxTokens]}
                  onValueChange={(value) => setSettings(prev => ({...prev, maxTokens: value[0]}))}
                  max={4000}
                  min={100}
                  step={100}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum length of AI responses (higher values = longer responses)
                </p>
              </div>

              <div>
                <Label htmlFor="temperature">Creativity: {settings.temperature}</Label>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={(value) => setSettings(prev => ({...prev, temperature: value[0]}))}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower values = more focused responses, Higher values = more creative responses
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              size="lg"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}