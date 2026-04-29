import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocketStore } from '../../store/useSocketStore';
import { useThemeStore } from '../../store/useThemeStore';
import { MoreVertical, Paperclip, Search, Send, Smile, ArrowLeft, Image as ImageIcon, Video } from 'lucide-react';
import { formatTime } from '../../utils/cn';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

const ChatArea = () => {
    const { 
        selectedUser, 
        setSelectedUser, 
        messages, 
        getMessagesList, 
        sendNewMessage, 
        isMessagesLoading 
    } = useChatStore();
    
    const { authUser } = useAuthStore();
    const { onlineUsers, typingUsers, emitTypingStart, emitTypingStop, markMessageAsReadEmit, addReactionEmit } = useSocketStore();
    
    const [messageText, setMessageText] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const isOnline = onlineUsers.includes(selectedUser?._id);
    // Find if the selected user is typing in our conversation
    // In our simplified logic, typingUsers might just have conversationId as keys.
    // The socket backend sends typing events with `conversationId`.
    const isTyping = selectedUser?.conversation?._id ? typingUsers[selectedUser.conversation._id] : false;

    useEffect(() => {
        if (selectedUser?.conversation?._id) {
            getMessagesList(selectedUser.conversation._id);
        }
    }, [selectedUser, getMessagesList]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        
        // Mark messages as read when they arrive
        if (messages.length > 0) {
            const unreadMessages = messages.filter(
                (m) => m.receiver?._id === authUser._id && m.messageStatus !== 'read'
            );
            
            if (unreadMessages.length > 0) {
                const messageIds = unreadMessages.map(m => m._id);
                markMessageAsReadEmit(messageIds, selectedUser._id);
            }
        }
    }, [messages, authUser._id, selectedUser?._id, markMessageAsReadEmit]);

    const handleTextChange = (e) => {
        setMessageText(e.target.value);
        
        if (selectedUser?.conversation?._id) {
            emitTypingStart(selectedUser.conversation._id, selectedUser._id);
            
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            
            typingTimeoutRef.current = setTimeout(() => {
                emitTypingStop(selectedUser.conversation._id, selectedUser._id);
            }, 2000);
        }
    };

    const handleAttachmentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!messageText.trim() && !attachment) return;
        
        const formData = new FormData();
        formData.append('receiverId', selectedUser._id);
        if (messageText.trim()) formData.append('content', messageText);
        if (attachment) formData.append('media', attachment);
        
        // Clear input early for better UX
        const currentText = messageText;
        setMessageText('');
        setAttachment(null);
        setPreviewUrl(null);
        setShowEmojiPicker(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        if (selectedUser?.conversation?._id) {
            emitTypingStop(selectedUser.conversation._id, selectedUser._id);
        }

        try {
            await sendNewMessage(formData);
        } catch (error) {
            setMessageText(currentText); // Restore on error
            toast.error("Failed to send message");
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            const { deleteMessageById } = useChatStore.getState();
            await deleteMessageById(messageId);
            toast.success("Message deleted");
        } catch (error) {
            toast.error("Failed to delete message");
        } finally {
            setActiveMenuId(null);
        }
    };

    const handleReaction = (messageId, emoji) => {
        addReactionEmit(messageId, emoji, authUser._id);
        setActiveMenuId(null);
    };

    const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
    const { theme } = useThemeStore();

    return (
        <div className="flex flex-col h-full bg-[#efeae2] dark:bg-[#0B141A] dark:bg-[url('https://whatsapp-clone-web.netlify.app/static/media/bg-chat-tile-dark.317a66f8.png')] dark:bg-repeat relative z-0 transition-colors duration-200">
            {/* Header */}
            <div className="h-16 px-4 py-3 flex justify-between items-center bg-[#f0f2f5] dark:bg-[#202C33] z-10 border-b border-[#d1d7db] dark:border-[#2A3942] transition-colors duration-200">
                <div className="flex items-center">
                    <button 
                        className="md:hidden mr-2 text-[#54656f] dark:text-[#AEBAC1] hover:bg-[#e9edef] dark:hover:bg-[#2A3942] p-1 rounded-full transition-colors"
                        onClick={() => setSelectedUser(null)}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="cursor-pointer mr-4">
                        {selectedUser?.profilePicture ? (
                            <img src={selectedUser.profilePicture} alt={selectedUser.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#dfe5e7] dark:bg-[#6B7C85] flex items-center justify-center">
                                <span className="text-[#111b21] dark:text-white text-lg font-medium">{selectedUser?.username?.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[#111b21] dark:text-[#E9EDEF] font-medium">{selectedUser?.username || selectedUser?.phoneNumber}</span>
                        <span className="text-[#54656f] dark:text-[#8696A0] text-xs">
                            {isTyping ? "typing..." : isOnline ? "Online" : "Offline"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-[#54656f] dark:text-[#AEBAC1]">
                    <button className="hover:bg-[#e9edef] dark:hover:bg-[#2A3942] p-2 rounded-full transition-colors" title="Video call">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="hover:bg-[#e9edef] dark:hover:bg-[#2A3942] p-2 rounded-full transition-colors" title="Menu">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 custom-scrollbar relative z-0">
                {isMessagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00A884]"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="bg-[#ffffff] dark:bg-[#202C33] text-[#111b21] dark:text-[#E9EDEF] px-4 py-2 rounded-lg shadow-sm text-sm transition-colors duration-200">
                            Send a message to start the conversation
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {messages.map((msg, idx) => {
                            const isMine = msg.sender?._id === authUser._id;
                            const showTail = idx === 0 || messages[idx - 1].sender?._id !== msg.sender?._id;
                            
                            return (
                                <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${showTail ? 'mt-2' : ''} mb-1 relative group`}>
                                    <div 
                                        className={`max-w-[75%] md:max-w-[65%] rounded-lg px-2 py-1.5 shadow-sm relative transition-colors duration-200 ${
                                            isMine ? 'bg-[#d9fdd3] dark:bg-[#005C4B] text-[#111b21] dark:text-[#E9EDEF]' : 'bg-[#ffffff] dark:bg-[#202C33] text-[#111b21] dark:text-[#E9EDEF]'
                                        }`}
                                        style={{
                                            borderTopRightRadius: isMine && showTail ? 0 : '0.5rem',
                                            borderTopLeftRadius: !isMine && showTail ? 0 : '0.5rem',
                                        }}
                                        onMouseLeave={() => setActiveMenuId(null)}
                                    >
                                        {/* Message Actions Menu Button (visible on hover) */}
                                        <div 
                                            className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-gradient-to-l from-current via-current to-transparent pl-4 pb-2 z-10"
                                            style={{ color: isMine ? 'transparent' : 'transparent' }}
                                            onClick={() => setActiveMenuId(activeMenuId === msg._id ? null : msg._id)}
                                        >
                                            <svg viewBox="0 0 19 20" width="19" height="20" className={`rounded-full drop-shadow-md text-[#8696a0] hover:text-[#54656f] dark:text-[#8696A0] dark:hover:text-[#AEBAC1] bg-transparent ${isMine ? 'dark:bg-[#005C4B]' : 'dark:bg-[#202C33]'}`}><path fill="currentColor" d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z"></path></svg>
                                        </div>

                                        {/* Dropdown Menu */}
                                        {activeMenuId === msg._id && (
                                            <div className="absolute top-8 right-0 bg-[#ffffff] dark:bg-[#233138] rounded-md shadow-xl py-2 z-50 w-40 border border-[#f0f2f5] dark:border-[#2A3942]">
                                                {/* Reactions */}
                                                <div className="flex justify-around px-2 pb-2 border-b border-[#f0f2f5] dark:border-[#2A3942] mb-1">
                                                    {emojis.map(emoji => (
                                                        <button 
                                                            key={emoji} 
                                                            onClick={() => handleReaction(msg._id, emoji)}
                                                            className="hover:scale-125 transition-transform text-lg"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                {/* Delete Option */}
                                                {isMine && (
                                                    <button 
                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                        className="w-full text-left px-4 py-2 text-[#111b21] dark:text-[#E9EDEF] hover:bg-[#f5f6f6] dark:hover:bg-[#111B21] transition-colors flex items-center text-sm"
                                                    >
                                                        Delete message
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Attachment rendering */}
                                        {msg.imageOrVideoUrl && (
                                            <div className="mb-1 rounded overflow-hidden mt-1 cursor-pointer">
                                                {msg.contentType?.startsWith('video') ? (
                                                    <video src={msg.imageOrVideoUrl} controls className="max-h-60 w-auto rounded object-cover" />
                                                ) : (
                                                    <img src={msg.imageOrVideoUrl} alt="attachment" className="max-h-60 w-auto rounded object-cover" />
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-wrap items-end justify-end gap-2 pr-4">
                                            <span className="text-[15px] leading-5 pt-0.5 pb-1 pl-1 text-left whitespace-pre-wrap break-words inline-block max-w-full">
                                                {msg.content}
                                            </span>
                                            
                                            <div className="flex items-center float-right h-4 mb-0.5 mt-1 ml-1 text-[11px] text-[#667781] dark:text-white/60">
                                                <span>{formatTime(msg.createdAt)}</span>
                                                {isMine && (
                                                    <span className="ml-1 flex items-center">
                                                        {msg.messageStatus === 'read' ? (
                                                            <svg viewBox="0 0 16 15" width="16" height="15" className="text-[#53bdeb]"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                                                        ) : msg.messageStatus === 'delivered' ? (
                                                            <svg viewBox="0 0 16 15" width="16" height="15"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                                                        ) : (
                                                            <svg viewBox="0 0 11 14" width="11" height="14"><path fill="currentColor" d="M3.5 11.235l-2.062-2.063a.5.5 0 1 0-.707.707l2.414 2.414a.5.5 0 0 0 .707 0l6.414-6.414a.5.5 0 1 0-.707-.707L3.5 11.235z"></path></svg>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Render Reactions */}
                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div className={`absolute -bottom-3 ${isMine ? 'right-0' : 'left-0'} bg-[#ffffff] dark:bg-[#202C33] border border-[#f0f2f5] dark:border-[#2A3942] rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-1 z-10 text-[11px] dark:text-[#E9EDEF]`}>
                                                {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => (
                                                    <span key={emoji}>{emoji}</span>
                                                ))}
                                                {msg.reactions.length > 1 && <span className="text-[#8696A0]">{msg.reactions.length}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f2f5] dark:bg-[#202C33] px-4 py-3 flex items-end sm:items-center gap-2 z-10 relative transition-colors duration-200">
                {previewUrl && (
                    <div className="absolute bottom-full left-0 mb-2 ml-4 p-2 bg-[#202C33] rounded-xl shadow-lg border border-[#2A3942]">
                        <div className="relative">
                            {attachment?.type?.startsWith('video') ? (
                                <video src={previewUrl} className="h-32 rounded object-contain bg-[#111B21]" controls />
                            ) : (
                                <img src={previewUrl} alt="Preview" className="h-32 rounded object-contain bg-[#111B21]" />
                            )}
                            <button 
                                onClick={() => { setAttachment(null); setPreviewUrl(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="absolute -top-2 -right-2 bg-[#111B21] text-[#8696A0] rounded-full p-1 hover:text-white"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
                {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 ml-4 z-50 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                        <EmojiPicker 
                            onEmojiClick={(emojiData) => {
                                setMessageText((prev) => prev + emojiData.emoji);
                            }}
                            theme={theme}
                            searchDisabled={false}
                            skinTonesDisabled={true}
                        />
                    </div>
                )}
                
                <button 
                    className={`p-2 flex-shrink-0 transition-colors ${showEmojiPicker ? 'text-[#00a884]' : 'text-[#54656f] dark:text-[#8696A0] hover:text-[#111b21] dark:hover:text-[#AEBAC1]'}`}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                    <Smile className="w-6 h-6" />
                </button>
                <button 
                    className="text-[#54656f] dark:text-[#8696A0] hover:text-[#111b21] dark:hover:text-[#AEBAC1] p-2 flex-shrink-0 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip className="w-6 h-6" />
                </button>
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleAttachmentChange}
                    accept="image/*,video/*"
                />

                <div className="flex-1 bg-[#ffffff] dark:bg-[#2A3942] rounded-xl min-h-[40px] flex items-center px-4 transition-colors duration-200">
                    <textarea 
                        value={messageText}
                        onChange={handleTextChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder="Type a message"
                        className="w-full bg-transparent text-[#111b21] dark:text-[#E9EDEF] border-none focus:outline-none placeholder-[#8696a0] resize-none overflow-hidden text-[15px] py-2 max-h-32"
                        rows={1}
                        style={{
                            height: "auto",
                        }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                </div>

                {messageText.trim() || attachment ? (
                    <button 
                        onClick={handleSendMessage}
                        className="text-[#00a884] dark:text-[#00A884] p-2 flex-shrink-0 flex items-center justify-center w-10 h-10 ml-1 hover:scale-110 transition-transform"
                    >
                        <Send className="w-6 h-6 ml-1" />
                    </button>
                ) : (
                    <button className="text-[#54656f] dark:text-[#8696A0] hover:text-[#111b21] dark:hover:text-[#AEBAC1] p-2 flex-shrink-0 transition-colors w-10 h-10 flex items-center justify-center ml-1">
                        <svg viewBox="0 0 24 24" width="24" height="24" className=""><path fill="currentColor" d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.531 3.531zM8.995 18.235v-1.765h6v1.765c0 1.252-1.015 2.266-2.266 2.266h-1.468c-1.251 0-2.266-1.014-2.266-2.266zM4.778 11.411H3.149c0 4.889 3.969 8.858 8.858 8.858v-1.629c-3.991 0-7.229-3.238-7.229-7.229zM12.007 20.269c4.889 0 8.858-3.969 8.858-8.858h-1.629c0 3.991-3.238 7.229-7.229 7.229v1.629z"></path></svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatArea;
