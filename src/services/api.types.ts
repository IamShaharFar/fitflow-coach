import type { Meal, Workout, Program, User } from "@/types";

export interface Api {
  login(email: string, password: string): Promise<{ token: string; user: User }>;
  me(): Promise<User>;

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
  };

  coach: {
    trainees: {
      list(): Promise<User[]>;
      get(id: string): Promise<{ trainee: User; meals: Meal[]; workouts: Workout[]; programs: Program[] }>;
      programs: {
        list(id: string): Promise<Program[]>;
        create(id: string, payload: any): Promise<Program>;
        update(id: string, pid: string, payload: any): Promise<Program>;
      };
    };
    programs: {
      list(): Promise<Program[]>;
      get(id: string): Promise<Program>;
    };
  };
}
