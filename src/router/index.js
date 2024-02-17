import { createRouter, createWebHashHistory } from 'vue-router';
import MedicionesView from '../views/MedicionesView.vue';
import DashboardView from '../views/DashboardView.vue';
import CargaDatosView from '../views/CargaDatosView.vue';

const routes = [
  { path: '/', component: MedicionesView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/carga-datos', name: 'Carga de Datos', component: CargaDatosView },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
