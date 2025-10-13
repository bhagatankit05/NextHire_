"use client";

import { useUser } from '@/app/provider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/services/supabaseClient';
import { Video, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import InterviewCard from './InterviewCard';

const LatestInterviewsList = () => {
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
                    .limit(6);

                if (error) throw error;

                setInterviewList(data || []);
            } catch (err) {
                console.error("Error fetching interviews:", err);
                setInterviewList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, [user?.email]);

    return (
        <section className="my-8 px-4 sm:px-6 lg:px-8">
            <header className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-gray-900 transition-opacity duration-500 ease-in-out">
                    Previously Created Interviews
                </h2>
                <p className="text-sm text-gray-500 mt-1">Review your recent interview setups</p>
            </header>

            {loading && (
                <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin transition-transform duration-300 ease-in-out" />
                    <p className="mt-4 text-gray-500 text-sm">Loading interviews...</p>
                </div>
            )}

            {!loading && interviewList.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-gray-50 transition-all duration-500 ease-in-out animate-fade-in">
                    <Video className="h-14 w-14 text-blue-600 mb-4 transform hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xl font-semibold text-gray-700">No interviews created yet</h3>
                    <p className="text-sm text-gray-500 mt-2">Start by creating your first AI-powered interview.</p>
                    <Button className="mt-6 px-6 py-2 text-sm font-medium transition-transform hover:scale-105 duration-300">
                        + Create New Interview
                    </Button>
                </div>
            )}

            {!loading && interviewList.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                    {interviewList.map((interview, index) => (
                        <div
                            key={index}
                            className="animate-fade-in-up transition-opacity duration-500 ease-in-out"
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

export default LatestInterviewsList;
