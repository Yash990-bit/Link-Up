import express from "express"
import { protectRoute } from "../middleware/auth.middleware"
import {getRecommendedUsers,getMyFriends} from "../controllers/user.controller.js"

const router=express.Router()

router.use(protectRoute)

router.get("/",getRecommendedUsers)
router.get("/friends",getMyFriends)

router.post("/friends-request/:id",sendFriendRequest)

export default router