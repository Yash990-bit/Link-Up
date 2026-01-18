import { Aperture } from 'lucide-react'
import React,{useState} from 'react'
import { Link } from 'react-router'
import { useMutation , useQueryClient} from '@tanstack/react-query'



const SignUpPage = () => {
    const [signupData, setSignupData] =useState({
        fullName:"",
        email:"",
        password:"",
    })
    const queryClient = useQueryClient()

    const {mutate,isPending,error}= useMutation({
        mutationFn:signup,
        onSuccess:()=>queryClient.invalidateQueries({queryKey:["authUser"]}),
    })

    const handleSignUp = (e) => {  
        e.preventDefault()
        mutate()
    }


  return (
    <div className='h-screen flex items-center justify-center p-4 sm:p-6 md:p-8' data-theme='forest'>
        <div className='border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100
        rounded-xl shadow-lg overflow-hidden'>

            <div className='w-full lg:w-1/2 p-4 sm:p-8 flex flex-col'>
            <div className='mb-4 flex items-center justify-start gap-2'>
                <Aperture className='size-9 text-primary'/>
            <span className='text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>
                LinkUp
            </span>
            </div>

            <div className='w-full'>
                <form onSubmit={handleSignUp}>

                    <div className='space-y-4'>
                        <div>
                            <h2 className='text-xl font-semibold'>Create an Account</h2>
                            <p className='text-sm opacity-70'>
                                Join LinkUp and start your language learning journey today!
                            </p>
                        </div>

                        <div className='space-y-3'>
                            <div className='form-control w-full'>
                                <label className='label'>
                                    <span className='label-text'>Full Name</span>
                                </label>
                                <input 
                                type="text" 
                                placeholder='Enter your full name'
                                className='input input-bordered w-full'
                                value={signupData.fullName}
                                onChange={(e)=> setSignupData({...signupData, fullName: e.target.value})}
                                required
                                />
                            </div>
                            <div className='form-control w-full'>
                                <label className='label'>
                                    <span className='label-text'>Email</span>
                                </label>
                                <input 
                                type="email" 
                                placeholder='Enter your email'
                                className='input input-bordered w-full'
                                value={signupData.email}
                                onChange={(e)=> setSignupData({...signupData, email: e.target.value})}
                                required
                                />
                            </div>
                            <div className='form-control w-full'>
                                <label className='label'>
                                    <span className='label-text'>Password</span>
                                </label>
                                <input 
                                type="password" 
                                placeholder='Enter your password'
                                className='input input-bordered w-full'
                                value={signupData.password}
                                onChange={(e)=> setSignupData({...signupData, password: e.target.value})}
                                required
                                />
                                <p className='text-xs opacity-70 mt-1'>
                                    Password must be at least 6 characters long.
                                </p>
                            </div>

                            <div className='form-controls'>
                                <label className='label cursor-pointer justify-start gap-2'>
                                    <input type="checkbox" className='checkbox checkbox-sm' required/>
                                    <span className='text-xs leading-tight'>
                                        I agrree to the{" "}
                                        <span className='text-primary hover:underline'>terms of service</span> and{" "}
                                        <span className='text-primary hover:underline'>privacy policy</span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <button className='btn btn-primary w-full' type="submit">
                            {isPending ? "Signing Up..." : "Create Account"}
                        </button>

                        <div className='text-center mt-4'>
                            <p className='text-sm'>
                                Already have an account?{" "}
                                <Link to="/login" className='text-primary hover:underline'>
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>

            </div>

            <div className='hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center'>
            <div className='p-8 max-w-md'>
                <div className='relative aspect-square max-w-sm mx-auto'>
                    <img src="/i.png" alt="Language Learning" className="w-full h-full" />
                </div>

                <div className='text-center space-y-3 mt-6'>
                    <h2 className='text-xl font-semibold'>Connect with language learners worldwide</h2>
                    <p className='opacity-70'>
                        Practice conversations, make friends , and improve your language skills together
                    </p>
                </div>
            </div>
            </div>
        </div>
    </div>
  )
}

export default SignUpPage