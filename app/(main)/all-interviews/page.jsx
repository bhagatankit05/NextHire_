"use client"

import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import React, { useEffect, useState } from 'react';
import InterviewCard from '../dashboard/_components/InterviewCard';
import { Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AllInterview = () => {
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser() || {};

  useEffect(() => {
    if (!user?.email) return;

    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('Interviews')
          .select('*')
          .eq('userEmail', user.email)
          .order('created_at', { ascending: false })

        if (error) throw error;
        setInterviewList(data || []);
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setInterviewList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [user?.email]);

  return (
    <div className='my-5'>
      <h2 className='font-bold text-2xl mb-5'>All Previously Created Interviews</h2>

      {loading && (
        <div className="flex flex-col items-center justify-center mt-10">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-3 text-gray-500">Loading interviews...</p>
        </div>
      )}

      {!loading && interviewList.length === 0 && (
        <div className='p-8 flex flex-col gap-4 items-center justify-center border border-dashed rounded-lg mt-5'>
          <Video className='h-12 w-12 text-primary' />
          <h2 className='text-lg font-medium text-gray-700 text-center'>
            You haven’t created any interviews so far!
          </h2>
          <Button className='mt-3 px-6 py-2 text-sm'>+ Create New Interview</Button>
        </div>
      )}

      {!loading && interviewList.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-5'>
          {interviewList.map((interview, index) => (
            <InterviewCard interview={interview} key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllInterview;
