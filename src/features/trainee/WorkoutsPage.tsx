import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Workout } from "@/types";
import { Trash } from "@/components/icons";

type Form = { type: string; createdAt: string };

type SwipeState = {
  [id: string]: number; // translateX in px (0..-80)
};

export default function WorkoutsPage() {
  const qc = useQueryClient();
  const { show } = useToast();

  const workouts = useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: api.trainee.workouts.list
  });

  const { register, handleSubmit, reset } = useForm<Form>({
    defaultValues: {
      type: "",
      createdAt: new Date().toISOString().slice(0, 16),
    },
  });

  const create = useMutation({
    mutationFn: (d: Form) =>
      api.trainee.workouts.create({
        type: d.type,
        createdAt: new Date(d.createdAt).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      show("האימון נוסף");
      reset({ type: "", createdAt: new Date().toISOString().slice(0, 16) });
    },
  });

  // ----- Swipe-to-delete state -----
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
    const dx = e.touches[0].clientX - startXRef.current; // שלילי כשמחליקים שמאלה
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

  const remove = useMutation({
    mutationFn: (id: string) => api.trainee.workouts.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      show("האימון נמחק");
    },
  });

  const list = useMemo(
    () => (workouts.data ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [workouts.data]
  );

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <h1 className="text-2xl font-bold">אימונים</h1>

      <form
        onSubmit={handleSubmit(d => create.mutate(d))}
        className="grid md:grid-cols-[2fr_1fr_auto] gap-2"
      >
        <Input type="datetime-local" {...register("createdAt", { required: true })} />
        <Input placeholder="סוג אימון, למשל ריצה" {...register("type", { required: true })} />
        <Button type="submit">הוסף</Button>
      </form>

      <ul className="space-y-3">
        {list.map(w => {
          const tx = swipe[w.id] ?? 0;
          return (
            <li key={w.id} className="relative">
              {/* כפתור מחיקה (חשוף כשהשורה מחליקה) */}
              <button
                onClick={() => remove.mutate(w.id)}
                className="absolute right-0 top-0 bottom-0 w-16 bg-red-600 text-white flex items-center justify-center rounded-xl"
                aria-label="מחק אימון"
              >
                <Trash />
              </button>

              {/* שורת האימון - נגררת שמאלה */}
              <div
                className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 pr-4 pl-16
                           flex items-center justify-between select-none touch-pan-x
                           transition-[transform] duration-150 ease-out"
                style={{ transform: `translateX(${tx}px)` }}
                onTouchStart={e => onTouchStart(w.id, e)}
                onTouchMove={e => onTouchMove(w.id, e)}
                onTouchEnd={() => onTouchEnd(w.id)}
              >
                <div className="font-medium">{w.type}</div>
                <div className="text-sm text-gray-600">
                  {new Date(w.createdAt).toLocaleString("he-IL")}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
