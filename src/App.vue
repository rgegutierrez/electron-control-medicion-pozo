<template>
  <v-app>
    <NavigationBar />
    <v-main>
      <router-view></router-view> <!-- Este componente renderiza la vista de la ruta actual -->
    </v-main>
  </v-app>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue';

export default {
  name: 'App',
  components: {
    NavigationBar,
  },
};
</script>
