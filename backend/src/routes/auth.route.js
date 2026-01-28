import express from "express"
import { logout, signup, login } from "../controllers/auth.controller.js"
import { protectRoute, optionalProtectRoute } from "../middleware/auth.middleware.js"
import { onboard } from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.post("/onboarding", protectRoute, onboard)

router.get("/me", optionalProtectRoute, (req, res) => {
    res.status(200).json({ success: true, user: req.user })
})

export default router