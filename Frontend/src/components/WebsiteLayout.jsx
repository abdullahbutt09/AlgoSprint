import Navbar from "./Navbar";
import Features from "./Features";
import HeroSection from "./HeroSection";
import LanguagesAvailable from "./LanguagesAvailable";
import Feature3 from "./Feature3";
import WorkFlow from "./WorkFlow";
import Footer from "./Footer";
import CTA from "./FinalCTA";
import RankLine from "./Rank";
import { useRef, useState } from "react";
import { FaStar } from "react-icons/fa";
import { AiOutlineCloseCircle } from "react-icons/ai";
import FeedbackForm from "./FeedbackForm";

const WebsiteLayout = () => {
  const featureRef = useRef(null);
  const homeRef = useRef(null);
  const languageRef = useRef(null);
  const [clicked, setClicked] = useState(false);
  const rankLineRef = useRef(null);
  const workFlowRef = useRef(null);

  return (
    <div className="font-[Inter] relative">
      <div className="z-[999] fixed bottom-6 right-6">
        <div
          className={`absolute right-0 bottom-14 transition-all duration-300 ${
            clicked
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <FeedbackForm />
        </div>

        <div className="flex flex-col items-center space-y-1">
          {!clicked ? (
            <FaStar
              onClick={() => setClicked(true)}
              className={`text-yellow-500 text-4xl cursor-pointer hover:scale-110 transition-all duration-200`}
            />
          ) : (
            <AiOutlineCloseCircle
              onClick={() => setClicked(false)}
              className="text-red-500 text-4xl cursor-pointer hover:scale-110 transition-all duration-200"
            />
          )}

          <p className="font-bold text-xs text-gray-700">Feedback</p>
        </div>
      </div>

      {/* Website Sections */}
      <Navbar />
      <div ref={homeRef}>
        <HeroSection featureRef={featureRef} />
      </div>
      <div ref={featureRef}>
        <Features />
      </div>
      <Feature3 />
      <div ref={rankLineRef}>
        <RankLine />
      </div>
      <div ref={languageRef}>
        <LanguagesAvailable />
      </div>
      <div ref={workFlowRef}>
        <WorkFlow />
      </div>
      <CTA />
      <Footer
        homeRef={homeRef}
        featureRef={featureRef}
        rankLineRef={rankLineRef}
        languageRef={languageRef}
        workFlow={workFlowRef}
      />
    </div>
  );
};

export default WebsiteLayout;
