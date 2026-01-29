import FriendRequest from "../models/FriendRequest.js"
import User from "../models/User.js"
import { streamClient } from "../lib/stream.js"

export async function searchUsers(req, res) {
    try {
        const currentUserId = req.user.id
        const { query } = req.query

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ message: "Search query must be at least 2 characters" })
        }

        // Find all friend requests involving the current user
        const existingRequests = await FriendRequest.find({
            $or: [{ sender: currentUserId }, { recipient: currentUserId }]
        })

        const associatedUserIds = existingRequests.map(re =>
            re.sender.toString() === currentUserId ? re.recipient.toString() : re.sender.toString()
        )

        // Also include existing friends
        const currentUser = await User.findById(currentUserId)
        const allExcludedIds = [...new Set([...associatedUserIds, ...currentUser.friends.map(id => id.toString()), currentUserId])]

        // Search users by name (case-insensitive partial match)
        const users = await User.find({
            $and: [
                { _id: { $nin: allExcludedIds } },
                { isOnboarded: true },
                { fullName: { $regex: query.trim(), $options: 'i' } }
            ]
        }).limit(10)

        res.status(200).json(users)
    }
    catch (error) {
        console.error("Error in searchUsers controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id

        // Find all friend requests involving the current user
        const existingRequests = await FriendRequest.find({
            $or: [{ sender: currentUserId }, { recipient: currentUserId }]
        })

        const associatedUserIds = existingRequests.map(re =>
            re.sender.toString() === currentUserId ? re.recipient.toString() : re.sender.toString()
        )

        // Also include existing friends
        const currentUser = await User.findById(currentUserId)
        const allExcludedIds = [...new Set([...associatedUserIds, ...currentUser.friends.map(id => id.toString()), currentUserId])]

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $nin: allExcludedIds } },
                { isOnboarded: true }
            ]
        })
        res.status(200).json(recommendedUsers)
    }
    catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message)

        res.status(500).json({ message: "Internal Server Error" })
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage")

        res.status(200).json(user.friends)
    }
    catch (error) {
        console.error("Error in getMyFriends controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id
        const { id: recipientId } = req.params

        if (myId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself." })
        }

        const recipient = await User.findById(recipientId)

        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found." })
        }

        if (recipient.friends.some(friendId => friendId.toString() === myId)) {
            return res.status(400).json({ message: "You are already friends with this user." })
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                {
                    sender: myId,
                    recipient: recipientId
                },
                {
                    sender: recipientId,
                    recipient: myId
                }
            ],
        })
        if (existingRequest) {
            return res.status(400).json({ message: "A friend request is already exist between you and the user." })
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId
        })

        // Real-time notification via Stream custom event
        try {
            const sender = await User.findById(myId).select("fullName profilePic")
            await streamClient.channel('messaging', { members: [myId, recipientId] }).sendEvent({
                type: 'friend_request_received',
                sender: {
                    id: myId,
                    fullName: sender.fullName,
                    profilePic: sender.profilePic
                }
            })
        } catch (streamError) {
            console.error("Error sending Stream event for friend request:", streamError.message)
        }

        res.status(201).json(friendRequest)
    }
    catch (error) {
        console.error("Error in sendFriendRequest controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params
        const friendRequest = await FriendRequest.findById(requestId)

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found." })
        }

        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this friend request." })
        }

        friendRequest.status = "accepted"
        await friendRequest.save()

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        })

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        })

        // Real-time notification for accepted request
        try {
            const recipient = await User.findById(req.user.id).select("fullName profilePic")
            await streamClient.channel('messaging', { members: [friendRequest.sender.toString(), req.user.id] }).sendEvent({
                type: 'friend_request_accepted',
                sender: {
                    id: req.user.id,
                    fullName: recipient.fullName,
                    profilePic: recipient.profilePic
                }
            })
        } catch (streamError) {
            console.error("Error sending Stream event for accepted friend request:", streamError.message)
        }

        res.status(200).json({ message: "Friend request accepted." })
    }
    catch (error) {
        console.error("Error in acceptFriendRequest controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export async function rejectFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;
        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found." });
        }

        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to reject this friend request." });
        }

        friendRequest.status = "rejected";
        await friendRequest.save();

        res.status(200).json({ message: "Friend request rejected." });
    }
    catch (error) {
        console.error("Error in rejectFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFriendRequest(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage")

        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted"
        }).populate("recipient", "fullName profilePic ")

        res.status(200).json({ incomingReqs, acceptedReqs })
    }
    catch (error) {
        console.error("Error in getPendingFriendRequest controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export async function getOutgoingFriendRequests(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage")
        res.status(200).json(outgoingRequests)
    }
    catch (error) {
        console.error("Error in getOutgoingFriendRequests controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}