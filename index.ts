import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import connectDatabase from "./config/database";
import { setupSwagger } from "./config/swagger";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import session from "express-session";

// Routes imports
import authRoutes from "./routers/auth.routes";
import uploadRoutes from "./routers/upload.routes";

// Load environment variables
dotenv.config();

// Create an express application instance
const app: Application = express();

// Middleware for CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parser setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cookie and session handling
app.use(cookieParser());
app.use(passport.initialize());
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.session());

// Database connection
const databaseUrl = process.env.DATABASE_URL as string;
connectDatabase(databaseUrl);

// Static files serving (e.g., images, public assets)
app.use(express.static("public"));

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

// Root endpoint for testing
app.get("/", (req: Request, res: Response) => {
  res.send("Chat app");
});

// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
