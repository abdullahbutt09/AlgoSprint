import { useState } from "react";
import { FaRestroom } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuid } from "uuid";
import { Label } from "@/components/ui/label";
import Loader from "../Loader"
import {useAuth, useUser} from "@clerk/clerk-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate, useParams }  from "react-router-dom";
import axios from "axios";

const CodingRooms = () => {

  const {getToken} = useAuth()
  const [activeCard, setActiveCard] = useState("create");
  const [username, setUsername] = useState("");
  const[loading, setLoading] = useState(false);
  const [roomid, setRoomid] = useState("");

  const timeMapping = {
      rapid: 3600,
      flash: 1800,
      classical: 7200,
    };
  
  
  const [settings, setSettings] = useState({
    playStyle: "rapid",
    numberOfProblems: 2,
    time: timeMapping["rapid"],
  });

  const user = useUser();
  const params = useParams();
  const realUsername = params.username;
  const navigate = useNavigate();
  if (!user) {
    return;
  }


  if (user.user.username !== realUsername) {
    console.log("Not your component you are being redirected...")
    navigate(`/${user.user.username}/codingrooms`);
  }


  const handleUuid = () => {
    const id = uuid();
    setRoomid(id);
  };

  const handleCreateLogic = async () => {
    try {
      setLoading(true)
      const token = await getToken();
      if (!token) {
        toast.error("No auth token found. Please sign in again.");
        return;
      }

      await axios.post(
        "https://algosprint-vxi4.onrender.com/api/v1/user/rooms/createNewRoom",
        {
          roomCode: roomid,
          username: realUsername,
          style: settings.playStyle,
          numberOfQuestions: settings.numberOfProblems,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setLoading(false)

      navigate(`/codingroom/${roomid}/lobby`, {
        state: {
          realUsername,
          username,
          settings,
          redirectedFrom: "codingRoom",
        },
      });
    } catch (err) {
      console.error("Error creating room:", err);
      toast.error(
        err.response?.data?.message || err.message || "Something went wrong"
      );
      setLoading(false);
    }
  };


  const handleJoinLogic = async () => {
    if (!username || !roomid) {
      toast.error("Please enter a username and room ID");
      return;
    }

    setLoading(true)

    const token = await getToken();
    if (!token) {
      toast.error("No auth token found. Please sign in again.");
      return;
    }

    const response = await axios.post(
      "https://algosprint-vxi4.onrender.com/api/v1/user/rooms/joinRoom",
      {
        roomCode: roomid,
        username: realUsername,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.message !== "Room joined successfully") {
      toast.error("there was some error while joining the room try again later");
      return;
    }
      navigate(`/codingroom/${roomid}/lobby`, {
        state: {
          realUsername,
          username,
          settings,
          redirectedFrom: "codingRoom",
        },
      });

      setLoading(false)
  }

  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white transition-colors duration-300 dark:bg-zinc-950 font-[Inter] p-8 h-screen relative overflow-hidden">
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm relative z-10 mb-8">
        <div className="flex gap-4 items-center">
          <div className="bg-white shadow-sm dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-4 text-3xl rounded-xl text-zinc-900 dark:text-zinc-100">
            <FaRestroom />
          </div>
          <div className="">
            <h1 className="text-xl font-[Inter] text-black dark:text-white font-bold">
              Coding Room
            </h1>
            <p
              className={`text-[#4a5568]  dark:text-[#A0AEC0] text-[12px] tracking-tight w-2/3 `}
            >
              Challenge and compete with your friends and colleagues in an environment built for focus and speed.
            </p>
          </div>
        </div>
      </div>
      <div className="flex px-4 gap-6 h-[75%] transition-all relative z-10 max-w-6xl mx-auto">
        <div
          onClick={() => setActiveCard("create")}
          className={`flex-1 flex flex-col justify-center items-center px-12 rounded-xl cursor-pointer transition-all duration-500 ease-in-out border border-zinc-200 dark:border-zinc-800
          ${activeCard === "create" ? "flex-[4] shadow-md bg-zinc-50 dark:bg-zinc-900" : "flex-[1] opacity-70 hover:opacity-100 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900"} 
          text-zinc-900 dark:text-zinc-100`}
        >
          <h2 className={`text-2xl font-bold mb-4 uppercase tracking-wide transition-all duration-500 ${activeCard === "create" ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500"}`}>Create Room</h2>
          <div
            className={`text-center    ${
              activeCard === "create" ? "inline" : "hidden"
            }`}
          >
            <p className={`text-center`}>
              Create your own personalised room and invite friends to compete
              and grow together in an competetive environment
            </p>

            <div className="flex flex-col mt-12">
              <div className="flex p-2 items-center gap-2">
                <label htmlFor="name" className="text-md">
                  username
                </label>
                <Input
                  id="name"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="enter space name"
                  required
                />
              </div>
              <div className="flex p-2 items-center gap-2">
                <label htmlFor="name" className="w-[20%] text-md">
                  room id
                </label>
                <Input
                  id="roomid"
                  type="text"
                  value={roomid}
                  onChange={(e) => setRoomid(e.target.value)}
                  placeholder="enter space id"
                  required
                  className="px-2"
                />
              </div>

              <p className="text-[12px] mt-6">
                genrate a random id
                <span
                  className="text-cyan-500 cursor-pointer underline"
                  onClick={() => {
                    handleUuid();
                  }}
                >
                  &nbsp;here
                </span>
              </p>
              <div className="flex items-center justify-between gap-2">
                <Dialog className="" open={open}>
                  <DialogTrigger asChild onClick={() => setOpen(true)}>
                    <p className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer p-2 mt-3 w-full rounded-md text-center font-medium shadow-sm">
                      Customize settings
                    </p>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold">
                        Game Settings
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                      <Label>PlayStyle</Label>
                      <Select
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            playStyle: value,
                            time: timeMapping[value],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose PlayStyle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flash">Flash - 30 mins</SelectItem>
                          <SelectItem value="rapid">Rapid - 1Hrs</SelectItem>
                          <SelectItem value="classical">
                            Classical - 2 hrs
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Number of Problems</Label>
                      <Select
                        onValueChange={(value) =>
                          setSettings({ ...settings, numberOfProblems: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Number of Problems" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full mt-4 rounded-2xl shadow-md"
                      onClick={() => setOpen(false)}
                    >
                      Save Settings
                    </Button>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="personal"
                  className="w-1/2 mt-4"
                  onClick={() => handleCreateLogic("create")}
                >
                  {loading ? <Loader /> : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveCard("join")}
          className={`flex-1 flex flex-col justify-center items-center px-12 rounded-xl cursor-pointer transition-all duration-500 ease-in-out border border-zinc-200 dark:border-zinc-800
          ${activeCard === "join" ? "flex-[4] shadow-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black" : "flex-[1] opacity-70 hover:opacity-100 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100"} 
          `}
        >
          <h2 className={`text-2xl font-bold mb-4 uppercase tracking-wide transition-all duration-500 ${activeCard === "join" ? "" : "text-zinc-500"}`}>Join Room</h2>
          <div
            className={`text-center transition-all   ${
              activeCard === "join" ? "inline" : "hidden"
            }`}
          >
            <p className={`text-center`}>
              Join any public room by entering room id and start competing with
              your friends in a competetive environment
            </p>

            <div className="flex flex-col mt-12">
              <div className="flex p-2 items-center gap-2">
                <label htmlFor="name" className="text-md">
                  username
                </label>
                <Input
                  id="name"
                  className={`${activeCard === "join" ? "placeholder:text-zinc-500 dark:placeholder:text-zinc-500 border-zinc-700 dark:border-zinc-300" : ""}`}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="enter space name"
                  required
                />
              </div>
              <div className="flex p-2 items-center gap-2">
                <label htmlFor="name" className="w-[20%] text-md">
                  room id
                </label>
                <Input
                  id="roomid"
                  type="text"
                  value={roomid}
                  onChange={(e) => setRoomid(e.target.value)}
                  placeholder="enter space id"
                  required
                  className={`px-2 ${activeCard === "join" ? "placeholder:text-zinc-500 dark:placeholder:text-zinc-500 border-zinc-700 dark:border-zinc-300" : ""}`}
                />
              </div>

              <p className="text-[12px] mt-6">
                Don't have a room id?
                <span
                  className={`${activeCard === "join" ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500"} cursor-pointer underline`}
                  onClick={() => {
                    setActiveCard("create");
                  }}
                >
                  Try creating a room
                </span>
              </p>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  handleJoinLogic(username, "join");
                }}
              >
                {loading ? <Loader /> : <p>Join</p>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingRooms;
