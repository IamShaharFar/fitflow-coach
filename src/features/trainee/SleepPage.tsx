import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/Toast";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { subDays, format } from "date-fns";

type SleepForm = { date: string; hours: number; note?: string };

export default function SleepPage() {
    const qc = useQueryClient();
    const { show } = useToast();

    const sleepQ = useQuery({
        queryKey: ["sleep"],
        queryFn: api.trainee.sleep.list,
    });

    const form = useForm<SleepForm>({
        defaultValues: {
            date: new Date().toISOString().slice(0, 10),
            hours: 8,
            note: "",
        },
    });

    const createSleep = useMutation({
        mutationFn: (d: SleepForm) =>
            api.trainee.sleep.create({
                date: new Date(d.date).toISOString(),
                hours: d.hours,
                note: d.note,
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sleep"] });
            show("נוספה שינה");
            form.reset({ date: new Date().toISOString().slice(0, 10), hours: 8, note: "" });
        },
    });

    const removeSleep = useMutation({
        mutationFn: (id: string) => api.trainee.sleep.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sleep"] });
            show("שינה נמחקה");
        },
    });

    const updateSleep = useMutation({
        mutationFn: (payload: { id: string; patch: Partial<SleepForm> }) =>
            api.trainee.sleep.update(payload.id, payload.patch),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sleep"] });
            show("שינה עודכנה");
        },
    });

    if (!sleepQ.data) return <div>טוען...</div>;

    // בונה 7 ימים רצופים אחורה מהיום
    const today = new Date();
    const last7 = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i)); // 7 ימים כולל היום
        const iso = d.toISOString().slice(0, 10);

        const match = sleepQ.data.find((s) => s.date.slice(0, 10) === iso);
        return {
            date: iso,
            hours: match ? match.hours : 0,
            id: match?.id,
        };
    });

    // 30 ימים אחורה
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);

    // מסנן רק מהחודש האחרון
    const last30 = sleepQ.data.filter((s) => new Date(s.date) >= monthAgo);


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">יומן שינה</h1>

            {/* טופס להוספת שינה */}
            <form
                onSubmit={form.handleSubmit((d) => createSleep.mutate(d))}
                className="grid grid-cols-1 md:grid-cols-4 gap-2"
            >
                <Input type="date" {...form.register("date", { required: true })} />
                <Input type="number" step="0.1" min={0} max={24} placeholder="שעות שינה" {...form.register("hours", { required: true })} />
                <Input placeholder="הערה (לא חובה)" {...form.register("note")} />
                <Button type="submit">הוסף</Button>
            </form>

            {/* גרף שינה לשבוע האחרון */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last7}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="hours" stroke="#4f46e5" name="שעות שינה" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* רשימת 7 הימים האחרונים עם כפתורי עדכון */}
            {/* רשימת נתוני שינה (30 ימים אחרונים) */}
            <ul className="space-y-2">
                {last30
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // מהחדש לישן
                    .map((s) => (
                        <li key={s.id} className="flex items-center justify-between border p-3 rounded-xl">
                            <div>
                                <div className="font-medium">{new Date(s.date).toLocaleDateString("he-IL")}</div>
                                <div className="text-sm text-gray-600">{s.hours} שעות {s.note ? `– ${s.note}` : ""}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => updateSleep.mutate({ id: s.id, patch: { hours: s.hours + 1 } })}>
                                    + שעה
                                </Button>
                                <Button variant="secondary" onClick={() => updateSleep.mutate({ id: s.id, patch: { hours: Math.max(0, s.hours - 1) } })}>
                                    - שעה
                                </Button>
                                <Button variant="secondary" onClick={() => removeSleep.mutate(s.id)}>
                                    מחק
                                </Button>
                            </div>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
