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

