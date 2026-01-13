import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import express from "express";
config();

const isProduction = express().get("env") === "production";

cloudinary.config({
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  secure: isProduction,
});

export { cloudinary };
