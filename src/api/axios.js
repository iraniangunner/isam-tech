import axios from 'axios';

const api = axios.create({
    baseURL:         '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept':        'application/json',
    },
});

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error) => {
    failedQueue.forEach(prom => {
        error ? prom.reject(error) : prom.resolve();
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const url             = originalRequest.url;

        // ✅ Never retry these
        if (
            url.includes('/auth/login')   ||
            url.includes('/auth/logout')  ||
            url.includes('/auth/refresh') ||
            originalRequest._retry
        ) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {

            // ✅ If profile fails — just reject, don't retry
            if (url.includes('/auth/profile')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => api(originalRequest))
                .catch(err => Promise.reject(err));
            }

            isRefreshing           = true;
            originalRequest._retry = true;

            try {
                await api.post('/auth/refresh');
                processQueue(null);
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError);
                window.location.href = '/login';
                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;