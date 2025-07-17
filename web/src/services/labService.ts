import { api } from "@/lib/utils";

export async function fetchLabTemplates() {
  const response = await api.get("/api/lab/templates");
  if (response.status < 200 || response.status >= 300) {
    throw new Error("Failed to fetch API keys");
  }

  return response.data;
}

export async function fetchLabs() {
  const response = await api.get("/api/lab");
  if (response.status < 200 || response.status >= 300) {
    throw new Error("Failed to fetch labs");
  }

  return response.data;
}