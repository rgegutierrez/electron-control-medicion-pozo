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
      item-key="id"
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
            >{{ pozoActual.id ? "Editar" : "Agregar" }} Pozo</span
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
import { database } from "../firebaseConfig";
import { ref, set, onValue, off, push } from "firebase/database";

export default {
  data() {
    return {
      // Ajusta los headers para reflejar los datos de un pozo
      headers: [
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
  async mounted() {
    await this.cargarPozos();
  },
  unmounted() {
    const datosRef = ref(database, "pozos/");
    off(datosRef);
  },
  methods: {
    async cargarPozos() {
      const datosRef = ref(database, "pozos/");
      onValue(
        datosRef,
        (snapshot) => {
          const data = snapshot.val();
          const pozosArray = Object.keys(data).map((key) => ({
            ...data[key],
            id: key, // Aquí asignas la clave única de Firebase a cada pozo
          }));
          this.pozos = pozosArray;
        },
        {
          onlyOnce: true,
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
      if (this.pozoActual.id) {
        const data = {
          Nombre: this.pozoActual.Nombre,
          Tipo: this.pozoActual.Tipo,
        };

        set(ref(database, "pozos/" + this.pozoActual.id), data)
          .then(() => {
            console.log("Datos guardados correctamente.");
          })
          .catch((error) => {
            console.log("Error al guardar datos: ", error);
          });
      } else {
        const data = {
          Nombre: this.pozoActual.Nombre,
          Tipo: this.pozoActual.Tipo,
        };

        // Crea una nueva referencia con un ID único en la colección "pozos"
        const nuevaRef = push(ref(database, "pozos"));

        // Inserta los datos en la nueva referencia
        set(nuevaRef, data)
          .then(() => {
            console.log("Datos insertados con ID único: ", nuevaRef.key);
          })
          .catch((error) => {
            console.log("Error al insertar datos: ", error);
          });
      }

      // Cerrar el formulario después de insertar/editar
      this.mostrarFormulario = false;
      await this.cargarPozos();
    },
  },
};
</script>
