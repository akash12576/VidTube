import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// create Playlist 
const createPlaylist = asyncHandler(async (req,res) => {
    const {name, description } = req.body

    const userId = req.user._id

    if(!name || name.trim() === ""){
        throw new ApiError(400, "Playlist name is required")
    }

    if(!description || description.trim() === ""){
        throw new ApiError(400, "Playlist description is reqired.")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId,
        videos: []
    })


    return res.status(201).json(
        new ApiResponse(
            201,
            playlist,
            "Playlist created successfully."
        )
    )
})



// gat user playlist

const getUserPlaylists = asyncHandler(async (req,res) => {
    const userId = req.user._id

    const playlists = await Playlist.find({
        owner: userId
    }).populate("videos")

    return res.status(200).json(
        new ApiResponse(
            200,
            playlists,
            "Playlists fetched successfully"
        )
    )
})


// get playlist by id

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully."
        )
    )
})


// Add video to playlist

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    const userId = req.user._id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found.")
    }

    //check playlist owner 

    if(!playlist.owner.toString() !== userId.toString()){
        throw new ApiError(
            403,
            "You are not allowed to modify this playlist."
        )
    }

    // check video exists
    const video = await Video.findById(videoID)

    if(!video){
        throw new ApiError(400, "video not found")
    }

    // check if video already exists
    if(playlist.videos.includes(videoId)){
        throw new ApiError(
            400,
            "Video Already exists in playlist"
        )
    }

    playlist.videos.push(videoId)

    await playlist.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video Added to playlist successfully"
        )
    )
})


// remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async(req,res) => {
    const { playlistId , videoID} = req.params

    const userId = req.user._id;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid  Playlist ID . ")
    }

    if(!isValidObjectId(videoID)){
        throw new ApiError(400, "Invalid video ID")
    }

    const palylist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    // check playlist owner
    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(
            403,
            "You are not allowed to modify this playlist"
        )
    }

    playlist.videos = playlist.videos.filter(
        (id) => id.toString() !== videoID.toString()
    )

    await playlist.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video removed from playlist successfully."
        )
    )
})


// Update playlist

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const {name, description} = req.body

    const userId = req.user._id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist ID")
    }

    if(!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required")
    }

    if(!description || description.trim() === ""){
        throw new ApiError(400, "Playlist description is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    if(playlist.owner.toString() !== user.toString()){

        throw new ApiError(
            403,
            "You are not allowed to update this playlist."
        )
    }

    playlist.name = name
    playlist.description = description

    await playlist.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist updated successfully."
        )
    )
})


// Delete Playlist 
const deletePlaylist = asyncHandler(async (req, res ) => {
    const {playlistId } = req.params

    const userId = req.user._id

    if(!playlist){
        throw new ApiError(
            403,
            "You are not allowed to delete this playlist "
        )
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted succesfully."
        )
    )
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
}