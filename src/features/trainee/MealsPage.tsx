import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Meal } from "@/types";
import { Trash } from "@/components/icons";

type Form = { text: string; mealType: string; mood: string; createdAt: string };

type SwipeState = { [id: string]: number }; // translateX in px (0..-80)

/** עזרי תאריך */
function toISODateKey(iso: string) { return new Date(iso).toISOString().slice(0, 10); }
function formatDateOnly(isoDateKey: string) {
  const d = new Date(isoDateKey + "T00:00:00");
  return d.toLocaleDateString("he-IL");
}

export default function MealsPage() {
  const qc = useQueryClient();
  const { show } = useToast();

  const meals = useQuery<Meal[]>({ queryKey: ["meals"], queryFn: api.trainee.meals.list });

  const { register, handleSubmit, reset } = useForm<Form>({
    defaultValues: {
      text: "",
      mealType: "בוקר",
      mood: "טוב",
      createdAt: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    },
  });

  const create = useMutation({
    mutationFn: (d: Form) => api.trainee.meals.create({
      text: d.text, mealType: d.mealType, mood: d.mood, createdAt: d.createdAt
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals"] });
      show("הארוחה נוספה");
      reset({ text: "", mealType: "בוקר", mood: "טוב", createdAt: new Date().toISOString().slice(0, 16) });
    }
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.trainee.meals.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["meals"] }); show("הארוחה נמחקה"); }
  });

  /** החלקה כמו באימונים – שורה אחת פתוחה בכל רגע */
  const [swipe, setSwipe] = useState<SwipeState>({});
  const startXRef = useRef<number>(0);
  const activeIdRef = useRef<string | null>(null);

  function onTouchStart(id: string, e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX;
    activeIdRef.current = id;
    // סגור אחרים
    setSwipe(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(k => (copy[k] = 0));
      return copy;
    });
  }
  function onTouchMove(id: string, e: React.TouchEvent) {
    if (activeIdRef.current !== id) return;
    const dx = e.touches[0].clientX - startXRef.current; // שלילי שמאלה
    const next = Math.max(-80, Math.min(0, dx));
    setSwipe(prev => ({ ...prev, [id]: next }));
  }
  function onTouchEnd(id: string) {
    if (activeIdRef.current !== id) return;
    const current = swipe[id] ?? 0;
    const snapped = current < -40 ? -80 : 0;
    setSwipe(prev => ({ ...prev, [id]: snapped }));
    activeIdRef.current = null;
  }

  /** קיבוץ לפי ימים ומיון פנימי (מאוחר->מוקדם) */
  const grouped = useMemo(() => {
    const data = meals.data ?? [];
    const byDay = new Map<string, Meal[]>();
    for (const m of data) {
      const key = toISODateKey(m.createdAt);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(m);
    }
    const dayKeys = Array.from(byDay.keys()).sort((a, b) => b.localeCompare(a));
    return dayKeys.map(key => ({
      key,
      items: byDay.get(key)!.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }));
  }, [meals.data]);

  /** תגיות צבע */
  const mealTypeClass = (t: string) =>
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs border " +
    (t === "בוקר" ? "bg-amber-50 border-amber-200 text-amber-700"
     : t === "צהריים" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
     : t === "ערב" ? "bg-indigo-50 border-indigo-200 text-indigo-700"
     : "bg-slate-50 border-slate-200 text-slate-700");

  const moodClass = (m: string) =>
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs border " +
    (m === "מעולה" ? "bg-green-50 border-green-200 text-green-700"
     : m === "טוב" ? "bg-sky-50 border-sky-200 text-sky-700"
     : m === "עייף" ? "bg-yellow-50 border-yellow-200 text-yellow-700"
     : "bg-rose-50 border-rose-200 text-rose-700");

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <h1 className="text-2xl font-bold">ארוחות</h1>

      {/* טופס הוספה */}
      <form
        onSubmit={handleSubmit(d => create.mutate(d))}
        className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_1.2fr_auto]"
      >
        <Input placeholder="מה אכלתי..." {...register("text", { required: true })} />
        <select {...register("mealType", { required: true })} className="border rounded px-2 py-1">
          <option value="בוקר">בוקר</option>
          <option value="צהריים">צהריים</option>
          <option value="ערב">ערב</option>
          <option value="נשנוש">נשנוש</option>
        </select>
        <select {...register("mood", { required: true })} className="border rounded px-2 py-1">
          <option value="טוב">טוב</option>
          <option value="מעולה">מעולה</option>
          <option value="עייף">עייף</option>
          <option value="לא משהו">לא משהו</option>
        </select>
        <Input type="datetime-local" {...register("createdAt", { required: true })} />
        <Button type="submit">הוסף</Button>
      </form>

      {/* תצוגה יומית + החלקה למחיקה בסגנון אימונים */}
      {grouped.map(group => (
        <section key={group.key} className="space-y-2">
          <h3 className="text-lg font-semibold">{formatDateOnly(group.key)}</h3>

          <ul className="space-y-3">
            {group.items.map(m => {
              const tx = swipe[m.id] ?? 0;
              return (
                <li key={m.id} className="relative">
                  {/* כפתור מחיקה (מימין, נחשף בהחלקה) */}
                  <button
                    onClick={() => remove.mutate(m.id)}
                    className="absolute right-0 top-0 bottom-0 w-16 bg-red-600 text-white flex items-center justify-center rounded-xl"
                    aria-label="מחק ארוחה"
                  >
                    <Trash />
                  </button>

                  {/* שורת הארוחה – לבן נטו, כך שהאדום לא “מציץ” */}
                  <div
                    className="bg-white border border-green-200 rounded-xl px-4 py-3 pr-4 pl-16
                               flex items-center justify-between select-none touch-pan-x
                               transition-[transform] duration-150 ease-out"
                    style={{ transform: `translateX(${tx}px)` }}
                    onTouchStart={e => onTouchStart(m.id, e)}
                    onTouchMove={e => onTouchMove(m.id, e)}
                    onTouchEnd={() => onTouchEnd(m.id)}
                  >
                    <span className={mealTypeClass(m.mealType)}>{m.mealType}</span>

                    <div className="flex-1 text-right">
                      <div className="font-semibold">{m.text}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="ml-2">הרגשה:</span>
                        <span className={moodClass(m.mood)}>{m.mood}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
