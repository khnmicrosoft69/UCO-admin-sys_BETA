import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // We only use the React integration here
  integrations: [react()],
  vite: {
    // Tailwind v4 runs inside Astro's Vite engine instead!
    plugins: [tailwindcss()],
  },
});
