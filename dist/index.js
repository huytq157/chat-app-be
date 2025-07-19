"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = require("http");
const socket_1 = require("./socket");
const dotenv_1 = __importDefault(require("dotenv"));
require("./config/auth");
dotenv_1.default.config();
// Routes imports
const auth_routes_1 = __importDefault(require("./routers/auth.routes"));
const upload_routes_1 = __importDefault(require("./routers/upload.routes"));
const user_routes_1 = __importDefault(require("./routers/user.routes"));
const message_routes_1 = __importDefault(require("./routers/message.routes"));
const conversation_routes_1 = __importDefault(require("./routers/conversation.routes"));
const database_1 = __importDefault(require("./config/database"));
const swagger_1 = require("./config/swagger");
// Create an express application instance
const app = (0, express_1.default)();
// Create HTTP server
const server = (0, http_1.createServer)(app);
// Initialize Socket.IO
(0, socket_1.initializeSocket)(server);
// Middleware for CORS
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    maxAge: 86400, // 24 hours
}));
// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Body parser setup
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
// Cookie and session handling
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "lax",
        httpOnly: true,
    },
}));
app.use(passport_1.default.session());
// Database connection
const databaseUrl = process.env.DATABASE_URL;
(0, database_1.default)(databaseUrl);
// Static files serving (e.g., images, public assets)
app.use(express_1.default.static("public"));
// Setup Swagger documentation
(0, swagger_1.setupSwagger)(app);
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/upload", upload_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use("/api/messages", message_routes_1.default);
app.use("/api/conversation", conversation_routes_1.default);
// Root endpoint for testing
app.get("/", (req, res) => {
    res.send("Chat app");
});
// Start the server
server.listen(env_1.env.PORT, () => {
    console.log(`Server is running at http://localhost:${env_1.env.PORT}`);
});
