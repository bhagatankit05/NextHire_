"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import Image from "next/image";
import React from "react";

const Login = () => {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard`
            : undefined,
      },
    });
    if (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md text-center">
        <Image
          src="/logo.png"
          alt="NextHire Logo"
          width={140}
          height={50}
          className="mx-auto mb-6"
        />
        <Image
          src="/login.png"
          alt="Login Illustration"
          width={400}
          height={250}
          className="mx-auto rounded-xl mb-6"
        />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to <span className="text-blue-600">NextHire</span>
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Sign in with your Google account to get started
        </p>
        <Button
          onClick={signInWithGoogle}
          className="w-full py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-lg"
        >
          Login with Google
        </Button>
      </div>
    </div>
  );
};

export default Login;
