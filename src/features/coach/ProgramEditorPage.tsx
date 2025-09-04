import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

type Form = {
  name: string;
  notes: string;
  sessions: { title: string; date?: string; exercises: { name: string; sets: number; reps: number; notes?: string }[] }[];
};

export default function ProgramEditorPage() {
  const { traineeId, programId } = useParams();
  const nav = useNavigate();

  const existing = useQuery({
    queryKey: ["coach-program", traineeId, programId],
    queryFn: async () => programId ? api.trainee.programs.get(programId) : null
  });

  const { control, register, handleSubmit } = useForm<Form>({
    defaultValues: existing.data || { name: "", notes: "", sessions: [{ title: "סשן 1", exercises: [{ name: "סקווט", sets: 3, reps: 8 }] }] }
  });
  const ses = useFieldArray({ control, name: "sessions" });

  const onSubmit = async (data: Form) => {
    if (programId) {
      await api.coach.trainees.programs.update(traineeId!, programId, data);
    } else {
      await api.coach.trainees.programs.create(traineeId!, data);
    }
    nav(`/coach/trainees/${traineeId}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{programId ? "עריכת תוכנית" : "יצירת תוכנית"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm">שם תוכנית</label>
          <Input {...register("name", { required: true })} />
        </div>
        <div>
          <label className="block text-sm">הערות</label>
          <Input {...register("notes")} />
        </div>

        <div className="space-y-4">
          {ses.fields.map((f, i) => (
            <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex gap-2">
                <Input placeholder="כותרת" {...register(`sessions.${i}.title` as const, { required: true })} />
                <Input type="date" {...register(`sessions.${i}.date` as const)} />
              </div>
              <div className="space-y-2">
                {/* Simple single exercise editor for demo */}
                <div className="grid md:grid-cols-3 gap-2">
                  <Input placeholder="תרגיל" {...register(`sessions.${i}.exercises.0.name` as const, { required: true })} />
                  <Input type="number" placeholder="סטים" {...register(`sessions.${i}.exercises.0.sets` as const, { valueAsNumber: true })} />
                  <Input type="number" placeholder="חזרות" {...register(`sessions.${i}.exercises.0.reps` as const, { valueAsNumber: true })} />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => ses.append({ title: "סשן חדש", exercises: [{ name: "", sets: 3, reps: 10 }] })}>הוסף סשן</Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">שמור</Button>
        </div>
      </form>
    </div>
  );
}
