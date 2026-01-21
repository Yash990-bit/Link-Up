import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { login } from '../lib/api.js'
import { Link } from 'react-router'
import { Aperture } from 'lucide-react'

const LoginPage = () => {
  const [loginData, setLoginData] = React.useState({
    email: '',
    password: ''
  })

  const queryClient = useQueryClient()

  const { mutate: loginMutation, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authUser'] })
  })

  const handlelogin = (e) => {
    e.preventDefault()
    loginMutation(loginData)
  }
  return (
    <div className='h-screen flex items-center justify-center p-4 sm:p-6 md:p-8' data-theme='forest'>
      <div className='border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 
      rounded-xl shadow-lg overflow-hidden'>

        <div className='w-full lg:w-1/2 p-4 sm:p-8 flex flex-col'>
          <div className='mb-4 flex items-center justify-start gap-2'>
            <Aperture className='text-primary' />
            <span className='text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>
              LinkUp
            </span>
          </div>

          {error && (
            <div className='alert alert-error mb-4'>
              <span>{error.response.data.message}</span>
            </div>
          )}

          <div className='w-full'>
            <form onSubmit={handlelogin}>
              <div className='space-y-4'>
                <div>
                  <h2 className='text-xl font-semibold'>Welcome Back</h2>
                  <p className='text-sm opacity-70'>
                    Log in to your LinkUp account and continue your language learning journey!
                  </p>
                </div>

                <div className='flex flex-col gap-3'>
                  <div className='form-control w-full space-y-2'>
                    <label className='label'>
                      <span className='label-text'>Email</span>
                    </label>
                    <input
                      type='email'
                      placeholder='Enter your email'
                      className='input input-bordered w-full'
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className='form-control w-full space-y-2'>
                    <label className='label'>
                      <span className='label-text'>Password</span>
                    </label>
                    <input
                      type='password'
                      placeholder='Enter your password'
                      className='input input-bordered w-full'
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                    />
                  </div>
                  <button type='submit' className='btn btn-primary w-full' disabled={isPending}>
                    {isPending ? (
                      <>
                        <span className='loading loading-spinner loading-xs'></span>
                        Loading...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </div>
              <div className='text-center mt-4'>
                <p className='text-sm'>
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className='text-primary hover:underline'>
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div >
    </div >
  )
}

export default LoginPage