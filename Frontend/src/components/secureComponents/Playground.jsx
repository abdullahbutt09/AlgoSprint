import { useState, useEffect, useRef, useMemo } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Loader from "../Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { GiFastBackwardButton } from "react-icons/gi";
import { GiFastForwardButton } from "react-icons/gi";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Editor from "@monaco-editor/react";
import axios from "axios";
import CountdownTimer from "../Stopwatch";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Playground = () => {
  const starterCode = {
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    javascript:
      'function main() {\n    console.log("Hello, World!");\n}\n\nmain();',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    php: '<?php\n\nfunction main() {\n    echo "Hello, World!\\n";\n}\n\nmain();\n?>',
    python: 'def greet():\n    print("Hello, World!")\n\ngreet()',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  };

  const location = useLocation();
  const setting = location.state?.setting;
  const style = setting.playStyle;
  const username = location.state?.username;
  const totalQuestions = location.state?.totalQuestions;
  const realUsername = location.state?.realUsername;
  const numberOfProblems = setting.numberOfProblems;
  const totalParticipants = location.state.totalParticipants;
  const startTime = location.state.startTime;
  const navigate = useNavigate();
  const params = useParams();
  // Language map for the editor (execution disabled — see banner)
  const SUPPORTED_LANGUAGES = [
    { label: "Python 3",   lang: "python",     monacoLang: "python",     starterKey: "python" },
    { label: "JavaScript", lang: "javascript", monacoLang: "javascript", starterKey: "javascript" },
    { label: "Java",       lang: "java",       monacoLang: "java",       starterKey: "java" },
    { label: "C",          lang: "c",          monacoLang: "c",          starterKey: "c" },
    { label: "C++",        lang: "c++",        monacoLang: "cpp",        starterKey: "cpp" },
    { label: "Go",         lang: "go",         monacoLang: "go",         starterKey: "go" },
    { label: "PHP",        lang: "php",        monacoLang: "php",        starterKey: "php" },
  ];

  // NOTE: Public code-execution APIs are no longer freely available.
  // To re-enable execution, add a Judge0 RapidAPI key to .env as
  // VITE_JUDGE0_API_KEY and restore the executeOnJudge0() helper.
  const EXECUTION_ENABLED = false;

  const [selectedLang, setSelectedLang] = useState(null);
  const [executionBannerDismissed, setExecutionBannerDismissed] = useState(false);
  const [data, setData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [problemLoading, setProblemLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [idx, setIdx] = useState(0);
  const [testCaseIndex, setTestCaseIndex] = useState(0);
  const roomid = params.roomid;
  const [outputRunned, setOutputRunned] = useState(
    Array.from({ length: numberOfProblems }, () => false)
  );
  const [codeSubmitted, setCodeSubmitted] = useState(
    Array.from({ length: numberOfProblems }, () => false)
  );
  const [activeTab, setActiveTab] = useState("testResult");

  const [problemFinished, setProblemfinished] = useState();

  const [questionDone, setQuestionDone] = useState();

  const editorRef = useRef(
    Array.from({ length: numberOfProblems }, () => null)
  );
  const [code, setCode] = useState(
    Array.from({ length: numberOfProblems }, () => " ")
  );
  const [time, setTime] = useState(() => {
    const savedTime = localStorage.getItem(`room_${roomid}_time`);
    return savedTime ? parseInt(savedTime) : setting.time || 3600;
  });

  const [problems, setProblems] = useState([]);
  const [codeSubmitOutput, setCodeSubmitOutput] = useState(
    Array.from({ length: numberOfProblems }, () => [])
  );
  const [codeOutput, setCodeOutput] = useState(
    Array.from({ length: numberOfProblems }, () => [])
  );

  const [submitOutput, setSubmitOutput] = useState({});

  let problemTestCasses = [];
  if (data && problems[idx]) {
    problemTestCasses = problems.map((elem, idx) => ({
      testCases: elem.problemTestCases.slice(0, 2),
    }));

  }

  useEffect(() => {
    const FetchQuestionsFromBackend = async () => {
      try {
        setProblemLoading(true);
        if (!roomid) return;

        console.log("got room id", roomid)
        const response = await axios.get(
          "https://algosprint-vxi4.onrender.com/api/v1/user/codingrooms/arena/getProblems",
          {
            params: { roomid },
          }
        );

        if (response.data?.data?.questions) {
          setProblems(response.data.data.questions);
          setData(true);
          console.log("")
          setErr(false);
        } else {
          throw new Error("No questions data received");
        }
      } catch (error) {
        console.error(
          "Error fetching questions in the function FetchQuestionsFromBackend:",
          error
        );
        setErr(true);
        setData(false);
      } finally {
        setProblemLoading(false);
      }
    };

    FetchQuestionsFromBackend();
  }, [roomid]);

  const HandleRedirectLogic = (event) => {

    const timeTaken = Math.floor(Date.now() / 1000) - startTime;

    navigate(`/codingroom/${roomid}/result`, {
      state: {
        username: username,
        roomid: roomid,
        startTime: startTime,
        timeTaken,
        style: style,
        time: setting?.time || 3600,
        score: event * 10,
        totalParticipants: totalParticipants,
        realUsername,
      },
    });
  };

  useEffect(() => {
    const currentRoomStored = localStorage.getItem("currentRoom");

    if (!currentRoomStored) {
      localStorage.setItem("currentRoom", roomid);
      localStorage.setItem(
        "solvedProblemBooleanArray",
        JSON.stringify(Array.from({ length: numberOfProblems }, () => false))
      );

      setQuestionDone(() =>
        JSON.parse(localStorage.getItem("solvedProblemBooleanArray"))
      );
      localStorage.setItem("solvedProblemCount", 0);
      setProblemfinished(() =>
        parseInt(localStorage.getItem("solvedProblemCount"))
      );
      return;
    }

    if (JSON.stringify(currentRoomStored) !== roomid) {
      localStorage.setItem("currentRoom", roomid);
      localStorage.setItem(
        "solvedProblemBooleanArray",
        JSON.stringify(Array.from({ length: numberOfProblems }, () => false))
      );
      localStorage.setItem("solvedProblemCount", 0);
      setQuestionDone(() =>
        JSON.parse(localStorage.getItem("solvedProblemBooleanArray"))
      );
      setProblemfinished(() =>
        parseInt(localStorage.getItem("solvedProblemCount"))
      );
    }
  }, [roomid]);

  useEffect(() => {
    let count = 0;
    questionDone?.map((elem, idx) => (elem === true ? count++ : (count += 0)));
    setProblemfinished(count);
    if (count === Number(numberOfProblems)) {
      HandleRedirectLogic(count);
    }
  }, [questionDone]);

  

  // No runtime fetch needed — Judge0 uses static language IDs

  const handleEditorMount = (editor) => {
    editorRef.current[idx] = editor;
  };

  const handleCodeChange = (newCode) => {
    const updatedCodeArray = code.map((elem, index) => {
      if (index === idx) {
        return newCode;
      } else {
        return elem;
      }
    });
    setCode(updatedCodeArray);
  };

  const HandleRunRequest = () => {
    // Execution is disabled — show banner instead
    setExecutionBannerDismissed(false);
    setActiveTab("testResult");
  };

  const HandleSubmitRequest = () => {
    // Execution is disabled — show banner instead
    setExecutionBannerDismissed(false);
    setActiveTab("submit");
  };

  useEffect(() => {
    localStorage.setItem("solvedProblemCount", problemFinished);
  }, [problemFinished]);

  useEffect(() => {
    localStorage.setItem(
      "solvedProblemBooleanArray",
      JSON.stringify(questionDone)
    );
  }, [questionDone]);

  return (
    <div className="h-screen flex-col">
      {/* Execution-unavailable banner */}
      {!executionBannerDismissed && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-800 text-xs font-medium">
          <span>
            ⚠️ <strong>Code execution is currently unavailable.</strong> Public execution APIs are no longer free. You can still write &amp; read problems — execution can be re-enabled by the admin at any time.
          </span>
          <button
            onClick={() => setExecutionBannerDismissed(true)}
            className="ml-4 shrink-0 text-amber-600 hover:text-amber-900 font-bold text-sm leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mx-4 mt-4 flex font-[Inter] items-center p-3 w-full max-w-[calc(100%-2rem)] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm justify-between">
        <div>
          <Select
            onValueChange={(value) => {
              const lang = SUPPORTED_LANGUAGES.find((l) => l.lang === value);
              if (lang) {
                setSelectedLang(lang);
                const updated = [...code];
                updated[idx] = starterCode[lang.starterKey] || " ";
                setCode(updated);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Language</SelectLabel>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.lang} value={lang.lang}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 flex justify-center gap-4">
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer w-28 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            onClick={HandleRunRequest}
          >
            {loading ? <Loader /> : <p>Run Code</p>}
          </Button>
          <Button
            size="sm"
            variant="personal"
            className="cursor-pointer w-28 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            onClick={HandleSubmitRequest}
          >
            {submitLoading ? <Loader /> : <p>Submit</p>}
          </Button>
        </div>
        <div className="flex items-center justify-end gap-6 mr-4">
          <div>
            <CountdownTimer
              initialSeconds={time}
              onTick={(newTime) =>
                localStorage.setItem(`room_${roomid}_time`, newTime)
              }
              onComplete={() => HandleRedirectLogic(problemFinished)}
            />
          </div>
          <Switch
            id="darkThemeToggler"
            onClick={() => {
              document.documentElement.classList.toggle("dark");
            }}
            className="cursor-pointer"
          />
        </div>

        <div>
          <Button
            onClick={() => HandleRedirectLogic(problemFinished)}
            variant="destructive"
            size="sm"
          >
            giveUp
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto p-4 no-scrollbar">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full border-2 rounded"
        >
          <ResizablePanel
            defaultSize={40}
            className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 min-h-[85vh] max-h-[85vh]"
          >
            {problemLoading ? (
              <Skeleton className="h-full w-full" />
            ) : err ? (
              <p className="text-bold text-2xl text-center">Some Error Occur Please Refresh to see the questions</p>
            ) : data ? (
              <div className="h-full overflow-y-auto no-scrollbar">
                <div className="p-6">
                  <div className="w-full text-zinc-900 dark:text-zinc-100 font-bold font-[Inter] flex items-center justify-between px-4 py-3 text-xl bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <GiFastBackwardButton
                      className="cursor-pointer"
                      onClick={() =>
                        setIdx(
                          (prev) =>
                            (prev - 1 + problems.length) % problems.length
                        )
                      }
                    />
                    <div className="flex-col ">
                      <p className="text-center text-sm font-semibold">
                        {idx + 1}/{totalQuestions}
                      </p>
                      problem No. {problems[idx]?.problemRanking}
                      {questionDone[idx] && (
                        <div className="text-[10px] text-white w-fit mx-auto bg-green-500 px-2 py-1 rounded-full">
                          {" "}
                          DONE{" "}
                        </div>
                      )}
                    </div>
                    <GiFastForwardButton
                      className="cursor-pointer"
                      onClick={() =>
                        setIdx((prev) => (prev + 1) % problems.length)
                      }
                    />
                  </div>

                  <div className="">
                    <h1 className="mt-6 text-lg mb-3 font-semibold">
                      {problems[idx]?.problemName}
                    </h1>
                    <Badge className="text-sm rounded-md bg-cyan-500 py-1 px-2">
                      {problems[idx]?.problemDifficulty}
                    </Badge>
                    <p className="mt-6 tracking-normal">
                      {problems[idx]?.problemDescription}
                    </p>
                    <div className="mt-2">
                      {problemTestCasses[idx]?.testCases?.map((elem, idx) => (
                        <div key={idx} className="py-2">
                          <p className="">
                            <strong>Sample input 1:</strong> &nbsp;
                            {elem.input.replace("sample_input_", "")}
                          </p>
                          <p className="">
                            <strong>expected answer: &nbsp;</strong>
                            {elem.expectedOutput.replace(
                              "expected_output_",
                              ""
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Skeleton className="h-full w-full"></Skeleton>
            )}
          </ResizablePanel>
          <ResizableHandle className="w-[1px] bg-zinc-200 dark:bg-zinc-800 cursor-col-resize hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors" />
          <ResizablePanel defaultSize={60}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel
                defaultSize={70}
                className="w-full overflow-hidden bg-zinc-950"
              >
                <div className="flex py-2 pl-2 h-full items-center justify-center w-full ">
                  <Editor
                    className="w-full h-full"
                    language={selectedLang?.monacoLang || "plaintext"}
                    value={code[idx]}
                    theme={"vs-dark"}
                    onMount={handleEditorMount}
                    onChange={handleCodeChange}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-[1px] bg-zinc-200 dark:bg-zinc-800 cursor-row-resize hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors" />
              <ResizablePanel
                defaultSize={30}
                className="border-t-3 border-zinc-600 p-2"
              >
                {" "}
                <div className="flex bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-2 text-sm items-center text-zinc-900 dark:text-zinc-100 justify-start gap-4 overflow-y-auto">
                  <div
                    onClick={() => setActiveTab("testResult")}
                    className={`px-4 py-2 font-bold cursor-pointer transition-all duration-100 
          ${
            activeTab === "testResult"
              ? "border-b-2 border-cyan-500 text-cyan-500"
              : "text-zinc-400 "
          }`}
                  >
                    TestCase
                  </div>
                  <div className="w-[0.1rem] h-[1.5rem] bg-white"></div>
                  <div
                    onClick={() => setActiveTab("submit")}
                    className={`px-4 py-2 font-bold cursor-pointer transition-all duration-100 
          ${
            activeTab === "submit"
              ? "border-b-2 border-cyan-500 text-cyan-500"
              : "text-zinc-400"
          }`}
                  >
                    Submit
                  </div>
                </div>
                <div className="flex flex-col bg-white dark:bg-zinc-950 h-full w-full px-6 overflow-auto">
                  <div className="flex items-center gap-4 text-white">
                    {activeTab === "testResult" ? (
                      <div>
                        <div className="flex items-center gap-4 pt-4 justify-start">
                          {problemTestCasses[idx]?.testCases?.map(
                            (_, index) => (
                              <h1
                                key={index}
                                className={`px-2 text-sm  cursor-pointer rounded-full ${
                                  testCaseIndex === index ? "bg-cyan-800" : ""
                                }`}
                                onClick={() => setTestCaseIndex(index)}
                              >
                                Test {index + 1}
                              </h1>
                            )
                          )}
                        </div>

                        {/* Execution unavailable notice in the output panel */}
                        <div className="mt-4 mx-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
                          <p className="text-amber-400 text-xs font-semibold mb-1">⚠️ Execution Unavailable</p>
                          <p className="text-amber-300/80 text-xs leading-relaxed">
                            Public code-execution APIs are no longer freely available. Running and auto-submitting code has been
                            temporarily disabled. Your code is saved — execution can be re-enabled by connecting a Judge0 API key.
                          </p>
                        </div>

                        <div className="flex text-sm flex-col mt-2 text-white">
                          {outputRunned[idx] ? (
                            codeOutput[idx][testCaseIndex] ? (
                              <div
                                className={`p-4 mt-3 w-[40rem] rounded-md ${
                                  codeOutput[idx][testCaseIndex].correctness
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              >
                                <h2 className="font-bold mb-2">
                                  TestCase {testCaseIndex + 1}
                                </h2>
                                <p>
                                  <strong>Input:</strong>{" "}
                                  {
                                    codeOutput[idx][testCaseIndex]
                                      .currentTestCase
                                  }
                                </p>
                                <p>
                                  <strong>Expected:</strong>{" "}
                                  {
                                    codeOutput[idx][testCaseIndex]
                                      .expectedOutcome
                                  }
                                </p>
                                <p className="flex items-center gap-2">
                                  <p>
                                    {codeOutput[idx][testCaseIndex].stdErr ? (
                                      <p className="text-white mt-2">
                                        <strong className="text-white mr-2 font-bold">
                                          Error:
                                        </strong>{" "}
                                        {codeOutput[idx][testCaseIndex].stdErr}
                                      </p>
                                    ) : (
                                      <p>
                                        <strong>Output:</strong>
                                        {
                                          codeOutput[idx][testCaseIndex]
                                            .actualOutput
                                        }
                                      </p>
                                    )}
                                  </p>
                                </p>
                              </div>
                            ) : (
                              <p>No output for this test case.</p>
                            )
                          ) : (
                            <div className="pt-8 rounded-md">
                              <p>
                                <strong>Input:</strong>{" "}
                                {problemTestCasses[idx]?.testCases?.[
                                  testCaseIndex
                                ]?.input.replace("sample_input_", "")}
                              </p>
                              <p className="mt-2">
                                <strong>Expected:</strong>{" "}
                                {problemTestCasses[idx]?.testCases?.[
                                  testCaseIndex
                                ]?.expectedOutput.replace(
                                  "expected_output_",
                                  ""
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {codeSubmitted[idx] ? (
                          <div>
                            {submitOutput.result === "Wrong Answer" ? (
                              <div className="text-sm">
                                <h1>
                                  Result:{" "}
                                  <span className="text-red-500 font-bold text-xl">
                                    {submitOutput.result}
                                  </span>
                                </h1>
                                <p className="py-2">
                                  Test Cases Passed:{" "}
                                  <span className="text-red-500">
                                    {submitOutput.testCasePassed}
                                  </span>
                                  /{submitOutput.totalTestCase}
                                </p>
                                <p>Input: {submitOutput.testCase}</p>
                                <p>Expected: {submitOutput.expectedOutput}</p>
                                <p>
                                  outcome:{" "}
                                  <span className="text-red-500 ">
                                    {submitOutput.yourOutput}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <div className="text-sm">
                                <h1 className="mt-5">
                                  Result:{" "}
                                  <span className="text-green-500 font-bold text-xl">
                                    {submitOutput.result}
                                  </span>
                                </h1>
                                <p className="py-2">
                                  Test Cases Passed:{" "}
                                  {submitOutput.testCasePassed}/
                                  {submitOutput.totalTestCase}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-4 mx-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
                            <p className="text-amber-400 text-xs font-semibold mb-1">⚠️ Execution Unavailable</p>
                            <p className="text-amber-300/80 text-xs leading-relaxed">
                              Code submission is temporarily disabled as public execution APIs are no longer free.
                              Your work is saved and can be re-evaluated when a key is configured.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Playground;