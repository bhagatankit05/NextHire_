"use client"

import React, { useContext, useEffect, useRef, useState } from 'react'
import InterviewHeader from '../_components/InterviewHeader'
import Image from 'next/image'
import { Clock, Info, Loader2Icon, VideoIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { toast } from 'sonner'
import { InterviewDataContext } from '@/context/InterviewDataContext'
import { useRouter } from 'next/navigation'

const Page = () => {
    const { interview_id } = useParams();
    const normalizedId = decodeURIComponent(Array.isArray(interview_id) ? interview_id[0] : String(interview_id || '')).trim();
    console.log('interview_id param:', interview_id, 'normalized:', normalizedId);

    const [interviewData, setInterviewData] = useState();
    const [userName, setUserName] = useState();
    const [loading, setLoading] = useState(false);
    const interviewCtx = useContext(InterviewDataContext);
    const [hasLoadedSuccess, setHasLoadedSuccess] = useState(false);
    const [hasShownError, setHasShownError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    

    const router = useRouter();

    const fetchedRef = useRef(false);
    useEffect(() => {
        if (!normalizedId) return;
        if (fetchedRef.current) return; // avoid double fetch in StrictMode
        fetchedRef.current = true;
        GetInterviewDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [normalizedId])

    const GetInterviewDetails = async () => {
        setLoading(true);

        try {
            let { data: Interviews, error } = await supabase
                .from('Interviews')
                .select("job_position, job_description, duration, type, questions, questionList")
                .eq("interview_id", normalizedId)
                .limit(1)

            if (error) {
                console.error('Supabase error (details):', error);
                setLoading(false);
                if (!hasLoadedSuccess && !hasShownError) {
                    setHasShownError(true);
                    setErrorMsg('Incorrect Interview Link');
                }
                return;
            }

            if (!Interviews || Interviews.length === 0) {
                console.warn('No interview row found for id:', normalizedId);
                setLoading(false);
                if (!hasLoadedSuccess && !hasShownError) {
                    setHasShownError(true);
                    setErrorMsg('Incorrect Interview Link');
                }
                return;
            }
            // Success path
            setInterviewData(Interviews[0]);
            setLoading(false);
            setHasLoadedSuccess(true);
            setErrorMsg('');

        } catch (e) {
            setLoading(false);
            toast('Incorrect Interview Link');
        }
    }

    const onJoinInterview = async () => {
        setLoading(true);
        try {
            const { data: Interviews, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('interview_id', normalizedId)
                .limit(1);

            if (error) {
                console.error('Supabase error (join):', error);
                toast('Unable to load interview');
                setLoading(false);
                return;
            }

            const info = Interviews?.[0];
            if (!info) {
                toast('Incorrect Interview Link');
                setLoading(false);
                return;
            }

            if (interviewCtx && typeof interviewCtx.setInterviewInfo === 'function') {
                interviewCtx.setInterviewInfo({
                    userName: userName,
                    interviewData: Interviews[0]
                });
            // Persist name so start page can show it when opened directly
            if (typeof window !== 'undefined') {
                localStorage.setItem('nh_user_name', userName || 'Candidate');
            }
            }

            router.push(`/interview/${encodeURIComponent(normalizedId)}/start`)
            setLoading(false);
        } catch (e) {
            console.error(e);
            toast('Unexpected error');
            setLoading(false);
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

                    onClick={()=>onJoinInterview()}
                ><VideoIcon />{loading && <Loader2Icon className='animate-spin'/>} Join Interview</Button>
            </div>
        </div>
    )
}

export default Page
