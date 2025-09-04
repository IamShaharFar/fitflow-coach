import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardTitle, CardMeta } from "@/components/ui/Card";
import type { Program, Session, Exercise } from "@/types";

export default function CoachProgramDetailsPage() {
  const { programId } = useParams();
  const program = useQuery<Program>({
    queryKey: ["coach-program", programId],
    queryFn: () => api.coach.programs.get(programId!)
  });

  if (program.isLoading) return <div>טוען...</div>;
  if (program.isError || !program.data) return <div>שגיאה בטעינת התוכנית</div>;

  const p = program.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <Link
          to={`/coach/trainees/${p.traineeId}/programs/${p.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          עריכת תוכנית
        </Link>
      </div>

      {p.notes && (
        <Card className="bg-orange-50 border border-orange-200">
          <CardTitle className="text-orange-800">הערות</CardTitle>
          <CardMeta className="text-gray-700">{p.notes}</CardMeta>
        </Card>
      )}

      <div className="space-y-4">
        {p.sessions.map((s: Session) => (
          <Card key={s.id} className="bg-white border border-gray-200">
            <CardTitle className="flex items-center justify-between">
              <span>{s.title}</span>
              {s.date && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border">
                  {new Date(s.date).toLocaleDateString("he-IL")}
                </span>
              )}
            </CardTitle>
            <ul className="list-disc pr-6 text-gray-700">
              {s.exercises.map((ex: Exercise) => (
                <li key={ex.id}>
                  {ex.name} - {ex.sets}x{ex.reps}
                  {ex.notes ? <span className="text-xs text-gray-500"> - {ex.notes}</span> : null}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
