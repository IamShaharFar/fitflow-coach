import type { Meal, Program, User, Workout } from "@/types";
import type { Api } from "./api.types";

type DB = {
  users: User[];
  meals: Meal[];
  workouts: Workout[];
  programs: Program[];
};

const KEY = "fitflow_mock_db_v1";

function uid() { return Math.random().toString(36).slice(2); }
function nowISO() { return new Date().toISOString(); }
function isoAt(daysAgo: number, h: number, m: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** ----------------- יצירה / טעינה ----------------- */
function createSeed(): DB {
  const coach: User = {
    id: "coach1",
    role: "coach",
    name: "מאמנת הדגמה",
    email: "coach@example.com",
  };

  const t1: User = { id: "t1", role: "trainee", name: "שחר", email: "shahar@example.com", coachId: coach.id };
  const t2: User = { id: "t2", role: "trainee", name: "נוי", email: "noy@example.com", coachId: coach.id };
  const t3: User = { id: "t3", role: "trainee", name: "הדס", email: "hadas@example.com", coachId: coach.id };

  // --- ארוחות לשחר: 3 ימים אחרונים, בוקר/צהריים/ערב ---
  const meals: Meal[] = [
    // היום
    { id: uid(), traineeId: "t1", createdAt: isoAt(0, 8, 15), text: "יוגורט וגרנולה", mealType: "בוקר", mood: "מעולה" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(0, 13, 10), text: "אורז עם עוף", mealType: "צהריים", mood: "טוב" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(0, 19, 45), text: "סלט טונה", mealType: "ערב", mood: "לא משהו" },

    // אתמול
    { id: uid(), traineeId: "t1", createdAt: isoAt(1, 8, 0), text: "חביתה וירקות", mealType: "בוקר", mood: "טוב" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(1, 14, 0), text: "פסטה בולונז", mealType: "צהריים", mood: "מעולה" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(1, 20, 30), text: "מרק עדשים", mealType: "ערב", mood: "עייף" },

    // לפני יומיים
    { id: uid(), traineeId: "t1", createdAt: isoAt(2, 9, 0), text: "קוטג׳ ולחם", mealType: "בוקר", mood: "טוב" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(2, 13, 20), text: "קוסקוס", mealType: "צהריים", mood: "טוב" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(2, 18, 50), text: "טוסט", mealType: "ערב", mood: "מעולה" },

    // קצת דאטה גם לשאר כדי שייראו במבט מאמן
    { id: uid(), traineeId: "t2", createdAt: isoAt(0, 9, 30), text: "דייסת שיבולת", mealType: "בוקר", mood: "טוב" },
    { id: uid(), traineeId: "t3", createdAt: isoAt(0, 12, 15), text: "שווארמה", mealType: "צהריים", mood: "לא משהו" },
  ];

  // --- אימונים לשחר: 5 אימונים אחרונים ---
  const workouts: Workout[] = [
    { id: uid(), traineeId: "t1", createdAt: isoAt(0, 7, 0), type: "ריצה 5 ק״מ" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(1, 18, 0), type: "חדר כושר - פלג גוף עליון" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(2, 7, 30), type: "אינטרוולים" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(3, 19, 0), type: "אופניים 30 דק׳" },
    { id: uid(), traineeId: "t1", createdAt: isoAt(4, 18, 0), type: "חדר כושר - רגליים" },

    // אימון בודד לנוי והדס כדי שהמאמנת תראה פעילות
    { id: uid(), traineeId: "t2", createdAt: isoAt(0, 20, 0), type: "הליכה 40 דק׳" },
    { id: uid(), traineeId: "t3", createdAt: isoAt(1, 17, 0), type: "יוגה" },
  ];

  // --- שתי תוכניות לדוגמה לשחר + אחת לנוי ---
  const programs: Program[] = [
    {
      id: uid(),
      traineeId: "t1",
      name: "תכנית כוח בסיסית",
      notes: "להקפיד על טכניקה",
      sessions: [
        {
          id: uid(),
          title: "פלג גוף עליון",
          exercises: [
            { id: uid(), name: "לחיצת חזה", sets: 3, reps: 8 },
            { id: uid(), name: "מתח", sets: 3, reps: 6 },
            { id: uid(), name: "חתירה", sets: 3, reps: 10 },
          ],
        },
        {
          id: uid(),
          title: "רגליים",
          exercises: [
            { id: uid(), name: "סקווט", sets: 4, reps: 6 },
            { id: uid(), name: "לאנג׳ים", sets: 3, reps: 10 },
          ],
        },
      ],
    },
    {
      id: uid(),
      traineeId: "t1",
      name: "תכנית ריצה 5K",
      notes: "3 אימונים בשבוע",
      sessions: [
        { id: uid(), title: "ריצה קלה", exercises: [{ id: uid(), name: "ריצה", sets: 1, reps: 25 }] },
        { id: uid(), title: "אינטרוולים", exercises: [{ id: uid(), name: "אינטרוול", sets: 6, reps: 400 }] },
      ],
    },
    {
      id: uid(),
      traineeId: "t2",
      name: "תכנית כללית",
      notes: "מתחילים",
      sessions: [
        { id: uid(), title: "מעגל", exercises: [{ id: uid(), name: "פלאנק", sets: 3, reps: 30 }] },
      ],
    },
  ];

  return { users: [coach, t1, t2, t3], meals, workouts, programs };
}

function ensureMinimumData(db: DB) {
  // ודא שיש לשחר לפחות תכנית אחת / אימונים / ארוחות
  const hasProg = db.programs.some(p => p.traineeId === "t1");
  const hasMeals = db.meals.some(m => m.traineeId === "t1");
  const hasWork = db.workouts.some(w => w.traineeId === "t1");

  if (!hasProg || !hasMeals || !hasWork) {
    const fresh = createSeed();
    // מיזוג עדין: לא מוחקים לך נתונים קיימים
    db.meals.push(...fresh.meals.filter(m => !db.meals.some(x => x.id === m.id)));
    db.workouts.push(...fresh.workouts.filter(w => !db.workouts.some(x => x.id === w.id)));
    db.programs.push(...fresh.programs.filter(p => !db.programs.some(x => x.id === p.id)));
  }
}

function load(): DB {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const db = JSON.parse(raw) as DB;
    ensureMinimumData(db);
    localStorage.setItem(KEY, JSON.stringify(db));
    return db;
  }
  const seeded = createSeed();
  localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}

function save(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

/** ----------------- API ----------------- */
export const mockApi: Api = {
  async login(email: string, _password: string) {
    const db = load();
    const e = (email || "").trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === e);
    if (!user) {
      // בכוונה לא נופלים לברירת מחדל כדי שלא תיכנס בטעות כמאמן
      throw new Error("Email not found in mock DB");
    }
    const token = "mock-token-" + uid();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return { token, user };
  },

  async me() {
    const db = load();
    const raw = localStorage.getItem("user");
    if (!raw) throw new Error("Not authenticated");
    const user = JSON.parse(raw) as User;
    const fresh = db.users.find(u => u.id === user.id)!;
    return fresh;
  },

  trainee: {
    meals: {
      async list() {
        const db = load();
        const user = JSON.parse(localStorage.getItem("user")!) as User;
        return db.meals
          .filter(m => m.traineeId === user.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      async create(payload: { text: string; mealType: string; mood: string; createdAt?: string }) {
        const db = load();
        const user = JSON.parse(localStorage.getItem("user")!) as User;
        const meal: Meal = {
          id: uid(),
          traineeId: user.id,
          createdAt: payload.createdAt ? new Date(payload.createdAt).toISOString() : nowISO(),
          text: String(payload.text || ""),
          mealType: String(payload.mealType || ""),
          mood: String(payload.mood || ""),
        };
        db.meals.push(meal);
        save(db);
        return meal;
      },
      async remove(id: string) {
        const db = load();
        const before = db.meals.length;
        db.meals = db.meals.filter(m => m.id !== id);
        if (db.meals.length !== before) save(db);
      },
    },

    workouts: {
      async list() {
        const db = load();
        const user = JSON.parse(localStorage.getItem("user")!) as User;
        return db.workouts
          .filter(w => w.traineeId === user.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      async create(payload: { type: string; createdAt: string }) {
        const db = load();
        const user = JSON.parse(localStorage.getItem("user")!) as User;
        const workout: Workout = {
          id: uid(),
          traineeId: user.id,
          createdAt: payload.createdAt,
          type: String(payload.type || ""),
        };
        db.workouts.push(workout);
        save(db);
        return workout;
      },
      async remove(id: string) {
        const db = load();
        const before = db.workouts.length;
        db.workouts = db.workouts.filter(w => w.id !== id);
        if (db.workouts.length !== before) save(db);
      },
    },

    programs: {
      async list() {
        const db = load();
        const user = JSON.parse(localStorage.getItem("user")!) as User;
        return db.programs.filter(p => p.traineeId === user.id);
      },
      async get(id: string) {
        const db = load();
        return db.programs.find(p => p.id === id)!;
      },
    },
  },

  coach: {
    trainees: {
      async list() {
        const db = load();
        return db.users.filter(u => u.role === "trainee");
      },
      async get(id: string) {
        const db = load();
        const trainee = db.users.find(u => u.id === id)!;
        const meals = db.meals.filter(m => m.traineeId === id);
        const workouts = db.workouts.filter(w => w.traineeId === id);
        const programs = db.programs.filter(p => p.traineeId === id);
        return { trainee, meals, workouts, programs };
      },
      programs: {
        async list(id: string) {
          const db = load();
          return db.programs.filter(p => p.traineeId === id);
        },
        async create(id: string, payload: any) {
          const db = load();
          const program: Program = { id: uid(), traineeId: id, ...payload };
          db.programs.push(program);
          save(db);
          return program;
        },
        async update(id: string, pid: string, payload: any) {
          const db = load();
          const idx = db.programs.findIndex(p => p.id === pid && p.traineeId === id);
          if (idx >= 0) {
            db.programs[idx] = { ...db.programs[idx], ...payload };
            save(db);
          }
          return db.programs[idx];
        },
      },
    },

    programs: {
      async list() {
        const db = load();
        return db.programs;
      },
      async get(id: string) {
        const db = load();
        const p = db.programs.find(p => p.id === id);
        if (!p) throw new Error("Program not found");
        return p!;
      },
    },
  },
};
