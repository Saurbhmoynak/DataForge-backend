import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
  try {
    //Ensures that the localFilePath is provided. If it's null or undefined, the function exits early by returning null.
    if (!localFilePath) return null
    
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      //The resource_type: "auto" allows Cloudinary to automatically detect the file type (image, video, etc.).
      resource_type:"auto"
    })
    //file has been uploaded successfully
    console.log("File has been uploaded successfully on cloudinary", response.url);
    
    return response;

  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file from local storage as the upload operation got failed
    return null;
  }
}

export default uploadCloudinary;

