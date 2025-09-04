import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import { Card, CardTitle, CardMeta } from "@/components/ui/Card";
import type { Program } from "@/types";

export default function ProgramsPage() {
  const programs = useQuery<Program[]>({ queryKey: ["programs"], queryFn: api.trainee.programs.list });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">התוכניות שלי</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {programs.data?.map((p: Program) => (
          <Link key={p.id} to={`/app/programs/${p.id}`}>
            <Card>
              <CardTitle>{p.name}</CardTitle>
              <CardMeta>{p.notes}</CardMeta>
            </Card>
          </Link>
        )) || <div>אין תוכניות עדיין</div>}
      </div>
    </div>
  );
}
