import Avatar from "react-avatar";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { initialiseSocket } from "../../socket.io";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import lobbybackground from "../../assets/images/lobbyBackground.png";

const CodingLobby = () => {
  const [players, setPlayers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [topic, setTopic] = useState("");
  const [questionsFetched, setQuestionsFetched] = useState(false);

  const socketRef = useRef();
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const roomid = params.roomid;
  const username = location.state?.username;
  const realUsername = location.state?.realUsername;
  const time = location.state?.time || " ";


  useEffect(() => {
    const findRoomTopic = async () => {
      try {
        const res = await axios.get(
          "https://algosprint-vxi4.onrender.com/api/v1/user/mcqRoomTopics",
          { params: { roomid } }
        );
        setTopic(res.data.data.topic); 
      } catch (err) {
        console.log("Error fetching topic", err);
      }
    };
    findRoomTopic();
  }, [roomid]);


  useEffect(() => {
    const connectSocket = async () => {
      socketRef.current = await initialiseSocket();

      socketRef.current.emit("userJoin", { roomid, username });

      const handleError = (err) => {
        console.error("Socket error:", err);
        toast.error("Socket connection failed, try again later");
        navigate(`/${username}/mcqrooms`, { replace: true });
      };

      socketRef.current.on("connect_error", handleError);
      socketRef.current.on("connect_failed", handleError);

      socketRef.current.on("userJoined", ({ connectedPlayers, user }) => {
        if (user !== username) {
          toast.success(`${user} joined the room`);
        } else {
          toast.success(`You joined the room`);
        }

        setPlayers(
          connectedPlayers.map((elem) => ({
            socketId: elem.socketId,
            name: elem.username,
            ready: false,
            avatar: <Avatar name={elem.username} size="50" round={true} />,
          }))
        );
      });

      socketRef.current.on("ready", ({ username }) => {
        setPlayers((prev) =>
          prev.map((player) =>
            player.name === username
              ? { ...player, ready: !player.ready }
              : player
          )
        );
      });

      socketRef.current.on("user-disconnected", ({ username, socketId }) => {
        setPlayers((prev) => prev.filter((user) => user.socketId !== socketId));
        toast.success(`${username} left the room`);
      });
    };

    connectSocket();

    return () => {
      socketRef.current.emit("leave", { username, roomid });
      socketRef.current?.disconnect();
    };
  }, [roomid, username, navigate]);

  const handleReadyLogic = () => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.name === username ? { ...player, ready: !player.ready } : player
      )
    );
    socketRef.current.emit("ready", { roomid, username });
  };

  useEffect(() => {
    if (players.length < 2) return;

    const allReady = players.every((p) => p.ready);
    if (!allReady || questionsFetched) return;

    const fetchQuestionsAndStart = async () => {
      try {
        const res = await axios.get(
          `https://algosprint-vxi4.onrender.com/api/v1/user/mcqroom/arena/topic/problems`,
          { params: { topic } }
        );

        const mcqQuestions = res.data.data.Questions;
        await axios.post(
          "https://algosprint-vxi4.onrender.com/api/v1/user/mcqrooms/updateroomdetails",
          { roomCode: roomid, questions: mcqQuestions }
        );

        setQuestionsFetched(true);

        navigate(`/mcqrooms/${roomid}/arena`, {
          state: {
            username,
            startTime: Math.floor(Date.now() / 1000),
            topic,
            roomid,
            totalParticipants: players.length,
            realUsername,
          },
        });
      } catch (err) {
        console.log("Error fetching questions", err);
        toast.error("Failed to fetch questions");
      }
    };

    fetchQuestionsAndStart();
  }, [
    players,
    topic,
    roomid,
    navigate,
    username,
    realUsername,
    questionsFetched,
  ]);

  const handleCopyRoomId = async () => {
    await navigator.clipboard.writeText(roomid);
    setCopied(true);
    toast.success("Room ID copied!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      className="min-h-screen relative font-[Inter] text-zinc-900 dark:text-zinc-100"
      style={{
        backgroundImage: `url(${lobbybackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 px-10 py-2 animate-in fade-in duration-1000 max-w-4xl mx-auto">
        <div className="border border-zinc-200 dark:border-zinc-800 p-8 rounded-xl shadow-sm mt-2">
          <h1 className="text-center text-4xl font-extrabold px-4 text-white uppercase tracking-tight">
            Waiting Lobby
          </h1>
          <p className="text-center text-sm text-zinc-500 font-medium mt-2">
            At least 2 coders are needed to begin the battle
          </p>

          <div className="mt-2 mb-6 backdrop-blur-sm bg-black/10 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm w-fit mx-auto">
            <div className="text-center flex items-center gap-8 font-bold justify-center text-zinc-800 dark:text-zinc-200">
              <p className="flex flex-col"><span className="text-xs text-zinc-300 uppercase tracking-widest">Topic</span> <span className="text-lg text-zinc-400">{topic}</span></p>
              <div className="w-[1px] h-8 bg-zinc-200"></div>
              <p className="flex flex-col"><span className="text-xs text-zinc-300 uppercase tracking-widest">Time</span> <span className="text-lg text-zinc-400">{time}</span></p>
            </div>
          </div>

          <div
            className="flex border border-zinc-200 dark:border-zinc-800 h-[40vh] overflow-y-auto max-w-[600px] mx-auto flex-wrap 
               items-center justify-center px-8 m-10 mt-4 mb-4 rounded-xl
               backdrop-blur-sm bg-black/20 shadow-inner gap-4"
          >
            {players.map((elem, idx) => (
              <div key={idx} className="basis-[24%] text-center flex flex-col items-center">
                <div className={`rounded-full p-1 border-2 transition-colors duration-300 ${elem.ready ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"}`}>
                  {elem.avatar}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`w-2 h-2 rounded-full ${elem.ready ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"}`}></span>
                  <p
                    className={`text-sm font-semibold tracking-wide ${
                      elem.ready ? "text-green-600 dark:text-green-400" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {elem.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="font-bold text-xs pb-4 text-center text-zinc-500 tracking-widest uppercase">
            Coders Joined : <span className="text-zinc-900 dark:text-zinc-100 text-sm ml-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full">{players.length}</span>
          </div>

          <div className="flex items-center gap-4 justify-center">
            <Button
              className={`border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer px-8 py-4 text-lg rounded-xl transition-all duration-300 ${players.find((player) => player.name === username)?.ready ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700" : "bg-green-600 hover:bg-green-700 text-white"}`}
              variant="outline"
              onClick={handleReadyLogic}
            >
              {players.find((p) => p.name === username)?.ready ? "Cancel Ready" : "Ready to Battle"}
            </Button>
            <Button
              className="shadow-sm cursor-pointer rounded-xl px-6 py-4 border border-red-200 dark:border-red-900 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
              variant="outline"
              onClick={() => {
                toast.success("Left the room successfully!");
                navigate(`/${username}/mcqrooms`, { replace: true });
              }}
            >
              Leave Room
            </Button>
            <Button
              className="shadow-sm cursor-pointer bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl px-6 py-4"
              onClick={handleCopyRoomId}
            >
              {copied ? "Copied!" : "Copy Room ID"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingLobby;
