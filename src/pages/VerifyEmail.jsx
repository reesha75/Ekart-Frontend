import { api, getApiErrorMessage } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("Verifying your account...");
    const [isError, setIsError] = useState(false);
    const [emailForResend, setEmailForResend] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const verifyEmail = async () => {
        try {
            const res = await api.post('/api/v1/user/verify', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setStatus('Email verified successfully! Redirecting to login...');
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            setIsError(true);
            setLoading(false);
            const apiMessage = getApiErrorMessage(error, 'Verification failed. The link may have expired.');
            setStatus(apiMessage);
            // If backend suggested resend action and provided email, capture it
            const srv = error.response?.data;
            if (srv?.action === 'resend' && srv?.email) {
                setEmailForResend(srv.email);
            }
        }
    };

    useEffect(() => {
        verifyEmail();
    }, [token]);

    return (
        <div className='w-full min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden select-none'>
            {/* Background Ambience */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

            <div className='max-w-md w-full bg-card p-10 rounded-3xl border border-white/5 shadow-2xl text-center relative z-10 space-y-6'>
                
                {/* Loader / Icons */}
                {loading ? (
                    <div className="flex justify-center">
                        <Loader2 className="animate-spin size-12 text-accent" />
                    </div>
                ) : isError ? (
                    <div className="flex justify-center text-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                        <XCircle size={48} strokeWidth={1.5} />
                    </div>
                ) : (
                    <div className="flex justify-center text-accent filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                        <CheckCircle2 size={48} strokeWidth={1.5} className="animate-bounce" />
                    </div>
                )}

                {/* Message Heading */}
                <h1 className={`text-2xl font-bold font-heading tracking-wide ${isError ? 'text-red-400' : 'text-white'}`}>
                    {isError ? "Verification Failed" : "Account Verification"}
                </h1>
                
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                    {status}
                </p>

                {/* Show Button only on Error */}
                {isError && (
                    <div className="space-y-4 pt-2">
                        <Button
                            onClick={async () => {
                                if (!emailForResend) return navigate('/');
                                setResendLoading(true);
                                setResendStatus('');
                                try {
                                    const resp = await api.post('/api/v1/user/reverify', { email: emailForResend });
                                    setResendStatus(resp.data.message || 'Verification email resent. Check your inbox.');
                                } catch (err) {
                                    setResendStatus(err.response?.data?.message || 'Resend failed.');
                                } finally {
                                    setResendLoading(false);
                                }
                            }}
                            className="w-full h-11 bg-accent hover:bg-accent-hover text-background font-bold rounded-xl transition-all duration-300 glow-accent cursor-pointer"
                        >
                            {resendLoading ? 'Sending…' : (emailForResend ? 'Resend Verification Email' : 'Back to Home')}
                        </Button>

                        {emailForResend && (
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-2.5 bg-[#111827] hover:bg-white/5 border border-white/10 text-white font-semibold rounded-xl text-sm transition duration-200 cursor-pointer"
                            >
                                Back to Home
                            </button>
                        )}

                        {resendStatus && (
                            <p className="text-xs font-semibold text-emerald-400 mt-2 font-mono bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">{resendStatus}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;