import React from 'react'
import { logout } from '../lib/api'
import { useNavigate } from 'react-router'
import { useMutation,useQueryClient } from '@tanstack/react-query'

const useLogout = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const {mutate:logoutMutation,isPending,error}=useMutation({
      mutationFn:logout,
      onSuccess:()=>{
        queryClient.invalidateQueries({queryKey:['authUser']})
        queryClient.clear()
        navigate('/login')
      },
    })

    return {logoutMutation,isPending,error}
}

export default useLogout