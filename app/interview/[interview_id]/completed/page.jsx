"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { Loader2Icon, CheckCircle2, ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const InterviewComplete = () => {
  const { interview_id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState();

  useEffect(()=>{
    FetchFeedback();
  },[interview_id])

  const FetchFeedback = async ()=>{
    setLoading(true);
    try{
      let resp = await supabase
        .from('interview_feedback')
        .select('*')
        .eq('interview_id', String(interview_id))
        .order('created_at', { ascending: false })
        .limit(1);
      if (resp.error || !resp.data || resp.data.length===0){
        // fallback to hyphen table name if exists
        resp = await supabase
          .from('interview-feedback')
          .select('*')
          .eq('interview_id', String(interview_id))
          .order('created_at', { ascending: false })
          .limit(1);
      }
      if (!resp.error && resp.data && resp.data.length>0) {
        setFeedback(resp.data[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  const root = feedback?.feedback || feedback || {};
  const meta = feedback || {};
  const ratings = root?.rating || {};
  const strengths = root?.strengths || [];
  const improvements = root?.improvements || [];
  const duration = typeof root?.durationSec === 'number' ? root.durationSec : null;
  const summary = root?.summary || root?.summery || '';
  const recommendation = root?.recommendation || root?.Recommendation || '';
  const recommendationMsg = root?.recommendationMsg || root?.RecommendationMsg || '';
  const hh = duration!=null ? String(Math.floor(duration/3600)).padStart(2,'0') : null;
  const mm = duration!=null ? String(Math.floor((duration%3600)/60)).padStart(2,'0') : null;
  const ss = duration!=null ? String(duration%60).padStart(2,'0') : null;

  return (
    <div className='px-8 md:px-16 lg:px-32 xl:px-48 mt-10'>
      <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
        <div className='flex items-center gap-3'>
          <CheckCircle2 className='text-green-600'/>
          <h2 className='text-2xl font-bold'>Interview Completed</h2>
        </div>
        {/* Candidate Meta */}
        <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/40 p-4 rounded-lg border border-blue-200'>
          <div>
            <div className='text-xs text-gray-500'>Candidate Name</div>
            <div className='font-semibold'>{meta?.userName || '—'}</div>
          </div>
          <div>
            <div className='text-xs text-gray-500'>Candidate Email</div>
            <div className='font-semibold break-all'>{meta?.userEmail || '—'}</div>
          </div>
          <div>
            <div className='text-xs text-gray-500'>Interview ID</div>
            <div className='font-mono text-sm break-all'>{meta?.interview_id || String(interview_id)}</div>
          </div>
        </div>
        {loading && (
          <div className='mt-6 flex items-center gap-3 text-gray-600'>
            <Loader2Icon className='animate-spin'/>
            <span>Fetching feedback...</span>
          </div>
        )}

        {!loading && (
          <div className='mt-6 space-y-6'>
            {/* Recommendation Badge */}
            {recommendation && (
              <div className='flex gap-2 items-center'>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${String(recommendation).toLowerCase().includes('hire') ? 'bg-green-50 text-green-700 border-green-300' : 'bg-yellow-50 text-yellow-800 border-yellow-300'}`}>
                  {recommendation}
                </span>
                {recommendationMsg && <span className='text-gray-700'>{recommendationMsg}</span>}
              </div>
            )}
            <div>
              <h3 className='font-semibold'>Ratings</h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-2'>
                {Object.keys(ratings).length ? (
                  Object.entries(ratings).map(([k,v])=> (
                    <div key={k} className='p-4 rounded-lg border border-gray-200 bg-white shadow-xs'>
                      <div className='text-xs uppercase text-gray-500 tracking-wide'>{String(k)}</div>
                      <div className='text-xl font-bold mt-1'>
                        {Number.isFinite(Number(v)) ? `${v}/10` : String(v)}
                      </div>
                      <div className='w-full bg-gray-100 rounded mt-2 h-2 overflow-hidden'>
                        <div className={`${Number(v)>=7 ? 'bg-green-500' : Number(v)>=5 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (Number(v)||0)*10)}%`, height: '100%' }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-gray-500'>No ratings available.</div>
                )}
              </div>
            </div>
            <div>
              <h3 className='font-semibold'>Summary</h3>
              <div className='border border-gray-200 rounded-lg p-4 bg-gray-50 text-gray-800 whitespace-pre-wrap'>
                {summary || 'No summary available.'}
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='font-semibold mb-2'>Strengths</h3>
                <ul className='list-disc pl-5 space-y-1 border border-green-200 bg-green-50 rounded-lg p-3'>
                  {strengths.length ? strengths.map((s, i)=> (
                    <li key={i}>{s}</li>
                  )) : <li className='list-none text-gray-500'>No strengths captured.</li>}
                </ul>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>Improvements</h3>
                <ul className='list-disc pl-5 space-y-1 border border-amber-200 bg-amber-50 rounded-lg p-3'>
                  {improvements.length ? improvements.map((s, i)=> (
                    <li key={i}>{s}</li>
                  )) : <li className='list-none text-gray-500'>No improvements captured.</li>}
                </ul>
              </div>
            </div>
            <div>
              <h3 className='font-semibold'>Recommendation</h3>
              <div className='capitalize border border-indigo-200 bg-indigo-50 rounded-lg p-3 inline-block'>{recommendation || '—'}</div>
              {recommendationMsg && <div className='text-gray-700 mt-2'>{recommendationMsg}</div>}
            </div>
            <div>
              <h3 className='font-semibold'>Duration</h3>
              <div className='inline-block border border-gray-200 bg-white rounded px-3 py-1 font-mono'>{duration!=null ? `${hh}:${mm}:${ss}` : '—'}</div>
            </div>
          </div>
        )}

        <div className='mt-8 flex justify-between'>
          <Button variant={'outline'} onClick={()=> router.replace(`/interview/${encodeURIComponent(String(interview_id))}`)}>
            <ArrowLeft className='mr-2'/> Back to Interview
          </Button>
          <Button onClick={()=> router.replace('/dashboard/create-interview')}>
            <Plus className='mr-2'/> Create New Interview
          </Button>
          <Button variant={'outline'} onClick={()=> window.print()}>Download PDF</Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewComplete
