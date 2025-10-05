"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
      } else {
        router.push("/dashboard");
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}