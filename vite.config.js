import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import Components from "unplugin-vue-components/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Pages(),
    Components({
      /* options */
      dirs: ["src/components"],
      extensions: ["vue"],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/],
    }),
  ],
});
