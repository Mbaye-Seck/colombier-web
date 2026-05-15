const rawUrl = import.meta.env.VITE_API_URL;

if (!rawUrl) {
  throw new Error(
    "[config] VITE_API_URL is not defined. " +
      "Add it to your .env file before starting the app.\n" +
      "Example: VITE_API_URL=http://localhost:8000"
  );
}

export const API_BASE_URL = rawUrl.replace(/\/+$/, "");
export const API_PREFIX = "/api";
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;
