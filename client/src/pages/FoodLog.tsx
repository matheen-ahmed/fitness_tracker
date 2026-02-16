import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { FoodEntry, FormData } from "../types";
import {
  mealColors,
  mealIcons,
  mealTypeOptions,
  quickActivitiesFoodLog,
} from "../assets/assets";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  Loader2Icon,
  PlusIcon,
  SparkleIcon,
  Trash2Icon,
  UtensilsCrossedIcon,
} from "lucide-react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";
import api from "../configs/api";

/* ---------------- TYPES ---------------- */

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/* ---------------- COMPONENT ---------------- */

const FoodLog = () => {
  const { allFoodLogs, setAllFoodLogs } = useAppContext();


  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    calories: 0,
    mealType: "",
  });
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];

  /* ---------------- DERIVED DATA ---------------- */

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  const groupedEntries = entries.reduce<Record<MealType, FoodEntry[]>>(
    (acc, entry) => {
      const key = entry.mealType as MealType;
      acc[key] ||= [];
      acc[key].push(entry);
      return acc;
    },
    {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    }
  );

  /* ---------------- HANDLERS ---------------- */

  const handleQuickAdd = (activityName: string) => {
    setFormData((prev) => ({
      ...prev,
      mealType: activityName,
    }));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!formData.name.trim() || !formData.calories || formData.calories <= 0 || !formData.mealType){
  return toast.error('Please enter valid data')
}

try {
  const {data} = await api.post('/api/food-logs', {data: formData})
  setAllFoodLogs(prev => [...prev, data])
  setFormData({name: '', calories: 0, mealType: ''})
  setShowForm(false)
} 
catch (error: any) {
  console.log(error);
  toast.error(error?.response?.data?.error?.message || error?.message);
}

    
  };

const handleDelete = async (documentId: string) => {
  try {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (!confirmDelete) return;

    await api.delete(`/api/food-logs/${documentId}`);

    setAllFoodLogs((prev) =>
      prev.filter((e) => e.documentId !== documentId)
    );
  } catch (error: any) {
    console.log(error);
    toast.error(
      error?.response?.data?.error?.message || error?.message
    );
  }
};



const handleImageChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setLoading(true);

  const formData = new FormData();
  formData.append("image", file);

  try {
    const { data } = await api.post(
      "/api/image-analysis",
      formData
    );

    const result = data.result;

    let mealType: MealType;
    const hour = new Date().getHours();

    if (hour < 12) mealType = "breakfast";
    else if (hour < 16) mealType = "lunch";
    else if (hour < 18) mealType = "snack";
    else mealType = "dinner";

    if (!result?.name || !result?.calories) {
      toast.error("Missing data");
      return;
    }

    const { data: newEntry } = await api.post(
      "/api/food-logs",
      {
        data: {
          name: result.name,
          calories: result.calories,
          mealType,
        },
      }
    );

    setAllFoodLogs((prev) => [...prev, newEntry]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  } catch (error: any) {
    console.log(error);
    toast.error(
      error?.response?.data?.error?.message || error?.message
    );
  } finally {
    setLoading(false);
  }
};

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    const todaysEntries = allFoodLogs.filter(
      (e) => e.createdAt?.split("T")[0] === today
    );
    setEntries(todaysEntries);
  }, [allFoodLogs, today]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Food Log
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Track your daily intake
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Today's Total
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalCalories} kcal
            </p>
          </div>
        </div>
      </div>

      <div className="page-content-grid">
        {/* Quick Add */}
        {!showForm && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Quick Add
              </h3>

              <div className="flex flex-wrap gap-2">
                {quickActivitiesFoodLog.map((activity) => (
                  <button
                    key={activity.name}
                    type="button"
                    onClick={() => handleQuickAdd(activity.name)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    {activity.emoji} {activity.name}
                  </button>
                ))}
              </div>
            </Card>

            <Button className="w-full" onClick={() => setShowForm(true)}>
              <PlusIcon className="size-5" />
              Add Food Entry
            </Button>

            <Button
              className="w-full"
              onClick={() => inputRef.current?.click()}
            >
              <SparkleIcon className="size-5" />
              AI Food Snap
            </Button>

            <input onChange={handleImageChange} type="file" accept="image/*" hidden ref={inputRef} />
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <Card className="border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              New Food Entry
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Food Name"
                value={formData.name}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, name: v.toString() }))
                }
                required
              />

              <Input
                label="Calories"
                type="number"
                value={formData.calories}
                onChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    calories: Number(v),
                  }))
                }
                required
              />

              <Select
                label="Meal Type"
                value={formData.mealType}
                onChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    mealType: v.toString(),
                  }))
                }
                options={mealTypeOptions}
                required
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setFormData({ name: "", calories: 0, mealType: "" });
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Entry
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Entries */}
        {/* Entries */}
{entries.length === 0 ? (
  <Card className="text-center py-12">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
      <UtensilsCrossedIcon className="size-8 text-slate-400 dark:text-slate-500" />
    </div>
    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
      No food logged today
    </h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm">
      Start tracking your meals to stay on target
    </p>
  </Card>
) : (
  <div className="space-y-4">
    {(Object.keys(groupedEntries) as MealType[]).map((mealType) => {
      const items = groupedEntries[mealType];
      if (items.length === 0) return null;

      const MealIcon = mealIcons[mealType];
      const mealCalories = items.reduce(
        (sum, e) => sum + e.calories,
        0
      );

      return (
        <Card
  key={mealType}
  className="bg-linear-to-br from-slate-900 to-slate-800 text-white border border-slate-700"
>
  {/* Meal Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${mealColors[mealType]}`}
      >
        <MealIcon className="size-6" />
      </div>

      <div>
        <h3 className="font-semibold capitalize">
          {mealType}
        </h3>
        <p className="text-sm text-slate-400">
          {items.length} items
        </p>
      </div>
    </div>

    <p className="font-semibold">
      {mealCalories} kcal
    </p>
  </div>

  {/* Food Items */}
  <div className="space-y-2">
    {items.map((entry) => (
      <div
        key={entry.documentId}
        className="flex items-center justify-between bg-slate-700/40 rounded-xl px-4 py-3"
      >
        <p className="text-sm font-medium">
          {entry.name}
        </p>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">
            {entry.calories} kcal
          </span>

          <button
            onClick={() => handleDelete(entry.documentId)}
            className="text-red-400 hover:text-red-500 transition"
          >
            <Trash2Icon className="w-4 h-4" />
          </button>
        </div>
      </div>
    ))}
  </div>
</Card>

      );
    })}
  </div>
)}

      </div>

      {loading && (
        <div className="fixed inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur flex items-center justify-center z-50">
          <Loader2Icon className="size-8 animate-spin text-emerald-600" />
        </div>
      )}
    </div>
  );
};

export default FoodLog;

