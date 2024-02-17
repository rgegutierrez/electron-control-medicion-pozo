<template>
  <v-container>
    <!-- Botón para insertar un pozo -->
    <v-btn color="primary" @click="insertarPozo"> Insertar Pozo </v-btn>
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
        { text: "Pozo", value: "pozo" },
        { text: "Fecha", value: "fecha" },
        { text: "pH Medido", value: "phMedido", align: "end" },
        { text: "STD Medido", value: "stdMedido", align: "end" },
        { text: "CU Medido", value: "cuMedido", align: "end" },
        { text: "CE Medido", value: "ceMedido", align: "end" },
        { text: "SO4 Medido", value: "so4Medido", align: "end" },
      ],
      mediciones: [
        // Ejemplo de datos, reemplazar con datos reales
        {
          pozo: "Pozo 1",
          fecha: "2024-02-17",
          phMedido: 7,
          stdMedido: 150,
          cuMedido: 0.5,
          ceMedido: 300,
          so4Medido: 250,
        },
        // Agregar más datos según sea necesario
      ],
    };
  },
  created() {
    console.log(`Mediciones`);

    // this.insertarPozo();
  },
  methods: {
    insertarPozo() {
      console.log(`insertarPozo`);

      // Datos del pozo a insertar
      const pozoData = {
        nombre: "Pozo 1",
        tipo: "Tipo 1",
      };

      // En tu componente Vue
      window.electronAPI.send("insertar-pozo", pozoData);

      window.electronAPI.receive("pozo-insertado", (arg) => {
        console.log(arg); // arg contiene la respuesta del proceso principal, por ejemplo, el ID del pozo insertado
      });
    },
  },
};
</script>
