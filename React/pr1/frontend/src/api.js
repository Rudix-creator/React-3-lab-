const API_URL = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
    let res;
    try {
        res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers },
        });
    } catch (networkError) {
        throw new Error('Сервер недоступен. Убедитесь, что бэкенд запущен на порту 3001.');
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Бэкенд недоступен или вернул некорректный ответ (не JSON). Убедитесь, что сервер запущен на 3001 порту.');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
    return data;
}

export const loginUser = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const getServices = () => request('/services');
export const createService = (data) => request('/services', { method: 'POST', body: JSON.stringify(data) });
export const deleteService = (id) => request(`/services/${id}`, { method: 'DELETE' });
export const getServiceById = (id) => request(`/services/${id}`);

export const getCategories = () => request('/categories');
export const createCategory = (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) });
export const deleteCategory = (id) => request(`/categories/${id}`, { method: 'DELETE' });

export const getUsers = () => request('/users');
export const updateCredentials = (id, data) => request(`/users/${id}/credentials`, { method: 'PUT', body: JSON.stringify(data) });
export const createOrder = (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) });
export const getUserOrders = (userId) => request(`/users/${userId}/orders`);

export const getCoupons = () => request('/coupons');
export const createCoupon = (data) => request('/coupons', { method: 'POST', body: JSON.stringify(data) });
export const assignCoupon = (userId, couponId) => request(`/users/${userId}/coupon`, { method: 'PUT', body: JSON.stringify({ coupon_id: couponId }) });
export const updateServiceDiscount = (serviceId, discount) => request(`/services/${serviceId}/discount`, { method: 'PUT', body: JSON.stringify({ discount_percent: discount }) });
export const updateCoupon = (id, data) => request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCoupon = (id) => request(`/coupons/${id}`, { method: 'DELETE' });