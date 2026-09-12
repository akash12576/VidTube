import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// create a tweet
const createTweet = asyncHandler( async (req, res) => {
    const {content} = req.body

    if(!content?.trim()){
        throw new ApiError(400, "Tweet content is required")
    }

    const tweet  = await Tweet.create({
        content, 
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully."
        )
    )
})


// get all tweet 
const getAllTweets = asyncHandler(async (req, res) => {
    const tweet = await Tweet.find()
        .populate("owner", "username fullname avatar")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            "Tweets fetched successfully."
        )
    ) 
})


// get tweet by id
const getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)
        .populate("owner", "username fullname avatar")

    
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet fetched successfully."
        )
    )
})


// Update tweet 
const updateTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet Id")
    }

    if(!content?.trim()){
        throw new ApiError(400, "Tweet content is required.")
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user._id
        },{
            $set: {
                content
            },
        },
        {
            new : true
        }
    )

    if(!tweet) {
        throw new ApiError(
            404,
            "Tweet not found or you are not owner."
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully."
        )
    )
})


// Delete tweet

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id
    })

    if(!tweet){
        throw new ApiError(
            404,
            "Tweet not found or you are not the owner."
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfuly."
        )
    )
})


export {
    createTweet,
    getAllTweets,
    getTweetById,
    updateTweet,
    deleteTweet
}