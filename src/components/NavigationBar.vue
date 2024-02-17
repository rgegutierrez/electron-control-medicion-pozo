<template>
    <v-app-bar app color="deep-purple accent-4" dark>
      <v-toolbar-title>Control Medición Pozo</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text><router-link to="/" class="text-decoration-none white--text">Mediciones</router-link></v-btn>
      <v-btn text><router-link to="/dashboard" class="text-decoration-none white--text">Dashboard</router-link></v-btn>
      <v-btn text><router-link to="/carga-datos" class="text-decoration-none white--text">Carga de Datos</router-link></v-btn>
    </v-app-bar>
  </template>
  
  <script>
  export default {
    name: 'NavigationBar',
  };
  </script>
  
  <style>
  .text-decoration-none {
    text-decoration: none;
  }
  </style>
  