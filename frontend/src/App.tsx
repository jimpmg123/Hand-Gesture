import React, { useState, useTransition } from 'react'
import {
  Camera,
  Home as HomeIcon,
  ClipboardList,
  LayoutGrid,
  Image as ImageIcon,
  User,
  MessageCircle,
  Minus,
  Send,
  Wand2,
  BookText,
} from 'lucide-react'
import { defaultMockAccount, uploadedPhotos } from './app/data'
import { CreateAccountPage } from './app/pages/CreateAccountPage'
import { GalleryPage } from './app/pages/GalleryPage'
import { HomePage } from './app/pages/HomePage'
import { ProfilePage } from './app/pages/ProfilePage'
import { SearchPage } from './app/pages/SearchPage'
import { SignInPage } from './app/pages/SignInPage'
import { JournalPage } from './app/pages/JournalPage'
import { BoardPage } from './app/pages/BoardPage'
import { TravlizerPage } from './app/pages/TravlizerPage'
import type { MockAccount, PageId, Role } from './app/types'

const defaultSelectedContext = uploadedPhotos[1] ?? uploadedPhotos[0]

const NAV_ITEMS: { id: PageId; icon: React.ElementType }[] = [
  { id: 'home', icon: HomeIcon },
  { id: 'travlizer', icon: Wand2 },
  { id: 'journal', icon: BookText },
  { id: 'search', icon: ClipboardList },
  { id: 'board', icon: LayoutGrid },
  { id: 'gallery', icon: ImageIcon },
]

interface ChatMessage {
  id: number
  sender: 'user' | 'system'
  text: string
}

function App() {
  const [activePage, setActivePage] = useState<PageId>('home')
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [role] = useState<Role>('traveler')
  const [currentAccount, setCurrentAccount] = useState<MockAccount>(defaultMockAccount)
  const [createdAccount, setCreatedAccount] = useState<MockAccount | null>(null)
  const [selectedContextId, setSelectedContextId] = useState(defaultSelectedContext.id)
  const [, startTransition] = useTransition()

  // 라이브 채팅 상태
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: 1, sender: 'system', text: 'Welcome! Do you have any questions about the location?' },
  ])

  const selectedContext =
    uploadedPhotos.find((photo) => photo.id === selectedContextId) ?? defaultSelectedContext

  const openPage = (page: PageId) => {
    startTransition(() => {
      setActivePage(page)
    })
  }

  const openUserPage = () => {
    openPage(isLoggedIn ? 'profile' : 'sign-in')
  }

  const handleCreateAccount = (account: MockAccount) => {
    setCreatedAccount(account)
    setCurrentAccount(account)
    setIsLoggedIn(true)
    openPage('profile')
  }

  const handleLogin = (identifier: string, password: string) => {
    if (!createdAccount) {
      return {
        success: false,
        message:
          'Create an account first. Until backend auth is added, this sign-in only checks the account created in this session.',
      }
    }
    const normalizedIdentifier = identifier.toLowerCase()
    const isMatchingIdentifier =
      createdAccount.userId.toLowerCase() === normalizedIdentifier ||
      createdAccount.email.toLowerCase() === normalizedIdentifier

    if (!isMatchingIdentifier || createdAccount.password !== password) {
      return { success: false, message: 'ID/email or password does not match the created account.' }
    }
    setCurrentAccount(createdAccount)
    setIsLoggedIn(true)
    openPage('profile')
    return { success: true }
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    setChatHistory((prev) => [...prev, { id: Date.now(), sender: 'user', text: chatMessage }])
    setChatMessage('')
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage isLoggedIn={isLoggedIn} onOpenPage={openPage} />
      case 'search':
        return (
          <SearchPage
            isLoggedIn={isLoggedIn}
            selectedContext={selectedContext}
            selectedContextId={selectedContextId}
            contextOptions={uploadedPhotos}
            onSelectContext={setSelectedContextId}
            onOpenPage={openPage}
          />
        )
      case 'gallery':
        return <GalleryPage />
      case 'journal':
        return <JournalPage />
      case 'board':
        return <BoardPage />
      case 'travlizer':
        return <TravlizerPage />
      case 'profile':
        return <ProfilePage account={currentAccount} isLoggedIn={isLoggedIn} role={role} />
      case 'sign-in':
        return (
          <SignInPage
            existingAccount={createdAccount}
            onLogin={handleLogin}
            onOpenPage={openPage}
          />
        )
      case 'create-account':
        return <CreateAccountPage onCreateAccount={handleCreateAccount} onOpenPage={openPage} />
      default:
        return <HomePage isLoggedIn={isLoggedIn} onOpenPage={openPage} />
    }
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA] font-sans text-gray-800 relative overflow-hidden">

      {/* 상단 헤더 */}
      <header className="absolute top-0 left-0 w-full p-5 md:p-8 z-50 flex items-center justify-between md:justify-start md:w-auto">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => openPage('home')}
        >
          <div className="bg-[#2D5A4C] p-2 md:p-2.5 rounded-xl shadow-sm">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">Travel From Photo</h1>
        </div>

        {/* 모바일: 우측 상단 프로필 버튼 */}
        <button
          onClick={openUserPage}
          className={`md:hidden p-2 rounded-full transition-all border ${
            activePage === 'profile'
              ? 'bg-[#2D5A4C] text-white border-[#2D5A4C]'
              : 'bg-white text-gray-400 border-gray-200 shadow-sm'
          }`}
        >
          <User className="w-5 h-5" />
        </button>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 h-screen overflow-y-auto pt-24 md:pt-28 pb-24 md:pb-12 flex justify-center w-full">
        {renderActivePage()}
      </main>

      {/* 사이드바/바텀 네비게이션 */}
      <aside className="fixed bottom-0 left-0 w-full h-20 bg-white border-t border-gray-200 flex items-center justify-around z-50 md:static md:w-24 md:h-screen md:border-l md:border-t-0 md:flex-col md:py-10 md:gap-8 md:justify-start md:px-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] md:shadow-none">

        {NAV_ITEMS.map(({ id, icon: Icon }) => {
          const isActive = activePage === id
          return (
            <button
              key={id}
              onClick={() => openPage(id)}
              className={`p-3 md:p-3.5 rounded-2xl transition-all ${
                isActive
                  ? 'bg-[#2D5A4C] text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-6 h-6" />
            </button>
          )
        })}

        {/* 데스크톱 전용: 사이드바 하단 프로필 버튼 */}
        <button
          onClick={openUserPage}
          className={`hidden md:block p-3.5 rounded-2xl transition-all ${
            activePage === 'profile'
              ? 'bg-[#2D5A4C] text-white shadow-md'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User className="w-6 h-6" />
        </button>

        {/* 빈 공간으로 채팅 아이콘을 맨 아래로 밀기 */}
        <div className="hidden md:block flex-1 w-full" />

        {/* 라이브 채팅 버튼 */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-3 md:p-3.5 rounded-2xl transition-all ${
            isChatOpen
              ? 'bg-[#2D5A4C] text-white shadow-md'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </aside>

      {/* 라이브 채팅 창 */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-28 z-[60] bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-[450px]">
          <div className="bg-[#2D5A4C] p-4 text-white flex justify-between items-center">
            <span className="font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </span>
            <button onClick={() => setIsChatOpen(false)} className="hover:text-gray-300 transition-colors">
              <Minus className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-[#FAFAFA] flex flex-col gap-3">
            {chatHistory.map((chat) => (
              <div key={chat.id} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`p-3 text-sm max-w-[80%] shadow-sm ${
                    chat.sender === 'user'
                      ? 'bg-[#2D5A4C] text-white rounded-2xl rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm'
                  }`}
                >
                  {chat.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A4C]/30"
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#2D5A4C] text-white p-2.5 rounded-xl hover:bg-[#1f4035] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
