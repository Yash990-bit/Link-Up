import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
    unreadMessagesCount: 0,
    pendingFriendRequestsCount: 0,

    setUnreadMessagesCount: (count) => set({ unreadMessagesCount: count }),
    incrementUnreadMessages: () => set((state) => ({ unreadMessagesCount: state.unreadMessagesCount + 1 })),
    clearUnreadMessages: () => set({ unreadMessagesCount: 0 }),

    setPendingFriendRequestsCount: (count) => set({ pendingFriendRequestsCount: count }),
    incrementPendingFriendRequests: () => set((state) => ({ pendingFriendRequestsCount: state.pendingFriendRequestsCount + 1 })),
    decrementPendingFriendRequests: () => set((state) => ({ pendingFriendRequestsCount: Math.max(0, state.pendingFriendRequestsCount - 1) })),
    clearPendingFriendRequests: () => set({ pendingFriendRequestsCount: 0 }),
}))
