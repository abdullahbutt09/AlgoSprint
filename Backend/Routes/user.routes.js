import { Router } from "express";
import { dashboardController } from "../controllers/user.controller.js";
import { leaderboardStats } from "../controllers/user.controller.js";
import { discussionDataFetcher } from "../controllers/user.controller.js";
import { QuestionFetcher } from "../controllers/codingRooms.controller.js";
import { mcqQuestionFetcher } from "../controllers/mcqRooms.controller.js";
import { CreateRoom } from "../controllers/codingRooms.controller.js";
import { findQuestionFromBackend } from "../controllers/codingRooms.controller.js";
import { updateUserName } from "../controllers/user.controller.js";
import { joinRoomHandler } from "../controllers/codingRooms.controller.js";
import { updateRoomDetails } from "../controllers/codingRooms.controller.js";
import { createMcqRoom } from "../controllers/mcqRooms.controller.js";
import { mcqRoomJoiningHandler } from "../controllers/mcqRooms.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { updateMcqRoomDetails } from "../controllers/mcqRooms.controller.js";
import { findMcqQuestionsFromBackend } from "../controllers/mcqRooms.controller.js";
import { UpdateUserProfilePicture } from "../controllers/user.controller.js";
import { discussionDataUpation } from "../controllers/user.controller.js";
import { updateRoomParticipantsDetails } from "../controllers/codingRooms.controller.js";
import { fetchParticipants } from "../controllers/codingRooms.controller.js";
import { updateMcqRoomParticipantDetails } from "../controllers/mcqRooms.controller.js";
import { fetchmcqParticipants } from "../controllers/mcqRooms.controller.js";
import { findRoomSetting } from "../controllers/codingRooms.controller.js";
import dotenv from "dotenv"
import { fetchRoomTitle } from "../controllers/mcqRooms.controller.js"
import { clerkMiddleware} from "@clerk/express";
import {handlePostReply} from "../controllers/user.controller.js"
import { initialChangeRequest } from "../controllers/user.controller.js";
import { feedbackController } from "../controllers/user.controller.js";

dotenv.config();

const router = Router();
router.use(clerkMiddleware());

// ******************* PROFILE ROUTES ***************************//
router.route("/user/feedback").post(feedbackController);
router.route("/user/dashboard").get(dashboardController);
router.route("/user/leaderboard").get(leaderboardStats);
router
  .route("/user/updatename")
  .post(updateUserName);
router.route("/user/updateinitialusername").post(initialChangeRequest);
router
  .route("/user/discussion")
  .get(discussionDataFetcher);
router
  .route("/user/updateDiscussion")
  .post(discussionDataUpation);
router
router
  .route("/user/addReply").post(handlePostReply)
  router
  .route("/user/updateuserprofilepicture")
  .post(upload.single("profilePic"), UpdateUserProfilePicture);

// ******************* CODING ROOM ROUTES ***************************//
router
  .route("/user/rooms/createNewRoom")
  .post(CreateRoom);
router.route("/user/rooms/joinRoom").post(joinRoomHandler);
router.route("/user/codingrooms/arena/problems").get(QuestionFetcher);
router.route("/user/codingrooms/updateRoomDetails").post(updateRoomDetails);
router.route("/user/codingroomsettings").get(findRoomSetting);
router.route("/user/rooms/participants").get(fetchParticipants);
router
  .route("/user/codingrooms/updateparticipantsdetails")
  .post(updateRoomParticipantsDetails);
router
  .route("/user/codingrooms/arena/getProblems")
  .get(findQuestionFromBackend);


// ******************* MCQ ROOM ROUTES ***************************//
router.route("/user/mcqroom/arena/topic/problems").get(mcqQuestionFetcher);
router.route("/user/mcqrooms/createmcqroom").post(createMcqRoom);
router.route("/user/mcqrooms/joinmcqroom").post(mcqRoomJoiningHandler);
router.route("/user/mcqRoomTopics").get(fetchRoomTitle);
router.route("/user/mcqrooms/updateroomdetails").post(updateMcqRoomDetails);
router
  .route("/user/mcqrooms/updateroomparticipantsdetails")
  .post(updateMcqRoomParticipantDetails);
router
  .route("/user/mcqrooms/arena/getProblems")
  .get(findMcqQuestionsFromBackend);
router.route("/user/mcqrooms/getmcqparticipants").get(fetchmcqParticipants);

export default router;
