"use client"

import { ArrowLeft, FileText, TextCursor } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

const CreateInterview = () => {
  const router = useRouter();
  return (
    <div className='mt-10 px-10 md:px-24 lg:px-44 xl:px-56'>
      <div className='flex gap-5 items-center'>
        <ArrowLeft onClick={() => router.back()} className='cursor-pointer'/>
        <h2 className='font-bold text-2xl'>Create New Interview</h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mt-8'>
        <Link href={'/dashboard/create-interview/upload-resume'} className='bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm'>
          <FileText className='p-3 text-primary bg-blue-50 rounded-lg h-12 w-12' />
          <h3 className='font-bold mt-2'>Upload Resume</h3>
          <p className='text-gray-500'>Upload a PDF or DOCX resume and let AI generate questions.</p>
        </Link>

        <Link href={'/dashboard/create-interview/enter-details'} className='bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm'>
          <TextCursor className='p-3 text-primary bg-blue-50 rounded-lg h-12 w-12' />
          <h3 className='font-bold mt-2'>Enter Details</h3>
          <p className='text-gray-500'>Type in the job description and preferences to generate questions.</p>
        </Link>
      </div>
    </div>
  )
}

export default CreateInterview
