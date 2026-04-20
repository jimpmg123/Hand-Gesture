import { useState, useTransition } from 'react'
import './App.css'
import { defaultMockAccount, uploadedPhotos } from './app/data'
import { TopBar } from './app/components/TopBar'
import { CreateAccountPage } from './app/pages/CreateAccountPage'
import { GalleryPage } from './app/pages/GalleryPage'
import { HomePage } from './app/pages/HomePage'
import { ProfilePage } from './app/pages/ProfilePage'
import { SearchPage } from './app/pages/SearchPage'
import { SignInPage } from './app/pages/SignInPage'
import { JournalPage } from './app/pages/JournalPage'
import type { MockAccount, PageId, Role } from './app/types'

const defaultSelectedContext = uploadedPhotos[1] ?? uploadedPhotos[0]

function App() {
  const [activePage, setActivePage] = useState<PageId>('home')
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [role, setRole] = useState<Role>('traveler')
  const [currentAccount, setCurrentAccount] = useState<MockAccount>(defaultMockAccount)
  const [createdAccount, setCreatedAccount] = useState<MockAccount | null>(null)
  const [selectedContextId, setSelectedContextId] = useState(defaultSelectedContext.id)
  const [isPending, startTransition] = useTransition()

  const selectedContext =
    uploadedPhotos.find((photo) => photo.id === selectedContextId) ?? defaultSelectedContext

  const openPage = (page: PageId) => {
    startTransition(() => {
      setActivePage(page)
    })
  }

  const toggleLogin = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false)
      return
    }

    setCurrentAccount(createdAccount ?? defaultMockAccount)
    setIsLoggedIn(true)
  }

  const toggleRole = () => {
    setRole((current) => (current === 'traveler' ? 'admin' : 'traveler'))
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
      return {
        success: false,
        message: 'ID/email or password does not match the created account.',
      }
    }

    setCurrentAccount(createdAccount)
    setIsLoggedIn(true)
    openPage('profile')

    return { success: true }
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
        return <GalleryPage isLoggedIn={isLoggedIn} photos={uploadedPhotos} onOpenPage={openPage} />
      case 'journal':
        return <JournalPage />
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

  const userDisplayName = `${currentAccount.firstName} ${currentAccount.lastName}`.trim()

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-a" />
      <div className="backdrop backdrop-b" />
      <div className="app-frame">
        <TopBar
          activePage={activePage}
          isLoggedIn={isLoggedIn}
          isPending={isPending}
          role={role}
          userDisplayName={userDisplayName}
          onOpenPage={openPage}
          onOpenUserPage={openUserPage}
          onToggleRole={toggleRole}
          onToggleLogin={toggleLogin}
        />

        <main className="page-surface">{renderActivePage()}</main>
      </div>
    </div>
  )
}

export default App