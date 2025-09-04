import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import { Table, Th, Td } from "@/components/ui/Table";
import { User } from "@/types";

export default function TraineesListPage() {
  const trainees = useQuery({ queryKey: ["coach-trainees"], queryFn: api.coach.trainees.list });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">רשימת מתאמנים</h1>
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 shadow-md">
        <Table>
          <thead>
            <tr>
              <Th>שם</Th>
              <Th>אימייל</Th>
              <Th>פעולות</Th>
            </tr>
          </thead>
          <tbody>
            {trainees.data?.map(t => (
              <tr key={t.id} className="hover:bg-white/60 transition">
                <Td>{t.name}</Td>
                <Td className="ltr:text-left rtl:text-right">{t.email}</Td>
                <Td className="text-left">
                  <Link
                    to={`/coach/trainees/${t.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    פתח פרופיל
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
