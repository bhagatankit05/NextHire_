"use client"

import React, { useEffect, useState } from 'react'
import InterviewHeader from '../_components/InterviewHeader'
import Image from 'next/image'
import { Clock, Info, VideoIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { toast } from 'sonner'

const Page = () => {
    const { interview_id } = useParams();
    console.log(interview_id);

    const [interviewData, setInterviewData] = useState();
    const [userName, setUserName] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        interview_id && GetInterviewDetails();
    }, [interview_id])

    const GetInterviewDetails = async () => {
        setLoading(true);

        try {
            let { data: Interviews, error } = await supabase
                .from('Interviews')
                .select("jobPosition, jobDescription, duration, type")
                .eq("interview_id", interview_id)

            setInterviewData(Interviews[0])
            setLoading(false)
            if (Interviews?.length === 0) {
                toast('Incorrect Interview Link');
                return;
            }

        } catch (e) {
            setLoading(false);
            toast('Incorrect Interview Link');
        }



    }

    return (
        <div className='px-10 md:px-28 lg:px-48 xl:px-64 mt-7 '>
            <div className='flex  flex-col items-center justify-center border rounded-xl bg-white p-7 lg:px-32 xl:px-52 mb-20'>
                <Image src="/logo.png" alt="Logo" width={100} height={50} className='w-[140px]' />
                <h2 className='mt-3'>AI-powered Interview Platform</h2>
                <Image src={'/interview_st.png'} alt='Interview Stage' width={500} height={500} className='w-[300px] my-4' />
                <h2 className='font-bold text-lg '>{interviewData?.jobPosition}</h2>
                <h2 className='flex gap-2 items-center text-gray-500 mt-3'><Clock className='h-4 w-4' /> {interviewData?.duration} Min </h2>

                <div className='w-full'>
                    <h2>Enter Your Full Name</h2>
                    <Input placeholder='e.g. Ankit Bhagat' onChange={(event)=>setUserName(event.target.value)}/>
                </div>

                <div className='p-3 bg-blue-100 flex gap-4 rounded-xl mt-4'>
                    <Info className='text-primary ' />
                    <div >
                        <h2 className='font-bold'>Before you begin</h2>
                        <ul>
                            <li className='text-sm text-primary'>-Test your camera and microphone</li>
                            <li className='text-sm text-primary'>-Ensure you have a stable internet connection</li>
                            <li className='text-sm text-primary'>-Find a quiet and comfortable space for the interview</li>
                            <li className='text-sm text-primary'>-Have your resume and any relevant materials ready</li>

                        </ul>
                    </div>
                </div>
                <Button className={'mt-5 w-full font-bold'}
                    disabled={loading || !userName}
                ><VideoIcon /> Join Interview</Button>
            </div>
        </div>
    )
}

export default Page
