import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //res.status(200):Sets the HTTP status code to 200, indicating the request was successful.
  //.json({ message: "ok" }):Converts the JavaScript object { message: "ok" } into a JSON string.

  //just for checking

  // res.status(200).json({
  //   message: "ok"
  //   //Sends the JSON string to the client with the appropriate headers (Content-Type: application/json).
  // })

  //get user details from frontend
  //check fields from model
  //validation- not empty
  //check if user already exists: username and email
  //check for images,check for avatar
  //upload them to cloudinary ,avatar
  //create user object - create db entry
  //remove password and refresh token field from response
  //check for user creation
  //return response

  const { fullName, email, username, password } = req.body;
  console.log("email:", email);

  //2: validation- not empty

  //The .some() method in JavaScript is used to test whether at least one element in an array satisfies a specified condition (callback function).
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
    //The some() method checks if any element in the array satisfies the condition (field?.trim() == "").
  ) {
    throw new ApiError(400, "All field are required");
  }

  //3: check if user already exists: username and email
  //The User.findOne() method is a Mongoose query used to find a single document in a MongoDB collection that matches the given criteria.
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  // If a form field allows multiple files (e.g., upload.fields()), the files will be stored in an array under the corresponding field name (e.g., avatar or coverImage)
  // Accessing the first element ([0]) retrieves the first (or only) uploaded file for that field.
  //Even if the field is meant for a single file, Multer stores it as the first element of an array. Thus, req.files.avatar[0] retrieves the uploaded file.

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  //Check if req.files exists:Ensures the req.files object is available, meaning files were uploaded in the request.
  //Check if req.files.coverImage is an array:The coverImage field in req.files is expected to be an array. This is common when configuring Multer with upload.fields() for named file fields or when handling multiple files for the same field.
  //Check if the array is not empty:Ensures at least one file was uploaded under the coverImage field.
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  //check for images,check for avatar

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  //upload them to cloudinary ,avatar

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //check local path is given to cloudinary
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //create user object - create db entry
  //sending only url not full object
  // if url found then use url otherwise undefined
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // The user object might look like this:
  /**{
   * 
    _id: "64abc123def4567890abcd12", // Auto-generated
    fullName: "John Doe",
    avatar: "https://example.com/avatar.jpg",
    coverImage: "https://example.com/cover.jpg",
    email: "john.doe@example.com",
    password: "securepassword",
    username: "johndoe",
    createdAt: "2025-01-23T12:34:56.789Z", // Auto-generated if timestamps are enabled
    updatedAt: "2025-01-23T12:34:56.789Z"  // Auto-generated if timestamps are enabled
  }**/

  //check user is created in db or not

  // When you create a document using Mongoose, the returned object (in this case, user) includes the _id property, which is a unique identifier automatically generated by MongoDB.

  //remove password and refresh token field from response

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //The .select() method in Mongoose is used to include or exclude specific fields from the documents returned by a query.

  //Use a - (minus) sign before the field name to exclude specific fields.

  //check for user creation

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //return response
  return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
