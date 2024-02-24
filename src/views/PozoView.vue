<template>
  <v-container>
    <v-toolbar border title="Pozos" class="mb-2">
      <v-row class="fill-height">
        <v-col class="d-flex justify-end">
          <v-btn class="mx-2" variant="tonal" color="primary" @click="recargar">
            <v-icon icon="$loading" />
            Recargar
          </v-btn>
          <v-btn
            class="mx-2"
            variant="tonal"
            color="secondary"
            @click="agregarPozo"
          >
            <v-icon icon="$plus" />
            Agrega Pozo
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>

    <!-- Tabla de Pozos -->
    <v-data-table
      :headers="headers"
      :items="pozos"
      :items-per-page="10"
      :items-per-page-options="[10, 30, 50, 100, -1]"
      class="elevation-1"
      item-key="id"
    >
      <template v-slot:[`top`]="{ pagination, options, updateOptions }">
        <v-data-table-footer
          class="border-bottom"
          :pagination="pagination"
          :options="options"
          @update:options="updateOptions"
          items-per-page-text="$vuetify.dataTable.itemsPerPageText"
        >
        </v-data-table-footer>
      </template>

      <!-- Nombre -->
      <template v-slot:[`item.Nombre`]="{ item }">
        <span style="font-weight: bold">{{ item.Nombre }}</span>
      </template>

      <!-- Tipo -->
      <template v-slot:[`item.Tipo`]="{ item }">
        <span style="font-weight: bold">{{ item.Tipo }}</span>
      </template>

      <template v-slot:[`item.Acciones`]="{ item }">
        <v-btn variant="tonal" icon color="primary" @click="editarPozo(item)">
          <v-icon icon="$edit" />
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
              <v-text-field
                label="pH Inferior"
                v-model="pozoActual.pHInferior"
                type="number"
                min="0"
                required
              ></v-text-field>
              <v-text-field
                label="pH Superior"
                v-model="pozoActual.pHSuperior"
                type="number"
                min="0"
                required
              ></v-text-field>
              <v-text-field
                label="CE (µS/cm)"
                v-model="pozoActual.CE"
                type="number"
                min="0"
                required
              ></v-text-field>
              <v-text-field
                label="STD (mg/l)"
                v-model="pozoActual.STD"
                type="number"
                min="0"
                required
              ></v-text-field>
              <v-text-field
                label="SO4 (mg/l)"
                v-model="pozoActual.SO4"
                type="number"
                min="0"
                required
              ></v-text-field>
              <v-text-field
                label="Cu (mg/l)"
                v-model="pozoActual.CuDisuelto"
                type="number"
                min="0"
                required
              ></v-text-field>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="tonal" text @click="mostrarFormulario = false"
            >Cancelar</v-btn
          >
          <v-btn
            variant="tonal"
            color="blue darken-1"
            text
            @click="insertarPozo"
          >
            <v-icon icon="$complete" />
            Guardar</v-btn
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
        { title: "pH Inferior", key: "pHInferior", align: "end" },
        { title: "pH Superior", key: "pHSuperior", align: "end" },
        { title: "CE (µS/cm)", key: "CE", align: "end" },
        { title: "STD (mg/l)", key: "STD", align: "end" },
        { title: "SO4 (mg/l)", key: "SO4", align: "end" },
        { title: "Cu Disuelto (mg/l)", key: "CuDisuelto", align: "end" },
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
    await this.recargar();
  },
  unmounted() {
    const datosRef = ref(database, "pozos/");
    off(datosRef);
  },
  methods: {
    convertirANullODecimal(valor) {
      // Convierte el valor a decimal si es posible; de lo contrario, devuelve null
      const numero = Number(valor);
      return isNaN(numero) ? null : numero;
    },
    async recargar() {
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
          } else {
            this.pozos = [];
          }
        },
        {
          onlyOnce: true,
        }
      );
    },
    agregarPozo() {
      this.pozoActual = {}; // Resetear pozoActual para un nuevo pozo
      this.mostrarFormulario = true;
    },
    editarPozo(pozo) {
      this.pozoActual = { ...pozo }; // Copiar el pozo a editar en pozoActual
      this.mostrarFormulario = true;
    },
    async insertarPozo() {
      const data = {
        Nombre: this.pozoActual.Nombre,
        Tipo: this.pozoActual.Tipo,
        pHInferior: this.convertirANullODecimal(this.pozoActual.pHInferior),
        pHSuperior: this.convertirANullODecimal(this.pozoActual.pHSuperior),
        CE: this.convertirANullODecimal(this.pozoActual.CE),
        STD: this.convertirANullODecimal(this.pozoActual.STD),
        SO4: this.convertirANullODecimal(this.pozoActual.SO4),
        CuDisuelto: this.convertirANullODecimal(this.pozoActual.CuDisuelto),
      };

      if (this.pozoActual.id) {
        set(ref(database, "pozos/" + this.pozoActual.id), data)
          .then(() => {
            console.log("Datos guardados correctamente.");
          })
          .catch((error) => {
            console.log("Error al guardar datos: ", error);
          });
      } else {
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
      await this.recargar();
    },
  },
};
</script>
<style>
.border-bottom {
  border-top: none !important;
  border-bottom: thin solid rgba(0, 0, 0, 0.12) !important;
}
</style>
