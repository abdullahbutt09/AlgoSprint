import { Badge } from "@/components/ui/badge";
import { Line, LineChart} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { MdOutlineEventRepeat } from "react-icons/md";
import { FaRankingStar } from "react-icons/fa6";
import { GiBattleGear } from "react-icons/gi";
import { SiStylelint } from "react-icons/si";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const params = useParams();
  const username = params.username;
  const [userDetails, setUserDetails] = useState({});
  const [data, setData] = useState(false);
  const [err, setErr] = useState(false);
  let feature = [];

  if (data) {
    feature = [
      {
        logo: <MdOutlineEventRepeat />,
        discription: "Win Streak",
        stats: userDetails.winStreak,
      },
      {
        logo: <GiBattleGear />,
        discription: "Total Battles",
        stats: userDetails.totalBattles,
      },
      {
        logo: <FaRankingStar />,
        discription: "Max Rank",
        stats: userDetails.maximumRatings,
      },
      {
        logo: <SiStylelint />,
        discription: "PlayStyle",
        stats:
          userDetails.playstyle,
      },
    ];
  }

  let chartDataExtractedVersion = [];
  if (userDetails && data) {
    chartDataExtractedVersion = userDetails.ratingHistory?.map((elem) => ({
      date: elem.date.substr(0,10),
      value: elem.value,
    }));
  }

  let recentMatchDataTable = [];
  if (userDetails.recentMatches && data) {
    recentMatchDataTable = userDetails.recentMatches.map((elem) => ({
      style: elem.style,
      result: elem.outcome,
      numberOfParticipants: elem.participants,
      xpChanged: elem.xpGained,
    }));
  }

  const chartData = chartDataExtractedVersion;

  const chartConfig = {
    desktop: {
      label: "date",
      color: "cyan",
    },
  };

  useEffect(() => {
    const handleFetchRequest = async () => {
      await axios
        .get(`https://algosprint-vxi4.onrender.com/api/v1/user/dashboard`, {
          params: {
            username: username,
          },
        })
        .then((res) => {
          setUserDetails(res.data.data);
          setData(true);
        })
        .catch((err) => {
          console.log("An error occurred", err);
          setErr(true);
        });
    };

    handleFetchRequest();
  }, [username]);

  return (
    <div>
      {err ? (
        <p className="text-black dark:text-white text-center mt-[30%] font-bold text-3xl">
          Something went wrong
        </p>
      ) : (
        <div className="bg-slate-50 dark:bg-black/80 transition-all duration-500 font-[Inter] px-16 pt-4 text-black dark:text-white min-h-screen">
          {data ? (
            <div className="flex items-center gap-10">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 transition-colors duration-300 rounded-xl basis-[80%] shadow-sm">
                <div className="p-4 shadow-lg transition-all duration-500 flex justify-between">
                  <div className="transition-all duration-500">
                    <h1 className="text-4xl p-1 font-bold flex items-center">
                      Welcome Back, {userDetails.username}{" "}
                    </h1>
                    <p className="text-sm px-3 text-[#4a5568] dark:text-[#A0AEC0]">
                      Ready for some new challenges today
                    </p>
                  </div>
                  <div className="pt-1 flex flex-col justify-between items-end gap-2">
                    <div className="text-xs font-medium tracking-wide uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1 rounded-full">
                      {userDetails.rank}{" "}
                    </div>
                    <div className="font-bold text-sm">
                      {userDetails.currentRating}
                    </div>
                    <div className="text-sm font-semibold">
                      Level {userDetails.level}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-6 py-1">
                  <div className="text-[11px] font-semibold">XP Progress</div>
                  <div className="text-[11px] text-sm font-semibold">
                    {userDetails.xp}/{userDetails.totalXp}xp
                  </div>
                </div>
                <div className="w-19/20 mx-auto pb-3">
                  <Progress value={userDetails.xp} />
                </div>
              </div>

              <div className="relative rounded-full transition-opacity duration-300 w-fit p-1 hover:opacity-90 h-4/5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={userDetails.profileImage}
                  alt="profile"
                  className="w-42 h-40 relative rounded-full border border-zinc-200 dark:border-zinc-700"
                />
              </div>
            </div>
          ) : (
            <Skeleton className="h-36 w-full rounded-xl mb-6" />
          )}

          <div className="flex items-center gap-2">
            <div className="Area-chart max-w-md mb-6 mt-6 rounded-xl">
              {data ? (
                <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <CardHeader>
                    <CardTitle>Ranking Chart</CardTitle>
                    <CardDescription>
                      Total Battles Fought: {userDetails.totalBattles}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <LineChart
                        className="text-black dark:text-white"
                        data={
                          chartData?.length > 0
                            ? chartData
                            : [
                                {
                                  date: new Date().toLocaleDateString("en-US"),
                                  value: 0,
                                },
                              ]
                        }
                        margin={{ left: 12, right: 12 }}
                      >
                        <ChartTooltip
                          cursor={false}
                          content={null}
                        />
                        <Line
                          dataKey="value"
                          type="linear"
                          stroke="var(--color-desktop)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              ) : (
                <Skeleton className="h-48 w-[350px] rounded-xl mb-6" />
              )}
            </div>

            <div className="flex gap-2 flex-col w-4/9 items-center justify-center">
              {data ? (
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full py-3 text-center p-2 text-sm uppercase tracking-wide font-medium rounded-xl shadow-sm text-zinc-500 dark:text-zinc-400">
                  Total Win
                  <p className="p-3 text-2xl text-zinc-900 dark:text-zinc-100 font-bold">
                    {userDetails.totalWin}
                  </p>
                </div>
              ) : (
                <Skeleton className="h-16 w-full rounded-md mb-6" />
              )}
              {data ? (
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full py-3 text-center p-2 text-sm uppercase tracking-wide font-medium rounded-xl shadow-sm text-zinc-500 dark:text-zinc-400">
                  Win ratio
                  <p className="p-3 text-2xl text-zinc-900 dark:text-zinc-100 font-bold">
                    {userDetails.winRatio}
                  </p>
                </div>
              ) : (
                <Skeleton className="h-16 w-full rounded-md mb-6" />
              )}
            </div>

            {data ? (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-[30rem] h-[13rem] shadow-sm p-5 rounded-xl">
                <h1 className="text-center font-medium uppercase tracking-widest text-xs text-zinc-500 dark:text-zinc-400">Badges Earned</h1>
                <p className="gap-2 p-4 py-9 flex flex-wrap items-center justify-center">
                  {userDetails.title.length > 0 ? (
                    userDetails.title.map((elem, idx) => <Badge>{elem}</Badge>)
                  ) : (
                    <p> No Badges to Show </p>
                  )}
                </p>
              </div>
            ) : (
              <Skeleton className="h-46 w-full rounded-md mb-6" />
            )}
          </div>
          <div className="flex justify-between gap-3 items-center">
            {feature.map((elem, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 basis-[48%] mb-2 rounded-xl transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div className="flex items-center justify-around">
                  <div>
                    <h1 className="font-bold text-2xl mx-2 text-gray-900 dark:text-[#F7FAFC]">
                      {elem.stats}
                    </h1>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <p className="text-4xl text-zinc-400 dark:text-zinc-500">{elem.logo}</p>
                    <p className="text-sm text-gray-600 dark:text-[#A0AEC0] m-2">
                      {elem.discription}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {data ? (
            <div className="my-6 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <Table>
                <TableCaption>Recent Battles</TableCaption>
                <TableHeader className="font-[Inter]">
                  <TableRow>
                    <TableHead className="w-[100px] text-md p-4">
                      Match Type
                    </TableHead>
                    <TableHead className="p-4">Result</TableHead>
                    <TableHead className="p-4">
                      number of participants
                    </TableHead>
                    <TableHead className="text-right p-4">xp Gained</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMatchDataTable.length > 0 ? (
                    recentMatchDataTable.map((elem, idx) => (
                      <TableRow key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                        <TableCell className="font-medium p-4 text-zinc-900 dark:text-zinc-100">
                          {elem.style}
                        </TableCell>
                        <TableCell className="p-4">
                          <span className={`text-xs font-semibold uppercase tracking-wider ${elem.result === 'Win' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
                            {elem.result}
                          </span>
                        </TableCell>
                        <TableCell className="p-4 text-zinc-600 dark:text-zinc-400">
                          {elem.numberOfParticipants}
                        </TableCell>
                        <TableCell className="p-4 text-right font-medium text-zinc-900 dark:text-zinc-100">
                          +{elem.xpChanged} XP
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <p className="w-full text-xs mx-auto text-center font-bold">
                      No Data To Display
                    </p>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Skeleton className="h-96 w-full" />
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
