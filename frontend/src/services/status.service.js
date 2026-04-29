import axiosInstance from "./url.service";

export const getStatuses = async () => {
    try {
        const response = await axiosInstance.get('/status');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const createStatus = async (formData) => {
    try {
        const response = await axiosInstance.post('/status', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const viewStatus = async (statusId) => {
    try {
        const response = await axiosInstance.put(`/status/${statusId}/view`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const deleteStatus = async (statusId) => {
    try {
        const response = await axiosInstance.delete(`/status/${statusId}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};
