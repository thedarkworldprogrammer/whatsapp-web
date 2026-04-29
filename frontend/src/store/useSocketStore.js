import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import { useChatStore } from './useChatStore';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

export const useSocketStore = create((set, get) => ({
    socket: null,
    onlineUsers: [],
    typingUsers: {}, // { conversationId: boolean }

    connectSocket: () => {
        const { authUser } = useAuthStore.getState();
        if (!authUser || get().socket?.connected) return;

        const socket = io(SOCKET_URL, {
            withCredentials: true,
            query: {
                userId: authUser._id,
            },
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            socket.emit('user_connected', authUser._id);
        });

        // Listen for initial list of online users
        socket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds });
        });

        // Listen for online users status
        socket.on('user_status', ({ userId, isOnline }) => {
            set((state) => {
                let updatedOnlineUsers = [...state.onlineUsers];
                if (isOnline && !updatedOnlineUsers.includes(userId)) {
                    updatedOnlineUsers.push(userId);
                } else if (!isOnline) {
                    updatedOnlineUsers = updatedOnlineUsers.filter(id => id !== userId);
                }
                return { onlineUsers: updatedOnlineUsers };
            });
        });

        // Listen for incoming messages
        socket.on('receive_message', (message) => {
            const { addMessageFromSocket } = useChatStore.getState();
            addMessageFromSocket(message);
        });

        // Listen for message status updates (read receipts)
        socket.on('message_status_update', ({ messageId, messageStatus }) => {
            const { updateMessageStatus } = useChatStore.getState();
            updateMessageStatus(messageId, messageStatus);
        });

        // Listen for typing indicators
        socket.on('user_typing', ({ userId, conversationId, istyping }) => {
            set((state) => ({
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: istyping
                }
            }));
        });

        // Listen for reaction updates
        socket.on('reaction_update', (reactionData) => {
            const { updateReaction } = useChatStore.getState();
            updateReaction(reactionData);
        });

        set({ socket });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket.disconnect();
            set({ socket: null, onlineUsers: [], typingUsers: {} });
        }
    },

    emitTypingStart: (conversationId, receiverId) => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.emit('typing_start', { conversationId, receiverId });
        }
    },

    emitTypingStop: (conversationId, receiverId) => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.emit('typing_stop', { conversationId, receiverId });
        }
    },

    markMessageAsReadEmit: (messageIds, senderId) => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.emit('message_read', { messageIds, senderId });
        }
    },

    addReactionEmit: (messageId, emoji, reactionUserId) => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.emit('add_reaction', { messageId, emoji, userId: reactionUserId, reactionUserId });
        }
    }
}));
