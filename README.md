# Chat App Server

Đây là backend của ứng dụng Chat App, xây dựng bằng Node.js, Express, MongoDB và Socket.IO. Dự án cung cấp các API cho đăng ký, đăng nhập, trò chuyện thời gian thực, quản lý người dùng, nhóm, tin nhắn, upload file, xác thực Google OAuth, và tài liệu Swagger. Hỗ trợ xác thực JWT, lưu trữ file trên Google Drive, và realtime qua WebSocket.

## Tính năng chính
- Đăng ký, đăng nhập, xác thực JWT
- Đăng nhập bằng Google OAuth 2.0
- Quản lý người dùng, cập nhật hồ sơ cá nhân
- Tạo, quản lý cuộc trò chuyện (chat nhóm, chat riêng, channel, broadcast)
- Gửi, nhận, chỉnh sửa, xóa tin nhắn (text, media, file, emoji, reaction)
- Thông báo realtime trạng thái online/offline, đang nhập tin nhắn
- Upload file lên Google Drive, lấy thông tin file
- Quản lý bạn bè, nhóm, hashtag, notification
- Tài liệu API với Swagger UI
- Hỗ trợ Socket.IO cho chat realtime

## Công nghệ sử dụng
- Node.js, Express.js
- MongoDB, Mongoose
- Socket.IO (WebSocket)
- Passport.js (Google OAuth)
- JWT (jsonwebtoken)
- Multer (upload file)
- Google Drive API
- Redis (tùy chọn, cache)
- Swagger (swagger-jsdoc, swagger-ui-express)
- Typescript

## Hướng dẫn chạy dự án
1. Cài đặt dependencies:
   ```bash
   cd server
   npm install
   ```
2. Tạo file `.env` và cấu hình các biến môi trường cần thiết (xem ví dụ trong mã nguồn)
3. Build project:
   ```bash
   npm run build
   ```
4. Chạy server ở chế độ production:
   ```bash
   npm start
   ```
   Hoặc chạy ở chế độ phát triển (hot reload):
   ```bash
   npm run dev
   ```
5. Truy cập tài liệu API tại: `http://localhost:5000/api-docs`
