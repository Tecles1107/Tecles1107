import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || process.env.BACKEND_PORT || 3000),
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Accept"]
  },
  geminiBin: process.env.GEMINI_BIN || process.env.BACKEND_GEMINI_BIN || "gemini",
  staticDir: new URL("../frontend", import.meta.url)
};
