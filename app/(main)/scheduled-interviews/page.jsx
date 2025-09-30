"use client"

import React, { useEffect, useState } from 'react'
import { useUser } from '@/app/provider'
import { supabase } from '@/services/supabaseClient'
import { Loader2Icon, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const ScheduledInterview = () => {
  const { user } = useUser?.() || {};
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(()=>{
    if (!user?.email) return;
    const fetchRows = async ()=>{
      setLoading(true);
      try{
        const { data, error } = await supabase
          .from('Interviews')
          .select('*')
          .or(`userEmail.eq.${user.email},created_by.eq.${user.email}`)
          .order('id', { ascending: false });
        if (!error) setRows(data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  },[user?.email])

  return (
    <div className='px-6 md:px-12 lg:px-20 xl:px-28 mt-8'>
      <h2 className='text-2xl font-bold'>Scheduled Interviews</h2>
      {loading && (
        <div className='mt-6 flex items-center gap-2 text-gray-600'>
          <Loader2Icon className='animate-spin'/> Loading...
        </div>
      )}
      {!loading && (
        <div className='mt-6 border border-gray-200 rounded-xl overflow-hidden'>
          <div className='grid grid-cols-12 bg-gray-50 p-3 text-sm font-semibold text-gray-600'>
            <div className='col-span-4'>Job Position</div>
            <div className='col-span-2'>Duration</div>
            <div className='col-span-4'>Types</div>
            <div className='col-span-2 text-right pr-2'>Action</div>
          </div>
          <div>
            {rows.map((r, idx)=>{
              const jobPosition = r.jobPosition ?? r.job_position ?? '-';
              const duration = r.duration ?? '-';
              const types = Array.isArray(r.type) ? r.type.join(', ') : (r.type || '-');
              return (
                <div key={idx} className='grid grid-cols-12 p-3 border-t border-gray-100 items-center'>
                  <div className='col-span-4 font-medium'>{jobPosition}</div>
                  <div className='col-span-2'>{duration} min</div>
                  <div className='col-span-4 truncate'>{types}</div>
                  <div className='col-span-2 text-right'>
                    <Link href={`/scheduled-interviews/${encodeURIComponent(r.interview_id || r.id)}`} className='text-primary inline-flex items-center gap-1'>
                      View Detail <ExternalLink className='h-4 w-4'/>
                    </Link>
                  </div>
                </div>
              );
            })}
            {!rows.length && (
              <div className='p-6 text-center text-gray-500'>No interviews found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ScheduledInterview
