import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import { useChatStore } from '../store/useChatStore';
import { MessageCircle, CircleDashed, Settings, User } from 'lucide-react';

// Components
import Sidebar from '../components/sidebar/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import NoChatSelected from '../components/chat/NoChatSelected';
import StatusViewer from './StatusSection/StatusViewer';

const Home = () => {
    const { connectSocket, disconnectSocket } = useSocketStore();
    const { selectedUser } = useChatStore();
    const { authUser } = useAuthStore();
    const [isStatusViewerOpen, setIsStatusViewerOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        // Connect socket when Home mounts (user is authenticated)
        connectSocket();

        // Disconnect when component unmounts
        return () => {
            disconnectSocket();
        };
    }, [connectSocket, disconnectSocket]);

    return (
        <div className="h-screen bg-[#d1d7db] dark:bg-[#0C1317] flex items-center justify-center overflow-hidden transition-colors duration-200">
            <div className="w-full max-w-[1600px] h-full sm:h-[calc(100vh-2.5rem)] bg-[#ffffff] dark:bg-[#111B21] sm:rounded-md flex shadow-xl overflow-hidden transition-colors duration-200">

                {/* Left Navigation Bar (New in Light Theme) */}
                <div className={`w-[60px] bg-[#f0f2f5] dark:bg-[#111B21] flex-shrink-0 flex flex-col items-center justify-between py-4 border-r border-[#d1d7db] dark:border-[#202C33] transition-colors duration-200 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    <div className="flex flex-col gap-6">
                        <button className="text-[#54656f] dark:text-[#AEBAC1] hover:bg-[#e9edef] dark:hover:bg-[#202C33] p-2 rounded-full transition-colors">
                            <MessageCircle className="w-6 h-6" />
                        </button>
                        <button
                            className="text-[#54656f] dark:text-[#AEBAC1] hover:bg-[#e9edef] dark:hover:bg-[#202C33] p-2 rounded-full transition-colors"
                            onClick={() => setIsStatusViewerOpen(true)}
                        >
                            <CircleDashed className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-6">
                        <button
                            className="text-[#54656f] dark:text-[#AEBAC1] hover:bg-[#e9edef] dark:hover:bg-[#202C33] p-2 rounded-full transition-colors"
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings className="w-6 h-6" />
                        </button>
                        <div
                            className="cursor-pointer mt-2"
                            onClick={() => setIsProfileOpen(true)}
                        >
                            {authUser?.profilePicture ? (
                                <img src={authUser.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-[#6B7C85] flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Conversations List) */}
                <div className={`w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r border-[#d1d7db] dark:border-[#2A3942] bg-white dark:bg-[#111B21] transition-colors duration-200 ${selectedUser ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
                    <Sidebar
                        onOpenStatus={() => setIsStatusViewerOpen(true)}
                        isProfileOpen={isProfileOpen}
                        setIsProfileOpen={setIsProfileOpen}
                        isSettingsOpen={isSettingsOpen}
                        setIsSettingsOpen={setIsSettingsOpen}
                    />
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col relative bg-[#efeae2] dark:bg-[#0B141A] transition-colors duration-200 ${!selectedUser ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
                    {selectedUser ? <ChatArea /> : <NoChatSelected />}
                </div>

            </div>

            {/* Status Overlay */}
            {isStatusViewerOpen && (
                <StatusViewer onClose={() => setIsStatusViewerOpen(false)} />
            )}
        </div>
    );
};

export default Home;
