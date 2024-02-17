<template>
  <v-container>
    <!-- Botón para agregar un pozo -->
    <v-btn color="primary" @click="mostrarFormularioAgregar"
      >Agregar Pozo</v-btn
    >

    <!-- Tabla de Pozos -->
    <v-data-table
      :headers="headersPozo"
      :items="pozos"
      :items-per-page="5"
      class="elevation-1"
      item-key="pozoId"
    >
      <template #item.acciones="{ item }">
        <v-btn icon @click="editarPozo(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="mostrarFormulario" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >{{ pozoActual.pozoId ? "Editar" : "Agregar" }} Pozo</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form>
              <v-text-field
                v-model="pozoActual.nombre"
                label="Nombre del Pozo"
              ></v-text-field>
              <v-text-field
                v-model="pozoActual.tipo"
                label="Tipo de Pozo"
              ></v-text-field>
              <!-- Más campos según sea necesario -->
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="mostrarFormulario = false"
            >Cancelar</v-btn
          >
          <v-btn color="blue darken-1" text @click="insertarPozo"
            >Guardar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      // Ajusta los headers para reflejar los datos de un pozo
      headersPozo: [
        { text: "Pozo ID", value: "pozoId" },
        { text: "Nombre", value: "nombre" },
        { text: "Tipo", value: "tipo" },
        { text: "Acciones", value: "acciones", sortable: false },
      ],
      // Datos de ejemplo, remplazar con datos reales obtenidos de la base de datos
      pozos: [
        { pozoId: 1, nombre: "Pozo 1", tipo: "Tipo 1" },
        // Agregar más pozos según sea necesario
      ],
      // Para controlar la visibilidad del formulario de agregar/editar
      mostrarFormulario: false,
      // Datos del pozo actual para agregar/editar
      pozoActual: {},
    };
  },
  methods: {
    mostrarFormularioAgregar() {
      this.pozoActual = {}; // Resetear pozoActual para un nuevo pozo
      this.mostrarFormulario = true;
    },
    editarPozo(pozo) {
      this.pozoActual = { ...pozo }; // Copiar el pozo a editar en pozoActual
      this.mostrarFormulario = true;
    },
    insertarPozo() {
      console.log("Insertar/Editar Pozo", this.pozoActual);

      const pozoDataSimplificado = {
        nombre: this.pozoActual.nombre,
        tipo: this.pozoActual.tipo,
        // Incluye otras propiedades necesarias que sean serializables
      };

      // En tu componente Vue
      window.electronAPI.send("insertar-pozo", pozoDataSimplificado);

      window.electronAPI.receive("pozo-insertado", (arg) => {
        console.log(arg); // arg contiene la respuesta del proceso principal, por ejemplo, el ID del pozo insertado
      });

      // Cerrar el formulario después de insertar/editar
      this.mostrarFormulario = false;
    },
  },
};
</script>
