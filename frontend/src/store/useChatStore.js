import { create } from 'zustand';
import { getConversations, getMessages, sendMessage, markMessagesAsRead, deleteMessage } from '../services/chat.service';
import { getAllUsers } from '../services/user.service';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
    users: [],
    conversations: [],
    messages: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        try {
            set({ isUsersLoading: true });
            const res = await getAllUsers();
            const { authUser } = useAuthStore.getState();
            
            // Filter out the current user just to be safe on the frontend
            const filteredUsers = res.data.filter(user => user._id !== authUser?._id);
            
            set({ users: filteredUsers });
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getConversationsList: async () => {
        try {
            const res = await getConversations();
            set({ conversations: res.data });
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    },

    getMessagesList: async (conversationId) => {
        try {
            set({ isMessagesLoading: true });
            const res = await getMessages(conversationId);
            set({ messages: res.data });
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendNewMessage: async (formData) => {
        try {
            const res = await sendMessage(formData);
            const newMessage = res.data;
            set((state) => ({ messages: [...state.messages, newMessage] }));
            return newMessage;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    setSelectedUser: (user) => {
        set({ selectedUser: user });
    },

    addMessageFromSocket: (message) => {
        const { selectedUser } = get();
        // Only append if the message is from the currently selected user or we sent it
        if (selectedUser && (message.sender._id === selectedUser._id || message.receiver._id === selectedUser._id)) {
            set((state) => ({ messages: [...state.messages, message] }));
        }
    },

    updateMessageStatus: (messageId, status) => {
        set((state) => ({
            messages: state.messages.map(msg => 
                msg._id === messageId ? { ...msg, messageStatus: status } : msg
            )
        }));
    },

    deleteMessageById: async (messageId) => {
        try {
            await deleteMessage(messageId);
            set((state) => ({
                messages: state.messages.filter(msg => msg._id !== messageId)
            }));
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    },

    updateReaction: (reactionUpdate) => {
        set((state) => ({
            messages: state.messages.map(msg => 
                msg._id === reactionUpdate.messageId 
                    ? { ...msg, reactions: reactionUpdate.reactions } 
                    : msg
            )
        }));
    }
}));
