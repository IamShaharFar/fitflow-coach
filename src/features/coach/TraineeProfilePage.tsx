import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardMeta, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Goal } from "@/types";


type AnyMeal = {
  id: string;
  createdAt: string; // ISO
  text: string;
  mealType: string; // בוקר/צהריים/ערב/נשנוש...
  mood?: string;
};
type AnyWorkout = { id: string; createdAt: string; type: string };

type MeasurementForm = {
  weight: number;
  chest?: number;
  waist?: number;
  hips?: number;
  height?: number;
  bodyFat?: number;
  date: string;
};

// helpers
const dayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10); // YYYY-MM-DD
const formatDay = (key: string) =>
  new Date(key + "T00:00:00").toLocaleDateString("he-IL");

export default function TraineeProfilePage() {
  const { traineeId } = useParams();
  const [formOpen, setFormOpen] = useState(false);
  // סטייטים לפידבק
  const [feedbackWorkouts, setFeedbackWorkouts] = useState("");
  const [statusWorkouts, setStatusWorkouts] = useState<"idle" | "sending" | "sent">("idle");

  const [feedbackMeals, setFeedbackMeals] = useState("");
  const [statusMeals, setStatusMeals] = useState<"idle" | "sending" | "sent">("idle");

  const [feedbackSleep, setFeedbackSleep] = useState("");
  const [statusSleep, setStatusSleep] = useState<"idle" | "sending" | "sent">("idle");

  const qc = useQueryClient();
  const profile = useQuery({
    queryKey: ["coach-trainee", traineeId],
    queryFn: () => api.coach.trainees.get(traineeId!)
  });

  const addMeasurement = useMutation({
    mutationFn: (data: MeasurementForm) =>
      api.coach.trainees.addMeasurement!(traineeId!, data), // 👈 צריך להיות ממומש ב־realService
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-trainee", traineeId] })
  });

  const traineeProfile = profile.data?.profile;

  const [tab, setTab] = useState("meals");
  const form = useForm<MeasurementForm>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10)
    }
  });

  // נגדיר אובייקטים דיפולטיביים כדי שה-hooks יוכלו לרוץ תמיד
  const trainee = profile.data?.trainee;
  const meals = profile.data?.meals ?? [];
  const workouts = profile.data?.workouts ?? [];
  const programs = profile.data?.programs ?? [];
  const sleep = profile.data?.sleep ?? [];
  // console.log("TraineeProfilePage render", { trainee, meals, workouts, programs, traineeProfile });

  // hooks תמיד מחושבים, גם כשהדאטה עדיין לא נטענה
  const groupedMeals = useMemo(() => {
    const byDay = new Map<string, typeof meals>();
    for (const m of meals) {
      const key = new Date(m.createdAt).toISOString().slice(0, 10);
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

  // שבעת הימים האחרונים כולל היום
  const last7days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // 6 אחורה עד היום
    const key = d.toISOString().slice(0, 10);

    const found = sleep.find(s => s.date.slice(0, 10) === key);
    return {
      date: key,
      hours: found ? found.hours : 0,
    };
  });

  // נביא את המדידה האחרונה מפרופיל המתאמן (אם יש)
  const lastMeasurement = traineeProfile?.measurements?.length
    ? traineeProfile.measurements[traineeProfile.measurements.length - 1]
    : null;


  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const goalsQuery = useQuery({
    queryKey: ["coach-trainee-goals", traineeId],
    queryFn: () => api.coach.trainees.goals.list(traineeId!),
  });
  const goals = goalsQuery.data ?? [];

  const createGoal = useMutation({
    mutationFn: (payload: { category: Goal["category"]; target: number; deadline: string }) =>
      api.coach.trainees.goals.create(traineeId!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-trainee-goals", traineeId] }),
  });

  const updateGoal = useMutation({
    mutationFn: (vars: { id: string; payload: { target: number; deadline: string } }) =>
      api.coach.trainees.goals.update(traineeId!, vars.id, vars.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-trainee-goals", traineeId] }),
  });

  const removeGoal = useMutation({
    mutationFn: (id: string) => api.coach.trainees.goals.remove(traineeId!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-trainee-goals", traineeId] }),
  });

  type GoalForm = {
    category: Goal["category"];
    target: number;
    deadline: string;
  };

  // טופס בלי id ובלי start (start נקבע אוטומטית מהמדידות)
  const [goalForm, setGoalForm] = useState<GoalForm>({
    category: "weight",
    target: 0,
    deadline: new Date().toISOString().slice(0, 10),
  });



  const getLabel = (c: Goal["category"]) => {
    switch (c) {
      case "weight": return "משקל (ק״ג)";
      case "bodyFat": return "שומן (%)";
      case "chest": return "חזה (ס״מ)";
      case "waist": return "מותניים (ס״מ)";
      case "hips": return "ירכיים (ס״מ)";
    }
  };

  function getCurrent(category: Goal["category"]): number {
    if (!lastMeasurement) return 0;
    switch (category) {
      case "weight": return lastMeasurement.weight ?? 0;
      case "bodyFat": return lastMeasurement.bodyFat ?? 0;
      case "chest": return lastMeasurement.chest ?? 0;
      case "waist": return lastMeasurement.waist ?? 0;
      case "hips": return lastMeasurement.hips ?? 0;
      default: return 0;
    }
  }



  // אחוז התקדמות
  function getProgress(goal: Goal): number {
    const current = getCurrent(goal.category);
    const { start, target } = goal;
    if (start === target) return 100;

    if (target < start) {
      return Math.min(100, Math.max(0, ((start - current) / (start - target)) * 100));
    }
    return Math.min(100, Math.max(0, ((current - start) / (target - start)) * 100));
  }

  function getProgressColor(progress: number): string {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  }


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
            <Link to={`/coach/trainees/${trainee?.id}/programs/new`} className="text-blue-600">
              תוכנית חדשה
            </Link>
          </div>

          <Tabs
            tabs={[
              { key: "meals", label: "ארוחות" },
              { key: "workouts", label: "אימונים" },
              { key: "programs", label: "תוכניות" },
              { key: "sleep", label: "שינה" },
              { key: "profile", label: "פרופיל" },
              { key: "goals", label: "יעדים" },
            ]}
            current={tab}
            onChange={setTab}
          />

          {tab === "meals" && (
            <Card className="bg-green-50 border border-green-200 shadow-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-800 mb-3">ארוחות</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById("feedback-meals");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  ✍️ כתוב פידבק
                </Button>
              </div>
              {groupedMeals.length ? (
                groupedMeals.map(group => (
                  <section key={group.key} className="space-y-2">
                    <div className="text-sm font-semibold text-gray-700">
                      {new Date(group.key + "T00:00:00").toLocaleDateString("he-IL")}
                    </div>
                    <ul className="space-y-2">
                      {group.items.map(m => (
                        <li key={m.id} className="rounded-xl bg-white border px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-green-100 px-2 py-0.5 rounded-full">{m.mealType}</span>
                            {m.mood && <span className="text-xs text-gray-500">הרגשה: {m.mood}</span>}
                          </div>
                          <div className="font-medium">{m.text}</div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              ) : (
                <div className="text-gray-500">אין ארוחות עדיין</div>
              )}

              {/* פידבק לארוחות */}
              <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3" id="feedback-meals">
                <h3 className="text-lg font-semibold text-gray-800">פידבק על הארוחות</h3>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="כתוב כאן פידבק על הארוחות..."
                  value={feedbackMeals}
                  onChange={(e) => setFeedbackMeals(e.target.value)}
                  disabled={statusMeals === "sending"}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      if (!feedbackMeals.trim()) return;
                      setStatusMeals("sending");

                      // 👇 צריך לממש בשרת
                      await new Promise((res) => setTimeout(res, 1000));

                      setStatusMeals("sent");
                      setFeedbackMeals("");

                      setTimeout(() => setStatusMeals("idle"), 2500);
                    }}
                    disabled={statusMeals === "sending"}
                  >
                    {statusMeals === "sending" ? "שולח..." : "שלח פידבק"}
                  </Button>
                </div>
                {statusMeals === "sent" && (
                  <div className="text-green-600 text-sm font-medium">✅ הפידבק נשלח בהצלחה</div>
                )}
              </div>
            </Card>
          )}


          {tab === "workouts" && (
            <Card className="bg-blue-50 border border-blue-200 shadow-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-800 mb-3">אימונים</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById("feedback-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  ✍️ כתוב פידבק
                </Button>
              </div>

              {groupedWorkouts.length ? (
                groupedWorkouts.map(group => (
                  <section key={group.key} className="space-y-2">
                    <div className="text-sm font-semibold text-gray-700">
                      {new Date(group.key + "T00:00:00").toLocaleDateString("he-IL")}
                    </div>
                    <ul className="space-y-2">
                      {group.items.map(w => (
                        <li key={w.id} className="rounded-xl bg-white border px-3 py-2">
                          <div className="font-medium">{w.type}</div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              ) : (
                <div className="text-gray-500">אין אימונים עדיין</div>
              )}

              {/* פידבק – בסוף הרשימה */}
              <div
                id="feedback-section"
                className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
              >
                <h3 className="text-lg font-semibold text-gray-800">פידבק מהמאמן</h3>

                <textarea
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="כתוב כאן פידבק על האימונים..."
                  value={feedbackWorkouts}
                  onChange={(e) => setFeedbackWorkouts(e.target.value)}
                  disabled={statusWorkouts === "sending"}
                />

                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      if (!feedbackWorkouts.trim()) return;
                      setStatusWorkouts("sending");

                      // 👇 צריך לממש בשרת
                      await new Promise((res) => setTimeout(res, 1000));

                      setStatusWorkouts("sent");
                      setFeedbackWorkouts("");

                      setTimeout(() => setStatusWorkouts("idle"), 2500);
                    }}
                    disabled={statusWorkouts === "sending"}
                  >
                    {statusWorkouts === "sending" ? "שולח..." : "שלח פידבק"}
                  </Button>
                </div>

                {statusWorkouts === "sent" && (
                  <div className="text-green-600 text-sm font-medium">
                    ✅ הפידבק נשלח בהצלחה
                  </div>
                )}
              </div>
            </Card>
          )}


          {tab === "programs" && (
            <div className="grid md:grid-cols-2 gap-4">
              {programs.length ? (
                programs.map(p => (
                  <Link key={p.id} to={`/coach/trainees/${trainee?.id}/programs/${p.id}/edit`}>
                    <Card className="bg-orange-100 border border-orange-300 shadow-md p-4 hover:shadow-lg transition">
                      <CardTitle className="text-orange-800">{p.name}</CardTitle>
                      <CardMeta className="text-gray-700">{p.notes}</CardMeta>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="text-gray-500">אין תוכניות עדיין</div>
              )}
            </div>
          )}

          {tab === "sleep" && (
            <Card className="bg-purple-50 border border-purple-200 shadow-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-800">שינה</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById("feedback-sleep");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  ✍️ כתוב פידבק
                </Button>
              </div>

              {/* גרף 7 ימים */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7days}>
                    <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })} />
                    <YAxis domain={[0, "dataMax + 2"]} />
                    <Tooltip labelFormatter={d => new Date(d).toLocaleDateString("he-IL")} formatter={(value: number) => [`${value} שעות`, "שינה"]} />
                    <Legend />
                    <Line type="monotone" dataKey="hours" stroke="#9333ea" name="שעות שינה" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* רשימת שינה */}
              {sleep.length ? (
                <ul className="space-y-2">
                  {sleep.map(s => (
                    <li key={s.id} className="rounded-xl bg-white border px-3 py-2">
                      <div className="font-medium text-gray-700">{new Date(s.date).toLocaleDateString("he-IL")}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>שעות שינה: {s.hours}</div>
                        {s.note && <div>הערות: {s.note}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">אין נתוני שינה עדיין</div>
              )}

              {/* פידבק על שינה */}
              <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3" id="feedback-sleep">
                <h3 className="text-lg font-semibold text-gray-800">פידבק על השינה</h3>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="כתוב כאן פידבק על השינה..."
                  value={feedbackSleep}
                  onChange={(e) => setFeedbackSleep(e.target.value)}
                  disabled={statusSleep === "sending"}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      if (!feedbackSleep.trim()) return;
                      setStatusSleep("sending");

                      // 👇 צריך לממש בשרת
                      await new Promise((res) => setTimeout(res, 1000));

                      setStatusSleep("sent");
                      setFeedbackSleep("");

                      setTimeout(() => setStatusSleep("idle"), 2500);
                    }}
                    disabled={statusSleep === "sending"}
                  >
                    {statusSleep === "sending" ? "שולח..." : "שלח פידבק"}
                  </Button>
                </div>
                {statusSleep === "sent" && (
                  <div className="text-green-600 text-sm font-medium">✅ הפידבק נשלח בהצלחה</div>
                )}
              </div>
            </Card>
          )}



          {tab === "profile" && (


            <Card className="bg-white border shadow-md p-4 space-y-4">
              <CardTitle className="text-xl text-gray-800 mb-2">מדידות גוף</CardTitle>
              {/* גרף מדידות */}
              {traineeProfile?.measurements?.length ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={traineeProfile.measurements}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) =>
                          new Date(d).toLocaleDateString("he-IL", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(d) =>
                          new Date(d).toLocaleDateString("he-IL")
                        }
                      />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="#3b82f6" name="משקל" />
                      <Line type="monotone" dataKey="bodyFat" stroke="#ef4444" name="שומן %" />
                      <Line type="monotone" dataKey="chest" stroke="#f59e0b" name="חזה" />
                      <Line type="monotone" dataKey="waist" stroke="#8b5cf6" name="מותניים" />
                      <Line type="monotone" dataKey="hips" stroke="#ec4899" name="ירכיים" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-gray-500">אין נתונים לגרף עדיין</div>
              )}
              {/* טופס הוספת מדידה */}
              {/* כפתור לפתיחת טופס */}
              <Button onClick={() => setFormOpen(o => !o)}>
                {formOpen ? "סגור טופס" : "➕ הוסף מדידה"}
              </Button>

              {/* טופס הוספת מדידה */}
              {formOpen && (
                <form
                  onSubmit={form.handleSubmit(d =>
                    addMeasurement.mutate({
                      weight: Number(d.weight),
                      chest: d.chest ? Number(d.chest) : undefined,
                      waist: d.waist ? Number(d.waist) : undefined,
                      hips: d.hips ? Number(d.hips) : undefined,
                      height: d.height ? Number(d.height) : undefined,
                      bodyFat: d.bodyFat ? Number(d.bodyFat) : undefined,
                      date: new Date(d.date).toISOString()
                    })
                  )}
                  className="grid md:grid-cols-4 gap-2 mt-2"
                >
                  <Input type="date" {...form.register("date", { required: true })} />
                  <Input placeholder="משקל (ק״ג)" type="number" step="0.1" {...form.register("weight", { required: true })} />
                  <Input placeholder="חזה (ס״מ)" type="number" step="0.1" {...form.register("chest")} />
                  <Input placeholder="מותניים (ס״מ)" type="number" step="0.1" {...form.register("waist")} />
                  <Input placeholder="ירכיים (ס״מ)" type="number" step="0.1" {...form.register("hips")} />
                  <Input placeholder="גובה (ס״מ)" type="number" step="0.1" {...form.register("height")} />
                  <Input placeholder="שומן (%)" type="number" step="0.1" {...form.register("bodyFat")} />
                  <Button type="submit">שמור</Button>
                </form>
              )}


              {/* רשימת מדידות */}
              {traineeProfile?.measurements?.length ? (
                <ul className="space-y-2">
                  {traineeProfile.measurements.slice(-5).reverse().map(m => (
                    <li key={m.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="font-medium text-gray-700">
                        {new Date(m.date).toLocaleDateString("he-IL")}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>משקל: {m.weight} ק״ג</div>
                        {m.chest && <div>חזה: {m.chest} ס״מ</div>}
                        {m.waist && <div>מותניים: {m.waist} ס״מ</div>}
                        {m.hips && <div>ירכיים: {m.hips} ס״מ</div>}
                        {m.height && <div>גובה: {m.height} ס״מ</div>}
                        {m.bodyFat && <div>שומן: {m.bodyFat}%</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">אין מדידות עדיין</div>
              )}
            </Card>
          )}
        </>
      )}

      {tab === "goals" && (
        <Card className="bg-yellow-50 border border-yellow-200 shadow-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-yellow-800 mb-3">🎯 יעדים</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditGoalId(null);
                setGoalForm({
                  category: "weight",
                  target: 0,
                  deadline: new Date().toISOString().slice(0, 10),
                });
                setGoalFormOpen(true);
              }}
            >
              ➕ הוסף יעד
            </Button>
          </div>

          {/* טופס יעד */}
          {goalFormOpen && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editGoalId) {
                  updateGoal.mutate({
                    id: editGoalId,
                    payload: {
                      target: goalForm.target,
                      deadline: goalForm.deadline,
                    },
                  });
                } else {
                  createGoal.mutate({
                    category: goalForm.category,
                    target: goalForm.target,
                    deadline: goalForm.deadline,
                  });
                }
                setGoalFormOpen(false);
              }}
              className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={goalForm.category}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, category: e.target.value as Goal["category"] })
                  }
                >
                  <option value="weight">משקל</option>
                  <option value="bodyFat">אחוז שומן</option>
                  <option value="chest">חזה</option>
                  <option value="waist">מותניים</option>
                  <option value="hips">ירכיים</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getLabel(goalForm.category)} – יעד
                </label>
                <input
                  type="number"
                  className="w-full border rounded p-2 text-sm"
                  placeholder={`הזן ${getLabel(goalForm.category)}`}
                  value={goalForm.target}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, target: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך יעד</label>
                <input
                  type="date"
                  className="w-full border rounded p-2 text-sm"
                  value={goalForm.deadline}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, deadline: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setGoalFormOpen(false)}
                >
                  ביטול
                </Button>
                <Button type="submit">{editGoalId ? "עדכן יעד" : "שמור יעד"}</Button>
              </div>
            </form>
          )}

          {/* רשימת יעדים */}
          {goalsQuery.isLoading ? (
            <div>טוען יעדים...</div>
          ) : goals.length ? (
            <ul className="space-y-3">
              {goals.map((g) => {
                const current = getCurrent(g.category);
                const progress = getProgress(g);
                return (
                  <li
                    key={g.id}
                    className="rounded-xl bg-white border p-4 shadow-sm space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {getLabel(g.category)}
                      </span>
                      <span className="text-sm text-gray-500">
                        יעד: {g.target} | נוכחי: {current} | התחלה: {g.start}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getProgressColor(progress)} transition-all`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>יעד עד: {new Date(g.deadline).toLocaleDateString("he-IL")}</span>
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:underline text-xs"
                          onClick={() => {
                            setEditGoalId(g.id);
                            setGoalForm({
                              category: g.category,
                              target: g.target,
                              deadline: g.deadline,
                            });
                            setGoalFormOpen(true);
                          }}
                        >
                          ערוך
                        </button>
                        <button
                          className="text-red-600 hover:underline text-xs"
                          onClick={() => removeGoal.mutate(g.id)}
                        >
                          מחק
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-gray-500">אין יעדים עדיין</div>
          )}
        </Card>
      )}


    </div>
  );
}
