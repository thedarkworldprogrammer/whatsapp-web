import axios from 'axios'

// const apiUrl = `${process.env.REACT_APP_API_URL}`
const apiUrl = `${import.meta.env.VITE_API_URL}`


const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true
})

export default axiosInstance;