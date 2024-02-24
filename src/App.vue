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
          <v-list-item to="/">
            <v-icon icon="$next" />
            Mediciones
          </v-list-item>
          <v-list-item to="/insitu">
            <v-icon icon="$next" />
            Mediciones In Situ
          </v-list-item>
          <v-list-item to="/dashboard">
            <v-icon icon="$next" />
            Dashboard
          </v-list-item>
          <v-list-item to="/carga-datos">
            <v-icon icon="$next" />
            Carga Archivo
          </v-list-item>
          <v-list-item to="/carga-datos-insitu">
            <v-icon icon="$next" />
            Carga Archivo In Situ
          </v-list-item>
          <v-list-item to="/pozo">
            <v-icon icon="$next" />
            Pozos
          </v-list-item>
          <v-list-item to="/observacion">
            <v-icon icon="$next" />
            Observaciones
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
