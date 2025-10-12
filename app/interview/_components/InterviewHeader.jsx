import Image from 'next/image'
import React from 'react'

const InterviewHeader = () => {
  return (
    <div className='p-4 shadow-sm'>
        <Image src="/logo.png" alt="Logo" width={100} height={50}  className='w-[140px]'/>
    </div>
  )
}

export default InterviewHeader
