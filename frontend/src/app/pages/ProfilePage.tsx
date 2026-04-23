import { User, Images, Shield, Lock } from 'lucide-react'
import { adminQueue } from '../data'
import { WorkflowList } from '../components/WorkflowList'
import type { MockAccount, Role } from '../types'

type ProfilePageProps = {
  account: MockAccount
  isLoggedIn: boolean
  role: Role
}

export function ProfilePage({ account, isLoggedIn, role }: ProfilePageProps) {
  // 계정 정보가 없을 경우를 대비한 기본값 처리
  const displayName = account ? `${account.firstName} ${account.lastName}`.trim() : 'Guest User'

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fadeIn">
      <div className="mb-8 md:mb-10 pb-4 border-b border-gray-200">
        <h2 className="text-2xl md:text-3xl font-serif text-gray-900">My Profile</h2>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          {isLoggedIn ? 'Signed in with a mock secure session.' : 'Browsing in guest preview mode.'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 mb-8 flex items-center shadow-sm">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center mr-6 md:mr-8 shadow-sm shrink-0">
          <User className="w-10 h-10 md:w-12 md:h-12 text-teal-700" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{displayName}</h3>
          {account && (
            <div className="mb-4">
              <p className="text-sm md:text-base text-gray-500">ID: {account.userId}</p>
              <p className="text-sm md:text-base text-gray-500">Email: {account.email}</p>
            </div>
          )}
          <button className="text-xs md:text-sm font-bold text-[#2d6a5f] border-2 border-[#2d6a5f] rounded-xl px-4 py-1.5 md:px-5 md:py-2 hover:bg-[#2d6a5f] hover:text-white transition-all">
            Edit Information
          </button>
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Settings & Privacy</h3>
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm mb-8">
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex items-center text-gray-700">
            <Images className="w-5 h-5 md:w-6 md:h-6 mr-3 md:mr-4 text-gray-400" />
            <span className="font-bold text-sm md:text-base">Gallery Access</span>
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-lg ${isLoggedIn ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
            {isLoggedIn ? 'Enabled' : 'Private'}
          </span>
        </div>
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex items-center text-gray-700">
            <Shield className="w-5 h-5 md:w-6 md:h-6 mr-3 md:mr-4 text-gray-400" />
            <span className="font-bold text-sm md:text-base">Privacy Settings</span>
          </div>
          <span className="text-gray-400 font-bold">→</span>
        </div>
        <div className="flex items-center justify-between p-5 md:p-6 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex items-center text-gray-700">
            <Lock className="w-5 h-5 md:w-6 md:h-6 mr-3 md:mr-4 text-gray-400" />
            <span className="font-bold text-sm md:text-base">Account Security</span>
          </div>
          <span className="text-gray-400 font-bold">→</span>
        </div>
      </div>

      {/* 기존 프로젝트의 Admin 기능 유지 */}
      {role === 'admin' && (
        <>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Admin Review Lane</h3>
          <div className="bg-white border border-teal-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <p className="text-sm text-gray-500 mb-6">Visible only in the admin mock view to satisfy the multi-role course requirement.</p>
            <WorkflowList items={adminQueue} compact />
          </div>
        </>
      )}
    </div>
  )
}
