<template>
  <v-container>
    <v-toolbar border title="Mediciones In Situ" class="mb-2">
      <v-row class="fill-height">
        <v-col class="d-flex justify-end">
          <v-btn
            class="mx-2"
            prepend-icon="mdi-reload"
            variant="tonal"
            color="primary"
            @click="recargar"
          >
            Recargar
          </v-btn>
          <v-btn
            class="mx-2"
            prepend-icon="mdi-plus"
            variant="tonal"
            color="secondary"
            @click="agregarMedicion"
          >
            Agrega Medición
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>

    <!-- Tabla de Mediciones -->
    <v-data-table
      :headers="headers"
      :items="medicionesAnalitics"
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

      <!-- Fecha -->
      <template v-slot:[`item.Fecha`]="{ item }">
        <span style="font-weight: bold">{{ item.Fecha }}</span>
      </template>

      <!-- Hora -->
      <template v-slot:[`item.Hora`]="{ item }">
        <span style="font-weight: bold">{{ item.Hora }}</span>
      </template>

      <!-- Pozo -->
      <template v-slot:[`item.Pozo`]="{ item }">
        <span style="font-weight: bold">{{ item.Pozo }}</span>
      </template>

      <!-- pH Medido -->
      <template v-slot:[`item.pHMedido`]="{ item }">
        <span
          :style="{ color: item.pHColor }"
          :title="`${item.pHInferior} - ${item.pHSuperior}`"
          >{{ item.pHMedido }}</span
        >
      </template>

      <!-- CE Medido -->
      <template v-slot:[`item.CEMedido`]="{ item }">
        <span :style="{ color: item.CEColor }" :title="`> ${item.CE}`">{{
          item.CEMedido
        }}</span>
      </template>

      <!-- STD Medido -->
      <template v-slot:[`item.STDMedido`]="{ item }">
        <span :style="{ color: item.STDColor }" :title="`> ${item.STD}`">{{
          item.STDMedido
        }}</span>
      </template>

      <!-- Salinidad Medido -->
      <template v-slot:[`item.SalinidadMedido`]="{ item }">
        <span
          :style="{ color: item.SalColor }"
          :title="`> ${item.Salinidad}`"
          >{{ item.SalinidadMedido }}</span
        >
      </template>

      <!-- NivelFreatico Medido -->
      <template v-slot:[`item.NivelFreaticoMedido`]="{ item }">
        <span
          :style="{ color: item.NFColor }"
          :title="`> ${item.NivelFreatico}`"
          >{{ item.NivelFreaticoMedido }}</span
        >
      </template>

      <template v-slot:[`item.Acciones`]="{ item }">
        <v-btn
          v-if="item.error"
          variant="tonal"
          icon
          color="primary"
          @click="editarMedicion(item)"
        >
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
              ></v-text-field>

              <v-text-field
                label="CE Medido"
                v-model="medicionActual.CEMedido"
              ></v-text-field>

              <v-text-field
                label="STD Medido"
                v-model="medicionActual.STDMedido"
              ></v-text-field>

              <v-text-field
                label="Salinidad Medido"
                v-model="medicionActual.SalinidadMedido"
              ></v-text-field>

              <v-text-field
                label="Nivel Freático Medido"
                v-model="medicionActual.NivelFreaticoMedido"
              ></v-text-field>

              <v-textarea
                label="Observaciones"
                v-model="medicionActual.Observaciones"
              ></v-textarea>
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
            prepend-icon="mdi-content-save"
            color="blue darken-1"
            text
            @click="insertarMedicion"
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
      headers: [
        { title: "Fecha", key: "Fecha", width: "120px" },
        { title: "Hora", key: "Hora" },
        { title: "Pozo", key: "Pozo", width: "200px" },
        { title: "pH Medido", key: "pHMedido", align: "end" },
        { title: "CE Medido (µS/cm)", key: "CEMedido", align: "end" },
        { title: "STD Medido (mg/l)", key: "STDMedido", align: "end" },
        { title: "Salinidad (%)", key: "SalinidadMedido", align: "end" },
        {
          title: "Nivel Freático (m.s.n.m.)",
          key: "NivelFreaticoMedido",
          align: "end",
        },
        { title: "Observaciones", key: "Observaciones" },
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
    await this.recargar();
    await this.cargarPozos();
  },
  unmounted() {
    const datosRef = ref(database, "mediciones-insitu/");
    off(datosRef);

    const datosRefPozo = ref(database, "pozos/");
    off(datosRefPozo);
  },
  methods: {
    convertirANullODecimal(valor) {
      // Convierte el valor a decimal si es posible; de lo contrario, devuelve null
      const numero = Number(valor);
      return isNaN(numero) ? null : numero;
    },
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
    async recargar() {
      const datosRef = ref(database, "mediciones-insitu/");
      onValue(
        datosRef,
        (snapshot) => {
          const data = snapshot.val();

          if (data) {
            const medicionesArray = Object.keys(data).map((key) => ({
              ...data[key],
              id: key, // Asigna la clave única de Firebase a cada medición
            }));
            this.mediciones = medicionesArray;
          } else {
            this.mediciones = [];
          }
        },
        {
          onlyOnce: true,
        }
      );
    },
    async agregarMedicion() {
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
        Mes: this.medicionActual.Fecha.substring(0, 7),
        Hora:
          this.medicionActual.Hora === undefined
            ? ""
            : this.medicionActual.Hora,
        pHMedido: this.convertirANullODecimal(this.medicionActual.pHMedido),
        CEMedido: this.convertirANullODecimal(this.medicionActual.CEMedido),
        STDMedido: this.convertirANullODecimal(this.medicionActual.STDMedido),
        SalinidadMedido: this.convertirANullODecimal(
          this.medicionActual.SalinidadMedido
        ),
        NivelFreaticoMedido: this.convertirANullODecimal(
          this.medicionActual.NivelFreaticoMedido
        ),
        Observaciones: this.medicionActual.Observaciones === undefined
            ? ""
            : this.medicionActual.Observaciones,
      };

      console.log(`DATA`, data);

      if (this.medicionActual.id) {
        set(ref(database, "mediciones-insitu/" + this.medicionActual.id), data)
          .then(() => {
            console.log("Datos guardados correctamente.");
          })
          .catch((error) => {
            console.log("Error al guardar datos: ", error);
          });
      } else {
        // Crea una nueva referencia con un ID único en la colección "mediciones-insitu"
        const nuevaRef = push(ref(database, "mediciones-insitu"));

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
  computed: {
    medicionesAnalitics() {
      return this.mediciones.map((medicion) => {
        // Buscar el pozo correspondiente y excluir el campo id
        const pozo = this.pozos.find(
          (p) => p.Nombre.trim() === medicion.Pozo.trim()
        );
        if (pozo) {
          const { id, ...restoPozo } = pozo;
          console.log(id);

          // Inicializar propiedades de color
          let pHColor = "",
            CEColor = "",
            STDColor = "",
            SO4Color = "",
            CuColor = "";

          // Verificar condiciones y asignar colores
          if (
            parseFloat(medicion.pHMedido) < parseFloat(restoPozo.pHInferior) ||
            parseFloat(medicion.pHMedido) > parseFloat(restoPozo.pHSuperior)
          ) {
            pHColor = "red";
          }
          if (parseFloat(medicion.CEMedido) > parseFloat(restoPozo.CE)) {
            CEColor = "red";
          }
          if (parseFloat(medicion.STDMedido) > parseFloat(restoPozo.STD)) {
            STDColor = "red";
          }
          if (parseFloat(medicion.SO4Medido) > parseFloat(restoPozo.SO4)) {
            SO4Color = "red";
          }
          if (
            parseFloat(medicion.CuMedido) > parseFloat(restoPozo.CuDisuelto)
          ) {
            CuColor = "red";
          }

          // Retornar nuevo objeto combinado con propiedades de color
          return {
            ...medicion,
            ...restoPozo,
            pHColor,
            CEColor,
            STDColor,
            SO4Color,
            CuColor,
          };
        }
        // En caso de no encontrar el pozo, retornar solo la medicion
        return medicion;
      });
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
