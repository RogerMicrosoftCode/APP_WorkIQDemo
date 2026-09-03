import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      WORK_IQ_MODE: "demo",
    },
  },
});