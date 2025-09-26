// import { mockApi } from "./mockService";
import { realApi } from "./realService";
import type { Api } from "./api.types";

const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

export const api: Api = useMocks ? realApi : realApi;
