"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const swagger_1 = require("./config/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
// Routes imports
const auth_routes_1 = __importDefault(require("./routers/auth.routes"));
const upload_routes_1 = __importDefault(require("./routers/upload.routes"));
const user_routes_1 = __importDefault(require("./routers/user.routes"));
// Load environment variables
dotenv_1.default.config();
// Create an express application instance
const app = (0, express_1.default)();
// Middleware for CORS
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
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
// Root endpoint for testing
app.get("/", (req, res) => {
    res.send("Chat app");
});
// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
