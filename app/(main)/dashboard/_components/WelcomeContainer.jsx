"use client"
import { useUser } from '@/app/provider'
import React from 'react'

const WelcomeContainer = () => {
    //const {user} = useUser();
  return (
    <div>
     <div>
       <h2 className='text-lg font-bold'>Welcome Back, {/*user?.name*/}</h2>
       <h2 className='text-secondary'>Seamless Hiring with Intelligent Interview Automation</h2>

     </div>
    </div>
  )
}

export default WelcomeContainer
