import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Verify = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-card p-10 rounded-3xl border border-white/5 shadow-2xl text-center relative z-10 space-y-6">
        <div className="flex justify-center text-accent filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
          <Mail size={48} strokeWidth={1.5} className="animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-extrabold font-heading text-white tracking-wide">Verification Sent</h1>
        <p className="text-sm text-gray-400 leading-relaxed font-light">
          Thank you for registering. A verification email has been sent to your inbox.
          Please open the email and click the verification link to complete your account setup.
        </p>
        
        <div className="pt-4">
          <Link to="/login">
            <Button className="w-full bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-11 transition-all duration-300 glow-accent flex items-center justify-center gap-2 cursor-pointer">
              Go to Login <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Verify;
