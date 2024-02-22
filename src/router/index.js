import { createRouter, createWebHashHistory } from "vue-router";
import MedicionesView from "../views/MedicionesView.vue";
import DashboardView from "../views/DashboardView.vue";
import CargaDatosView from "../views/CargaDatosView.vue";
import CargaDatosInSituView from "../views/CargaDatosInSituView.vue";

import PozoView from "../views/PozoView.vue";

const routes = [
  { path: "/", component: MedicionesView },
  { path: "/dashboard", name: "Dashboard", component: DashboardView },
  { path: "/carga-datos", name: "Carga de Datos", component: CargaDatosView },
  {
    path: "/carga-datos-insitu",
    name: "Carga de Datos In Situ",
    component: CargaDatosInSituView,
  },
  { path: "/pozo", name: "Pozos", component: PozoView },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
