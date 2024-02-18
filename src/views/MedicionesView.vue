<template>
  <v-container>
    <!-- Botón para agregar un medicion -->
    <v-btn color="primary" @click="mostrarFormularioAgregar"
      >Agregar Medición</v-btn
    >
    <v-btn color="success" @click="cargarMediciones">Sincronizar</v-btn>

    <!-- Tabla de Mediciones -->
    <v-data-table
      :headers="headers"
      :items="mediciones"
      class="elevation-1"
      item-key="id"
    >
      <template v-slot:[`item.Acciones`]="{ item }">
        <v-btn icon @click="editarMedicion(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="mostrarFormulario" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >{{ medicionActual.id ? "Editar" : "Agregar" }} Medición</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form>
              <v-autocomplete
                label="Pozo"
                :items="pozos"
                item-title="Nombre"
                item-value="Nombre"
                v-model="medicionActual.Pozo"
                required
              ></v-autocomplete>

              <v-text-field
                label="Fecha"
                v-model="medicionActual.Fecha"
                type="date"
                required
              ></v-text-field>

              <v-text-field
                label="pH Medido"
                v-model="medicionActual.pHMedido"
                type="number"
                required
              ></v-text-field>

              <v-text-field
                label="CE Medido"
                v-model="medicionActual.CEMedido"
                type="number"
                required
              ></v-text-field>

              <v-text-field
                label="STD Medido"
                v-model="medicionActual.STDmedido"
                type="number"
                required
              ></v-text-field>

              <v-text-field
                label="SO4 Medido"
                v-model="medicionActual.SO4medido"
                type="number"
                required
              ></v-text-field>

              <v-text-field
                label="Cu Medido"
                v-model="medicionActual.CuMedido"
                type="number"
                required
              ></v-text-field>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="mostrarFormulario = false"
            >Cancelar</v-btn
          >
          <v-btn color="blue darken-1" text @click="insertarMedicion"
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
      // Ajusta los headers para reflejar los datos de un medicion
      headers: [
        { title: "Fecha", key: "Fecha" },
        { title: "Pozo", key: "Pozo" },
        { title: "pH Medido", key: "pHMedido", align: "end" },
        { title: "CE Medido", key: "CEMedido", align: "end" },
        { title: "STD Medido", key: "STDmedido", align: "end" },
        { title: "SO4 Medido", key: "SO4medido", align: "end" },
        { title: "Cu Medido", key: "CuMedido", align: "end" },
        { title: "Acciones", key: "Acciones", sortable: false },
      ],
      // Datos de ejemplo, remplazar con datos reales obtenidos de la base de datos
      mediciones: [],
      // Para controlar la visibilidad del formulario de agregar/editar
      mostrarFormulario: false,
      // Datos del medicion actual para agregar/editar
      medicionActual: {},
      pozos: [],
    };
  },
  async mounted() {
    await this.cargarMediciones();
    await this.cargarPozos();
  },
  unmounted() {
    const datosRef = ref(database, "mediciones/");
    off(datosRef);

    const datosRefPozo = ref(database, "pozos/");
    off(datosRefPozo);
  },
  methods: {
    async cargarPozos() {
      const datosRef = ref(database, "pozos/");
      onValue(
        datosRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Verifica si data no es null
            const pozosArray = Object.keys(data).map((key) => ({
              ...data[key],
              id: key, // Asigna la clave única de Firebase a cada medición
            }));
            this.pozos = pozosArray;
          }
        },
        {
          onlyOnce: true,
        }
      );
    },
    async cargarMediciones() {
      const datosRef = ref(database, "mediciones/");
      onValue(
        datosRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Verifica si data no es null
            const medicionesArray = Object.keys(data).map((key) => ({
              ...data[key],
              id: key, // Asigna la clave única de Firebase a cada medición
            }));
            this.mediciones = medicionesArray;
          }
        },
        {
          onlyOnce: true,
        }
      );
    },
    async mostrarFormularioAgregar() {
      this.medicionActual = {}; // Resetear medicionActual para un nuevo medicion
      this.mostrarFormulario = true;
    },
    async editarMedicion(medicion) {
      this.medicionActual = { ...medicion }; // Copiar el medicion a editar en medicionActual
      this.mostrarFormulario = true;
    },
    async insertarMedicion() {
      const data = {
        Pozo: this.medicionActual.Pozo,
        Fecha: this.medicionActual.Fecha,
        pHMedido: this.medicionActual.pHMedido,
        CEMedido: this.medicionActual.CEMedido,
        STDmedido: this.medicionActual.STDmedido,
        SO4medido: this.medicionActual.SO4medido,
        CuMedido: this.medicionActual.CuMedido,
      };

      if (this.medicionActual.id) {
        set(ref(database, "mediciones/" + this.medicionActual.id), data)
          .then(() => {
            console.log("Datos guardados correctamente.");
          })
          .catch((error) => {
            console.log("Error al guardar datos: ", error);
          });
      } else {
        // Crea una nueva referencia con un ID único en la colección "mediciones"
        const nuevaRef = push(ref(database, "mediciones"));

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
      await this.cargarMediciones();
    },
  },
};
</script>
