import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardTitle } from "@/components/ui/Card";
import type { Program, Session, Exercise } from "@/types";

export default function ProgramDetailsPage() {
  const { programId } = useParams();
  const program = useQuery<Program>({
    queryKey: ["program", programId],
    queryFn: () => api.trainee.programs.get(programId!)
  });

  if (!program.data) return <div>טוען...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{program.data.name}</h1>
      {program.data.sessions.map((s: Session) => (
        <Card key={s.id}>
          <CardTitle>{s.title}</CardTitle>
          <ul>
            {s.exercises.map((ex: Exercise) => (
              <li key={ex.id}>{ex.name} - {ex.sets}x{ex.reps}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
