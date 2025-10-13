"use client";

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
          .order('created_at', { ascending: false });

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
    <section className="px-4 sm:px-6 lg:px-8 py-10 bg-white text-gray-800 min-h-screen">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Interview Dashboard</h2>
        <p className="text-sm text-gray-500 mt-2">Your AI-generated interview history</p>
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="mt-4 text-gray-500 text-sm font-mono">Fetching interviews...</p>
        </div>
      )}

      {!loading && interviewList.length === 0 && (
        <div className="border border-gray-300 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center bg-gray-50 shadow-sm transition-all duration-500 animate-fade-in">
          <Video className="h-14 w-14 text-gray-400 mb-4 transition-transform hover:scale-110" />
          <h3 className="text-xl font-semibold text-gray-700">No interviews found</h3>
          <p className="text-sm text-gray-500 mt-2 font-mono">Ready to create your first AI-powered interview?</p>
          <Button className="mt-6 px-6 py-2 text-sm font-medium transition hover:scale-105">
            + Create New Interview
          </Button>
        </div>
      )}

      {!loading && interviewList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {interviewList.map((interview, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <InterviewCard interview={interview} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AllInterview;
