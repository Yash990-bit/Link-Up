import { useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import useAuthUser from '../hooks/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken, getFriendRequests } from '../lib/api';
import { useNotificationStore } from '../store/useNotificationStore';
import toast from 'react-hot-toast';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const NotificationObserver = () => {
    const { authUser } = useAuthUser();
    const { setUnreadMessagesCount, incrementUnreadMessages, setPendingFriendRequestsCount, incrementPendingFriendRequests } = useNotificationStore();

    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
    });

    const { data: friendRequests } = useQuery({
        queryKey: ["friendRequests"],
        queryFn: getFriendRequests,
        enabled: !!authUser,
    });

    useEffect(() => {
        if (friendRequests) {
            setPendingFriendRequestsCount(friendRequests.incomingReqs?.length || 0);
        }
    }, [friendRequests, setPendingFriendRequestsCount]);

    useEffect(() => {
        if (!tokenData?.token || !authUser) return;

        let client;

        const initNotifications = async () => {
            try {
                client = StreamChat.getInstance(STREAM_API_KEY);

                // If not already connected
                if (!client.userID) {
                    await client.connectUser(
                        {
                            id: authUser._id,
                            name: authUser.fullName,
                            image: authUser.profilePic,
                        },
                        tokenData.token
                    );
                }

                // Initial unread count
                setUnreadMessagesCount(client.user.total_unread_count || 0);

                const handleEvent = (event) => {
                    if (event.type === 'notification.message_new') {
                        // Only notify if it's not from us and we're not on the chat page with this user
                        // Simplification for now: always increment if not us
                        if (event.user.id !== authUser._id) {
                            incrementUnreadMessages();
                            toast(`New message from ${event.user.name}`, {
                                icon: '💬',
                                position: 'top-right',
                            });
                        }
                    } else if (event.type === 'friend_request_received') {
                        incrementPendingFriendRequests();
                        toast(`New friend request from ${event.sender.fullName}`, {
                            icon: '👤',
                            position: 'top-right',
                            style: {
                                borderRadius: '10px',
                                background: '#333',
                                color: '#fff',
                            },
                        });
                    } else if (event.type === 'friend_request_accepted') {
                        toast(`${event.sender.fullName} accepted your friend request!`, {
                            icon: '✅',
                            position: 'top-right',
                        });
                    }
                };

                client.on(handleEvent);

                return () => {
                    client.off(handleEvent);
                };
            } catch (error) {
                console.error("Error in NotificationObserver:", error);
            }
        };

        const cleanup = initNotifications();

        return () => {
            if (cleanup && typeof cleanup === 'function') cleanup();
        };
    }, [tokenData, authUser, setUnreadMessagesCount, incrementUnreadMessages, incrementPendingFriendRequests]);

    return null;
};

export default NotificationObserver;
