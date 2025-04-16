// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-27",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  runtimeConfig: {
    adminUsername: process.env.ADMIN_USERNAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    public: {
      appDomain: process.env.APP_DOMAIN,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      tinymceKey: process.env.TINYMCE_KEY,
    },
  },
  modules: ["@nuxt/ui", "@nuxt/eslint", "@nuxtjs/supabase"],
  css: ["~/assets/css/main.css"],
  ui: {
    colorMode: false,
  },
});
