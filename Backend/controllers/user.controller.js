import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Match } from "../models/match.model.js";
import { Discuss } from "../models/discuss.model.js";
import uploadToCloudinary from "../Utils/cloudinary.js";
import { Room } from "../models/room.model.js";
import {Feedback} from "../models/feedback.model.js"

const dashboardController = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) {
      throw new ApiError(404, "User Not Found in the request parameters");
    }

    const userData = await User.findOne({ username: username }).populate(
      "ratingHistory"
    );
    if (!userData) {
      throw new ApiError(404, "User Not Found");
    }

    const recentMatches = await Room.find({
      "participants.userId": userData._id,
    })
      .sort({ date: -1 })
      .limit(10); 

    const formattedRatings = userData.ratingHistory?.ratings || [];

    const formattedMatches = recentMatches.map((match) => {
      const userResult = match.participants.find(
        (r) => r.userId.toString() === userData._id.toString()
      );

      return {
        style: match.style,
        participants: match.participants.length,
        outcome: userResult?.outcome || "N/A",
        xpGained: userResult?.ratingChange || 0,
        date: match.date,
      };
    });

    const playstyle = await Room.aggregate([
      {
        $match: {
          "participants.userId": userData._id,
        },
      },
      {
        $group: {
          _id: "$style",
          countPlayStyle: { $sum: 1 },
        },
      },
      { $sort: { countPlayStyle: -1 } },
      { $limit: 1 },
    ]);

    res.status(200).json(
      new ApiResponse(200, "User Fetched !", {
        userid: userData._id,
        username: userData.username,
        title: userData.title,
        level: userData.level,
        xp: userData.xp,
        totalXp: userData.totalXp,
        currentRating: userData.currentRating,
        profileImage: userData.profilePicture,
        rank: userData.rank,
        totalBattles: userData.totalBattles,
        totalWin: userData.totalWins,
        winRatio: userData.totalBattles
          ? userData.totalWins / userData.totalBattles
          : 0,
        winStreak: userData.winStreak,
        maximumRatings: userData.highestRating,
        playstyle: playstyle[0]?._id || "random", // most played style
        recentMatches: formattedMatches,
        ratingHistory: formattedRatings,
      })
    );
  } catch (error) {
    next(error);
  }
};

const initialChangeRequest = async (req, res) => {
  try{
    const {clerkId, username} = req.body;

    if(!clerkId || !username) {
      throw new ApiError(200, "Required Fileds are not present in the request body")
    }

    console.log(username, clerkId)
    const user = await User.findOne({clerkId});

    if(!user) {
      throw new ApiError(
        200,
        "user not found"
      );
    }

    user.username = username;
    await user.save();
    
    res.status(200).json(new ApiResponse(200,"Updated the username successfully"));

  } catch (error) {
    throw new ApiError(200, error)
  }
}

const updateUserName = async (req, res, next) => {
  try {
    const { newUsername, username } = req.body;
      if (!newUsername || !username) {
        throw new ApiError(
          400,
          "Not sufficient information in the request body"
        );
      }

    const usernameAlreadyInUse = await User.findOne({ username: newUsername });
    if (usernameAlreadyInUse) {
      return res
        .status(200)
        .json("Username already in use", { message: "Username already in use" });
    }

    const currentUserDetails = await User.findOneAndUpdate(
      { username },
      { $set: { username: newUsername } },
      { new: true }
    );

    if (!currentUserDetails) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json(
      new ApiResponse(200, "Username Updated", {
        username: currentUserDetails.username,
      })
    );
  } catch (error) {
    next(error);
  }
};


const UpdateUserProfilePicture = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) {
      throw new ApiError(404, "User Not Found");
    }

    const profilePhotoLocalPath = req.file?.path;
    if (!profilePhotoLocalPath) {
      throw new ApiError(404, "profile image not found");
    }

    const profilePhotoUpdatedURL = await uploadToCloudinary(
      profilePhotoLocalPath
    );
    if (!profilePhotoUpdatedURL) {
      throw new ApiError(
        500,
        "There was an error while uploading the profile photo please try again later"
      );
    }

    const currentUser = await User.findOneAndUpdate(
      { username },
      {
        profilePicture: profilePhotoUpdatedURL,
      },
      {
        new: true,
      }
    );

    if (!currentUser) {
      throw new ApiError(404, "User Not Found");
    }


    res.status(200).json(
      new ApiResponse(200, "Profile photo updated successfully", {
        profilePicture: currentUser.profilePicture,
      })
    );
  } catch (error) {
    next(error);
  }
};

const leaderboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBattleFought = await Match.countDocuments();
    const top10 = await User.aggregate([
      { $sort: { currentRating: -1 } },
      { $limit: 10 },
      {
        $project: {
          level: 1,
          username: 1,
          currentRating: 1,
          title: 1,
          totalWins: 1,
          profilePicture: 1,
        },
      },
    ]);

    res.status(200).json(
      new ApiResponse(200, "LeaderBoard data fetched successfully! ", {
        totalUsers,
        totalBattleFought,
        top10,
      })
    );
  } catch (error) {
    next(error);
  }
};

const discussionDataFetcher = async (_, res, next) => {
  try {
    const discussionData = await Discuss.find({})
      .populate({
        path: "user",
        select: "username profilePicture level",
      })
      .populate({path:"reply.user", select:"username profilePicture"})
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(
      new ApiResponse(200, "Data Fetched Successfully", {
        discussionData,
      })
    );
  } catch (error) {
    next(error);
  }
};

const discussionDataUpation = async (req, res) => {
  const { post, username } = req.body;
  
  if(!post || !username) {
    throw new ApiError (404, "Post details not found in the request body");
  }

  const authorOfThePost = await User.findOne({username: username});

  if(!authorOfThePost) {
    throw new ApiError(404, "user not found");
  }

  const postDetails = {
    user: authorOfThePost._id,
    message: post,
    reply: {

    }
  };
  const createNewPost = await Discuss.create(postDetails)
  if(!createNewPost) {
    throw new ApiError (500, "internal server error while creating the post");
  }

  res.status(200).json(
    new ApiResponse(200, "Added the post successfully")
  )
}

const handlePostReply = async (req, res) => {
  try {
    const { postId, message, username } = req.body;
    if(!postId || !message || !username) {
      throw new ApiError(404, "Required information not found in the request body");
    }
  
    const userOfReply = await User.findOne({username})
  
    if(!userOfReply) {
      throw new ApiError(404, "user not found who is replying to the post")
    }
  
    const existingPost = await Discuss.findOne({_id: postId});
    if(!existingPost) {
      throw new ApiError(404, "Post not found")
    }
  
    const replyData = {
      user: userOfReply._id,
      message: message
    }
  
    existingPost.reply.push(replyData);
  
    await existingPost.save();
  
    res.status(200).json(new ApiResponse(200, "reply added"));
  } catch (error) {
    console.log(error)
    throw new ApiError(500, "an error occured", error)
  }
}

const feedbackController = async (req, res) => {
  try {
    const {name, email, rating, message} = req.body;
  if (!rating || !message) {
    throw new ApiError(
      404,
      "Required information is not found in the request body"
    );
  }

  const feedbackDetails = {
    name: name, email: email, rating: rating, message: message
  }
  const feedback = await Feedback.create(feedbackDetails);
  if(!feedback) {
    throw new ApiError(505, "internal server error please try agian later");
  }

  res.status(200).json(new ApiResponse(200, "Feedback added successfully"))
  } catch (err) {
    throw new ApiError(404, err)
  }
}

export {
  dashboardController,
  updateUserName,
  UpdateUserProfilePicture,
  leaderboardStats,
  discussionDataFetcher,
  discussionDataUpation,
  handlePostReply,
  initialChangeRequest,
  feedbackController,
};
