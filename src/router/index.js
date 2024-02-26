import { createRouter, createWebHashHistory } from "vue-router";
import MedicionesView from "../views/MedicionesView.vue";
import MedicionesInSituView from "../views/MedicionesInSituView.vue";
import EliminarView from "../views/EliminarView.vue";
import CargaDatosView from "../views/CargaDatosView.vue";
import CargaDatosInSituView from "../views/CargaDatosInSituView.vue";
import PozoView from "../views/PozoView.vue";
import ObservacionView from "../views/ObservacionView.vue";
import LoginView from "../views/LoginView.vue";
import UsuarioView from "../views/UsuarioView.vue";

const routes = [
  { path: "/login", component: LoginView },
  { path: "/", component: MedicionesView },
  { path: "/insitu", component: MedicionesInSituView },
  { path: "/eliminar", name: "Eliminar Datos", component: EliminarView },
  { path: "/carga-datos", name: "Carga de Datos", component: CargaDatosView },
  {
    path: "/carga-datos-insitu",
    name: "Carga de Datos In Situ",
    component: CargaDatosInSituView,
  },
  { path: "/pozo", name: "Pozos", component: PozoView },
  { path: "/observacion", name: "Observaciones", component: ObservacionView },
  { path: "/usuario", name: "Usuarios", component: UsuarioView },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Aquí agregas el guard de navegación
router.beforeEach((to, from, next) => {
  // Aquí deberías verificar si el usuario está autenticado
  // Esto puede ser a través de un estado global (Vuex) o localStorage, por ejemplo
  // Por ejemplo, asumiendo que guardas el estado de autenticación en localStorage
  const isAuthenticated = localStorage.getItem("isAuthenticated"); // Deberías ajustar esto a tu lógica real de comprobación

  if (to.path !== "/login" && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
