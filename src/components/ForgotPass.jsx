import React, { useState } from 'react';
import axios from '../axios';
import { toast } from "sonner";
import {useNavigate} from "react-router-dom";
import {AiOutlineMail} from 'react-icons/ai';

const ForgotPass = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/auth/forgotpassword', { email });
      toast.success("A password reset link is send to your email. Reset password before the link expires");
    } catch (error) {
      toast.error("An error occured");
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 dark:bg-slate-800 p-5">
        <div>
          <h2 className="mt-6 dark:text-white text-center text-3xl font-extrabold text-gray-900">Forgot Password</h2>
        </div>
        <form className="mt-8 space-y-6  shadow-lg" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
          <label htmlFor="email" className="sr-only dark:text-white">
                Email address
              </label>
            <div className="flex dark:bg-slate-700 items-center border border-gray-300 rounded-md px-3 py-2">
              
              <AiOutlineMail className="text-gray-600 mr-2 dark:text-white" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2  placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:text-white"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Password
            </button>
          </div>
          <p className="ml-7 lg:ml-9 xl:ml-9 mt-5 dark:text-white ">
     
          <a
            onClick={() => navigate("/login")}
            className="ml-1 text-blue-700 hover:underline hover:text-green-700 "
          >
                 Back to login ?{" "}
          </a>
      
        </p>
        </form>
        {message && (
          <p className="mt-2 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ForgotPass;
