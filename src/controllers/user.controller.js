import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Function to generate access and refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Retrieve the user from the database using the provided userId
    const user = await User.findById(userId);

    // Ensure the user exists before proceeding
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate the access and refresh tokens using user-specific methods
    const accessToken = user.generateAccessToken(); // Assumes user has a method for generating access tokens
    const refreshToken = user.generateRefreshToken(); // Assumes user has a method for generating refresh tokens

    // Store the newly generated refresh token in the user's record
    user.refreshToken = refreshToken;

    // Save the user's updated record without triggering validation (useful if validations aren't needed here)
    await user.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
    
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh ans access tokens")
  }
}

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

const loginUser = asyncHandler(async (req, res) => {
  // req.body ->fetch data
  //login using username or email based , take password
  //find the user 
  // check password
  //if username and pwd does not match then trow error
  //access and refresh token 
  //send through secure cookies
  
  // req.body ->fetch data
  const { email, username, password } = req.body;

  //login using username or email based , take password
  if (!username || !email) {
    throw new ApiError(400, "Username or email is required");
  }

  //find the user 
  const user = await User.findOne({
    $or: [{ username }, { email }],
  })

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  // check password
  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(402, "Invalid user credentials");
  }

  //access and refresh token 
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
  //send through secure cookies

  const options = {
    httpOnly: true,
    secure :true
  }

  return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,accessToken,refreshToken
      },
      "User logged in successfully"
    )
  )
});

const logoutUser = asyncHandler(async (req, res) => {
  // Find user and reset refresh token
  // This ensures that the user's session is invalidated on the server-side
  User.findByIdAndUpdate(
    await req.user._id, // Get the user ID from the request object
    {
      $set: {
        refreshToken: undefined // Clear the refresh token in the database
      }
    },
    {
      new: true // Return the updated user document
    }
  );

  // Options for clearing cookies
  const options = {
    httpOnly: true, // Ensures the cookie cannot be accessed via JavaScript (for security)
    secure: true // Ensures the cookie is sent only over HTTPS
  };

  // Clear the access and refresh token cookies
  return res
    .status(200) // Set HTTP status code to 200 (OK)
    .clearCookie("accessToken", options) // Clear the access token cookie
    .clearCookie("refreshToken", options) // Clear the refresh token cookie
    .json(
      new ApiResponse(
        200, // HTTP status code
        {}, // Empty data object
        "User logged out" // Success message
      )
    );
})


export { registerUser,loginUser,logoutUser };
