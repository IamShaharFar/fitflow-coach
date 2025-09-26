import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/state/authStore";
import { AppLayout } from "@/components/AppLayout";
import CoachProgramsPage from "@/features/coach/CoachProgramsPage";
import ProfilePage from "@/features/trainee/ProfilePage";

const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const TraineeDashboardPage = lazy(() => import("@/features/trainee/TraineeDashboardPage"));
const MealsPage = lazy(() => import("@/features/trainee/MealsPage"));
const WorkoutsPage = lazy(() => import("@/features/trainee/WorkoutsPage"));
const ProgramsPage = lazy(() => import("@/features/trainee/ProgramsPage"));
const ProgramDetailsPage = lazy(() => import("@/features/trainee/ProgramDetailsPage"));
const CoachProgramDetailsPage = React.lazy(() => import("@/features/coach/CoachProgramDetailsPage"));
const SleepPage = lazy(() => import("@/features/trainee/SleepPage"));

const CoachDashboardPage = lazy(() => import("@/features/coach/CoachDashboardPage"));
const TraineesListPage = lazy(() => import("@/features/coach/TraineesListPage"));
const TraineeProfilePage = lazy(() => import("@/features/coach/TraineeProfilePage"));
const ProgramEditorPage = lazy(() => import("@/features/coach/ProgramEditorPage"));

function RequireAuth({ children, role }: { children: React.ReactNode; role?: "coach" | "trainee" }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (role && user.role !== role) {
    const target = user.role === "coach" ? "/coach" : "/app";
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Suspense fallback={<div className="p-6">טוען...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/app"
          element={
            <RequireAuth role="trainee">
              <AppLayout role="trainee" />
            </RequireAuth>
          }
        >
          <Route index element={<TraineeDashboardPage />} />
          <Route path="meals" element={<MealsPage />} />
          <Route path="workouts" element={<WorkoutsPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="programs/:programId" element={<ProgramDetailsPage />} />
          <Route path="sleep" element={<SleepPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
        </Route>

        <Route
          path="/coach"
          element={
            <RequireAuth role="coach">
              <AppLayout role="coach" />
            </RequireAuth>
          }
        >
          <Route index element={<CoachDashboardPage />} />
          <Route path="trainees" element={<TraineesListPage />} />
          <Route path="trainees/:traineeId" element={<TraineeProfilePage />} />
          <Route path="trainees/:traineeId/programs/new" element={<ProgramEditorPage />} />
          <Route path="trainees/:traineeId/programs/:programId/edit" element={<ProgramEditorPage />} />
          <Route path="programs" element={<CoachProgramsPage />} />
          <Route path="programs/:programId" element={<CoachProgramDetailsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div className="p-6">לא נמצא</div>} />
      </Routes>
    </Suspense>
  );
}
