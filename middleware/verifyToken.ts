// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.PASSJWT;

// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET environment variable is not set");
// }

// export const verifyToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Authentication required!",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
//     (req as any).userId = decoded.userId;
//     next();
//   } catch (error) {
//     return res.status(403).json({
//       success: false,
//       message: "Invalid or expired token!",
//     });
//   }
// };

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PASSJWT;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required!",
    });
    return; // Đảm bảo hàm không tiếp tục thực thi
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = decoded.userId; // Gắn `userId` vào request để dùng về sau
    next(); // Chuyển sang middleware/handler tiếp theo
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired token!",
    });
  }
};
