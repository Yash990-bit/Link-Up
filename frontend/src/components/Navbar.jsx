import React from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { useLocation, Link } from 'react-router'

import { Aperture, BellIcon, LogOutIcon } from 'lucide-react'
import ThemeSelector from './ThemeSelector'
import useLogout from '../hooks/useLogout'
import { useNotificationStore } from '../store/useNotificationStore'

const Navbar = () => {
  const { authUser } = useAuthUser()
  const location = useLocation()
  const isChatPage = location.pathname?.startsWith('/chat')

  const { logoutMutation, isPending: logoutPending } = useLogout()
  const { pendingFriendRequestsCount } = useNotificationStore()

  return (
    <nav className='bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-end'>

          {isChatPage && (
            <div className='pl-5'>
              <Link to='/' className='flex items-center gap-2.5'>
                <Aperture className='size-9 text-primary' />
                <span className='text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>
                  LinkUp
                </span>
              </Link>
            </div>
          )}

          <div className='flex items-center gap-3 sm:gap-4 ml-auto'>

            <Link to='/notifications'>
              <button type='button' className='btn btn-ghost btn-circle relative'>
                <BellIcon className='h-6 w-6 text-base-content opacity-70' />
                {pendingFriendRequestsCount > 0 && (
                  <span className='absolute top-2 right-2 flex h-3 w-3'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-3 w-3 bg-red-500'></span>
                  </span>
                )}
              </button>
            </Link>
          </div>

          <ThemeSelector />

          <div className='avatar'>
            <div className='w-9 rounded-full'>
              <img src={authUser?.profilePic} alt='User Avatar' referrerPolicy='no-referrer' />
            </div>
          </div>

          <button
            type='button'
            className='btn btn-ghost btn-circle'
            onClick={() => logoutMutation()}
            disabled={logoutPending}
          >
            {logoutPending ? (
              <span className='loading loading-spinner loading-xs' />
            ) : (
              <LogOutIcon className='h-6 w-6 text-base-content opacity-70' />
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar