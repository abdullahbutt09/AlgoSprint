import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { initialiseSocket } from "../../socket.io";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CountdownTimer from "../Stopwatch";

const ResultPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const roomid = params.roomid;
  const score = location.state.score;
  const timeTake = location.state.timeTaken;
  const startTime = location.state.startTime;
  const realUsername = location.state?.realUsername;
  const totalTime = location.state?.time || 120;

  const [userProfile, setUserProfile] = useState({});
  const [userFinished, setUserFinished] = useState([]);

  const timeLeft = startTime + totalTime - Math.floor(Date.now() / 1000);

  useEffect(() => {
    document.documentElement.classList.add("light")
  }, [])

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `https://algosprint-vxi4.onrender.com/api/v1/user/dashboard`,
          {
            params: {
              username: realUsername,
            },
          }
        );
        setUserProfile(res.data.data);
      } catch (err) {
        console.log("An error occurred fetching user profile", err);
      }
    };
    fetchUserProfile();
  }, [realUsername]);
  useEffect(() => {
    if (!userProfile.username) return;

    const connectToSockets = async () => {
      socketRef.current = await initialiseSocket();

      socketRef.current.emit("userFinished", {
        roomid,
        username: realUsername,
        score,
        timeTaken: timeTake,
      });

      socketRef.current.on(
        "playerConnectedToTheWaitingArea",
        async ({ newPlayerData, allWaitingPlayers }) => {
          try {
            await axios.post(
              `https://algosprint-vxi4.onrender.com/api/v1/user/codingrooms/updateparticipantsdetails`,
              {
                roomCode: String(roomid),
                participantTimeTaken: String(newPlayerData.timeTaken),
                participantUsername: newPlayerData.username,
                participantScore: newPlayerData.score,
              }
            );
          } catch (error) {
            console.error("Error managing room:", error);
          }

          setUserFinished((prev) => {
            const exists = prev.find(
              (p) => p.username === newPlayerData.username
            );
            if (exists) return prev;
            let timeTakenInSeconds = newPlayerData.timeTaken;
            const hours = Math.floor(timeTakenInSeconds / 3600);
            timeTakenInSeconds %= 3600;
            const minutes = Math.floor(timeTakenInSeconds / 60);
            const seconds = timeTakenInSeconds % 60;

            const formattedTime = `${hours
              .toString()
              .padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

            const updatedList = [
              ...prev,
              {
                ...newPlayerData,
                formattedTime,
                finished: true,
              },
            ];

            updatedList.sort(
              (a, b) => b.score - a.score || a.timeTaken - b.timeTaken
            );

            return updatedList.map((p, index) => ({
              ...p,
              position: index + 1,
            }));
          });
        }
      );

      socketRef.current.on("connect_error", (err) =>
        console.log("Socket error:", err)
      );
      socketRef.current.on("connect_failed", (err) =>
        console.log("Socket failed:", err)
      );
    };

    connectToSockets();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveTheWaitingArea", {
          username: realUsername,
          roomid,
        });
        socketRef.current.disconnect();
      }
    };
  }, [userProfile, roomid, realUsername, score, timeTake]);

  useEffect(() => {
  const fetchRoomParticipants = async () => {
    try {
      const response = await axios.get(
        `https://algosprint-vxi4.onrender.com/api/v1/user/rooms/participants`,
        {
          params: { roomid },
        }
      );

      const participants = response.data.data.participants
        .filter((participant) => participant.finished === true)
        .map((participant, index) => {
          let timeTakenInSeconds = participant.timeTaken;
          const hours = Math.floor(timeTakenInSeconds / 3600);
          timeTakenInSeconds %= 3600;
          const minutes = Math.floor(timeTakenInSeconds / 60);
          const seconds = timeTakenInSeconds % 60;

          const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

          return {
            ...participant,
            position: index + 1,
            formattedTime,
          };
        });

      setUserFinished(participants);
    } catch (error) {
      console.error("Error fetching room participants:", error);
    }
  };

  fetchRoomParticipants();
}, [roomid]);


  return (
    <div className="font-[Inter] py-10 bg-gradient-to-br from-cyan-50 to-cyan-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-cyan-900 mb-4">
        Result
      </h1>
      <p className="text-lg text-center text-cyan-700/80 mb-10">
        The rankings will take up to 3 working days to reflect in your profile
      </p>

      <div className="flex-col justify-center items-center w-fit mx-auto">
        <p className="text-base font-bold">Time Left Before Room Ends</p>
        <div className=" dark:bg-gray-800 rounded-xl mx-auto pb-6 w-fit">
          <CountdownTimer initialSeconds={timeLeft > 0 ? timeLeft : 0} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto rounded-xl p-6 bg-white dark:bg-gray-800 shadow-lg">
        <Table className="border-collapse w-full">
          <TableCaption className="text-cyan-700 font-semibold mb-4">
            Users Finished
          </TableCaption>
          <TableHeader className="bg-cyan-100">
            <TableRow>
              <TableHead className="w-[10%] text-cyan-900">Rank</TableHead>
              <TableHead className="w-[25%] text-cyan-900">User</TableHead>
              <TableHead className="text-cyan-900">Qscore</TableHead>
              <TableHead className="text-cyan-900">Time Taken</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userFinished.map((elem, idx) => (
              <TableRow
                key={idx}
                className="text-start border-b last:border-none hover:bg-cyan-50 transition-colors"
              >
                <TableCell
                  className={`py-2 ${
                    elem.username === realUsername
                      ? "font-bold text-cyan-800 bg-green-300 backdrop-blur-2xl"
                      : "text-cyan-700"
                  }`}
                >
                  {elem.position}
                </TableCell>
                <TableCell
                  className={`py-2 ${
                    elem.username === realUsername
                      ? "font-bold text-cyan-800 bg-green-300 backdrop-blur-2xl"
                      : "text-cyan-700"
                  }`}
                >
                  {elem.username}
                </TableCell>
                <TableCell
                  className={`py-2 ${
                    elem.username === realUsername
                      ? "font-bold text-cyan-800 bg-green-300 backdrop-blur-2xl"
                      : "text-cyan-700"
                  }`}
                >
                  {elem.score}
                </TableCell>
                <TableCell
                  className={`py-2 ${
                    elem.username === realUsername
                      ? "font-bold text-cyan-800 bg-green-300 backdrop-blur-2xl"
                      : "text-cyan-700"
                  }`}
                >
                  {elem.formattedTime}s
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="w-fit mx-auto mt-6">
          <Button
            variant="personal"
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium shadow-md"
            onClick={() => navigate(`/${realUsername}/dashboard`)}
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );

};

export default ResultPage;
