export type Meal = {
  id: string;
  traineeId: string;
  createdAt: string;
  text: string;         // תיאור הארוחה
  mealType: string;     // בוקר / צהריים / ערב / נשנוש
  mood: string;         // הרגשה
};

export type Workout = {
  id: string;
  traineeId: string;
  createdAt: string;
  type: string;
};

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  notes?: string;
};

export type Session = {
  id: string;
  title: string;
  date?: string;
  exercises: Exercise[];
};

export type Program = {
  id: string;
  traineeId: string;
  name: string;
  notes: string;
  sessions: Session[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "coach" | "trainee";
  coachId?: string;   // הוספתי את זה
};

export type Sleep = {
  id: string;
  traineeId: string;
  date: string;       // YYYY-MM-DD או ISO string מהשרת
  hours: number;      // כמה שעות שינה
  note?: string;      // הערה חופשית
  createdAt: string;  // נוספה אוטומטית ע"י mongoose
  updatedAt: string;  // נוספה אוטומטית ע"י mongoose
};

export type Measurement = {
  id: string;
  weight: number;
  chest?: number;
  waist?: number;
  hips?: number;
  height?: number;   // 👈 נוסף
  bodyFat?: number;  // 👈 נוסף
  date: string;
};

export type Profile = {
  id: string;
  userId: string;
  birthDate?: string; // תאריך לידה של המשתמש
  measurements: Measurement[]; // עכשיו כל מדידה מכילה גם height ו־bodyFat
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: string;
  traineeId: string;
  category: "weight" | "bodyFat" | "chest" | "waist" | "hips";
  start: number;
  target: number;
  deadline: string;
  createdAt?: string;
  updatedAt?: string;
};

