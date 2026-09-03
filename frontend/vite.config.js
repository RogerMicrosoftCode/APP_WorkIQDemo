import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: [
            {
                find: /^@fluentui\/react-icons$/,
                replacement: fileURLToPath(new URL("../node_modules/@fluentui/react-icons/lib/index.js", import.meta.url)),
            },
        ],
    },
    server: {
        port: 5173,
        proxy: {
            "/api": "http://localhost:3001",
        },
    },
});
