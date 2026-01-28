import axiosInstance from './axios';

export const signup = async (signupData) => {
    const response = await axiosInstance.post('/auth/signup', signupData)
    return response.data
}

export const login = async (loginData) => {
    const response = await axiosInstance.post('/auth/login', loginData)
    return response.data
}

export const logout = async () => {
    const response = await axiosInstance.post('/auth/logout')
    return response.data
}

export const getAuthUser = async () => {
    try {
        const res = await axiosInstance.get('/auth/me')
        return res.data
    }
    catch (error) {
        return null
    }
}

export const completeOnboarding = async (userData) => {
    const response = await axiosInstance.post('/auth/onboarding', userData)
    return response.data
}


export const getStreamToken = async () => {
    const response = await axiosInstance.get('/chat/token')
    return response.data
}

export async function getUserFriends() {
    const res = await axiosInstance.get('/users/friends')
    return res.data
}

export async function getRecommendedUsers() {
    const res = await axiosInstance.get('/users')
    return res.data
}

export async function getOutgoingFriendReqs() {
    const res = await axiosInstance.get('/users/outgoing-friend-requests')
    return res.data
}

export async function sendFriendRequest(userId) {
    const res = await axiosInstance.post(`/users/friend-requests/${userId}`)
    return res.data
}

export async function getFriendRequests() {
    const res = await axiosInstance.get('/users/friend-requests')
    return res.data
}

export async function acceptFriendRequest(requestId) {
    const res = await axiosInstance.put(`/users/friend-requests/${requestId}/accept`)
    return res.data
}

export async function searchUsers(query) {
    const res = await axiosInstance.get(`/users/search?query=${encodeURIComponent(query)}`)
    return res.data
}