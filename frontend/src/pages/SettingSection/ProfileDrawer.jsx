import React, { useRef, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowLeft, Camera, Edit2, Check, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileDrawer = ({ isOpen, onClose }) => {
    const { authUser, updateProfile } = useAuthStore();

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [name, setName] = useState(authUser?.username || '');
    const [about, setAbout] = useState(authUser?.about || '');
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef(null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('media', file);
            await updateProfile(formData);
            toast.success('Profile picture updated successfully');
        } catch (error) {
            toast.error('Failed to update picture');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveName = async () => {
        if (!name.trim() || name === authUser.username) {
            setIsEditingName(false);
            setName(authUser.username || '');
            return;
        }

        try {
            await updateProfile({ username: name });
            toast.success('Name updated');
            setIsEditingName(false);
        } catch (error) {
            toast.error('Failed to update name');
        }
    };

    const handleSaveAbout = async () => {
        if (about === authUser.about) {
            setIsEditingAbout(false);
            return;
        }

        try {
            await updateProfile({ about });
            toast.success('About info updated');
            setIsEditingAbout(false);
        } catch (error) {
            toast.error('Failed to update info');
        }
    };

    return (
        <div
            className={`absolute top-0 left-0 h-full w-full bg-[#f0f2f5] dark:bg-[#111B21] z-30 transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            {/* Header */}
            <div className="h-[108px] bg-[#00a884] dark:bg-[#202C33] flex items-end px-6 pb-4 transition-colors duration-200">
                <button onClick={onClose} className="text-white dark:text-[#E9EDEF] mr-6 mb-1 hover:bg-black/10 dark:hover:bg-[#2A3942] rounded-full p-1 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-white dark:text-[#E9EDEF] text-xl font-medium">Profile</h1>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Profile Picture */}
                <div className="flex justify-center py-7">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {authUser?.profilePicture ? (
                            <img src={authUser.profilePicture} alt="Profile" className="w-[200px] h-[200px] rounded-full object-cover" />
                        ) : (
                            <div className="w-[200px] h-[200px] rounded-full bg-[#dfe5e7] dark:bg-[#6B7C85] flex items-center justify-center">
                                <User className="w-24 h-24 text-white" />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white mb-2" />
                            <span className="text-white text-[13px] uppercase text-center leading-tight">
                                Change<br />profile photo
                            </span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    </div>
                </div>

                {isLoading && <div className="text-center text-[#00A884] text-sm mb-4 animate-pulse">Updating profile picture...</div>}

                {/* Name Section */}
                <div className="bg-[#ffffff] dark:bg-[#111B21] px-7 py-3 shadow-[0_1px_3px_rgba(11,20,26,0.1)] dark:shadow-[0_1px_3px_rgba(11,20,26,0.4)] transition-colors duration-200">
                    <p className="text-[#00A884] text-[14px] mb-4">Your name</p>
                    <div className="flex justify-between items-center group">
                        {isEditingName ? (
                            <div className="flex-1 border-b-2 border-[#00A884] flex items-center pb-1">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                    className="w-full bg-transparent text-[#111b21] dark:text-[#E9EDEF] focus:outline-none"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                                />
                                <button onClick={handleSaveName} className="text-[#54656f] dark:text-[#8696A0] hover:text-[#111b21] dark:hover:text-[#E9EDEF]">
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-[#111b21] dark:text-[#E9EDEF] text-[17px]">{authUser?.username}</p>
                                <button onClick={() => setIsEditingName(true)} className="text-[#54656f] dark:text-[#8696A0] hover:text-[#111b21] dark:hover:text-[#E9EDEF]">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="px-7 py-4">
                    <p className="text-[#54656f] dark:text-[#8696A0] text-[14px] leading-relaxed">
                        This is not your username or pin. This name will be visible to your WhatsApp contacts.
                    </p>
                </div>

                {/* About Section */}
                <div className="bg-[#ffffff] dark:bg-[#111B21] px-7 py-3 shadow-[0_1px_3px_rgba(11,20,26,0.1)] dark:shadow-[0_1px_3px_rgba(11,20,26,0.4)] transition-colors duration-200">
                    <p className="text-[#00A884] text-[14px] mb-4">About</p>
                    <div className="flex justify-between items-center group">
                        {isEditingAbout ? (
                            <div className="flex-1 border-b-2 border-[#00A884] flex items-center pb-1">
                                <input
                                    type="text"
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                    autoFocus
                                    className="w-full bg-transparent text-[#111b21] dark:text-[#E9EDEF] focus:outline-none"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAbout(); }}
                                />
                                <button onClick={handleSaveAbout} className="text-[#54656f] dark:text-[#8696A0] hover:text-[#111b21] dark:hover:text-[#E9EDEF]">
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-[#111b21] dark:text-[#E9EDEF] text-[17px]">{authUser?.about || "Hey there! I am using WhatsApp."}</p>
                                <button onClick={() => setIsEditingAbout(true)} className="text-[#54656f] dark:text-[#8696A0] hover:text-[#111b21] dark:hover:text-[#E9EDEF]">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Contact Info Section */}
                <div className="px-7 py-4">
                    <p className="text-[#54656f] dark:text-[#8696A0] text-[14px] leading-relaxed mb-4">
                        Contact Info
                    </p>
                    <div className="flex items-center">
                        <p className="text-[#111b21] dark:text-[#E9EDEF] text-[17px]">
                            {authUser?.email ? authUser.email : `${authUser?.phoneSuffix || ''} ${authUser?.phoneNumber || ''}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDrawer;
