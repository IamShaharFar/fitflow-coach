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
  sessions: {
    title: string;
    exercises: { name: string; sets: number; reps: number; notes?: string }[];
  }[];
};

export default function ProgramEditorPage() {
  const { traineeId, programId } = useParams();
  const nav = useNavigate();

  const existing = useQuery({
    queryKey: ["coach-program", traineeId, programId],
    queryFn: async () => (programId ? api.trainee.programs.get(programId) : null),
  });

  const form = useForm<Form>({
    defaultValues: { name: "", notes: "", sessions: [{ title: "סשן 1", exercises: [{ name: "סקווט", sets: 3, reps: 8 }] }] }
  });

  const { control, register, handleSubmit, reset } = form;

  // ברגע ש־existing.data משתנה → לעדכן את הטופס
  React.useEffect(() => {
    if (existing.data) {
      reset(existing.data);
    }
  }, [existing.data, reset]);

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {programId ? "עריכת תוכנית" : "יצירת תוכנית"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* שם תוכנית */}
        <div>
          <label className="block text-sm font-medium mb-1">שם תוכנית</label>
          <Input {...register("name", { required: true })} />
        </div>

        {/* הערות */}
        <div>
          <label className="block text-sm font-medium mb-1">הערות</label>
          <Input {...register("notes")} />
        </div>

        {/* סשנים */}
        <div className="space-y-4">
          {ses.fields.map((f, i) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl p-4 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <label className="text-lg font-semibold">
                  סשן {i + 1}
                </label>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => ses.remove(i)}
                >
                  מחק סשן
                </Button>
              </div>

              <div>
                <label className="block text-sm mb-1">כותרת סשן</label>
                <Input
                  placeholder="כותרת"
                  {...register(`sessions.${i}.title` as const, {
                    required: true,
                  })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm">תרגיל</label>
                <div className="grid md:grid-cols-3 gap-2">
                  <Input
                    placeholder="שם התרגיל"
                    {...register(`sessions.${i}.exercises.0.name` as const, {
                      required: true,
                    })}
                  />
                  <div>
                    <label className="block text-sm">מספר סטים</label>
                    <Input
                      type="number"
                      {...register(`sessions.${i}.exercises.0.sets` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm">מספר חזרות</label>
                    <Input
                      type="number"
                      {...register(`sessions.${i}.exercises.0.reps` as const, { valueAsNumber: true })}
                    />
                  </div>

                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              ses.append({
                title: "סשן חדש",
                exercises: [{ name: "", sets: 3, reps: 10 }],
              })
            }
          >
            הוסף סשן
          </Button>
        </div>

        {/* שמירה */}
        <div className="flex justify-end">
          <Button type="submit" className="px-6">
            שמור תוכנית
          </Button>
        </div>
      </form>
    </div>
  );
}
