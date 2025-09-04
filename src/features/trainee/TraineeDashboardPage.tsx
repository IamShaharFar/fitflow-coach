import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardTitle, CardMeta } from "@/components/ui/Card";
import { Utensils, Dumbbell, Activity, Plus, X } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useNavigate } from "react-router-dom";

type MealForm = { text: string; mealType: string; mood: string; createdAt: string };
type WorkoutForm = { type: string; createdAt: string };

export default function TraineeDashboardPage() {
  const nav = useNavigate();
  const { show } = useToast();
  const qc = useQueryClient();

  const meals = useQuery({ queryKey: ["meals"], queryFn: api.trainee.meals.list });
  const workouts = useQuery({ queryKey: ["workouts"], queryFn: api.trainee.workouts.list });
  const programs = useQuery({ queryKey: ["programs"], queryFn: api.trainee.programs.list });

  // FAB / Speed dial
  const [dialOpen, setDialOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [workoutOpen, setWorkoutOpen] = useState(false);

  // Meal create
  const mealForm = useForm<MealForm>({
    defaultValues: {
      text: "",
      mealType: "בוקר",
      mood: "טוב",
      createdAt: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    },
  });

  const createMeal = useMutation({
    mutationFn: (d: MealForm) =>
      api.trainee.meals.create({
        text: d.text,
        mealType: d.mealType,
        mood: d.mood,
        createdAt: d.createdAt,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals"] });
      show("הארוחה נוספה");
      setMealOpen(false);
      mealForm.reset({
        text: "",
        mealType: "בוקר",
        mood: "טוב",
        createdAt: new Date().toISOString().slice(0, 16),
      });
    },
  });

  // Workout create
  const workoutForm = useForm<WorkoutForm>({
    defaultValues: {
      type: "",
      createdAt: new Date().toISOString().slice(0, 16),
    },
  });

  const createWorkout = useMutation({
    mutationFn: (d: WorkoutForm) =>
      api.trainee.workouts.create({
        type: d.type,
        createdAt: new Date(d.createdAt).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      show("האימון נוסף");
      setWorkoutOpen(false);
      workoutForm.reset({
        type: "",
        createdAt: new Date().toISOString().slice(0, 16),
      });
    },
  });

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <h1 className="text-2xl font-bold">דשבורד</h1>

      {/* כרטיסי סטטוס – כרטיסים קליקים שמעבירים לעמודים */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => nav("/app/workouts")}
          className="text-right"
          aria-label="הצג אימונים"
        >
          <Card className="w-[90%] mx-auto bg-blue-100 border border-blue-300 shadow-md hover:shadow-lg transition">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Dumbbell /> אימונים אחרונים
            </CardTitle>
            <CardMeta className="text-blue-700">
              {workouts.data?.slice(0, 5).length || 0} בשבוע האחרון
            </CardMeta>
          </Card>
        </button>

        <button
          onClick={() => nav("/app/meals")}
          className="text-right"
          aria-label="הצג ארוחות"
        >
          <Card className="w-[90%] mx-auto bg-green-100 border border-green-300 shadow-md hover:shadow-lg transition">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Utensils /> ארוחות אחרונות
            </CardTitle>
            <CardMeta className="text-green-700">
              {meals.data?.slice(0, 5).length || 0} ב-7 ימים
            </CardMeta>
          </Card>
        </button>

        <button
          onClick={() => nav("/app/programs")}
          className="text-right"
          aria-label="הצג תוכניות"
        >
          <Card className="w-[90%] mx-auto bg-orange-100 border border-orange-300 shadow-md hover:shadow-lg transition">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Activity /> תוכניות פעילות
            </CardTitle>
            <CardMeta className="text-orange-700">
              {programs.data?.length || 0}
            </CardMeta>
          </Card>
        </button>
      </div>

      {/* רשימות קצרות */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-green-50 border border-green-200 shadow-sm">
          <CardTitle className="text-green-800">5 ארוחות אחרונות</CardTitle>
          <ul className="space-y-2">
            {meals.data?.slice(0, 5).map((m) => (
              <li key={m.id} className="border-b pb-2">
                <div className="text-sm text-gray-600">
                  {new Date(m.createdAt).toLocaleString("he-IL")}
                </div>
                <div className="font-medium">{m.text}</div>
                <div className="text-xs text-gray-500">סוג: {m.mealType}</div>
                <div className="text-xs text-gray-500">הרגשה: {m.mood}</div>
              </li>
            )) || <div>אין נתונים עדיין</div>}
          </ul>
          <div className="pt-3">
            <button onClick={() => nav("/app/meals")} className="text-blue-600">
              לכל הארוחות
            </button>
          </div>
        </Card>

        <Card className="bg-blue-50 border border-blue-200 shadow-sm">
          <CardTitle className="text-blue-800">5 אימונים אחרונים</CardTitle>
          <ul className="space-y-2">
            {workouts.data?.slice(0, 5).map((w) => (
              <li key={w.id} className="border-b pb-2">
                <div className="text-sm text-gray-600">
                  {new Date(w.createdAt).toLocaleString("he-IL")}
                </div>
                <div>{w.type}</div>
              </li>
            )) || <div>אין נתונים עדיין</div>}
          </ul>
          <div className="pt-3">
            <button onClick={() => nav("/app/workouts")} className="text-blue-600">
              לכל האימונים
            </button>
          </div>
        </Card>
      </div>

      {/* FAB – ימין למטה, ספיד־דייל עם שתי אפשרויות */}
      <div className="fixed md:hidden bottom-4 right-4 z-50">
        {/* תפריט קטן שנפתח מעל ה-FAB */}
        {dialOpen && (
          <div className="mb-2 flex flex-col items-end gap-2">
            <button
              onClick={() => {
                setDialOpen(false);
                setMealOpen(true);
              }}
              className="flex items-center gap-2 bg-green-600 text-white rounded-full px-3 py-2 shadow-lg active:scale-95 transition"
            >
              <Utensils /> ארוחה חדשה
            </button>
            <button
              onClick={() => {
                setDialOpen(false);
                setWorkoutOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white rounded-full px-3 py-2 shadow-lg active:scale-95 transition"
            >
              <Dumbbell /> אימון חדש
            </button>
          </div>
        )}

        {/* כפתור הפלוס עצמו */}
        <button
          onClick={() => setDialOpen((v) => !v)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-xl active:scale-95 transition"
          aria-label="הוסף"
        >
          {dialOpen ? <X /> : <Plus />}
        </button>
      </div>

      {/* Modal – הוספת ארוחה */}
      <Modal open={mealOpen} onClose={() => setMealOpen(false)} title="הוספת ארוחה">
        <form
          className="space-y-3"
          onSubmit={mealForm.handleSubmit((d) => createMeal.mutate(d))}
        >
          <div>
            <label className="block text-sm mb-1">מה אכלתי</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="לדוגמה: סנדוויץ' טונה"
              {...mealForm.register("text", { required: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">סוג ארוחה</label>
              <select className="w-full border rounded-xl px-3 py-2" {...mealForm.register("mealType", { required: true })}>
                <option value="בוקר">בוקר</option>
                <option value="צהריים">צהריים</option>
                <option value="ערב">ערב</option>
                <option value="נשנוש">נשנוש</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">הרגשה</label>
              <select className="w-full border rounded-xl px-3 py-2" {...mealForm.register("mood", { required: true })}>
                <option value="מעולה">מעולה</option>
                <option value="טוב">טוב</option>
                <option value="עייף">עייף</option>
                <option value="לא משהו">לא משהו</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">תאריך ושעה</label>
            <input
              type="datetime-local"
              className="w-full border rounded-xl px-3 py-2"
              {...mealForm.register("createdAt", { required: true })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setMealOpen(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={createMeal.isPending}>
              שמור
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal – הוספת אימון */}
      <Modal open={workoutOpen} onClose={() => setWorkoutOpen(false)} title="הוספת אימון">
        <form
          className="space-y-3"
          onSubmit={workoutForm.handleSubmit((d) => createWorkout.mutate(d))}
        >
          <div>
            <label className="block text-sm mb-1">סוג אימון</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="לדוגמה: ריצה"
              {...workoutForm.register("type", { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">תאריך ושעה</label>
            <input
              type="datetime-local"
              className="w-full border rounded-xl px-3 py-2"
              {...workoutForm.register("createdAt", { required: true })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setWorkoutOpen(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={createWorkout.isPending}>
              שמור
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
