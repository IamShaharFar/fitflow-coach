import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardMeta, CardTitle } from "@/components/ui/Card";

type AnyMeal = {
  id: string;
  createdAt: string;     // ISO
  text: string;
  mealType: string;      // בוקר/צהריים/ערב/נשנוש...
  mood?: string;
};
type AnyWorkout = { id: string; createdAt: string; type: string };

// helpers
const dayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10); // YYYY-MM-DD
const formatDay = (key: string) =>
  new Date(key + "T00:00:00").toLocaleDateString("he-IL");

export default function TraineeProfilePage() {
  const { traineeId } = useParams();
  const profile = useQuery({
    queryKey: ["coach-trainee", traineeId],
    queryFn: () => api.coach.trainees.get(traineeId!)
  });
  const [tab, setTab] = useState("overview");

  // נגדיר אובייקטים דיפולטיביים כדי שה-hooks יוכלו לרוץ תמיד
  const trainee = profile.data?.trainee;
  const meals = profile.data?.meals ?? [];
  const workouts = profile.data?.workouts ?? [];
  const programs = profile.data?.programs ?? [];

  // hooks תמיד מחושבים, גם כשהדאטה עדיין לא נטענה
  const groupedMeals = useMemo(() => {
    const byDay = new Map<string, typeof meals>();
    for (const m of meals) {
      const key = new Date(m.createdAt).toISOString().slice(0, 10); // YYYY-MM-DD
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(m);
    }
    const keys = [...byDay.keys()].sort((a, b) => b.localeCompare(a));
    return keys.map(k => ({
      key: k,
      items: byDay.get(k)!.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }));
  }, [meals]);

  const groupedWorkouts = useMemo(() => {
    const byDay = new Map<string, typeof workouts>();
    for (const w of workouts) {
      const key = new Date(w.createdAt).toISOString().slice(0, 10);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(w);
    }
    const keys = [...byDay.keys()].sort((a, b) => b.localeCompare(a));
    return keys.map(k => ({
      key: k,
      items: byDay.get(k)!.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }));
  }, [workouts]);

  // במקום return מוקדם, נטפל בטעינה בתוך ה-JSX
  return (
    <div className="space-y-4">
      {!profile.data ? (
        <div>טוען...</div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Card className="bg-white shadow-sm">
              <CardTitle className="text-xl">{`פרופיל של ${trainee?.name}`}</CardTitle>
            </Card>
            <Link to={`/coach/trainees/${trainee?.id}/programs/new`} className="text-blue-600">תוכנית חדשה</Link>
          </div>

          <Tabs
            tabs={[
              { key: "overview", label: "סקירה" },
              { key: "meals", label: "ארוחות" },
              { key: "workouts", label: "אימונים" },
              { key: "programs", label: "תוכניות" },
            ]}
            current={tab}
            onChange={setTab}
          />

          {tab === "overview" && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-green-100 border border-green-300 shadow-md">
                <CardTitle className="text-green-800">ארוחות</CardTitle>
                <CardMeta className="text-green-700 text-2xl font-bold">{meals.length}</CardMeta>
              </Card>
              <Card className="bg-blue-100 border border-blue-300 shadow-md">
                <CardTitle className="text-blue-800">אימונים</CardTitle>
                <CardMeta className="text-blue-700 text-2xl font-bold">{workouts.length}</CardMeta>
              </Card>
              <Card className="bg-orange-100 border border-orange-300 shadow-md">
                <CardTitle className="text-orange-800">תוכניות</CardTitle>
                <CardMeta className="text-orange-700 text-2xl font-bold">{programs.length}</CardMeta>
              </Card>
            </div>
          )}

          {tab === "meals" && (
            <Card className="bg-green-50 border border-green-200 shadow-md">
              <CardTitle className="text-green-800 mb-3">ארוחות</CardTitle>
              <div className="space-y-3">
                {groupedMeals.map(group => (
                  <section key={group.key} className="space-y-2">
                    <div className="text-sm font-semibold text-gray-700">
                      {new Date(group.key + "T00:00:00").toLocaleDateString("he-IL")}
                    </div>
                    <ul className="space-y-2">
                      {group.items.map(m => (
                        <li key={m.id} className="rounded-xl bg-white/80 border border-green-100 px-3 py-2 hover:bg-white transition">
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                              {m.mealType}
                            </span>
                            {m.mood && <span className="text-xs text-gray-500">הרגשה: {m.mood}</span>}
                          </div>
                          <div className="font-medium">{m.text}</div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </Card>
          )}

          {tab === "workouts" && (
            <Card className="bg-blue-50 border border-blue-200 shadow-md">
              <CardTitle className="text-blue-800 mb-3">אימונים</CardTitle>
              <div className="space-y-3">
                {groupedWorkouts.map(group => (
                  <section key={group.key} className="space-y-2">
                    <div className="text-sm font-semibold text-gray-700">
                      {new Date(group.key + "T00:00:00").toLocaleDateString("he-IL")}
                    </div>
                    <ul className="space-y-2">
                      {group.items.map(w => (
                        <li key={w.id} className="rounded-xl bg-white/80 border border-blue-100 px-3 py-2 hover:bg-white transition">
                          <div className="font-medium">{w.type}</div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </Card>
          )}

          {tab === "programs" && (
            <div className="grid md:grid-cols-2 gap-4">
              {programs.map(p => (
                <Link key={p.id} to={`/coach/trainees/${trainee?.id}/programs/${p.id}/edit`} className="block">
                  <Card className="bg-orange-100 border border-orange-300 shadow-md hover:shadow-lg transition">
                    <CardTitle className="text-orange-800">{p.name}</CardTitle>
                    <CardMeta className="text-gray-700">{p.notes}</CardMeta>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

