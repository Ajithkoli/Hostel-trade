import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Configure cloudinary using credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and deletes the local file.
 * @param {string} localFilePath - Path to the local file
 * @returns {Promise<string|null>} - The Cloudinary secure URL or null if upload failed
 */
export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    // Check if Cloudinary credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn("Cloudinary configuration is missing. Falling back to local file path.");
      return localFilePath; // Graceful fallback
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "hostel-trade",
    });
    
    // Remove the file from the local server
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    return response.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Attempt to clean up local file anyway
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error("Failed to delete local file:", err);
      }
    }
    throw error;
  }
};

/**
 * Extracts the public ID of a Cloudinary image from its URL.
 * @param {string} url - The Cloudinary image URL
 * @returns {string|null} - The public ID or null
 */
export const extractPublicId = (url) => {
  try {
    if (!url || !url.includes("cloudinary.com")) return null;
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    // Get everything after "upload/vxxxx/"
    const publicIdWithExtParts = parts.slice(uploadIndex + 2); // skips "upload" and the version component
    const publicIdWithExt = publicIdWithExtParts.join("/");
    const lastDotIndex = publicIdWithExt.lastIndexOf(".");
    if (lastDotIndex === -1) return publicIdWithExt;
    return publicIdWithExt.substring(0, lastDotIndex);
  } catch (error) {
    console.error("Failed to extract public ID:", error);
    return null;
  }
};

/**
 * Deletes a file from Cloudinary using its public ID.
 * @param {string} publicId - The Cloudinary public ID of the resource
 * @returns {Promise<any>} - Cloudinary destroy response
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};
