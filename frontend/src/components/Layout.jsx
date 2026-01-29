import React from 'react'
import SideBar from './SideBar'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

const Layout = ({ showSidebar, children = null }) => {
  return (
    <div className='min-h-screen'>
      <div className='flex'>
        {showSidebar && <SideBar />}

        <div className='flex-1 flex flex-col'>
          <Navbar />

          <main className='flex-1 overflow-y-auto pb-20 lg:pb-0'>
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </div>
  )
}

export default Layout