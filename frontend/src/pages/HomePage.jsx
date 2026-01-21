import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'
import { LogOut } from 'lucide-react'

const HomePage = () => {
  const queryClient = useQueryClient()

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await axiosInstance.post("/auth/logout")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
      toast.success("Logged out successfully")
    }
  })

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>HomePage</h1>
      <p className='mb-4'>You are logged in!</p>
      <button onClick={() => logout()} className='btn btn-error'>
        <LogOut className='size-5 mr-2' />
        Logout
      </button>
    </div>
  )
}

export default HomePage