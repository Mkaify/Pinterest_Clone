import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with fallback values for development
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "demo-key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "demo-secret",
});

export const uploadImage = async (
  file: string,
  folder = "pinterest-clone"
): Promise<{ url: string; public_id: string }> => {
  try {
    // Check if we have proper Cloudinary configuration
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
        !process.env.CLOUDINARY_API_KEY && 
        !process.env.CLOUDINARY_API_SECRET) {
      console.warn("⚠️  Cloudinary not configured. Using demo URL for development.");
      
      // Return a demo image URL for development
      return {
        url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        public_id: "demo-image-" + Date.now(),
      };
    }

    const result = await cloudinary.uploader.upload(file, {
      folder,
      transformation: [
        { width: 1080, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    
    // For development, return a demo image instead of failing
    if (process.env.NODE_ENV === "development") {
      console.warn("🔄 Cloudinary upload failed. Using demo image for development.");
      return {
        url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        public_id: "demo-image-" + Date.now(),
      };
    }
    
    throw new Error("Image upload failed");
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    // Skip deletion for demo images
    if (publicId.startsWith("demo-image-")) {
      console.log("Skipping deletion of demo image");
      return;
    }
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw new Error("Image deletion failed");
  }
};

export default cloudinary;
