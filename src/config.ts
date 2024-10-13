import dotenv from 'dotenv';

dotenv.config();

export const mongoUri = process.env.MONGO_URL as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
export const MAIL_RU_PASS = process.env.MAIL_RU_PASS;
export const GMAIL_COM_PASS = process.env.GMAIL_COM_PASS;
