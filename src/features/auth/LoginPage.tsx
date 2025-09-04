import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Dumbbell, LogIn } from "lucide-react";
import { useAuth } from "@/state/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/services/api";

type Form = { email: string; password: string };

export default function LoginPage() {
  const { register, handleSubmit } = useForm<Form>();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data: Form) => {
    try {
      setLoading(true);
      const email = data.email.trim().toLowerCase();
      const { token, user } = await api.login(email, data.password);
      setAuth(token, user);
      navigate(user.role === "coach" ? "/coach" : "/app");
    } catch {
      alert("שגיאת התחברות");
    } finally {
      setLoading(false);
    }

  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* לוגו / מותג */}
      <div className="flex items-center gap-2 mb-8">
        <Dumbbell className="text-blue-600" size={32} />
        <span className="text-3xl font-bold text-blue-600">FitFlow</span>
      </div>

      {/* כרטיס התחברות */}
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <LogIn className="text-blue-600" /> התחברות
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: true })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password", { required: true })}
              className="w-full"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
            {loading ? "מתחבר..." : "כניסה"}
          </Button>
        </form>

        {/* מיקרו־קופי / דמו */}
        <p className="text-xs text-gray-500 mt-6 text-center">
          נסה להתחבר עם: <br />
          <span className="font-mono">shahar@example.com</span> או{" "}
          <span className="font-mono">coach@example.com</span>
        </p>
      </div>
    </div>
  );
}
