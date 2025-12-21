import logo from "../../assets/images/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { PiRankingFill } from "react-icons/pi";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { toast } from "sonner";
import { RiUserCommunityFill } from "react-icons/ri";
import { FaLaptopCode } from "react-icons/fa";
import { GiChoice } from "react-icons/gi";
import { SiGoogleclassroom } from "react-icons/si";
import { Button } from "../../components/ui/button";
import { useClerk, useUser } from "@clerk/clerk-react";
import FeedbackForm from "../FeedbackForm";
import react, {useState} from "react";

const ProfileHeroSection = () => {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { user } = useUser();
  const [showFeedback, setShowFeedback] = useState(false);
  const username = user?.username;

  if (!username) {
    return;
  }

  const HandleSignOut = () => {
    signOut(() => {
      navigate("/auth/signin");
      toast.success("Successfully signed out!");
    });
  };

  const ToggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  const toggleFeedback = () => {
    setShowFeedback((prev) => !prev);
  };

  return (
    <div className="bg-slate-50 flex flex-col items-start h-screen  justify-between dark:bg-black/60 w-2/10  font-[Inter] px-4 py-3  border-r-2 border-zinc-300 dark:border-zinc-600 shadow-sm dark:shadow-white transition-all duration-500">
      {/* Logo Section */}
      <div className="gap-4 bg-black/2 px-2 rounded-md items-center justify-items-center basis-[10%] flex">
        <img src={logo} alt="AlgoSprint" className="w-8 h-8" />
        <div className="">
          <h1 className="text-black dark:text-white text-lg font-bold">
            AlgoSprint
          </h1>
          <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
            Level up your skills
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="pr-4 gap-3 justify-between flex flex-col basis-[70%]">
        <NavLink
          to={`/${username}/dashboard`}
          className="list-none transition-all duration-300 flex gap-2 items-center justify-start hover:bg-black/20 dark:hover:bg-white/6 rounded-md px-3 py-[12px] text-sm text-black dark:text-white"
        >
          <TbLayoutDashboardFilled className="text-xl" />
          <p>Dashboard</p>
        </NavLink>
        <NavLink
          to={`/${username}/leaderboard`}
          className="list-none transition-all duration-300 flex gap-2 items-center justify-start hover:bg-black/10 dark:hover:bg-white/6 rounded-md px-3 py-[12px] text-sm text-black dark:text-white"
        >
          <PiRankingFill className="text-2xl" /> <p>Leaderboard</p>
        </NavLink>
        <NavLink
          to={`/${username}/codingrooms`}
          className="list-none transition-all duration-300 flex gap-2 items-center justify-start hover:bg-black/10 dark:hover:bg-white/6 rounded-md px-3 py-[12px] text-sm text-black dark:text-white"
        >
          <FaLaptopCode className="text-xl" /> <p>Coding Room</p>
        </NavLink>
        <NavLink
          to={`/${username}/mcqrooms`}
          className="list-none transition-all duration-300 flex gap-2 items-center justify-start hover:bg-black/10 dark:hover:bg-white/6 rounded-md px-3 py-[12px] text-sm text-black dark:text-white"
        >
          <GiChoice className="text-xl" /> <p>MCQ verse</p>
        </NavLink>
        <NavLink
          to={`/${username}/community`}
          className="list-none transition-all duration-300 flex gap-2 items-center justify-start hover:bg-black/10 dark:hover:bg-white/6 rounded-md px-3 py-[12px] text-sm text-black dark:text-white"
        >
          <RiUserCommunityFill className="text-xl" /> <p>Community</p>
        </NavLink>
        <NavLink
          to={`/${username}/collaborativerooms`}
          className="list-none transition-all duration-300 flex gap-2 items-center justify-start hover:bg-black/10 dark:hover:bg-white/6 rounded-md px-3 py-[12px] text-sm text-black dark:text-white"
        >
          <SiGoogleclassroom className="text-xl" /> <p>Collaborative Space</p>
        </NavLink>
      </div>

      {/* Toggle and Sign Out */}
      <div className="basis-[10%] w-full pt-3 flex flex-col gap-2 ">
        <Button
          variant="personal"
          className="hover:bg-cyan-500/70 dark:hover:bg-cyan-600/80"
          onClick={ToggleTheme}
        >
          Toggle Theme
        </Button>
        <Button
          variant="destructive"
          className="hover:bg-red-600/70 dark:hover:bg-red-600/60"
          onClick={HandleSignOut}
        >
          Sign Out
        </Button>
        <Button className="transition-all duration-75" variant={showFeedback ? "ghost" : "outline"} onClick={toggleFeedback}>
          {showFeedback ? "Cancel" : "Give Feedback"}
        </Button>

        {showFeedback && (
          <div className="absolute top-[5%] left-[2%] z-9999">
            {" "}
            <FeedbackForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeroSection;
