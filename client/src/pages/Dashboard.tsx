import { getMotivationalMessage } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import type { ActivityEntry, FoodEntry } from "../types";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import {
  Activity,
  FlameIcon,
  HamburgerIcon,
  Ruler,
  ScaleIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";
import CaloriesChart from "../components/CaloriesChart";

const Dashboard = () => {
  const { user, allActivityLogs, allFoodLogs } = useAppContext();

  // ✅ Always safe arrays
  const safeFoodLogs = allFoodLogs ?? [];
  const safeActivityLogs = allActivityLogs ?? [];

  const today = new Date().toISOString().split("T")[0];

  // ✅ Derived values (NO useState, NO useEffect)
  const todayFood = safeFoodLogs.filter(
    (f: FoodEntry) => f.createdAt?.split("T")[0] === today
  );

  const todayActivities = safeActivityLogs.filter(
    (a: ActivityEntry) => a.createdAt?.split("T")[0] === today
  );

  const DAILY_CALORIE_LIMIT = user?.dailyCalorieIntake || 2000;

  const totalCalories = todayFood.reduce(
    (sum, item) => sum + item.calories,
    0
  );

  const totalActiveMinutes = todayActivities.reduce(
    (sum, item) => sum + item.duration,
    0
  );

  const totalBurned = todayActivities.reduce(
    (sum, item) => sum + (item.calories || 0),
    0
  );

  const remainingCalories = DAILY_CALORIE_LIMIT - totalCalories;

  const motivation = getMotivationalMessage(
    totalCalories,
    totalActiveMinutes,
    DAILY_CALORIE_LIMIT
  );

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <p className="text-emerald-100 text-sm font-medium">Welcome back</p>
        <h1 className="text-2xl font-bold mt-1">
          {`Hi there! 👋 ${user?.username ?? ""}`}
        </h1>

        <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{motivation.emoji}</span>
            <p className="text-white font-medium">{motivation.text}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card className="shadow-lg col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <HamburgerIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Calories Consumed</p>
                <p className="text-2xl font-bold">{totalCalories}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">Limit</p>
              <p className="text-2xl font-bold">{DAILY_CALORIE_LIMIT}</p>
            </div>
          </div>

          <ProgressBar value={totalCalories} max={DAILY_CALORIE_LIMIT} />
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-slate-500">Active Minutes</p>
          </div>
          <p className="text-2xl font-bold">{totalActiveMinutes}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <ZapIcon className="w-5 h-5 text-purple-500" />
            <p className="text-sm text-slate-500">Workouts</p>
          </div>
          <p className="text-2xl font-bold">{todayActivities.length}</p>
        </Card>

        <Card className="col-span-2">
          <h3 className="font-semibold mb-2">This Week's Progress</h3>
          <CaloriesChart />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
