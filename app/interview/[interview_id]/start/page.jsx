"use client"

import { InterviewDataContext } from '@/context/InterviewDataContext'
import { Mic, Phone, Timer } from 'lucide-react';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react'
import Vapi from '@vapi-ai/web';
import AlertConfirmation from './_components/AlertConfirmation';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';


const StartInterview = () => {
    const { interview_id } = useParams();
    const router = useRouter();
    const {interviewInfo,setInterviewInfo}=useContext(InterviewDataContext);
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

    const [activeUser , setActiveUser]=useState(false);
    const [ready, setReady] = useState(false);

    // Ensure interview info is loaded when user opens start page directly via link
    useEffect(()=>{
      const init = async () => {
        if (interviewInfo?.interviewData) {
          setReady(true);
          return;
        }
        try{
          const { data, error } = await supabase
            .from('Interviews')
            .select('*')
            .eq('interview_id', String(interview_id))
            .limit(1);
          if (error || !data || data.length===0) {
            toast('Unable to load interview');
            return;
          }
          const savedName = typeof window !== 'undefined' ? (localStorage.getItem('nh_user_name') || 'Candidate') : 'Candidate';
          setInterviewInfo && setInterviewInfo({
            userName: savedName,
            interviewData: data[0]
          });
          setReady(true);
        }catch(e){
          toast('Unexpected error loading interview');
        }
      };
      init();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect(()=>{
      if ((interviewInfo?.interviewData) || ready) {
        startCall();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[ready, interviewInfo])

    const startCall=()=>{
      const fromArray = Array.isArray(interviewInfo?.interviewData?.questions)
        ? interviewInfo.interviewData.questions
        : Array.isArray(interviewInfo?.interviewData?.questionList)
          ? interviewInfo.interviewData.questionList
          : [];
      const normalized = fromArray.map(q => (typeof q === 'string' ? { question: q } : q)).filter(Boolean);
      const questionList = normalized.map(q => q.question).filter(Boolean).join(', ');
      if (!questionList) {
        console.warn('No questions available to start the interview');
      }

      const assistantOptions = {
  name: "AI Recruiter",
  firstMessage: "Hi "+interviewInfo?.userName+", how are you? Ready for your interview on "+interviewInfo?.interviewData?.jobPosition,
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `
You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses.
Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey there! Welcome to your `+interviewInfo?.interviewData?.jobPosition+` interview. Let’s get started with a few questions!"
Ask one question at a time and wait for the candidate’s response before proceeding. Keep the questions clear and concise. Below Are the questions ask one by one:
Questions: `+questionList+`

If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"
Provide brief, encouraging feedback after each answer. Example:
"Nice! That’s a solid answer."
"Hmm, not quite! Want to try again?"

Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let’s tackle a tricky one!"
After 5–7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"
End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon!"

Key Guidelines:
✅ Be friendly, engaging, and witty ✍️
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate’s confidence level
✅ Ensure the interview remains focused on React
`.trim(),
      },
    ],
  },
};
vapi.start(assistantOptions)
    }

  const stopInterview=()=>{
    vapi.stop();
    router.replace(`/interview/${encodeURIComponent(String(interview_id))}`);
  }

  vapi.on("call-start",()=>{
    console.log("Call has started");
    toast("Recruiter is Connected...");
  })

  vapi.on("speech-start",()=>{
    console.log("Assistant speech has started.")
    setActiveUser(false);
  });

  vapi.on("speech-end",()=>{
    console.log("Assistant Speech has ended.");
    setActiveUser(true);
  });

  vapi.on("call-end",()=>{
    console.log("Call has ended");
    toast("Interview Ended");
  })



  return (
    <div className='p-20 lg:px-48 xl:px-56'>
      <h2 className='font-bold text-xl flex justify-between'>AI Interview Session
      <span className='flex gap-2 items-center'>
        <Timer/>
        00:00:00
      </span>
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-7 mt-5'>
        <div className='bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center'>
          <div className='relative'>
          {!activeUser && <span className='absolute inset-0 rounded-full bg-blue-500/70 animate-ping'/>}
            <Image src={'/ai.png'} alt='Interviewer'
            width={400}
            height={400}
            className='w-[140px] h-[140px] rounded-full object-cover'/>
            </div>
            <h2>AI Recruiter</h2>
        </div>

          <div className='bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center'>
            <div className='relative'>
              {activeUser && <span className='absolute inset-0 rounded-full bg-green-500/70 animate-ping'/>}
            <h2 className='text-2xl bg-primary text-white h-[50px] rounded-full px-5'>{(interviewInfo?.userName||'C')[0]}</h2>
            <h2>{interviewInfo?.userName||'Candidate'}</h2>
            </div>
        </div>

      </div>
      <div className='flex items-center gap-5 justify-center mt-7'>
            <Mic className='h-14 w-14 p-3 bg-gray-500 text-white rounded-full cursor-pointer'/>
            <AlertConfirmation stopInterview={()=>stopInterview()}>
                <Phone className='h-14 w-14 p-3 bg-red-600 text-white rounded-full cursor-pointer'/>
            </AlertConfirmation>
            

        </div>
        <h2 className='text-sm text-gray-400 text-center mt-5'>Interview in progress...</h2>
    </div>
  )
}

export default StartInterview
