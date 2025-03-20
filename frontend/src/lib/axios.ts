import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth-token');
            if (token) {
                // Đảm bảo headers object tồn tại
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa thử refresh
        // if (error.response?.status === 401 && !originalRequest._retry) {
        //     originalRequest._retry = true;

        //     try {
        //         const currentToken = localStorage.getItem('auth-token');
        //         if (!currentToken) {
        //             throw new Error('No token found');
        //         }

        //         // Gọi API refresh token với token hiện tại
        //         const response = await axios.post(`${API_URL}/auth/refresh-token`, null, {
        //             headers: {
        //                 Authorization: `Bearer ${currentToken}`
        //             }
        //         });

        //         const { token: newToken } = response.data;
        //         localStorage.setItem('auth-token', newToken);

        //         // Cập nhật token cho request tiếp theo
        //         originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        //         // Thử lại request ban đầu
        //         return axiosInstance(originalRequest);
        //     } catch (refreshError) {
        //         localStorage.removeItem('auth-token');
        //         window.location.href = '/login';
        //         return Promise.reject(refreshError);
        //     }
        // }

        return Promise.reject(error);
    }
);

export default axiosInstance; 