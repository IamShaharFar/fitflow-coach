import React, { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/state/authStore";
import { Home, Utensils, Dumbbell, ClipboardList, Users, List, Menu, LogOut, Moon, User } from "@/components/icons";

export function AppLayout({ role }: { role: "coach" | "trainee" }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, clear } = useAuth();
  const home = role === "coach" ? "/coach" : "/app";

  const handleLogout = () => {
    clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l">
        <Link to={home} className="p-4 text-xl font-bold border-b text-blue-600 hover:text-blue-700">
          FitFlow
        </Link>
        <div className="flex-1 p-4 space-y-2">
          {role === "trainee" ? <TraineeNav vertical /> : <CoachNav vertical />}
        </div>
        <div className="p-4 border-t text-sm text-gray-600">
          משתמש מחובר<br /> <button className="text-blue-600">יציאה</button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar for mobile */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-white shadow-sm">
          {/* כפתור המבורגר משודרג */}
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="פתח תפריט"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* לוגו באמצע */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Link
              to={home}
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
              aria-label="לדף הראשי"
            >
              <Dumbbell className="text-blue-600" size={24} />
              <span className="font-bold text-blue-600 text-lg">FitFlow</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)}>
          <aside
            onClick={e => e.stopPropagation()}
            className="absolute right-0 top-0 bottom-0 w-64 bg-white p-4 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex justify-between items-center mb-4">
                <Link
                  to={home}
                  onClick={() => setOpen(false)}
                  className="font-bold text-lg text-blue-600 hover:text-blue-700"
                >
                  FitFlow
                </Link>
                <button onClick={() => setOpen(false)}>✕</button>
              </div>

            </div>
            <div className="flex-1 space-y-2">
              {role === "trainee" ? <TraineeNav vertical /> : <CoachNav vertical />}
            </div>
            <div className="border-t pt-4 text-sm flex flex-col gap-2">
              <span className="text-gray-700">שלום {user?.name || "אורח"}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                <LogOut size={18} /> יציאה
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Item({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${isActive ? "bg-blue-700 text-white" : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function TraineeNav({ vertical = false }: { vertical?: boolean }) {
  const cls = vertical ? "flex flex-col gap-2" : "flex gap-2";
  return (
    <div className={cls}>
      <Item to="/app"><Home size={18} /> דשבורד</Item>
      <Item to="/app/meals"><Utensils size={18} /> ארוחות</Item>
      <Item to="/app/workouts"><Dumbbell size={18} /> אימונים</Item>
      <Item to="/app/programs"><ClipboardList size={18} /> תוכניות</Item>
      <Item to="/app/sleep"><Moon size={18} /> שינה</Item> {/* 👈 הכפתור החדש */}
      <Item to="/app/profile"><User size={18} /> פרופיל</Item>
    </div>
  );
}

function CoachNav({ vertical = false }: { vertical?: boolean }) {
  const cls = vertical ? "flex flex-col gap-2" : "flex gap-2";
  return (
    <div className={cls}>
      <Item to="/coach"><Home size={18} /> דשבורד</Item>
      <Item to="/coach/trainees"><Users size={18} /> מתאמנים</Item>
      <Item to="/coach/programs"><List size={18} /> תוכניות</Item>
    </div>
  );
}
