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
import { Handshake, Eye, EyeOff } from "lucide-react";
import { toast } from 'sonner';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/v1/user/register', formData);

      if (res.data.success) {
        navigate('/verify');
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = getApiErrorMessage(error, "Registration failed! Please check your details.");
      toast.error(errorMsg);

      if (error.response?.data?.message === "User already exists") {
        toast.info("This email is already registered. Try logging in or check your inbox for the verification email.");
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
            <Handshake size={36} strokeWidth={1.5}/>
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-white tracking-wide">Create Account</CardTitle>
          <CardDescription className="text-xs text-gray-400 mt-1">
            Sign up below to access premium futuristic tech
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs text-gray-400 font-bold uppercase tracking-wider">First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  placeholder="John" 
                  required 
                  className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs text-gray-400 font-bold uppercase tracking-wider">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  placeholder="Doe" 
                  required 
                  className="bg-background border-white/10 text-white placeholder-gray-600 rounded-xl h-10 text-sm focus-visible:border-accent" 
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-xs text-gray-400 font-bold uppercase tracking-wider">Password</Label>
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
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8 px-8 pt-4">
          <div className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-bold hover:underline">
              Log In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Signup;