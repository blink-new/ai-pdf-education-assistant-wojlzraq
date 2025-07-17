import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut,
  BookOpen,
  TrendingUp
} from 'lucide-react'
import { blink } from '../../blink/client'
import { Button } from '../ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'PDF Library', href: '/library', icon: FileText },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <BookOpen className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">EduPDF AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/chat' && location.pathname.startsWith('/chat'))
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={() => blink.auth.logout()}
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}