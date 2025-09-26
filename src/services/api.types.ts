import type { Meal, Workout, Program, User, Sleep, Profile, Goal } from "@/types";

export interface Api {
  login(email: string, password: string): Promise<{ token: string; user: User }>;
  me(): Promise<User>;

  profile: {
    get(): Promise<Profile>;
    update(payload: { birthDate?: string; height?: number; bodyFat?: number }): Promise<Profile>;
    addMeasurement(payload: {
      weight: number;
      chest?: number;
      waist?: number;
      hips?: number;
      height?: number;
      bodyFat?: number;
      date?: string;
    }): Promise<Profile>;
    removeMeasurement(id: string): Promise<Profile>;
  };

  trainee: {
    meals: {
      list(): Promise<Meal[]>;
      create(payload: { text: string; mealType: string; mood: string; createdAt?: string }): Promise<Meal>;
      remove(id: string): Promise<void>;
    };
    workouts: {
      list(): Promise<Workout[]>;
      create(payload: { type: string; createdAt: string }): Promise<Workout>;
      remove(id: string): Promise<void>;
    };
    programs: {
      list(): Promise<Program[]>;
      get(id: string): Promise<Program>;
    };
    sleep: {
      list(): Promise<Sleep[]>;
      create(payload: { date: string; hours: number; note?: string }): Promise<Sleep>;
      update(id: string, payload: { date?: string; hours?: number; note?: string }): Promise<Sleep>;
      remove(id: string): Promise<void>;
    };
  };

  coach: {
    trainees: {
      list(): Promise<User[]>;
      get(id: string): Promise<{
        trainee: User;
        profile: Profile | null; // 👈 עכשיו גם פרופיל מוחזר
        meals: Meal[];
        workouts: Workout[];
        programs: Program[];
        sleep: Sleep[];
        goals: Goal[];
      }>;

      addMeasurement(
        traineeId: string,
        payload: {
          weight: number;
          chest?: number;
          waist?: number;
          hips?: number;
          height?: number;
          bodyFat?: number;
          date?: string;
        }
      ): Promise<Profile>; // 👈 פונקציה חדשה למאמן

      programs: {
        list(id: string): Promise<Program[]>;
        create(id: string, payload: any): Promise<Program>;
        update(id: string, pid: string, payload: any): Promise<Program>;
      };

      goals: {
        list(traineeId: string): Promise<Goal[]>;
        create(traineeId: string, payload: { category: Goal["category"]; target: number; deadline: string }): Promise<Goal>;
        update(traineeId: string, goalId: string, payload: { target: number; deadline: string }): Promise<Goal>;
        remove(traineeId: string, goalId: string): Promise<void>;
      };
    };
    programs: {
      list(): Promise<Program[]>;
      get(id: string): Promise<Program>;
    };
  };
}
