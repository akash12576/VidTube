import { isValidObjectId } from "mongoose";
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



// Get all videos 
const getAllVideos = asyncHandler( async(req,res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query


    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    const filter = {
        isPublished: true
    }

    // Search by title or description
    if(query) {
        filter:$or = [
            {title: { $regex: query, $options: "i"}},
            {description: { $regex: query, $options: "i"}},
            
        ]
    }

    // get videos of a particular user
    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid User ID")
        }
        filter.owner = userId
    }

    const sortOrder = await Video.find(filter)
        .populate("owner", "username fullname avatar")
        .sort({ [sortBy]: sortOrder })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)

    const totalVideos = await Video.countDocuments(filter)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                page: pageNumber,
                limit: limitNumber,
                totalVideos,
                totalPages: Math.ceil(totalVideos / limitNumber)
            },
            "videos fetched successfully"
        )
    )
})

// Publish a video
const publishAVideo = asyncHandler(async (req,res) => {
    const { title, description} = req.body

    if(!title?.trim()){
        throw new ApiError(400, "Title is required")
    }

    if(!description?.trim()){
        throw new ApiError(400, "Description is required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!videoFileLocalPath){
        throw new ApiError(400, "video file is required")
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)

    if(!videoFile){
        throw new ApiError(500, "video upload failed")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(500, "Thumbnail upload failed")
    }

    const video = await video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            video,
            "Video published successfully"
        )
    )
})


// get video by id
const getVideobyId = asyncHandler(async (req,res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
        .populate("owner", "username fullname avatar")

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "video fetched succssfully"
        )
    )
})


// Update video
const UpdateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await video.findOne({
        _id: videoId,
        owner: req.user._id
    })

    if(!video){
        throw new ApiError(
            404,
            "Video not found or you are not the owner."
        )
    }

    if(title){
        video.title = title
    }

    if(description){
        video.description = description
    }

    // Update thumbnail if new thumbnail is provided
    const thumbnailLocalPath = req.file?.path

    if(thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if(!thumbnail){
            throw new ApiError(500, "Thumbnail upload failed")
        }

        video.thumbnail = thumbnail.url
    }

    await video.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video upload successfully"
        )
    )
})


// Delete video 
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
    })

    if(!video) {

        throw new ApiError(
            404,
            "Video not found or you are not the owner."
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully."
        )
    )
})


// Toggle publish status

const togglePublishStatus = asyncHandler(async (req,res) => {
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await video.findOne({
        _id: videoId,
        owner: req.user._id
    })

    if(!video){
        throw new ApiError(
            404,
            "Video not found or you are not the owner."
        )
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            video.isPublished
                ? "Video published successfully"
                : "Video unpublished successfully"
        )
    )
})


export {
    getAllVideos,
    publishAVideo,
    getVideobyId,
    UpdateVideo,
    deleteVideo,
    togglePublishStatus
}