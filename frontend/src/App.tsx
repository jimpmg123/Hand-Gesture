import { useState, useTransition } from 'react'
import './App.css'
import { defaultMockAccount } from './app/data'
import { TopBar } from './app/components/TopBar'
import { useGalleryBrowser } from './app/hooks/useGalleryBrowser'
import { CreateAccountPage } from './app/pages/CreateAccountPage'
import { GalleryPage } from './app/pages/GalleryPage'
import { ImagesPage } from './app/pages/ImagesPage'
import { ProfilePage } from './app/pages/ProfilePage'
import { SearchPage } from './app/pages/SearchPage'
import { SearchResultsPage } from './app/pages/SearchResultsPage'
import { SignInPage } from './app/pages/SignInPage'
import type { SearchSession } from './app/search/types'
import type { MockAccount, PageId, Role } from './app/types'

function App() {
  const [activePage, setActivePage] = useState<PageId>('search')
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [role, setRole] = useState<Role>('traveler')
  const [currentAccount, setCurrentAccount] = useState<MockAccount>(defaultMockAccount)
  const [createdAccount, setCreatedAccount] = useState<MockAccount | null>(null)
  const [latestSearchSession, setLatestSearchSession] = useState<SearchSession | null>(null)
  const [isPending, startTransition] = useTransition()
  const {
    closeImage,
    galleryState,
    navigateImage,
    openGroup,
    openImage,
    renameGroup,
    selectedGalleryGroup,
    selectedGalleryImage,
  } = useGalleryBrowser()

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

  const handleLogout = () => {
    setIsLoggedIn(false)
    openPage('sign-in')
  }

  const handleRunSearch = (session: SearchSession) => {
    setLatestSearchSession(session)
    openPage('search-results')
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
    setIsLoggedIn(false)
    openPage('sign-in')
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
      case 'search':
        return <SearchPage onRunSearch={handleRunSearch} />
      case 'search-results':
        return (
          <SearchResultsPage
            isLoggedIn={isLoggedIn}
            searchSession={latestSearchSession}
            onOpenPage={openPage}
          />
        )
      case 'gallery':
        return (
          <GalleryPage
            groups={galleryState}
            isLoggedIn={isLoggedIn}
            onOpenPage={openPage}
            onRenameGroup={renameGroup}
            onViewImages={(group) => {
              openGroup(group)
              openPage('images')
            }}
          />
        )
      case 'images':
        if (!selectedGalleryGroup) {
          return <GalleryPage
            groups={galleryState}
            isLoggedIn={isLoggedIn}
            onOpenPage={openPage}
            onRenameGroup={renameGroup}
            onViewImages={(group) => {
              openGroup(group)
              openPage('images')
            }}
          />
        }

        return (
          <ImagesPage
            group={selectedGalleryGroup}
            selectedImage={selectedGalleryImage}
            onBack={() => openPage('gallery')}
            onOpenImage={openImage}
            onCloseImage={closeImage}
            onNavigateImage={navigateImage}
          />
        )
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
        return <SearchPage onRunSearch={handleRunSearch} />
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
          onLogout={handleLogout}
          onToggleRole={toggleRole}
          onToggleLogin={toggleLogin}
        />

        <main className="page-surface">{renderActivePage()}</main>
      </div>
    </div>
  )
}

export default App
