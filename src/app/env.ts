export const ENV = {
  env: import.meta.env.VITE_APP_ENV || "development",
  apiBase: import.meta.env.VITE_APP_API_BASE || "",
  useMocks: (import.meta.env.VITE_USE_MOCKS || "true") === "true",
};
