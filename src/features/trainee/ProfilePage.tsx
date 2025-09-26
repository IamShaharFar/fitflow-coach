import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash } from "@/components/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Measurement = {
  id: string;
  weight: number;
  chest?: number;
  waist?: number;
  hips?: number;
  height?: number;
  bodyFat?: number;
  date: string;
};

type Profile = {
  id: string;
  userId: string;
  birthDate?: string;
  measurements: Measurement[];
  createdAt: string;
  updatedAt: string;
};

type SwipeState = {
  [id: string]: number;
};

export default function ProfilePage() {
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [swipe, setSwipe] = useState<SwipeState>({});
  const startXRef = useRef<number>(0);
  const activeIdRef = useRef<string | null>(null);

  // ----- React Query -----
  const profileQ = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: api.profile.get,
  });

  const addMeasurement = useMutation({
    mutationFn: (data: {
      weight: number;
      chest?: number;
      waist?: number;
      hips?: number;
      height?: number;
      bodyFat?: number;
      date?: string;
    }) => api.profile.addMeasurement(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  const removeMeasurement = useMutation({
    mutationFn: (id: string) => api.profile.removeMeasurement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  const form = useForm<{
    weight: number;
    chest?: number;
    waist?: number;
    hips?: number;
    height?: number;
    bodyFat?: number;
    date: string;
  }>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
    },
  });

  if (profileQ.isLoading) return <div>טוען...</div>;
  if (profileQ.isError) return <div>שגיאה בטעינת פרופיל</div>;

  const profile = profileQ.data!;

  // נביא את שם המשתמש
  const user = localStorage.getItem("user");
  const userName = user ? JSON.parse(user).name : profile.userId;

  // גיל
  const age = profile.birthDate
    ? Math.floor(
        (Date.now() - new Date(profile.birthDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      )
    : undefined;

  // ----- גרף - 5 מדידות אחרונות -----
  const last5 = [...profile.measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-5)
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("he-IL"),
      weight: m.weight,
      chest: m.chest,
      waist: m.waist,
      hips: m.hips,
      height: m.height,
      bodyFat: m.bodyFat,
    }));

  // ----- Swipe-to-delete -----
  function onTouchStart(id: string, e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX;
    activeIdRef.current = id;
    setSwipe((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => (copy[k] = 0));
      return copy;
    });
  }

  function onTouchMove(id: string, e: React.TouchEvent) {
    if (activeIdRef.current !== id) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const next = Math.max(-80, Math.min(0, dx));
    setSwipe((prev) => ({ ...prev, [id]: next }));
  }

  function onTouchEnd(id: string) {
    if (activeIdRef.current !== id) return;
    const current = swipe[id] ?? 0;
    const snapped = current < -40 ? -80 : 0;
    setSwipe((prev) => ({ ...prev, [id]: snapped }));
    activeIdRef.current = null;
  }

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <h1 className="text-2xl font-bold">פרופיל של {userName}</h1>

      <div className="space-y-2">
        <div>גיל: {age ? `${age} שנים` : "לא הוזן"}</div>
      </div>

      {/* טופס להוספת מדידה */}
      <form
        onSubmit={form.handleSubmit((d) =>
          addMeasurement.mutate({
            weight: Number(d.weight),
            chest: d.chest ? Number(d.chest) : undefined,
            waist: d.waist ? Number(d.waist) : undefined,
            hips: d.hips ? Number(d.hips) : undefined,
            height: d.height ? Number(d.height) : undefined,
            bodyFat: d.bodyFat ? Number(d.bodyFat) : undefined,
            date: d.date ? new Date(d.date).toISOString() : undefined,
          })
        )}
        className="grid grid-cols-1 md:grid-cols-8 gap-2"
      >
        <Input type="date" {...form.register("date", { required: true })} />
        <Input type="number" step="0.1" placeholder="משקל (ק״ג)" {...form.register("weight", { required: true })} />
        <Input type="number" step="0.1" placeholder="חזה (ס״מ)" {...form.register("chest")} />
        <Input type="number" step="0.1" placeholder="מותניים (ס״מ)" {...form.register("waist")} />
        <Input type="number" step="0.1" placeholder="ירכיים (ס״מ)" {...form.register("hips")} />
        <Input type="number" step="0.1" placeholder="גובה (ס״מ)" {...form.register("height")} />
        <Input type="number" step="0.1" placeholder="אחוז שומן (%)" {...form.register("bodyFat")} />
        <Button type="submit">הוסף מדידה</Button>
      </form>

      {/* גרף */}
      <div className="h-80 flex justify-center items-center bg-white shadow rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={last5}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
            <Line dataKey="weight" stroke="#10b981" strokeWidth={2} name="משקל" />
            <Line dataKey="chest" stroke="#3b82f6" strokeWidth={2} name="חזה" />
            <Line dataKey="waist" stroke="#f59e0b" strokeWidth={2} name="מותניים" />
            <Line dataKey="hips" stroke="#8b5cf6" strokeWidth={2} name="ירכיים" />
            <Line dataKey="height" stroke="#6366f1" strokeWidth={2} name="גובה" />
            <Line dataKey="bodyFat" stroke="#ef4444" strokeWidth={2} name="אחוז שומן" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* רשימת מדידות */}
      <ul className="space-y-3">
        {profile.measurements.slice(-5).reverse().map((m) => {
          const tx = swipe[m.id] ?? 0;
          const isOpen = openId === m.id;
          return (
            <li key={m.id} className="relative border rounded-xl overflow-hidden">
              {/* כפתור מחיקה */}
              <button
                onClick={() => removeMeasurement.mutate(m.id)}
                className="absolute right-0 top-0 bottom-0 w-16 bg-red-600 text-white flex items-center justify-center"
              >
                <Trash />
              </button>

              {/* שורת המדידה */}
              <div
                className="bg-gray-50 px-4 py-3 transition-[transform] duration-150 ease-out select-none touch-pan-x"
                style={{ transform: `translateX(${tx}px)` }}
                onTouchStart={(e) => onTouchStart(m.id, e)}
                onTouchMove={(e) => onTouchMove(m.id, e)}
                onTouchEnd={() => onTouchEnd(m.id)}
              >
                <button
                  className="w-full text-right font-medium"
                  onClick={() => setOpenId(isOpen ? null : m.id)}
                >
                  {new Date(m.date).toLocaleDateString("he-IL")}
                </button>

                {isOpen && (
                  <div className="mt-2 p-3 bg-white rounded-lg shadow space-y-1 text-sm text-gray-700">
                    <div>משקל: {m.weight} ק״ג</div>
                    {m.chest && <div>חזה: {m.chest} ס״מ</div>}
                    {m.waist && <div>מותניים: {m.waist} ס״מ</div>}
                    {m.hips && <div>ירכיים: {m.hips} ס״מ</div>}
                    {m.height && <div>גובה: {m.height} ס״מ</div>}
                    {m.bodyFat && <div>אחוז שומן: {m.bodyFat}%</div>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
