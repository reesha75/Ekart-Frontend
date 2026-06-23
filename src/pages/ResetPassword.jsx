import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from 'sonner';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const target = location.state?.target || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!target) {
      toast.error("Invalid session. Please enter email or phone number first.");
      navigate('/forgot-password');
    }
  }, [target, navigate]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return "";
    if (pwd.length < 6) return "Too short (min 6 characters)";
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
    
    if (hasLetters && hasNumbers && hasSpecial) return "Strong";
    if (hasLetters && hasNumbers) return "Medium";
    return "Weak";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/api/v1/user/change-password/${target}`, {
        newPassword,
        confirmPassword
      });

      if (res.data.success) {
        toast.success("Password reset successfully! Please log in with your new password.");
        navigate('/login');
      } else {
        toast.error(res.data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset password submission error:", error);
      toast.error(getApiErrorMessage(error, "Failed to complete password reset. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className='flex justify-center items-center min-h-screen p-4 font-sans bg-background relative overflow-hidden select-none'>
      {/* Ambience glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <Card className="relative z-10 w-full max-w-sm border border-white/5 rounded-3xl bg-card/75 backdrop-blur-md shadow-2xl overflow-hidden">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="flex justify-center mb-3 text-accent filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
            <Lock size={36} strokeWidth={1.5}/>
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-white tracking-wide">New Password</CardTitle>
          <CardDescription className="text-xs text-gray-400 mt-1">
            Choose a secure, strong password for your account setup.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 relative">
              <Label htmlFor="newPassword" className="text-xs text-gray-400 font-bold uppercase tracking-wider">New Password</Label>
              <Input 
                id="newPassword" 
                name="newPassword"
                type={showPassword ? "text" : "password"} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="At least 6 characters" 
                required 
                className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm pr-10 focus-visible:border-accent" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {strength && (
              <div className="text-left font-sans">
                <span className="text-[10px] text-gray-500">Security rating: </span>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${
                  strength === 'Strong' ? 'text-green-400' :
                  strength === 'Medium' ? 'text-amber-400' : 'text-red-400'
                }`}>{strength}</span>
              </div>
            )}

            <div className="space-y-1.5 relative">
              <Label htmlFor="confirmPassword" className="text-xs text-gray-400 font-bold uppercase tracking-wider">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type={showPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Repeat password" 
                required 
                className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" 
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-10 text-sm shadow-lg glow-accent transition-all duration-300 hover:scale-[1.02] cursor-pointer mt-2"
            >
              {loading ? "Resetting..." : "Save Password"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8 px-8 pt-4">
          <div className="text-center text-xs text-gray-500">
            Or return to{" "}
            <Link to="/login" className="text-accent font-bold hover:underline">
              Log In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
