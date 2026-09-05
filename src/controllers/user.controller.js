import { asyncHandler } from "../utils/async-Handler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefershToken = async(userId) => {
try {
   const user = await User.findById(userId)
   if(!user){
    throw new ApiError(409, "User does not exists. ")
   }
  
  const accessToken =  user.generateAccessToken()
  const refreshToken =  user.generateRefreshToken()
  
  user.refreshToken = refreshToken
  await user.save({validateBeforeSave: false})
  return {accessToken, refreshToken}
} catch (error) {
  throw new ApiError(500, "Something went wrong while generating access and refresh tokens.")

}
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // 1. Validation for empty strings or missing fields
  if (
    [fullName, username, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // 3. Extract local file paths
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // 4. Upload Avatar (Required)
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(500, "Failed to upload avatar to cloud storage");
  }

  // 5. Upload Cover Image (Optional - strictly conditional)
  let coverImage = null;
  if (coverLocalPath) {
    coverImage = await uploadOnCloudinary(coverLocalPath);
  }

  // 6. Create User & Handle Database Errors with Rollback
  try {
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "User verification failed after registration");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    console.error("Database Registration Failure:", error);

    // Rollback uploaded assets if database save fails
    if (avatar?.public_id) {
      await deleteFromCloudinary(avatar.public_id);
    }

    if (coverImage?.public_id) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while registering user"
    );
  }
});


const loginUser = asyncHandler( async(req, res) => {
  // get a data from body
  const {username, email, password} = req.body

  //validation 
  if(!email){
    throw new ApiError(400, "Email is required")
  }

   // 2. Check if user already exists
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if(!user){
    throw new ApiError(404, "User not found")
  }


  // validate password

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid credentials ")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefershToken(user._id)

  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    if(!loggedInUser){
      throw new ApiError(400, "User is not loggedIn")
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }

    return res 
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json( new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken},
        "User logged in successfully"
      ))

})

const logoutUser = asyncHandler( async(res, res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      }
    },
    { new: true }   
  )
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {} , "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "Refresh token is required")
  }

  try {
   const decodedToken =  jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user =   await User.findById(decodedToken?._id)

    if(!user){
      throw new ApiError(401, "Invalid refresh Token");
    }

    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Invalid refresh token")
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }

  const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefershToken(user._id)

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
       new ApiResponse(
        200, 
        {accessToken, refreshToken: newRefreshToken}, 
        "Access token refreshed successfully."
      ));


  } catch (error) {
    throw new ApiError(500, "Something went wrong while refreshing access token.")
  }
})

export { registerUser, loginUser, refreshAccessToken , logoutUser};