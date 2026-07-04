import { GiMultipleTargets } from "react-icons/gi";
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { v4 as uuid } from "uuid";
import { useState } from "react"
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import javaLogo from "../../assets/images/javaLogo.png";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "../Loader"
import {useUser} from "@clerk/clerk-react"

const McqRooms = () => {

  const params = useParams();
  const navigate = useNavigate();
  const realUsername = params.username;
  const [roomid, setRoomid] = useState("");
  const [loading, setLoading] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const user = useUser();
  const [joinLoading, setJoinLoading] = useState(false);
  const handleUuid = () => {
    const id = uuid();
    return id;
  };

  if (!user) {
    return;
  }
 if (user.user.username !== realUsername) {
   console.log("Not your component you are being redirected...");
   navigate(`/${user.user.username}/codingrooms`);
 }

  
  const quizList = [
    {
      name: "C++",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: "https://cdn.simpleicons.org/cplusplus/00599C",
    },
    {
      name: "Java",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: javaLogo,
    },
    {
      name: "JavaScript",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: "https://cdn.simpleicons.org/javascript/F7DF1E",
    },
    {
      name: "Python",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: "https://cdn.simpleicons.org/python/3776AB",
    },
    {
      name: "C",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: "https://cdn.simpleicons.org/c/00599C",
    },
    {
      name: "PHP",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: "https://cdn.simpleicons.org/php/777BB4",
    },
    {
      name: "Go",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: "https://cdn.simpleicons.org/go/00ADD8",
    },
    {
      name: "SQL",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: "https://cdn.simpleicons.org/mysql/4479A1",
    },
    {
      name: "Mongo DB",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: "https://cdn.simpleicons.org/mongodb/47A248",
    },
    {
      name: "Data Structures",
      Questions: "20",
      time: "20 minutes",
      reward: "15xp",
      imageURL: "https://cdn.simpleicons.org/leetcode/F89F1B",
    },
  ];

  const handleCreateLogic = async (event, idx) => {

    setLoading((prev) => prev.map((elem, index) => (
      index === idx ? true : false
    )));
    const roomid = handleUuid();

    if (!realUsername || !roomid) {
      toast.error("Please enter a username and room ID");
      return;
    }

    console.log("topic is", event)

    const response = await axios.post(
      "https://algosprint-vxi4.onrender.com/api/v1/user/mcqrooms/createmcqroom",
      {
        roomCode: roomid,
        username: realUsername,
        topic: event,
      }
    );

    setLoading([false, false, false, false, false, false, false, false]);

    if (response.data.message !== "Room Created Successfully") {
      toast.error("Ther was some error PLease try again");
      return;
    }

    setLoading(false)

    navigate(`/mcq/${roomid}/lobby`, {
      state: { username: realUsername, topic: event, time:1200 },
    });
  }

  const handleJoinLogic = async () => {
    setJoinLoading(true);

    if (!realUsername || !roomid) {
      toast.error("Please enter a username and room ID");
      setLoading(false)
      return;
    }
    
    const response = await axios.post(
      "https://algosprint-vxi4.onrender.com/api/v1/user/mcqrooms/joinmcqroom",
      {
        roomCode: roomid,
        username: realUsername,
      }
    );
    
    if (response.data.message !== "Room joined successfully") {
      toast.error("there was some error while joining the room try again later");
      setLoading(false)
      return;
    }

    setJoinLoading(false);
    navigate(`/mcq/${roomid}/lobby`, {
      state: { username:realUsername, time: "20 Mins" },
    });
  }

  return (
    <div className="bg-white transition-colors duration-300 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-[Inter] p-8 min-h-screen">
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm mb-8">
        <div className="flex gap-4 items-center">
          <div className="bg-white shadow-sm dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-4 text-3xl rounded-xl text-zinc-900 dark:text-zinc-100">
            <GiMultipleTargets />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black dark:text-white">
              MCQ Rooms - Quiz Arena
            </h1>
            <p className="text-zinc-600 dark:text-white text-sm">
              Test your theoretical knowledge with rapid-fire MCQ rounds with
              your friends
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-center font-bold text-3xl text-zinc-900 dark:text-zinc-100 pt-10 tracking-tight uppercase">
        Join Public Room
      </h1>

      <div className="mx-auto flex items-center justify-center mt-4">
        <Dialog>
          <form>
            <DialogTrigger asChild>
              <Button variant="outline">Join</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Join room</DialogTitle>
                <DialogDescription>
                  enter room id to join the room
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="name-1">roomid</Label>
                  <Input
                    id="roomid"
                    value={roomid}
                    onChange={(e) => setRoomid(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  onClick={() => handleJoinLogic()}
                >
                  {joinLoading ? <Loader /> : <p>join</p>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 w-full my-12"></div>

      <div className="flex items-center mt-6 text-3xl font-bold justify-center gap-4 text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">
        Create your room
      </div>
      <div className="flex items-center transition-all duration-500 flex-wrap max-w-[900px] mx-auto p-4">
        {quizList.map((elem, idx) => (
          <div
            key={idx}
            className="flex px-6 py-4 flex-col basis-[48%] border transition-all duration-500 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 m-2 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <h1 className="text-zinc-900 dark:text-zinc-100 font-bold m-2 text-xl tracking-tight">
                  {elem.name}
                </h1>
                <div className="flex items-center gap-4 text-sm m-2 text-zinc-600 dark:text-zinc-400">
                  <p>{elem.Questions} questions</p>
                  <p className="font-bold">{elem.time}</p>
                </div>
                <div className="text-green-600 dark:text-green-400 font-medium text-xs m-2 uppercase tracking-widest">
                  * Reward: {elem.reward}
                </div>
                <div className="w-full flex mt-4 gap-4 items-center justify-start">
                  <Button
                    size="sm"
                    className="w-24 border-zinc-200 dark:border-zinc-800 bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm transition-colors"
                    variant="outline"
                    onClick={() => handleCreateLogic(elem.name, idx)}
                  >
                    {loading[idx] ? <Loader></Loader> : <p>create</p>}
                  </Button>
                </div>
              </div>
              <div className="w-15">
                <img src={elem.imageURL} className="" alt={elem.name} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default McqRooms;
