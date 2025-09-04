import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardTitle, CardMeta } from "@/components/ui/Card";
import { Users, Dumbbell, ClipboardList } from "@/components/icons";
import { User } from "@/types";
import { Link } from "react-router-dom";

export default function CoachDashboardPage() {
  const trainees = useQuery({ queryKey: ["coach-trainees"], queryFn: api.coach.trainees.list });
  const allPrograms = useQuery({
    queryKey: ["coach-programs-count"], queryFn: async () => {
      const list = await api.coach.trainees.list();
      const pCounts = await Promise.all(list.map((t: User) => api.coach.trainees.programs.list(t.id)));
      return pCounts.flat().length;
    }
  });
  const workouts7 = 7; // demo metric

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">דשבורד מאמנת</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/coach/trainees" className="block">
          <Card className="w-[90%] mx-auto bg-blue-100 border border-blue-300 shadow-md hover:shadow-lg transition cursor-pointer">
            <CardTitle className="flex items-center gap-2 text-blue-800"><Users /> מספר מתאמנים</CardTitle>
            <CardMeta className="text-blue-700">{trainees.data?.length ?? 0}</CardMeta>
          </Card>
        </Link>

        <Link to="/coach/trainees" className="block">
          <Card className="w-[90%] mx-auto bg-green-100 border border-green-300 shadow-md hover:shadow-lg transition cursor-pointer">
            <CardTitle className="flex items-center gap-2 text-green-800"><Dumbbell /> אימונים ב-7 ימים</CardTitle>
            <CardMeta className="text-green-700">{workouts7}</CardMeta>
          </Card>
        </Link>

        <Link to="/coach/programs" className="block">
          <Card className="w-[90%] mx-auto bg-orange-100 border border-orange-300 shadow-md hover:shadow-lg transition cursor-pointer">
            <CardTitle className="flex items-center gap-2 text-orange-800"><ClipboardList /> תוכניות פעילות</CardTitle>
            <CardMeta className="text-orange-700">{allPrograms.data ?? 0}</CardMeta>
          </Card>
        </Link>
      </div>
    </div>
  );
}
