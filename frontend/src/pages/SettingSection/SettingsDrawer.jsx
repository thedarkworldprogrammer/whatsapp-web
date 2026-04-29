import React from 'react';
import { ArrowLeft, Bell, Lock, Key, HelpCircle, User, Image as ImageIcon, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

const SettingsDrawer = ({ isOpen, onClose, onOpenProfile }) => {
    const { authUser } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    return (
        <div 
            className={`absolute top-0 left-0 h-full w-full bg-[#ffffff] dark:bg-[#111B21] z-20 transition-transform duration-300 ease-in-out flex flex-col ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            {/* Header */}
            <div className="h-[108px] bg-[#00a884] dark:bg-[#202C33] flex items-end px-6 pb-4 transition-colors duration-200">
                <div className="flex items-center text-white dark:text-[#E9EDEF]">
                    <button onClick={onClose} className="mr-6 hover:bg-black/10 dark:hover:bg-[#2A3942] p-2 rounded-full transition-colors -ml-2">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-[19px] font-medium">Settings</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Profile Section */}
                <div 
                    className="flex items-center px-4 py-4 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202C33] transition-colors duration-200"
                    onClick={() => {
                        onClose();
                        onOpenProfile();
                    }}
                >
                    <div className="mr-4">
                        {authUser?.profilePicture ? (
                            <img src={authUser.profilePicture} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-[#dfe5e7] dark:bg-[#6B7C85] flex items-center justify-center">
                                <User className="w-10 h-10 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[#111b21] dark:text-[#E9EDEF] text-[19px] font-normal mb-1">{authUser?.username || 'You'}</span>
                        <span className="text-[#54656f] dark:text-[#8696A0] text-[14px] line-clamp-1">{authUser?.about || 'Hey there! I am using WhatsApp.'}</span>
                    </div>
                </div>

                {/* Settings Options */}
                <div className="flex flex-col mt-2">
                    <div onClick={toggleTheme}>
                        <SettingItem 
                            icon={theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-500" />} 
                            title="Theme" 
                            subtitle={`Click to switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`} 
                        />
                    </div>
                    <SettingItem icon={<Key className="w-5 h-5" />} title="Account" subtitle="Security notifications, change number" />
                    <SettingItem icon={<Lock className="w-5 h-5" />} title="Privacy" subtitle="Block contacts, disappearing messages" />
                    <SettingItem icon={<Bell className="w-5 h-5" />} title="Notifications" subtitle="Message, group & call tones" />
                    <SettingItem icon={<ImageIcon className="w-5 h-5" />} title="Chat wallpaper" subtitle="Theme, wallpapers, chat history" />
                    <SettingItem icon={<HelpCircle className="w-5 h-5" />} title="Help" subtitle="Help center, contact us, privacy policy" />
                </div>
            </div>
        </div>
    );
};

const SettingItem = ({ icon, title, subtitle }) => (
    <div className="flex items-center px-6 py-4 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202C33] transition-colors duration-200">
        <div className="text-[#54656f] dark:text-[#8696A0] mr-6">
            {icon}
        </div>
        <div className="flex flex-col flex-1 border-b border-[#f2f2f2] dark:border-[#2A3942] pb-4">
            <span className="text-[#111b21] dark:text-[#E9EDEF] text-[17px] mb-1">{title}</span>
            <span className="text-[#54656f] dark:text-[#8696A0] text-[14px]">{subtitle}</span>
        </div>
    </div>
);

export default SettingsDrawer;
