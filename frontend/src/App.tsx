import { useState, useTransition } from 'react'

import './App.css'
import { uploadedPhotos } from './app/data'
import { TopBar } from './app/components/TopBar'
import { useGalleryBrowser } from './app/hooks/useGalleryBrowser'
import { useMockAuth } from './app/hooks/useMockAuth'
import { CreateAccountPage } from './app/pages/CreateAccountPage'
import { GalleryPage } from './app/pages/GalleryPage'
import { HomePage } from './app/pages/HomePage'
import { ImagesPage } from './app/pages/ImagesPage'
import { ProfilePage } from './app/pages/ProfilePage'
import { SearchPage } from './app/pages/SearchPage'
import { SignInPage } from './app/pages/SignInPage'
import type { GalleryGroup, PageId } from './app/types'

const defaultSelectedContext = uploadedPhotos[1] ?? uploadedPhotos[0]

function App() {
  const [activePage, setActivePage] = useState<PageId>('home')
  const [selectedContextId, setSelectedContextId] = useState(defaultSelectedContext.id)
  const [isPending, startTransition] = useTransition()

  const openPage = (page: PageId) => {
    startTransition(() => {
      setActivePage(page)
    })
  }

  const auth = useMockAuth(openPage)
  const galleryBrowser = useGalleryBrowser()

  const selectedContext =
    uploadedPhotos.find((photo) => photo.id === selectedContextId) ?? defaultSelectedContext

  const openGalleryGroup = (group: GalleryGroup) => {
    galleryBrowser.openGroup(group)
    openPage('images')
  }

  const renderGalleryPage = () => (
    <GalleryPage
      groups={galleryBrowser.galleryState}
      isLoggedIn={auth.isLoggedIn}
      onOpenPage={openPage}
      onRenameGroup={galleryBrowser.renameGroup}
      onViewImages={openGalleryGroup}
    />
  )

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage isLoggedIn={auth.isLoggedIn} onOpenPage={openPage} />
      case 'search':
        return (
          <SearchPage
            isLoggedIn={auth.isLoggedIn}
            selectedContext={selectedContext}
            selectedContextId={selectedContextId}
            contextOptions={uploadedPhotos}
            onSelectContext={setSelectedContextId}
            onOpenPage={openPage}
          />
        )
      case 'gallery':
        return renderGalleryPage()
      case 'profile':
        return (
          <ProfilePage
            account={auth.currentAccount}
            isLoggedIn={auth.isLoggedIn}
            role={auth.role}
          />
        )
      case 'images':
        return galleryBrowser.selectedGalleryGroup ? (
          <ImagesPage
            group={galleryBrowser.selectedGalleryGroup}
            selectedImage={galleryBrowser.selectedGalleryImage}
            onBack={() => openPage('gallery')}
            onOpenImage={galleryBrowser.openImage}
            onCloseImage={galleryBrowser.closeImage}
            onNavigateImage={galleryBrowser.navigateImage}
          />
        ) : (
          renderGalleryPage()
        )
      case 'sign-in':
        return (
          <SignInPage
            existingAccount={auth.createdAccount}
            onLogin={auth.handleLogin}
            onOpenPage={openPage}
          />
        )
      case 'create-account':
        return (
          <CreateAccountPage onCreateAccount={auth.handleCreateAccount} onOpenPage={openPage} />
        )
      default:
        return <HomePage isLoggedIn={auth.isLoggedIn} onOpenPage={openPage} />
    }
  }

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-a" />
      <div className="backdrop backdrop-b" />
      <div className="app-frame">
        <TopBar
          activePage={activePage}
          isLoggedIn={auth.isLoggedIn}
          isPending={isPending}
          role={auth.role}
          userDisplayName={auth.userDisplayName}
          onOpenPage={openPage}
          onOpenUserPage={auth.openUserPage}
          onLogout={auth.handleLogout}
          onToggleRole={auth.toggleRole}
          onToggleLogin={auth.toggleLogin}
        />

        <main className="page-surface">{renderActivePage()}</main>
      </div>
    </div>
  )
}

export default App
