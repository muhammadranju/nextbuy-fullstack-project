"use client";
import React from "react";
import Link from "next/link";

import Sociallogin from "./Sociallogin";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const LoginForm = () => {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log(email, password);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });

      if (res?.ok) {
        router.push("/");
        form.reset();
        toast.success("Log in Successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to Log in");
    }
  };

  return (
    <div className="lg:w-1/2  lg:p-28 p-16  lg:mt-44 mt-40 ">
      <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
      <p className="text-sm text-gray-500 text-center">
        Please login to your account
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#3C9E26]"
          name="email"
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#3C9E26]"
          name="password"
          required
        />
        <button className="w-full bg-[#3C9E26] hover:bg-[#3C9E26] text-white py-2 rounded-md cursor-pointer">
          Login
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm">Or login with</p>
        <Sociallogin />
      </div>

      <p className="mt-4 text-sm text-center">
        Not a member?{" "}
        <Link href="/auth/signUp" className="text-[#3C9E26] font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
