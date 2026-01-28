import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getRecommendedUsers, getMyFriends, sendFriendRequest, acceptFriendRequest, getFriendRequest, getOutgoingFriendRequests } from "../controllers/user.controller.js"

const router = express.Router()

router.use(protectRoute)

router.get("/", getRecommendedUsers)
router.get("/friends", getMyFriends)

router.post("/friend-requests/:id", sendFriendRequest)
router.put("/friend-requests/:id/accept", acceptFriendRequest)

router.get("/friend-requests", getFriendRequest)
router.get("/outgoing-friend-requests", getOutgoingFriendRequests)
export default router