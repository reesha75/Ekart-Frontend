import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
import { ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from 'sonner';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const target = location.state?.target || "";
  const mode = location.state?.mode || "email"; // 'email' or 'mobile'

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(180); // 3 minutes countdown
  const [isExpired, setIsExpired] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!target) {
      toast.error("Invalid session. Please enter email or phone number first.");
      navigate('/forgot-password');
    }
  }, [target, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (timer <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return; // Numeric only

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Only take last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Focus previous input if current is empty and backspace pressed
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error("Please paste a 6-digit numeric OTP code.");
      return;
    }

    const pastedDigits = pastedData.split("");
    setOtp(pastedDigits);

    // Focus last input box after paste
    inputRefs.current[5].focus();
  };

  const handleResend = async () => {
    if (resendLoading) return;
    setResendLoading(true);

    try {
      const payload = mode === 'email' ? { email: target } : { phoneNo: target };
      const res = await api.post('/api/v1/user/forgot-password', payload);

      if (res.data.success) {
        toast.success(res.data.message || "A new OTP code has been sent!");
        setOtp(new Array(6).fill(""));
        setTimer(180); // Reset timer to 3 minutes
        setIsExpired(false);
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 50);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(getApiErrorMessage(error, "Failed to resend OTP. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter all 6 digits of the OTP code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/api/v1/user/verify-otp/${target}`, { otp: otpCode });

      if (res.data.success) {
        toast.success(res.data.message || "OTP verified successfully!");
        // Navigate to Reset Password page
        navigate('/reset-password', { state: { target, mode } });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(getApiErrorMessage(error, "Invalid or expired OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen p-4 font-sans bg-background relative overflow-hidden select-none'>
      {/* Ambience glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <Card className="relative z-10 w-full max-w-sm border border-white/5 rounded-3xl bg-card/75 backdrop-blur-md shadow-2xl overflow-hidden">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="flex justify-center mb-3 text-accent filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
            <ShieldCheck size={36} strokeWidth={1.5}/>
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-white tracking-wide">OTP Verification</CardTitle>
          <CardDescription className="text-xs text-gray-400 mt-1 px-4 leading-relaxed">
            A verification security code has been sent to <span className="font-bold text-accent">{target}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={isExpired || loading}
                  className="w-10 h-12 text-center text-lg font-bold border border-white/10 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all bg-background text-white disabled:bg-background/40 disabled:opacity-50 font-mono"
                />
              ))}
            </div>

            {/* Timer / Expiry Info */}
            <div className="text-center text-xs">
              {isExpired ? (
                <p className="text-red-400 font-bold tracking-wide">Verification session expired.</p>
              ) : (
                <p className="text-gray-400 font-light">
                  Valid for: <span className="font-bold text-accent font-mono">{formatTime(timer)}</span>
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading || isExpired}
              className="w-full bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-10 text-sm shadow-lg glow-accent transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify Security Code"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8 px-8 pt-2">
          {isExpired && (
            <Button
              onClick={handleResend}
              disabled={resendLoading}
              variant="outline"
              className="w-full border-white/10 hover:border-accent hover:text-accent hover:bg-accent/5 text-white rounded-xl h-10 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw size={14} />
              {resendLoading ? "Requesting..." : "Resend Security Code"}
            </Button>
          )}

          <div className="text-center text-xs text-gray-500 mt-2">
            Return to{" "}
            <Link to="/forgot-password" className="text-accent font-bold hover:underline">
              Forgot Password
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOtp;
