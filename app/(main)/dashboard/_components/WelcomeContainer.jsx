"use client"
import { useUser } from '@/app/provider'
import Image from 'next/image';
import React from 'react'

const WelcomeContainer = () => {
    const {user} = useUser();
  return (
    <div className='bg-white p-5 rounded-xl flex justify-between items-center'>
     <div>
       <h2 className='text-lg font-bold'>Welcome Back, {user?.name}</h2>
       <h2 className='text-gray-500'>Seamless Hiring with Intelligent Interview Automation</h2>
     </div>
     {user && <Image src={user?.picture} alt='profile' width={50} height={50} className='rounded-full mt-3'/>}
    </div>
  )
}

export default WelcomeContainer
