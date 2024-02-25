<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer
        v-if="isAuthenticated"
        class="bg-deep-purple"
        theme="dark"
        app
        permanent
      >
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title text-center my-8 text-uppercase"
                ><b>Control Medición Pozo</b></v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title text-center text-uppercase">
                <b>{{ haveUser }}</b></v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/">
            <v-icon icon="$next" />
            Mediciones
          </v-list-item>
          <v-list-item to="/insitu">
            <v-icon icon="$next" />
            Mediciones In Situ
          </v-list-item>
          <!-- <v-list-item to="/dashboard">
            <v-icon icon="$next" />
            Dashboard
          </v-list-item> -->
          <v-list-item v-if="havePermission" to="/carga-datos">
            <v-icon icon="$next" />
            Carga Archivo
          </v-list-item>
          <v-list-item v-if="havePermission" to="/carga-datos-insitu">
            <v-icon icon="$next" />
            Carga Archivo In Situ
          </v-list-item>
          <v-list-item v-if="havePermission" to="/pozo">
            <v-icon icon="$next" />
            Pozos
          </v-list-item>
          <v-list-item v-if="havePermission" to="/observacion">
            <v-icon icon="$next" />
            Observaciones
          </v-list-item>
          <v-list-item v-if="this.permission >= 3" to="/usuario">
            <v-icon icon="$next" />
            Usuarios
          </v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn block @click="logout"> Cerrar Sesión </v-btn>
          </div>
        </template>
      </v-navigation-drawer>
      <v-main>
        <router-view></router-view>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      // Inicializa el estado de autenticación leyendo desde localStorage
      userAuthenticated: localStorage.getItem("isAuthenticated") === "true",
      permission: localStorage.getItem("permission"),
      user: localStorage.getItem("user"),
    };
  },
  methods: {
    logout() {
      this.userAuthenticated = false; // Actualiza la variable de datos
      localStorage.setItem("isAuthenticated", "false");
      localStorage.setItem("permission", 0);
      this.$router.push("/login");
    },
    // Podrías necesitar un método para establecer la autenticación a true también
    setAuthentication(authStatus) {
      this.userAuthenticated = authStatus;
      localStorage.setItem("isAuthenticated", authStatus ? "true" : "false");
    },
  },

  computed: {
    haveUser() {
      return this.user;
    },
    isAuthenticated() {
      if (!this.userAuthenticated) {
        this.logout();
      }
      return this.userAuthenticated;
    },
    havePermission() {
      return this.permission > 1;
    },
  },
};
</script>
