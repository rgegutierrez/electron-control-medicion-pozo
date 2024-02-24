import { createRouter, createWebHashHistory } from "vue-router";
import MedicionesView from "../views/MedicionesView.vue";
import MedicionesInSituView from "../views/MedicionesInSituView.vue";
import DashboardView from "../views/DashboardView.vue";
import CargaDatosView from "../views/CargaDatosView.vue";
import CargaDatosInSituView from "../views/CargaDatosInSituView.vue";

import PozoView from "../views/PozoView.vue";
import ObservacionView from "../views/ObservacionView.vue";


const routes = [
  { path: "/", component: MedicionesView },
  { path: "/insitu", component: MedicionesInSituView },
  { path: "/dashboard", name: "Dashboard", component: DashboardView },
  { path: "/carga-datos", name: "Carga de Datos", component: CargaDatosView },
  {
    path: "/carga-datos-insitu",
    name: "Carga de Datos In Situ",
    component: CargaDatosInSituView,
  },
  { path: "/pozo", name: "Pozos", component: PozoView },
  { path: "/observacion", name: "Observaciones", component: ObservacionView },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
