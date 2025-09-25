"use client"

import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import QuestionList from '../_components/QuestionList'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InterviewTypes } from '@/services/Constant'
import { toast } from 'sonner'
import InterviewLink from '../_components/InterviewLink'

const UploadResumePage = () => {
  const router = useRouter();
  const [step,setStep] = useState(1);
  const [formData,setFormData] = useState({});

  const onHandleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const onNext = () => {
    if (!formData?.jobPosition||!formData?.resumeFile||!formData?.duration||!(formData?.type||[]).length) {
      toast('Please select a resume and fill all fields')
      return;
    }
    setStep(2);
  }

  return (
    <div className='mt-10 px-10 md:px-24 lg:px-44 xl:px-56'>
      <div className='flex gap-5 items-center'>
        <ArrowLeft onClick={() => router.back()} className='cursor-pointer'/>
        <h2 className='font-bold text-2xl'>Upload Resume</h2>
      </div>
      <Progress value={step*50} className='my-5' />
      {step===1 && (
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Job Position</h2>
            <Input
              placeholder="e.g. Full Stack Developer"
              className="mt-2"
              onChange={(event) => onHandleInputChange("jobPosition", event.target.value)}
            />
          </div>

          <div className='mt-5'>
            <h2 className='text-sm font-medium text-gray-700'>Upload Resume (PDF/DOCX)</h2>
            <Input type='file' accept='.pdf,.docx' className='mt-2'
              onChange={(e)=>{
                const file = e.target.files?.[0];
                onHandleInputChange('resumeFile', file || null)
              }}
            />
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-medium text-gray-700">Interview Duration</h2>
            <Select onValueChange={(value) => onHandleInputChange("duration", value)}>
              <SelectTrigger className="w-[180px] mt-2">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Min</SelectItem>
                <SelectItem value="15">15 Min</SelectItem>
                <SelectItem value="30">30 Min</SelectItem>
                <SelectItem value="45">45 Min</SelectItem>
                <SelectItem value="60">60 Min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-medium text-gray-700">Interview Type</h2>
            <div className='flex flex-wrap gap-3 mt-2'>
              {InterviewTypes.map((type, index) => (
                <div key={index} className={`flex  gap-2 mt-3 items-center cursor-pointer border border-gray-200 bg-white rounded-2xl p-1 hover:bg-secondary ${(formData.type||[]).includes(type.title) && 'bg-blue-50 text-primary'}`}
                    onClick={() => {
                      const exists = (formData.type||[]).includes(type.title);
                      onHandleInputChange('type', exists ? (formData.type||[]).filter(x=>x!==type.title) : [...(formData.type||[]), type.title])
                    }}>
                    <type.icon className='h-6 w-6 text-gray-600' />
                    <span>{type.title} </span>
                </div>
              ))}
            </div>
          </div>

          <div className='mt-7 flex justify-end'>
            <Button onClick={onNext}>Generate Questions</Button>
          </div>
        </div>
      )}

      {step===2 && <QuestionList formData={formData}/>}    
      {step===3 &&<InterviewLink />}
    </div>
  )
}

export default UploadResumePage


