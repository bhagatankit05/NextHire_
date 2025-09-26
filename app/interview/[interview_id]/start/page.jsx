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
import axios from 'axios';
import TimerComponent from '../../_components/TimerComponent';


const StartInterview = () => {
  const { interview_id } = useParams();
  const router = useRouter();
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
  const [activeUser, setActiveUser] = useState(false);
  const [ready, setReady] = useState(false);

  const [conversation, setConversation] = useState()
  const [elapsed, setElapsed] = useState(0);
  const redirectingRef = React.useRef(false);

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
          toast('Unable to load interview');
          return;
        }
        const savedName = typeof window !== 'undefined' ? (localStorage.getItem('nh_user_name') || 'Candidate') : 'Candidate';
        setInterviewInfo && setInterviewInfo({
          userName: savedName,
          interviewData: data[0]
        });
        setReady(true);
      } catch (e) {
        toast('Unexpected error loading interview');
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if ((interviewInfo?.interviewData) || ready) {
      startCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: "Hi " + interviewInfo?.userName + ", how are you? Ready for your interview on " + interviewInfo?.interviewData?.jobPosition,
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
"Hey there! Welcome to your `+ interviewInfo?.interviewData?.jobPosition + ` interview. Let’s get started with a few questions!"
Ask one question at a time and wait for the candidate’s response before proceeding. Keep the questions clear and concise. Below Are the questions ask one by one:
Questions: `+ questionList + `

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

  const stopInterview = () => {
    // Stop the live call; call-end handler will persist feedback and navigate
    vapi.stop();
    // Fallback: if call-end doesn't arrive, force feedback + redirect
    setTimeout(() => {
      if (!redirectingRef.current) {
        GenerateFeedback();
      }
    }, 1500);
    // Hard fallback redirect in case feedback fails
    setTimeout(() => {
      if (!redirectingRef.current) {
        router.replace(`/interview/${encodeURIComponent(String(interview_id))}/completed`);
      }
    }, 6000);
  }



  useEffect(() => {
    const handleMessage = (message) => {
      console.log('Message:', message);
      if (message?.conversation) {
        const convoString = JSON.stringify(message.conversation);
        console.log('Conversation String:', convoString);
        setConversation(convoString);

      }
    };
    vapi.on("message", handleMessage)
    vapi.on("call-start", () => {
      console.log("Call has started");
      toast("Recruiter is Connected...");
    })

    vapi.on("speech-start", () => {
      console.log("Assistant speech has started.")
      setActiveUser(false);
    });

    vapi.on("speech-end", () => {
      console.log("Assistant Speech has ended.");
      setActiveUser(true);
    });

    vapi.on("call-end", async () => {
      console.log("Call has ended");
      toast("Interview Ended");
      try {
        await GenerateFeedback();
      } catch (e) {
        console.error('Feedback generation failed:', e);
        router.replace(`/interview/${encodeURIComponent(String(interview_id))}/completed`);
      }
    })


    //clean up the listener

    return () => {
      vapi.off("message", handleMessage)
      vapi.off("call-start", () => console.log('END'))
      vapi.off("speech-start", () => console.log('END'))
      vapi.off("speech-end", () => console.log('END'))
      vapi.off("call-end", () => console.log('END'))
    }
  }, [])

  const GenerateFeedback = async () => {
    try {
      const result = await axios.post('/api/ai-feedback', {
        conversation: conversation || ''
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
      // Normalize feedback shape from FEEDBACK_PROMPT
      const feedbackPayload = parsed.feedback ? parsed.feedback : parsed;
      const recommendationRaw = feedbackPayload?.Recommendation || feedbackPayload?.recommendation || '';
      const recommendedFlag = String(recommendationRaw).toLowerCase().includes('hire');
      const feedbackObj = { ...feedbackPayload, durationSec: elapsed };

      // Try saving to common table names: 'interview-feedback' then fallback 'interview_feedback'
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
        // Fallback to underscore table name
        resp = await supabase.from('interview_feedback').insert([row]);
        if (resp.error) {
          saveError = resp.error;
        } else {
          saveError = null;
        }
      }
      if (saveError) {
        console.error('Save feedback error:', saveError);
        toast('Could not save feedback (see console)');
      } else {
        toast('Feedback saved');
      }
    } catch (e) {
      console.error('Generate feedback error:', e);
      toast('Feedback generation failed');
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
          <TimerComponent isRunning={true} onTick={(s)=>setElapsed(s)} />
        </span>
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-7 mt-5'>
        <div className='bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center'>
          <div className='relative'>
            {!activeUser && <span className='absolute inset-0 rounded-full bg-blue-500/70 animate-ping' />}
            <Image src={'/ai.png'} alt='Interviewer'
              width={400}
              height={400}
              className='w-[140px] h-[140px] rounded-full object-cover' />
          </div>
          <h2>AI Recruiter</h2>
        </div>

        <div className='bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center'>
          <div className='relative'>
            {activeUser && <span className='absolute inset-0 rounded-full bg-green-500/70 animate-ping' />}
            <h2 className='text-2xl bg-primary text-white h-[50px] rounded-full px-5'>{(interviewInfo?.userName || 'C')[0]}</h2>
            <h2>{interviewInfo?.userName || 'Candidate'}</h2>
          </div>
        </div>

      </div>
      <div className='flex items-center gap-5 justify-center mt-7'>
        <Mic className='h-14 w-14 p-3 bg-gray-500 text-white rounded-full cursor-pointer' />
        <AlertConfirmation stopInterview={() => stopInterview()}>
          <Phone className='h-14 w-14 p-3 bg-red-600 text-white rounded-full cursor-pointer' />
        </AlertConfirmation>


      </div>
      <h2 className='text-sm text-gray-400 text-center mt-5'>Interview in progress...</h2>
    </div>
  )
}

export default StartInterview
