import mongoose from "mongoose"
import { Video, video } from "../models/video.models.js"
import { Subcription, Subscription } from "../models/subscription.models.js"
import { like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler( async (req, res) => {
    const userId = req.user._id

    // total video
    const totalVideos = await Video.countDocuments({
        owner: userId
    })

    //total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    })

    // total likes 
    const totalLikes = await Like.countDocuments({
        likedBy: userId
    })

    // total views
    const videos = await Video.find({
        owner: userId
    }).select("_id views")

    let totalViews = 0

    for(const video of videos){
        totalViews += video.views
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalSubscribers,
                totalLikes,
                totalViews
            },
            "Channel stats fetched successfully"
        )
    )
})


const getChannelVideos = asyncHandler(async(req, res) => {

    const userId = req.user._id

    const videos = await Video.find({
        owner: userId
    }).sort({
        createdAt: -1
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully."
        )
    )
})

export {
    getChannelStats,
    getChannelVideos
}