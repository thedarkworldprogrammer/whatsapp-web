import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../../services/user.service';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { Loader2, MessageSquare, Mail, Phone } from 'lucide-react';
import countries from '../../utils/countries';

const Login = () => {
    const navigate = useNavigate();
    const setAuthUser = useAuthStore((state) => state.setAuthUser);
    
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneSuffix, setPhoneSuffix] = useState('+91');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (loginMethod === 'email') {
                if (!email) return toast.error('Please enter an email address');
                await sendOtp(null, null, email);
            } else {
                if (!phoneNumber) return toast.error('Please enter a phone number');
                await sendOtp(phoneNumber, phoneSuffix, null);
            }
            toast.success('OTP sent successfully!');
            setIsOtpSent(true);
        } catch (error) {
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) return toast.error('Please enter the OTP');
        setIsLoading(true);
        try {
            let res;
            if (loginMethod === 'email') {
                res = await verifyOtp(null, null, otp, email);
            } else {
                res = await verifyOtp(phoneNumber, phoneSuffix, otp, null);
            }
            
            toast.success('Login successful!');
            setAuthUser(res.data?.user || res.user);
            
            // Redirect based on whether profile is setup
            const user = res.data?.user || res.user;
            if (user && (!user.username || !user.profilePicture)) {
                navigate('/setup');
            } else {
                navigate('/');
            }
        } catch (error) {
            toast.error(error.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111B21] flex items-center justify-center p-4">
            <div className="bg-[#202C33] p-8 rounded-2xl shadow-2xl w-full max-w-md text-[#E9EDEF]">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-[#00A884] p-4 rounded-full mb-4 shadow-[0_0_20px_rgba(0,168,132,0.4)]">
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Welcome to WhatsApp Clone</h1>
                    <p className="text-[#8696A0] mt-2 text-center text-sm">
                        {isOtpSent ? 'Enter the code sent to you' : 'Sign in to continue'}
                    </p>
                </div>

                {!isOtpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="flex bg-[#111B21] p-1 rounded-lg mb-6">
                            <button
                                type="button"
                                onClick={() => setLoginMethod('email')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${loginMethod === 'email' ? 'bg-[#2A3942] text-white shadow' : 'text-[#8696A0] hover:text-white'}`}
                            >
                                <Mail className="w-4 h-4" /> Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('phone')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${loginMethod === 'phone' ? 'bg-[#2A3942] text-white shadow' : 'text-[#8696A0] hover:text-white'}`}
                            >
                                <Phone className="w-4 h-4" /> Phone
                            </button>
                        </div>

                        {loginMethod === 'email' ? (
                            <div>
                                <label className="block text-sm font-medium text-[#8696A0] mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-[#2A3942] text-[#E9EDEF] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00A884] outline-none transition-all"
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-[#8696A0] mb-2">Phone Number</label>
                                <div className="flex gap-2">
                                    <select
                                        value={phoneSuffix}
                                        onChange={(e) => setPhoneSuffix(e.target.value)}
                                        className="w-28 bg-[#2A3942] text-[#E9EDEF] border-none rounded-lg px-2 py-3 focus:ring-2 focus:ring-[#00A884] outline-none transition-all cursor-pointer custom-scrollbar"
                                    >
                                        {countries.map((country, idx) => (
                                            <option key={`${country.alpha2}-${idx}`} value={country.dialCode}>
                                                {country.flag} {country.dialCode}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Phone Number"
                                        className="flex-1 bg-[#2A3942] text-[#E9EDEF] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00A884] outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#00A884] hover:bg-[#008f6f] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#8696A0] mb-2">
                                Enter OTP sent to {loginMethod === 'email' ? email : `${phoneSuffix} ${phoneNumber}`}
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                className="w-full bg-[#2A3942] text-[#E9EDEF] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00A884] outline-none transition-all text-center tracking-[0.5em] font-mono text-xl"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={isLoading || !otp}
                                className="w-full bg-[#00A884] hover:bg-[#008f6f] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOtpSent(false)}
                                className="w-full bg-transparent hover:bg-[#2A3942] text-[#8696A0] font-medium py-3 rounded-lg transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;