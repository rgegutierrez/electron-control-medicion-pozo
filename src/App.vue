<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer class="bg-deep-purple" theme="dark" app permanent>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title text-center my-8 text-uppercase"
                >Control Medición Pozo</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            to="/"
            title="Mediciones"
            prepend-icon="mdi-view-dashboard"
          >
          </v-list-item>
          <v-list-item
            to="/insitu"
            title="Mediciones In Situ"
            prepend-icon="mdi-view-dashboard"
          >
          </v-list-item>
          <v-list-item
            to="/dashboard"
            title="Dashboard"
            prepend-icon="mdi-view-dashboard"
          >
          </v-list-item>
          <v-list-item
            to="/carga-datos"
            title="Carga Archivo"
            prepend-icon="mdi-view-dashboard"
          >
          </v-list-item>
          <v-list-item
            to="/carga-datos-insitu"
            title="Carga Archivo In Situ"
            prepend-icon="mdi-view-dashboard"
          >
          </v-list-item>
          <v-list-item
            to="/pozo"
            title="Pozos"
            prepend-icon="mdi-view-dashboard"
          >
          </v-list-item>
        </v-list>

        <!-- <template v-slot:append>
          <div class="pa-2">
            <v-btn block> Logout </v-btn>
          </div>
        </template> -->
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
};
</script>