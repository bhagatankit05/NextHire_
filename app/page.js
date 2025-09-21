"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to the login page if no user is signed in
        router.push("/auth");
      } else {
        setUser(user);
      }
    };

    checkUser();
  }, [router]);

  if (!user) {
    // Optionally, you can show a loading state while checking authentication
    return <div>Loading...</div>;
  }

  return (
    <div>
      Welcome, {user.user_metadata?.name || "User"}!
    </div>
  );
}