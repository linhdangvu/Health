import { createApp as createClientApp, h, Suspense } from "vue";

// import { createHead } from "@vueuse/head";
// import { createPinia } from 'pinia'
// import { createI18n } from './i18n'
import { createRouter } from "./router";

import App from "./App.vue";
import "./style.css";
// import * as NProgress from "nprogress";

async function createApp() {
  // const head = createHead();
  //   const i18n = createI18n()
  const router = createRouter();
  //   const pinia = createPinia()

  const app = createClientApp({
    // This is the global app setup function
    setup() {
      return () => {
        return h(Suspense, null, {
          default: () => h(App),
        });
      };
    },
  });

  const test = {
    app,
    router,
    // head,
  };

  app.use(test.router);
  // app.use(test.head);

  return test;
}

createApp().then(async (First) => {
  // wait for the app to be ready
  await First.router.isReady();

  // finaly mount the app to the DOM
  First.app.mount("#app");
});
