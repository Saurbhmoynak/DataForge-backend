import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Middleware to verify JWT and authenticate the user
export const verifyJWT = asyncHandler(async (req, _, next) => {
  // Using (req, _, next) is a way to ignore the second parameter, which is typically res (response), in your middleware function. This is commonly done when you don’t need to use the res object.
  
  try {
    // Retrieve the token from either cookies or the Authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("bearer ", "");
  
    // If no token is found, throw an Unauthorized error
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    // Verify the JWT using the secret key and decode the token payload
    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    // Fetch the user from the database using the ID from the decoded token
    // Exclude sensitive fields like password and refreshToken
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
  
    // If no user is found or the token is invalid, throw an Unauthorized error
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
  
    // Attach the user to the request object for further use
    req.user = user;
  
    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    
    throw new ApiError(401,error?.message || "Invalid access token")
  }
});
