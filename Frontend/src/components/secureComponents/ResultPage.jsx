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
          { params: { roomid } }
        );

        const participants = response.data.data.participants
          .filter((p) => p.finished === true)
          .map((p, index) => {
            let t = p.timeTaken;
            const h = Math.floor(t / 3600); t %= 3600;
            const m = Math.floor(t / 60);
            const s = t % 60;
            return {
              ...p,
              position: index + 1,
              formattedTime: `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`,
            };
          });

        setUserFinished(participants);
      } catch (error) {
        console.error("Error fetching room participants:", error);
      }
    };

    // Initial fetch
    fetchRoomParticipants();

    // Poll every 5 seconds so new finishers appear without needing a refresh
    const pollInterval = setInterval(fetchRoomParticipants, 5000);

    return () => clearInterval(pollInterval);
  }, [roomid]);



  return (
    <div className="font-[Inter] py-10 bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100">
      <h1 className="text-4xl font-extrabold text-center uppercase tracking-tight mb-4">
        Result
      </h1>
      <p className="text-lg text-center text-zinc-500 mb-10">
        The rankings will take up to 3 working days to reflect in your profile
      </p>

      <div className="flex-col justify-center items-center w-fit mx-auto mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-center text-zinc-500 mb-2">Time Left Before Room Ends</p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl mx-auto px-6 py-4 shadow-sm w-fit">
          <CountdownTimer initialSeconds={timeLeft > 0 ? timeLeft : 0} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto rounded-xl p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Table className="border-collapse w-full">
          <TableCaption className="text-zinc-500 font-semibold mb-4">
            Users Finished
          </TableCaption>
          <TableHeader className="bg-zinc-100 dark:bg-zinc-800">
            <TableRow className="border-b border-zinc-200 dark:border-zinc-700">
              <TableHead className="w-[10%] text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider">Rank</TableHead>
              <TableHead className="w-[25%] text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider">User</TableHead>
              <TableHead className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider">Qscore</TableHead>
              <TableHead className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider">Time Taken</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userFinished.map((elem, idx) => (
              <TableRow
                key={idx}
                className={`text-start border-b border-zinc-100 dark:border-zinc-800 last:border-none transition-colors duration-200 ${
                  elem.username === realUsername
                    ? "bg-zinc-50 dark:bg-zinc-800/50"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <TableCell
                  className={`py-3 ${
                    elem.username === realUsername
                      ? "font-bold text-zinc-900 dark:text-zinc-100 border-l-4 border-zinc-900 dark:border-zinc-100"
                      : "text-zinc-700 dark:text-zinc-300 font-medium pl-4"
                  }`}
                >
                  {elem.position === 1 ? "🥇 " : elem.position === 2 ? "🥈 " : elem.position === 3 ? "🥉 " : ""}
                  {elem.position}
                </TableCell>
                <TableCell
                  className={`py-3 ${
                    elem.username === realUsername
                      ? "font-bold text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-700 dark:text-zinc-300 font-medium"
                  }`}
                >
                  {elem.username}
                  {elem.username === realUsername && <span className="ml-2 text-[10px] uppercase font-bold tracking-widest bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2 py-0.5 rounded-sm">You</span>}
                </TableCell>
                <TableCell
                  className={`py-3 ${
                    elem.username === realUsername
                      ? "font-bold text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-700 dark:text-zinc-300 font-medium"
                  }`}
                >
                  {elem.score}
                </TableCell>
                <TableCell
                  className={`py-3 ${
                    elem.username === realUsername
                      ? "font-bold text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-700 dark:text-zinc-300 font-medium"
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
            variant="outline"
            size="sm"
            className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
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
