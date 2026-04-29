import axiosInstance from "./url.service";

export const getConversations = async () => {
    try {
        const response = await axiosInstance.get('/chat/conversations');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const getMessages = async (conversationId) => {
    try {
        const response = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const sendMessage = async (formData) => {
    try {
        const response = await axiosInstance.post('/chat/send-message', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const markMessagesAsRead = async (messageIds, senderId) => {
    try {
        const response = await axiosInstance.put('/chat/messages/read', { messageIds, senderId });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const deleteMessage = async (messageId) => {
    try {
        const response = await axiosInstance.delete(`/chat/messages/${messageId}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};
