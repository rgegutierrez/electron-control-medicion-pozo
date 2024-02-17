<template>
    <v-container>
      <v-data-table
        :headers="headers"
        :items="mediciones"
        :items-per-page="5"
        class="elevation-1"
      ></v-data-table>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        headers: [
          { text: 'Pozo3', value: 'pozo' },
          { text: 'Fecha', value: 'fecha' },
          { text: 'pH Medido', value: 'phMedido', align: 'end' },
          { text: 'STD Medido', value: 'stdMedido', align: 'end' },
          { text: 'CU Medido', value: 'cuMedido', align: 'end' },
          { text: 'CE Medido', value: 'ceMedido', align: 'end' },
          { text: 'SO4 Medido', value: 'so4Medido', align: 'end' },
        ],
        mediciones: [
          // Ejemplo de datos, reemplazar con datos reales
          { pozo: 'Pozo 3', fecha: '2024-02-17', phMedido: 7, stdMedido: 150, cuMedido: 0.5, ceMedido: 300, so4Medido: 250 },
          // Agregar más datos según sea necesario
        ],
      };
    },
    created() {
      console.log(`CargaDatos`);
    }
  };
  </script>
  