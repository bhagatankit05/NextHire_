"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Clock, Info, Loader2Icon, VideoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { InterviewDataContext } from "@/context/InterviewDataContext";

const Page = () => {
  const { interview_id } = useParams();
  const normalizedId = decodeURIComponent(
    Array.isArray(interview_id) ? interview_id[0] : String(interview_id || "")
  ).trim();

  const [interviewData, setInterviewData] = useState();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const interviewCtx = useContext(InterviewDataContext);
  const [hasLoadedSuccess, setHasLoadedSuccess] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!normalizedId || fetchedRef.current) return;
    fetchedRef.current = true;
    GetInterviewDetails();
  }, [normalizedId]);

  const GetInterviewDetails = async () => {
    setLoading(true);
    try {
      const { data: Interviews, error } = await supabase
        .from("Interviews")
        .select("*")
        .eq("interview_id", normalizedId)
        .limit(1);

      if (error || !Interviews?.length) {
        setLoading(false);
        if (!hasLoadedSuccess && !hasShownError) {
          setHasShownError(true);
          setErrorMsg("Incorrect Interview Link");
        }
        return;
      }

      const row = Interviews[0];
      const normalized = {
        jobPosition: row.jobPosition ?? row.job_position ?? "",
        jobDescription: row.jobDescription ?? row.job_description ?? "",
        duration: row.duration ?? null,
        type: row.type ?? [],
        questions: row.questions ?? row.questionList ?? [],
      };

      setInterviewData(normalized);
      setLoading(false);
      setHasLoadedSuccess(true);
      setErrorMsg("");
    } catch (e) {
      setLoading(false);
      toast("Incorrect Interview Link");
    }
  };

  const onJoinInterview = async () => {
    setLoading(true);
    try {
      const { data: Interviews, error } = await supabase
        .from("Interviews")
        .select("*")
        .eq("interview_id", normalizedId)
        .limit(1);

      if (error || !Interviews?.length) {
        toast("Unable to load interview");
        setLoading(false);
        return;
      }

      if (interviewCtx?.setInterviewInfo) {
        interviewCtx.setInterviewInfo({
          userName,
          userEmail,
          interviewData: Interviews[0],
        });
        localStorage.setItem("nh_user_name", userName || "Candidate");
      }

      router.push(`/interview/${encodeURIComponent(normalizedId)}/start`);
      setLoading(false);
    } catch (e) {
      console.error(e);
      toast("Unexpected error");
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-16 lg:px-32 xl:px-48 py-10">
      <div className="bg-white border rounded-2xl shadow-sm p-8 flex flex-col items-center gap-6">
        <Image src="/logo.png" alt="Logo" width={140} height={50} />
        <h2 className="text-lg text-gray-600">AI-powered Interview Platform</h2>
        <Image
          src="/interview_st.png"
          alt="Interview Stage"
          width={300}
          height={300}
          className="my-4"
        />
        <h2 className="text-xl font-semibold text-gray-800">
          {interviewData?.jobPosition}
        </h2>
        <p className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="h-4 w-4" />
          {interviewData?.duration} Min
        </p>

        <div className="w-full space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Full Name
            </label>
            <Input
              placeholder="e.g. Ankit Bhagat"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email Address
            </label>
            <Input
              placeholder="e.g. ankitbhagat@gmail.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 w-full mt-6">
          <div className="flex gap-3 items-start">
            <Info className="text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Before you begin</h3>
              <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                <li>Test your camera and microphone</li>
                <li>Ensure you have a stable internet connection</li>
                <li>Find a quiet and comfortable space for the interview</li>
                <li>Have your resume and any relevant materials ready</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          className="mt-6 w-full font-semibold flex items-center justify-center gap-2"
          disabled={loading || !userName}
          onClick={onJoinInterview}
        >
          <VideoIcon className="h-5 w-5" />
          {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
          Join Interview
        </Button>
      </div>
    </div>
  );
};

export default Page;
