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
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/userSlice';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reverifyLoading, setReverifyLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showReverify, setShowReverify] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first.');
      return;
    }

    setReverifyLoading(true);
    try {
      const res = await api.post('/api/v1/user/reverify', { email: formData.email });
      toast.success(res.data.message || 'Verification email resent successfully.');
    } catch (error) {
      console.error('Resend verification error:', error);
      const errorMsg = getApiErrorMessage(error, 'Could not resend verification email.');
      toast.error(errorMsg);
    } finally {
      setReverifyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    setShowReverify(false);

    try {
      const res = await api.post('/api/v1/user/login', formData);

      if (res.data.success) {
        // Save tokens and user info to localStorage
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        toast.success(res.data.message || "Logged in successfully!");
        
        // Redirect to homepage
        navigate('/');
        dispatch(setUser(res.data.user));
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = getApiErrorMessage(error, "Login failed! Please check your credentials.");
      setLoginError(errorMsg);
      toast.error(errorMsg);

      if (error.response?.status === 403) {
        setShowReverify(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen p-4 font-sans bg-background relative overflow-hidden select-none'>
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <Card className="relative z-10 w-full max-w-sm border border-white/5 rounded-3xl bg-card/75 backdrop-blur-md shadow-2xl overflow-hidden">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="flex justify-center mb-3 text-accent filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
            <KeyRound size={36} strokeWidth={1.5}/>
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-white tracking-wide">Welcome Back</CardTitle>
          <CardDescription className="text-xs text-gray-400 mt-1">
            Access your secure next-gen shopping account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="email@example.com" 
                required 
                className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" 
              />
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs text-gray-400 font-bold uppercase tracking-wider">Password</Label>
                <Link to="/forgot-password" className="text-[10px] text-accent hover:underline font-bold tracking-wider">
                  Forgot Password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password"
                type={showPassword ? "text" : "password"} 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
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

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-10 text-sm shadow-lg glow-accent transition-all duration-300 hover:scale-[1.02] cursor-pointer mt-2"
            >
              {loading ? "Authenticating..." : "Log In"}
            </Button>
            
            {loginError && (
              <p className="mt-3 text-xs text-red-400 font-medium text-center bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">{loginError}</p>
            )}
            
            {showReverify && (
              <Button
                type="button"
                disabled={reverifyLoading}
                onClick={handleResendVerification}
                className="mt-3 w-full bg-secondary/10 border border-secondary/20 text-white rounded-xl h-10 text-xs font-semibold hover:bg-secondary/20 cursor-pointer"
              >
                {reverifyLoading ? 'Resending...' : 'Resend verification email'}
              </Button>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8 px-8 pt-4">
          <div className="text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent font-bold hover:underline">
              Sign Up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
