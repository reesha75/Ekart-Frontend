import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage } from '@/lib/api';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/v1/user/forgot-password', { email: email.trim() });

      if (res.data.success) {
        toast.success(res.data.message || "OTP sent successfully!");
        // Redirect to Verification screen
        navigate('/verify-otp', { state: { target: email.trim(), mode: 'email' } });
      }
    } catch (error) {
      console.error("Forgot password OTP trigger error:", error);
      const errorMsg = getApiErrorMessage(error, "Failed to send OTP. Please check details and try again.");
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen p-4 font-sans bg-background relative overflow-hidden select-none'>
      {/* Ambience glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <Card className="relative z-10 w-full max-w-sm border border-white/5 rounded-3xl bg-card/75 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="flex justify-center mb-3 text-accent filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
            <Mail size={36} strokeWidth={1.5}/>
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-white tracking-wide">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-xs text-gray-400 mt-1 px-4 leading-relaxed">
            Enter your registered email below to receive a 6-digit verification code.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="recoveryInput" className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Email Address
              </Label>
              <Input 
                id="recoveryInput" 
                name="recoveryInput" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="email@example.com" 
                required 
                className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" 
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-10 text-sm shadow-lg glow-accent transition-all duration-300 hover:scale-[1.02] cursor-pointer mt-2"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8 px-8 pt-2">
          <div className="text-center text-xs text-gray-500">
            Remember your password?{" "}
            <Link to="/login" className="text-accent font-bold hover:underline">
              Log In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
