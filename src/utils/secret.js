import "dotenv/config";

export const PORT = process.env.PORT || 3001;
export const URL_MONGODB = process.env.URL_MONGODB || "";
export const EMAIL_ADMIN = process.env.EMAIL_ADMIN || "";
export const PASS_ADMIN = process.env.PASS_ADMIN || "";
export const SECRET_KEY = process.env.SECRET_KEY;
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
export const MIDTRANS_URL_API = process.env.MIDTRANS_URL_API;
