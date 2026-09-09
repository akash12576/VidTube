import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res)=>{
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page=1, limit=10} = req.query

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const skip = (page-1) * limit

    const comments = await Comment.find({video: videoId})
        .sort({craeated: -1})
        .skip(skip)
        .limit(limit)

    return res.status(200).json(
        new ApiResponse(
            200,-
            comments,
            "Comments fetched successfully"
        )
    )

})


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params
    const {content} = req.body

    const userId = req.user._id

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.create({
        content,
        video: viddeoId,
        owner: userId
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            comment,
            "Comment added successfully"
        )
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {videoId} = req.params
    const {content} = req.body

    const userId = req.user._id

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required ")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found" )
    }

    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not allowed to update this comment")
    }

    comment.content = content

    await comment.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment updated successfully"
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params

    const userId = req.user._id

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not allowed to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }