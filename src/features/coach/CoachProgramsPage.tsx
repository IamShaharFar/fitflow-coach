import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardTitle, CardMeta } from "@/components/ui/Card";
import { Link } from "react-router-dom";

export default function CoachProgramsPage() {
    const trainees = useQuery({ queryKey: ["coach-trainees"], queryFn: api.coach.trainees.list });
    const programs = useQuery({
        queryKey: ["coach-programs-all"],
        queryFn: async () => {
            const list = await api.coach.trainees.list();
            const perTrainee = await Promise.all(
                list.map(async (t) => {
                    const p = await api.coach.trainees.programs.list(t.id);
                    return p.map(pp => ({ ...pp, trainee: t }));
                })
            );
            return perTrainee.flat();
        }
    });

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">תוכניות</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.data?.map(p => (
                    <Link key={p.id} to={`/coach/programs/${p.id}`}>
                        <Card className="bg-orange-100 border border-orange-300 shadow-md hover:shadow-lg transition">
                            <CardTitle className="text-orange-800">{p.name}</CardTitle>
                            <CardMeta className="text-gray-700">{p.notes}</CardMeta>
                        </Card>
                    </Link>
                )) || <div>אין תוכניות עדיין</div>}
            </div>
        </div>
    );
}
