import { asyncHandler } from "../utils/async-Handler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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

export { registerUser };