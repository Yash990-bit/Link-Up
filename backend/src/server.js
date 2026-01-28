import express from "express"
import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import chatRoutes from "./routes/chat.route.js"
import { connectDB } from "./lib/db.js"



import { fileURLToPath } from "url"

const app = express()
const PORT = process.env.PORT

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            process.env.CLIENT_URL,
            "https://link-up-eta-eight.vercel.app"
        ].filter(Boolean).map(url => url.replace(/\/$/, ""));

        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
            callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')))

    app.get("*path", (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"))
    })
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
})
