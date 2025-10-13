"use client"

import { InterviewDataContext } from '@/context/InterviewDataContext'
import { Mic, Phone, Timer } from 'lucide-react';
import Image from 'next/image';
import React, { useContext, useEffect, useState, useRef, useMemo } from 'react'
import Vapi from '@vapi-ai/web';
import AlertConfirmation from './_components/AlertConfirmation';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import axios from 'axios';
import TimerComponent from '../../_components/TimerComponent';


const StartInterview = () => {
  const { interview_id } = useParams();
  const router = useRouter();
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  
  // FIX 1: Create Vapi instance only once using useMemo
  const vapi = useMemo(() => new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY), []);
  
  const [activeUser, setActiveUser] = useState(false);
  const [ready, setReady] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [callActive, setCallActive] = useState(false);
  
  const redirectingRef = useRef(false);
  const callStartedRef = useRef(false);
  const feedbackGeneratedRef = useRef(false);

  // Ensure interview info is loaded when user opens start page directly via link
  useEffect(() => {
    const init = async () => {
      if (interviewInfo?.interviewData) {
        setReady(true);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('Interviews')
          .select('*')
          .eq('interview_id', String(interview_id))
          .limit(1);
        if (error || !data || data.length === 0) {
          toast.error('Unable to load interview');
          return;
        }
        const savedName = typeof window !== 'undefined' ? (localStorage.getItem('nh_user_name') || 'Candidate') : 'Candidate';
        setInterviewInfo && setInterviewInfo({
          userName: savedName,
          interviewData: data[0]
        });
        setReady(true);
      } catch (e) {
        console.error('Init error:', e);
        toast.error('Unexpected error loading interview');
      }
    };
    init();
  }, [interview_id, interviewInfo?.interviewData, setInterviewInfo])

  // FIX 2: Start call only once when ready
  useEffect(() => {
    if ((interviewInfo?.interviewData || ready) && !callStartedRef.current) {
      callStartedRef.current = true;
      startCall();
    }
  }, [ready, interviewInfo])

  const startCall = () => {
    const fromArray = Array.isArray(interviewInfo?.interviewData?.questions)
      ? interviewInfo.interviewData.questions
      : Array.isArray(interviewInfo?.interviewData?.questionList)
        ? interviewInfo.interviewData.questionList
        : [];
    const normalized = fromArray.map(q => (typeof q === 'string' ? { question: q } : q)).filter(Boolean);
    const questionList = normalized.map(q => q.question).filter(Boolean).join(', ');
    
    if (!questionList) {
      console.warn('No questions available to start the interview');
      toast.error('No interview questions found');
      return;
    }

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi ${interviewInfo?.userName}, how are you? Ready for your interview on ${interviewInfo?.interviewData?.jobPosition}`,
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
"Hey there! Welcome to your ${interviewInfo?.interviewData?.jobPosition} interview. Let's get started with a few questions!"
Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below Are the questions ask one by one:
Questions: ${questionList}

If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"
Provide brief, encouraging feedback after each answer. Example:
"Nice! That's a solid answer."
"Hmm, not quite! Want to try again?"

Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"
After 5–7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"
End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon!"

Key Guidelines:
✅ Be friendly, engaging, and witty ✍️
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate's confidence level
✅ Ensure the interview remains focused on the role
`.trim(),
          },
        ],
      },
    };
    
    try {
      vapi.start(assistantOptions);
      setCallActive(true);
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start interview call');
    }
  }

  const stopInterview = () => {
    if (!callActive) return;
    
    setCallActive(false);
    vapi.stop();
    
    // FIX 3: Remove fallback timeouts - let call-end handler do its job
    // The call-end event will trigger GenerateFeedback
  }

  // FIX 4: Setup event listeners only once
  useEffect(() => {
    const handleMessage = (message) => {
      console.log('Message:', message);
      // FIX 5: Store conversation as array, not stringified
      if (message?.conversation) {
        setConversation(message.conversation);
      }
    };

    const handleCallStart = () => {
      console.log("Call has started");
      toast.success("Recruiter is Connected...");
    };

    const handleSpeechStart = () => {
      console.log("Assistant speech has started.");
      setActiveUser(false);
    };

    const handleSpeechEnd = () => {
      console.log("Assistant Speech has ended.");
      setActiveUser(true);
    };

    const handleCallEnd = async () => {
      console.log("Call has ended");
      setCallActive(false);
      toast.info("Interview Ended");
      
      // FIX 6: Prevent duplicate feedback generation
      if (feedbackGeneratedRef.current || redirectingRef.current) {
        return;
      }
      
      try {
        await GenerateFeedback();
      } catch (e) {
        console.error('Feedback generation failed:', e);
        toast.error('Failed to save feedback');
        redirectingRef.current = true;
        router.replace(`/interview/${encodeURIComponent(String(interview_id))}/completed`);
      }
    };

    const handleError = (error) => {
      console.error('Vapi error:', error);
      toast.error('Interview error occurred');
    };

    // Attach listeners
    vapi.on("message", handleMessage);
    vapi.on("call-start", handleCallStart);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-end", handleCallEnd);
    vapi.on("error", handleError);

    // Cleanup
    return () => {
      vapi.off("message", handleMessage);
      vapi.off("call-start", handleCallStart);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("call-end", handleCallEnd);
      vapi.off("error", handleError);
    }
  }, [vapi, interview_id, router]);

  const GenerateFeedback = async () => {
    // Prevent duplicate calls
    if (feedbackGeneratedRef.current) {
      console.log('Feedback already generated, skipping...');
      return;
    }
    feedbackGeneratedRef.current = true;

    try {
      // FIX 7: Validate conversation data before sending
      if (!conversation || (Array.isArray(conversation) && conversation.length === 0)) {
        console.warn('No conversation data available for feedback');
        toast.warning('No conversation recorded');
        redirectingRef.current = true;
        router.replace(`/interview/${encodeURIComponent(String(interview_id))}/completed`);
        return;
      }

      // FIX 8: Send conversation as proper format
      const conversationData = Array.isArray(conversation) 
        ? conversation 
        : typeof conversation === 'string' 
          ? conversation 
          : JSON.stringify(conversation);

      console.log('Sending feedback request with conversation length:', 
        typeof conversationData === 'string' ? conversationData.length : conversationData.length);

      const result = await axios.post('/api/ai-feedback', {
        conversation: conversationData,
        interview_id: String(interview_id),
        userName: interviewInfo?.userName || 'Candidate'
      });

      const content = result?.data?.content || '';

      const extractJson = (txt) => {
        if (!txt) return null;
        const fence = txt.match(/```json\s*([\s\S]*?)```|```\s*([\s\S]*?)```/i);
        const body = fence ? (fence[1] || fence[2] || '').trim() : txt.trim();
        try { return JSON.parse(body); } catch {}
        const start = body.indexOf('{');
        const end = body.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          const sub = body.substring(start, end+1);
          try { return JSON.parse(sub); } catch {}
        }
        return null;
      };

      const parsed = extractJson(content) || {};
      const feedbackPayload = parsed.feedback ? parsed.feedback : parsed;
      const recommendationRaw = feedbackPayload?.Recommendation || feedbackPayload?.recommendation || '';
      const recommendedFlag = String(recommendationRaw).toLowerCase().includes('hire');
      const feedbackObj = { ...feedbackPayload, durationSec: elapsed };

      // Try saving to database
      const row = {
        userName: interviewInfo?.userName || 'Candidate',
        userEmail: interviewInfo?.userEmail || null,
        interview_id: String(interview_id),
        feedback: feedbackObj,
        recommended: recommendedFlag,
      };

      let saveError = null;
      let resp = await supabase.from('interview-feedback').insert([row]);
      if (resp.error) {
        saveError = resp.error;
        resp = await supabase.from('interview_feedback').insert([row]);
        if (resp.error) {
          saveError = resp.error;
        } else {
          saveError = null;
        }
      }
      
      if (saveError) {
        console.error('Save feedback error:', saveError);
        toast.error('Could not save feedback');
      } else {
        toast.success('Feedback saved successfully');
      }
    } catch (e) {
      console.error('Generate feedback error:', e);
      if (axios.isAxiosError(e)) {
        console.error('API Response:', e.response?.data);
        toast.error(`Feedback API error: ${e.response?.status || 'Unknown'}`);
      } else {
        toast.error('Feedback generation failed');
      }
    } finally {
      redirectingRef.current = true;
      router.replace(`/interview/${encodeURIComponent(String(interview_id))}/completed`);
    }
  }

  return (
    <div className='p-20 lg:px-48 xl:px-56'>
      <h2 className='font-bold text-xl flex justify-between'>AI Interview Session
        <span className='flex gap-2 items-center'>
          <Timer />
          <TimerComponent isRunning={callActive} onTick={(s)=>setElapsed(s)} />
        </span>
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-7 mt-5'>
        <div className='bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center'>
          <div className='relative'>
            {!activeUser && callActive && <span className='absolute inset-0 rounded-full bg-blue-500/70 animate-ping' />}
            <Image src={'/ai.png'} alt='Interviewer'
              width={400}
              height={400}
              className='w-[140px] h-[140px] rounded-full object-cover' />
          </div>
          <h2>AI Recruiter</h2>
        </div>

        <div className='bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center'>
          <div className='relative'>
            {activeUser && callActive && <span className='absolute inset-0 rounded-full bg-green-500/70 animate-ping' />}
            <h2 className='text-2xl bg-primary text-white h-[50px] rounded-full px-5 flex items-center justify-center'>
              {(interviewInfo?.userName || 'C')[0]}
            </h2>
          </div>
          <h2>{interviewInfo?.userName || 'Candidate'}</h2>
        </div>
      </div>
      
      <div className='flex items-center gap-5 justify-center mt-7'>
        <Mic className='h-14 w-14 p-3 bg-gray-500 text-white rounded-full cursor-pointer' />
        <AlertConfirmation stopInterview={() => stopInterview()}>
          <Phone className='h-14 w-14 p-3 bg-red-600 text-white rounded-full cursor-pointer' />
        </AlertConfirmation>
      </div>
      
      <h2 className='text-sm text-gray-400 text-center mt-5'>
        {callActive ? 'Interview in progress...' : 'Connecting...'}
      </h2>
    </div>
  )
}

export default StartInterview;