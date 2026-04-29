import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { Loader2, Camera, User } from 'lucide-react';

const SetupProfile = () => {
    const navigate = useNavigate();
    const { authUser, updateProfile } = useAuthStore();

    const [username, setUsername] = useState(authUser?.username || '');
    const [about, setAbout] = useState(authUser?.about || "Hey there! I am using WhatsApp.");
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(authUser?.profilePicture || null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const avatars = [
        'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
        'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
        'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
        'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
        'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSelectAvatar = (url) => {
        setProfilePicture(url);
        setPreviewUrl(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return toast.error('Username is required');

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('about', about);
            formData.append('agreed', true); // Assumes user agreed to terms by setting up

            // If it's a file, append as file, otherwise (it's a string URL from avatars), append as string
            if (profilePicture instanceof File) {
                formData.append('media', profilePicture);
            } else if (typeof profilePicture === 'string') {
                formData.append('profilePicture', profilePicture);
            }

            await updateProfile(formData);
            toast.success('Profile updated successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111B21] flex items-center justify-center p-4">
            <div className="bg-[#202C33] p-8 rounded-2xl shadow-2xl w-full max-w-md text-[#E9EDEF]">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Profile Info</h1>
                    <p className="text-[#8696A0] mt-2 text-sm">
                        Please provide your name and an optional profile photo
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center mb-6">
                        <div
                            className="relative w-32 h-32 rounded-full bg-[#2A3942] flex items-center justify-center cursor-pointer group overflow-hidden border-2 border-transparent hover:border-[#00A884] transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-[#8696A0]" />
                            )}

                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white mb-1" />
                                <span className="text-xs text-white uppercase font-medium">Add Photo</span>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-3 mb-6">
                        {avatars.map((avatar, idx) => (
                            <img
                                key={idx}
                                src={avatar}
                                alt={`Avatar ${idx}`}
                                onClick={() => handleSelectAvatar(avatar)}
                                className={`w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition-transform ${previewUrl === avatar ? 'ring-2 ring-[#00A884]' : 'opacity-70 hover:opacity-100'}`}
                            />
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#8696A0] mb-2">Your Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Type your name here"
                            className="w-full bg-[#2A3942] text-[#E9EDEF] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00A884] outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#8696A0] mb-2">About (Optional)</label>
                        <input
                            type="text"
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            placeholder="Hey there! I am using WhatsApp."
                            className="w-full bg-[#2A3942] text-[#E9EDEF] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00A884] outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username.trim()}
                        className="w-full bg-[#00A884] hover:bg-[#008f6f] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 mt-4"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupProfile;
