import mongoose, { isValidObjectId } from "mongoose"
import {Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// Toggle subscription

const toggleSubscription = asyncHandler( async (req, res) => {
    const {channelId} = req.params

    const subscriberId = req.user._id

    // check channel ID
    if( !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    //check if subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    // if already subscribed -> unsubcribed
    if(existingSubscription) {
        await Subscription.findByIdAndDelete(
            existingSubscription._id
        )

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Channel unsubscribed successfully"
            )
        )
    }

    //IF not subscribed -> subscribe
    const subscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            subscription,
            "Channel subscribed successfully."
        )
    )

})

    // Get all subscribers of a channel
    const getUserChannelSubscribers = asyncHandler(async (req, res) => {
        const {channelId} = req.params

        if(!isValidObjectId(channelId)){
            throw new ApiError(400, "Invalid channel ID")
        }

        const subscribers = await Subscription.find({
            channel: channelId
        }).populate(
            "subscriber",
            "username fullname avatar"
        )

        return res.status(200).json(
            new ApiResponse(
                200,
                subscribers,
                "Channel subscribers fetched succesfully."
            )
        )
    })


    // Get channel that current user subscribed to
    const getSubscribedChannels = asyncHandler(async(req, res) => {
        const userId = req.user._id

        const subscriptions = await Subscription.find({
            subscriber: userId
        }).populate(
            "channel",
            "username fullname avatar"
        )

        return res.status(200).json(
            new ApiResponse(
                200,
                subscriptions,
                "Subscribed channels fetched successfully"
            )
        )
    })

export {
    toggleSubscription,
    getSubscribedChannels,
    getSubscribedChannels,
    getUserChannelSubscribers
}