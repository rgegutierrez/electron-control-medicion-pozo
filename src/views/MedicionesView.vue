<template>
  <v-container>
    <v-toolbar border title="Mediciones" class="mb-2">
      <v-row class="fill-height">
        <v-col class="d-flex justify-end">
          <v-btn
            class="mx-2"
            variant="tonal"
            color="black"
            @click="agregarMedicion"
          >
            <v-icon icon="$plus" />
            Agrega Medición
          </v-btn>
          <v-btn
            class="mx-2"
            variant="tonal"
            color="secondary"
            @click="exportar"
          >
            <v-icon icon="$file" />
            Exportar
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>

    <v-container>
      <v-row>
        <v-col>
          <v-text-field
            v-model="mesInicio"
            label="Mes de inicio"
            type="month"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            v-model="mesFin"
            label="Mes de fin"
            type="month"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-autocomplete
            label="Pozo"
            :items="pozos"
            item-title="Nombre"
            item-value="Nombre"
            hide-details="auto"
            v-model="filtersHeader['Pozo']"
            small-chips
            dense
            solo
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-btn class="mx-2" variant="tonal" color="primary" @click="recargar">
            <v-icon icon="$loading" />
            Recargar
          </v-btn>
          <v-btn
            class="my-2"
            variant="tonal"
            color="error"
            @click="limpiarFiltros"
          >
            <v-icon icon="$close" />
            Limpiar</v-btn
          >
        </v-col>
      </v-row>
    </v-container>

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

      <!-- Pozo -->
      <template v-slot:[`item.Pozo`]="{ item }">
        <span style="font-weight: bold">{{ item.Pozo }}</span>
      </template>

      <!-- pH Medido -->
      <template v-slot:[`item.pHMedido`]="{ item }">
        <span
          :style="{ color: item.pHMedidoColor }"
          :title="`${item.pHInferior} - ${item.pHSuperior}`"
          >{{ item.pHMedido }}</span
        >
      </template>

      <!-- CE Medido -->
      <template v-slot:[`item.CEMedido`]="{ item }">
        <span :style="{ color: item.CEMedidoColor }" :title="`> ${item.CE}`">{{
          item.CEMedido
        }}</span>
      </template>

      <!-- STD Medido -->
      <template v-slot:[`item.STDMedido`]="{ item }">
        <span
          :style="{ color: item.STDMedidoColor }"
          :title="`> ${item.STD}`"
          >{{ item.STDMedido }}</span
        >
      </template>

      <!-- SO4 Medido -->
      <template v-slot:[`item.SO4Medido`]="{ item }">
        <span
          :style="{ color: item.SO4MedidoColor }"
          :title="`> ${item.SO4}`"
          >{{ item.SO4Medido }}</span
        >
      </template>

      <!-- Cu Medido -->
      <template v-slot:[`item.CuMedido`]="{ item }">
        <span
          :style="{ color: item.CuMedidoColor }"
          :title="`> ${item.CuDisuelto}`"
          >{{ item.CuMedido }}</span
        >
      </template>

      <template v-slot:[`item.Acciones`]="{ item }">
        <v-btn
          variant="tonal"
          icon
          color="primary"
          @click="editarMedicion(item)"
        >
          <v-icon icon="$edit" />
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
            <v-form ref="form">
              <v-autocomplete
                label="Pozo"
                :items="pozos"
                item-title="Nombre"
                item-value="Nombre"
                v-model="medicionActual.Pozo"
                :rules="reglasPozo"
                required
              ></v-autocomplete>

              <v-text-field
                label="Fecha"
                v-model="medicionActual.Fecha"
                type="date"
                :rules="reglasFecha"
                required
              ></v-text-field>

              <v-text-field
                label="pH Medido"
                v-model="medicionActual.pHMedido"
                type="number"
                min="0"
              ></v-text-field>

              <v-text-field
                label="CE Medido"
                v-model="medicionActual.CEMedido"
                type="number"
                min="0"
              ></v-text-field>

              <v-text-field
                label="STD Medido"
                v-model="medicionActual.STDMedido"
                type="number"
                min="0"
              ></v-text-field>

              <v-text-field
                label="SO4 Medido"
                v-model="medicionActual.SO4Medido"
                type="number"
                min="0"
              ></v-text-field>

              <v-text-field
                label="Cu Medido"
                v-model="medicionActual.CuMedido"
                type="number"
                min="0"
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
            @click="insertarMedicion"
          >
            <v-icon icon="$complete" />Guardar</v-btn
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
        { title: "Fecha", key: "Fecha", width: "120px", t: "s" },
        { title: "Pozo", key: "Pozo", width: "200px", t: "s" },
        { title: "Criticidad", key: "Tipo", t: "s" },
        { title: "pH Medido", key: "pHMedido", align: "end", t: "n" },
        { title: "CE Medido (µS/cm)", key: "CEMedido", align: "end", t: "n" },
        { title: "STD Medido (mg/l)", key: "STDMedido", align: "end", t: "n" },
        { title: "SO4 Medido (mg/l)", key: "SO4Medido", align: "end", t: "n" },
        { title: "Cu Medido (mg/l)", key: "CuMedido", align: "end", t: "n" },
        { title: "Acciones", key: "Acciones", sortable: false },
      ],
      filtersHeader: {},
      dialogMesInicio: false,
      dialogMesFin: false,
      mesInicio: "",
      mesFin: "",
      // Datos de ejemplo, remplazar con datos reales obtenidos de la base de datos
      mediciones: [],
      // Para controlar la visibilidad del formulario de agregar/editar
      mostrarFormulario: false,
      // Datos del medicion actual para agregar/editar
      medicionActual: {},
      pozos: [],
      reglasPozo: [(v) => !!v || "El campo Pozo es requerido."],
      reglasFecha: [(v) => !!v || "El campo Fecha es requerido."],
    };
  },
  async mounted() {
    await this.recargar();
    await this.cargarPozos();
  },
  async unmounted() {
    const datosRef = ref(database, "mediciones/");
    off(datosRef);

    const datosRefPozo = ref(database, "pozos/");
    off(datosRefPozo);

    await this.calcularRangoFechas();
  },
  methods: {
    limpiarFiltros() {
      this.mesInicio = "";
      this.mesFin = "";
      this.filtersHeader["Pozo"] = null; // Asegúrate de que este sea el valor adecuado para "limpiar" el v-autocomplete

      this.calcularRangoFechas();
    },
    calcularRangoFechas() {
      if (this.mesInicio != "" && this.mesFin != "") {
        return;
      }

      if (this.mediciones.length === 0) {
        this.mesInicio = "";
        this.mesFin = "";
        return;
      }

      const fechas = this.mediciones.map((m) => m.Mes);
      const mesInicio = fechas.reduce(
        (min, p) => (p < min ? p : min),
        fechas[0]
      );
      const mesFin = fechas.reduce((max, p) => (p > max ? p : max), fechas[0]);

      this.mesInicio = mesInicio;
      this.mesFin = mesFin;
    },
    getColumnValues(val) {
      switch (val) {
        case "vigencia":
          return [
            { name: "Activo", id: true },
            { name: "Inactivo", id: false },
          ];
        default:
          return this.pozos.map((d) => ({
            name: d[val],
            id: d[val],
          }));
      }
    },
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
    async exportar() {
      const styleRed = { font: { bold: true, color: { rgb: "FF0000" } } };

      const XLSX = require("xlsx-js-style");
      // STEP 1: Create a new workbook
      const wb = XLSX.utils.book_new();

      // Filtrar headers para excluir 'Pozo' y 'Acciones'
      const filteredHeaders = this.headers
        .filter(
          (h) => h.key !== "Pozo" && h.key !== "Acciones" && h.key !== "Tipo"
        )
        .map((h) => h.title);

      // Por cada pozo en el array de pozos, crea una hoja de cálculo
      this.pozos.forEach((pozo) => {
        // Filtra mediciones para el pozo actual
        const medicionesPozo = this.medicionesAnalitics.filter(
          (m) => m.Pozo === pozo.Nombre
        );

        // Preparar los datos de las mediciones, excluyendo 'Pozo' y 'Acciones'
        const wsData = [
          filteredHeaders, // Encabezados ya filtrados
          ...medicionesPozo.map((medicion) => {
            return this.headers
              .filter(
                (h) =>
                  h.key !== "Pozo" && h.key !== "Acciones" && h.key !== "Tipo"
              ) // Excluyendo 'Pozo', 'Acciones' y 'Tipo'
              .map((h) => {
                // Determinar si el campo debe tener el estilo rojo
                let style = {};
                if (medicion[`${h.key}Color`] === "red") {
                  style = styleRed; // Aplica el estilo rojo si la propiedad Color es 'red'
                }

                return {
                  v: medicion[h.key],
                  t: h.t, // Tipo string
                  s: style, // Estilo, que puede ser 'styleRed' o vacío
                };
              });
          }),
        ];

        // Crea una hoja de cálculo a partir de los datos
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Suponiendo que ws es tu hoja de trabajo
        if (!ws["!cols"]) ws["!cols"] = [];
        ws["!cols"][0] = { wch: 12 };
        ws["!cols"][1] = { wch: 23 };
        ws["!cols"][2] = { wch: 23 };
        ws["!cols"][3] = { wch: 23 };
        ws["!cols"][4] = { wch: 23 };
        ws["!cols"][5] = { wch: 23 };

        // Añade la hoja de cálculo al libro de trabajo
        XLSX.utils.book_append_sheet(wb, ws, pozo.Nombre);
      });

      // Genera el archivo Excel
      XLSX.writeFile(wb, `${this.obtenerFechaActual()} Mediciones Pozo.xlsx`);
    },
    obtenerFechaActual() {
      const hoy = new Date();
      const anio = hoy.getFullYear();
      const mes = ("0" + (hoy.getMonth() + 1)).slice(-2); // Añade un '0' si es necesario y toma los últimos 2 caracteres
      const dia = ("0" + hoy.getDate()).slice(-2); // Añade un '0' si es necesario y toma los últimos 2 caracteres
      return `${anio}-${mes}-${dia}`;
    },
    async recargar() {
      const datosRef = ref(database, "mediciones/");
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

            this.calcularRangoFechas();
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
      this.$refs.form.validate().then(({ valid: isValid }) => {
        if (isValid) {
          const data = {
            Pozo: this.medicionActual.Pozo,
            Fecha: this.medicionActual.Fecha,
            Mes: this.medicionActual.Fecha.substring(0, 7),
            pHMedido: this.convertirANullODecimal(this.medicionActual.pHMedido),
            CEMedido: this.convertirANullODecimal(this.medicionActual.CEMedido),
            STDMedido: this.convertirANullODecimal(
              this.medicionActual.STDMedido
            ),
            SO4Medido: this.convertirANullODecimal(
              this.medicionActual.SO4Medido
            ),
            CuMedido: this.convertirANullODecimal(this.medicionActual.CuMedido),
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
          this.recargar();
        } else {
          console.log("El formulario tiene errores.");
        }
      });
    },
  },
  computed: {
    medicionesAnalitics() {
      return this.mediciones
        .filter((medicion) => {
          const mesMedicion = medicion.Mes; // Asume que ya tienes una propiedad Mes en tu objeto
          return mesMedicion >= this.mesInicio && mesMedicion <= this.mesFin;
        })
        .filter((d) => {
          // Filtrar mediciones basadas en filtersHeader
          return Object.keys(this.filtersHeader).every((f) => {
            if (this.filtersHeader[f] == null) return true;
            if (d[f] == null) return false;
            return (
              this.filtersHeader[f].toString().length < 1 ||
              this.filtersHeader[f].toString() === d[f].toString()
            );
          });
        })
        .map((medicion) => {
          // Buscar el pozo correspondiente y excluir el campo id
          const pozo = this.pozos.find(
            (p) => p.Nombre.trim() === medicion.Pozo.trim()
          );
          if (pozo) {
            const { id, ...restoPozo } = pozo;
            console.log(id);

            // Inicializar propiedades de color
            let pHMedidoColor = "",
              CEMedidoColor = "",
              STDMedidoColor = "",
              SO4MedidoColor = "",
              CuMedidoColor = "";

            // Verificar condiciones y asignar colores
            if (
              parseFloat(medicion.pHMedido) <
                parseFloat(restoPozo.pHInferior) ||
              parseFloat(medicion.pHMedido) > parseFloat(restoPozo.pHSuperior)
            ) {
              pHMedidoColor = "red";
            }
            if (parseFloat(medicion.CEMedido) > parseFloat(restoPozo.CE)) {
              CEMedidoColor = "red";
            }
            if (parseFloat(medicion.STDMedido) > parseFloat(restoPozo.STD)) {
              STDMedidoColor = "red";
            }
            if (parseFloat(medicion.SO4Medido) > parseFloat(restoPozo.SO4)) {
              SO4MedidoColor = "red";
            }
            if (
              parseFloat(medicion.CuMedido) > parseFloat(restoPozo.CuDisuelto)
            ) {
              CuMedidoColor = "red";
            }

            // Retornar nuevo objeto combinado con propiedades de color
            return {
              ...medicion,
              ...restoPozo,
              pHMedidoColor,
              CEMedidoColor,
              STDMedidoColor,
              SO4MedidoColor,
              CuMedidoColor,
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
