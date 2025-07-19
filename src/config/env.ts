import dotenv from "dotenv";
import fs from "fs";
import path from "path";


dotenv.config();
// Đường dẫn tới file .env ở thư mục gốc
const envPath = path.resolve(__dirname, "../../.env");

// Chỉ load dotenv nếu file .env tồn tại (ví dụ khi chạy local)
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn("⚠️ Error loading .env file:", result.error);
  } else {
    console.log("✅ Loaded .env file");
  }
} else {
  console.log("⚠️ No .env file found — using system environment variables (Render, CI/CD, etc)");
}

// Danh sách biến môi trường bắt buộc
const requiredEnvVars = ["PASSJWT", "SESSION_SECRET", "DATABASE_URL"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
  process.exit(1); // Thoát nếu biến thực sự thiếu
}

// Export đối tượng env để dùng trong toàn app
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  PASSJWT: process.env.PASSJWT as string,
  SESSION_SECRET: process.env.SESSION_SECRET as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
};
