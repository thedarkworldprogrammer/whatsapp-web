import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { useSocketStore } from '../../store/useSocketStore';
import { MessageSquare, MoreVertical, Search, User } from 'lucide-react';
import { formatTimestamp } from '../../utils/cn';
import ProfileDrawer from '../../pages/SettingSection/ProfileDrawer';
import SettingsDrawer from '../../pages/SettingSection/SettingsDrawer';

const Sidebar = ({ onOpenStatus, isProfileOpen, setIsProfileOpen, isSettingsOpen, setIsSettingsOpen }) => {
    const { authUser, logout } = useAuthStore();
    const { users, conversations, getUsers, getConversationsList, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers } = useSocketStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'contacts'

    useEffect(() => {
        getUsers();
        getConversationsList();
    }, [getUsers, getConversationsList]);

    // Format conversations with users
    const getChatList = () => {
        if (activeTab === 'contacts') {
            return users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Return users who have a conversation with us or all users if we want to show everyone in chat list
        return users.filter(u =>
            u.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            u.conversation
        );
    };

    const chatList = getChatList();

    const handleSelectChat = (user) => {
        setSelectedUser(user);
    };

    return (
        <div className="flex flex-col h-full bg-[#ffffff] dark:bg-[#111B21] transition-colors duration-200">
            {/* Header */}
            <div className="h-16 px-4 py-3 flex justify-between items-center bg-[#ffffff] dark:bg-[#202C33] border-b border-transparent dark:border-[#2A3942] transition-colors duration-200">
                <h1 className="text-[22px] font-bold text-[#111b21] dark:text-[#E9EDEF]">Chats</h1>

                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveTab(activeTab === 'chats' ? 'contacts' : 'chats')} className="bg-[#00a884] text-white p-[6px] rounded-full hover:bg-[#008f6f] transition-colors shadow-sm" title="New Chat">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-[#f2f2f2] dark:border-[#2A3942] transition-colors duration-200">
                <div className="bg-[#f0f2f5] dark:bg-[#202C33] rounded-lg flex items-center px-3 py-1.5 transition-colors duration-200">
                    <Search className="w-5 h-5 text-[#54656f] dark:text-[#8696A0] mr-3" />
                    <input
                        type="text"
                        placeholder={activeTab === 'chats' ? "Search or start new chat" : "Search contacts"}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-sm text-[#111b21] dark:text-[#E9EDEF] focus:outline-none w-full placeholder-[#8696a0]"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {isUsersLoading ? (
                    <div className="flex justify-center items-center h-20 text-[#8696A0]">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00A884]"></div>
                    </div>
                ) : chatList.length === 0 ? (
                    <div className="text-center text-[#8696A0] mt-10">
                        {searchQuery ? 'No results found' : 'No chats found'}
                    </div>
                ) : (
                    chatList.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleSelectChat(user)}
                            className={`flex items-center px-3 py-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202C33] transition-colors duration-200 ${selectedUser?._id === user._id ? 'bg-[#f0f2f5] dark:bg-[#2A3942]' : ''}`}
                        >
                            <div className="relative mr-4">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-[#dfe5e7] dark:bg-[#6B7C85] flex items-center justify-center">
                                        <User className="w-7 h-7 text-white" />
                                    </div>
                                )}
                                {onlineUsers.includes(user._id) && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00A884] rounded-full border-2 border-[#ffffff] dark:border-[#111B21]"></div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 border-b border-[#f2f2f2] dark:border-[#2A3942] pb-3 pt-1 h-full flex flex-col justify-center group-last:border-none">
                                <div className="flex justify-between items-center mb-1">
                                    <h2 className="text-[#111b21] dark:text-[#E9EDEF] text-[17px] truncate font-normal">{user.username || user.phoneNumber}</h2>
                                    {user.conversation?.lastMessage && (
                                        <span className="text-xs text-[#54656f] dark:text-[#8696A0]">
                                            {formatTimestamp(user.conversation.lastMessage.createdAt)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-[#54656f] dark:text-[#8696A0] truncate">
                                        {activeTab === 'contacts' ? user.about : (user.conversation?.lastMessage?.content || "Tap to chat")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Custom scrollbar CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(134, 150, 160, 0.2);
                    border-radius: 3px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(134, 150, 160, 0.4);
                }
            `}} />
        </div>
    );
};

export default Sidebar;
