// src/services/realService.ts
import type { Meal, Workout, Program, User, Sleep, Profile, Goal } from "@/types";
import type { Api } from "./api.types";

const BASE = import.meta.env.VITE_APP_API_BASE || "http://localhost:4000";

/** -------- Token helpers -------- */
function getToken(): string | null {
  return localStorage.getItem("token");
}
function setToken(token: string) {
  localStorage.setItem("token", token);
}
function setUser(u: any) {
  localStorage.setItem("user", JSON.stringify(u));
}
function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/** -------- Deep normalize: _id -> id, להסיר __v -------- */
function normalize(data: any): any {
  if (Array.isArray(data)) return data.map(normalize);
  if (data && typeof data === "object") {
    const { _id, __v, ...rest } = data as Record<string, any>;
    const out: Record<string, any> = { ...rest };
    if (_id && !rest.id) out.id = String(_id);
    for (const k of Object.keys(out)) out[k] = normalize(out[k]);
    return out;
  }
  return data;
}

/** -------- fetch עם Authorization + נרמול JSON -------- */
async function authFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  const token = getToken();

  if (!path.startsWith("/login") && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (res.status === 204) {
    // @ts-expect-error – void
    return undefined;
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const json = await res.json();
    return normalize(json) as T;
  }

  // @ts-expect-error – allow void/other
  return undefined;
}

export const realApi: Api = {
  // ---------- Auth ----------
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const data = await authFetch<{ token: string; user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  me: async () => {
    const user = await authFetch<User>("/me");
    setUser(user);
    return user;
  },

  // ---------- Trainee ----------
  trainee: {
    meals: {
      list: () => authFetch<Meal[]>("/meals"),
      create: (payload: { text: string; mealType: string; mood: string; createdAt?: string }) =>
        authFetch<Meal>("/meals", { method: "POST", body: JSON.stringify(payload) }),
      remove: (id: string) => authFetch<void>(`/meals/${id}`, { method: "DELETE" }),
    },

    workouts: {
      list: () => authFetch<Workout[]>("/workouts"),
      create: (payload: { type: string; createdAt: string }) =>
        authFetch<Workout>("/workouts", { method: "POST", body: JSON.stringify(payload) }),
      remove: (id: string) => authFetch<void>(`/workouts/${id}`, { method: "DELETE" }),
    },

    programs: {
      list: () => authFetch<Program[]>("/programs"),
      get: (id: string) => authFetch<Program>(`/programs/${id}`),
    },
    sleep: {
      list: () => authFetch<Sleep[]>("/sleep"),
      create: (payload: { date: string; hours: number; note?: string }) =>
        authFetch<Sleep>("/sleep", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      update: (id: string, payload: { date?: string; hours?: number; note?: string }) =>
        authFetch<Sleep>(`/sleep/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }),
      remove: (id: string) =>
        authFetch<void>(`/sleep/${id}`, { method: "DELETE" }),
    },
  },

  // ---------- Coach ----------
  coach: {
    trainees: {
      list: () => authFetch<User[]>("/coach/trainees"),
      get: (id: string) =>
        authFetch<{
          trainee: User;
          profile: Profile | null;
          meals: Meal[];
          workouts: Workout[];
          programs: Program[];
          sleep: Sleep[];
          goals: Goal[];
        }>(`/coach/trainees/${id}`),

      // 👇 חדש: הוספת מדידה למתאמן
      addMeasurement: (traineeId: string, payload: any) =>
        authFetch<Profile>(`/coach/trainees/${traineeId}/measurement`, {
          method: "POST",
          body: JSON.stringify(payload),
        }),

      programs: {
        list: (id: string) => authFetch<Program[]>(`/coach/trainees/${id}/programs`),
        create: (id: string, payload: any) =>
          authFetch<Program>(`/coach/trainees/${id}/programs`, {
            method: "POST",
            body: JSON.stringify(payload),
          }),
        update: (id: string, pid: string, payload: any) =>
          authFetch<Program>(`/coach/trainees/${id}/programs/${pid}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          }),
      },

      goals: {
        list: (traineeId: string) =>
          authFetch<Goal[]>(`/coach/trainees/${traineeId}/goals`),

        create: (traineeId: string, payload: { category: Goal["category"]; target: number; deadline: string }) =>
          authFetch<Goal>(`/coach/trainees/${traineeId}/goals`, {
            method: "POST",
            body: JSON.stringify(payload),
          }),

        update: (traineeId: string, goalId: string, payload: { target: number; deadline: string }) =>
          authFetch<Goal>(`/coach/trainees/${traineeId}/goals/${goalId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          }),

        remove: (traineeId: string, goalId: string) =>
          authFetch<void>(`/coach/trainees/${traineeId}/goals/${goalId}`, {
            method: "DELETE",
          }),
      },
    },
    programs: {
      list: () => authFetch<Program[]>("/coach/programs"),
      get: (id: string) => authFetch<Program>(`/coach/programs/${id}`),
    },
  },

  // ---------- Profile ----------
  profile: {
    get: () => authFetch<Profile>("/profile"),
    update: (payload: { birthDate?: string; height?: number; bodyFat?: number }) =>
      authFetch<Profile>("/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    addMeasurement: (payload) =>
      authFetch<Profile>("/profile/measurement", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    removeMeasurement: (id) =>
      authFetch<Profile>(`/profile/measurement/${id}`, {
        method: "DELETE",
      }),
  },
};
