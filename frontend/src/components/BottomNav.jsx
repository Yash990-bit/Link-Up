import React from 'react'
import { Link, useLocation } from 'react-router'
import { HomeIcon, BellIcon, UsersIcon } from 'lucide-react'
import { useNotificationStore } from '../store/useNotificationStore'

const BottomNav = () => {
    const location = useLocation()
    const currentPath = location.pathname
    const { unreadMessagesCount, pendingFriendRequestsCount } = useNotificationStore()

    const navItems = [
        {
            label: 'Home',
            icon: HomeIcon,
            path: '/',
            badge: unreadMessagesCount
        },
        {
            label: 'Friends',
            icon: UsersIcon,
            path: '/friends',
            badge: 0
        },
        {
            label: 'Notifications',
            icon: BellIcon,
            path: '/notifications',
            badge: pendingFriendRequestsCount
        }
    ]

    return (
        <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 z-50 h-16 safe-bottom'>
            <div className='flex items-center justify-around h-full'>
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentPath === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative ${isActive ? 'text-primary' : 'text-base-content opacity-70'
                                }`}
                        >
                            <div className='relative'>
                                <Icon className='size-6' />
                                {item.badge > 0 && (
                                    <span className='absolute -top-1.5 -right-1.5 flex h-4 w-4'>
                                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                                        <span className='relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center text-white font-bold'>
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    </span>
                                )}
                            </div>
                            <span className='text-[10px] font-medium tracking-wide uppercase'>{item.label}</span>
                            {isActive && (
                                <div className='absolute bottom-0 w-8 h-1 bg-primary rounded-t-full' />
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default BottomNav
