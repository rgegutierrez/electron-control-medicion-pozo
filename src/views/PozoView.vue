<template>
  <v-container>
    <!-- Botón para agregar un pozo -->
    <v-btn color="primary" @click="mostrarFormularioAgregar"
      >Agregar Pozo</v-btn
    >

    <!-- Tabla de Pozos -->
    <v-data-table
      :headers="headers"
      :items="pozos"
      class="elevation-1"
      item-key="PozoId"
    >
      <template v-slot:[`item.Acciones`]="{ item }">
        <v-btn icon @click="editarPozo(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="mostrarFormulario" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >{{ pozoActual.PozoId ? "Editar" : "Agregar" }} Pozo</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form>
              <v-text-field
                v-model="pozoActual.Nombre"
                label="Nombre del Pozo"
              ></v-text-field>
              <v-text-field
                v-model="pozoActual.Tipo"
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
      headers: [
        { title: "Pozo ID", key: "PozoId" },
        { title: "Nombre", key: "Nombre" },
        { title: "Tipo", key: "Tipo" },
        { title: "Acciones", key: "Acciones", sortable: false },
      ],
      // Datos de ejemplo, remplazar con datos reales obtenidos de la base de datos
      pozos: [],
      // Para controlar la visibilidad del formulario de agregar/editar
      mostrarFormulario: false,
      // Datos del pozo actual para agregar/editar
      pozoActual: {},
    };
  },
  async created() {
    await this.cargarPozos();
  },
  methods: {
    async cargarPozos() {
      // Enviar un mensaje al proceso principal para solicitar los datos de los pozos
      window.electronAPI.send("solicitar-pozos");

      // Escuchar la respuesta con los datos de los pozos
      const removeListener = window.electronAPI.receive(
        "cargar-pozos",
        (result) => {
          console.log(`cargar-pozos`, result);
          this.pozos = result.pozos; // Actualizar la propiedad pozos con los datos recibidos
          removeListener();
        }
      );
    },
    mostrarFormularioAgregar() {
      this.pozoActual = {}; // Resetear pozoActual para un nuevo pozo
      this.mostrarFormulario = true;
    },
    editarPozo(pozo) {
      this.pozoActual = { ...pozo }; // Copiar el pozo a editar en pozoActual
      this.mostrarFormulario = true;
    },
    async insertarPozo() {
      if (this.pozoActual.PozoId) {
        const pozoDataSimplificado = {
          PozoId: this.pozoActual.PozoId,
          Nombre: this.pozoActual.Nombre,
          Tipo: this.pozoActual.Tipo,
          // Incluye otras propiedades necesarias que sean serializables
        };

        // Actualizar pozo existente
        window.electronAPI.send("actualizar-pozo", pozoDataSimplificado);

        const removeListener = window.electronAPI.receive(
          "pozo-actualizado",
          (arg) => {
            console.log(arg); // arg contiene la respuesta del proceso principal, por ejemplo, el ID del pozo actualizado
            removeListener();
          }
        );
      } else {
        const pozoDataSimplificado = {
          Nombre: this.pozoActual.Nombre,
          Tipo: this.pozoActual.Tipo,
          // Incluye otras propiedades necesarias que sean serializables
        };

        // Insertar nuevo pozo
        window.electronAPI.send("insertar-pozo", pozoDataSimplificado);

        const removeListener = window.electronAPI.receive("pozo-insertado", (arg) => {
          console.log(arg); // arg contiene la respuesta del proceso principal, por ejemplo, el ID del pozo insertado
          removeListener();
        });
      }

      // Cerrar el formulario después de insertar/editar
      this.mostrarFormulario = false;
      await this.cargarPozos();
    },
  },
};
</script>
