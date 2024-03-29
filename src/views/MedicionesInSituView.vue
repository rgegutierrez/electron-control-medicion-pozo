<template>
  <v-container>
    <v-toolbar border title="Mediciones In Situ" class="mb-2">
      <v-row class="fill-height">
        <v-col class="d-flex justify-end">
          <v-btn
            v-if="havePermission"
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
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <span
              v-bind="props"
              :style="{
                fontWeight: item.pHMedidoColor === 'red' ? 'bold' : 'normal',
                color: item.pHMedidoColor,
              }"
            >
              {{ item.pHMedido }}
            </span>
          </template>
          <span v-if="item.pHMedidoColor === 'red'">
            (Valor +10%) {{ item.pHMedidoDiez }} > {{ item.pHInSitu }} (Límite)
          </span>
        </v-tooltip>
      </template>

      <!-- CEInSitu Medido -->
      <template v-slot:[`item.CEMedido`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <span
              v-bind="props"
              :style="{
                fontWeight: item.CEMedidoColor === 'red' ? 'bold' : 'normal',
                color: item.CEMedidoColor,
              }"
            >
              {{ item.CEMedido }}
            </span>
          </template>
          <span v-if="item.CEMedidoColor === 'red'">
            (Valor +10%) {{ item.CEMedidoDiez }} > {{ item.CEInSitu }} (Límite)
          </span>
        </v-tooltip>
      </template>

      <!-- STDInSitu Medido -->
      <template v-slot:[`item.STDMedido`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <span
              v-bind="props"
              :style="{
                fontWeight: item.STDMedidoColor === 'red' ? 'bold' : 'normal',
                color: item.STDMedidoColor,
              }"
            >
              {{ item.STDMedido }}
            </span>
          </template>
          <span v-if="item.STDMedidoColor === 'red'">
            (Valor +10%) {{ item.STDMedidoDiez }} >
            {{ item.STDInSitu }} (Límite)
          </span>
        </v-tooltip>
      </template>

      <!-- SalinidadInSitu Medido -->
      <template v-slot:[`item.SalinidadMedido`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <span
              v-bind="props"
              :style="{
                fontWeight:
                  item.SalinidadMedidoColor === 'red' ? 'bold' : 'normal',
                color: item.SalinidadMedidoColor,
              }"
            >
              {{ item.SalinidadMedido }}
            </span>
          </template>
          <span v-if="item.SalinidadMedidoColor === 'red'">
            (Valor +10%) {{ item.SalinidadMedidoDiez }} >
            {{ item.SalinidadInSitu }} (Límite)
          </span>
        </v-tooltip>
      </template>

      <!-- NivelFreaticoInSitu Medido -->
      <template v-slot:[`item.NivelFreaticoMedido`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <span
              v-bind="props"
              :style="{
                fontWeight:
                  item.NivelFreaticoMedidoColor === 'red' ? 'bold' : 'normal',
                color: item.NivelFreaticoMedidoColor,
              }"
            >
              {{ item.NivelFreaticoMedido }}
            </span>
          </template>
          <span v-if="item.NivelFreaticoMedidoColor === 'red'">
            (Valor +10%) {{ item.NivelFreaticoMedidoDiez }} >
            {{ item.NivelFreaticoInSitu }} (Límite)
          </span>
        </v-tooltip>
      </template>

      <template v-slot:[`item.Acciones`]="{ item }">
        <v-btn
          v-if="havePermission"
          variant="tonal"
          icon
          color="primary"
          size="small"
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
                label="Hora"
                v-model="medicionActual.Hora"
                type="time"
                :rules="reglasHora"
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
                label="Salinidad Medido"
                v-model="medicionActual.SalinidadMedido"
                type="number"
                min="0"
              ></v-text-field>

              <v-text-field
                label="Nivel Freático Medido"
                v-model="medicionActual.NivelFreaticoMedido"
                type="number"
                min="0"
              ></v-text-field>

              <v-textarea
                label="Observaciones"
                v-model="medicionActual.Observaciones"
              ></v-textarea>

              <v-row>
                <v-col cols="10">
                  <v-autocomplete
                    label="Seleccionar Observación"
                    :items="observaciones"
                    item-title="Nombre"
                    item-value="Nombre"
                    v-model="observacionSeleccionada"
                    clearable
                  ></v-autocomplete>
                </v-col>
                <v-col cols="2">
                  <v-btn
                    variant="tonal"
                    color="blue darken-1"
                    icon
                    @click="agregarObservacion"
                  >
                    <v-icon icon="$plus" />
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="tonal" text @click="mostrarFormulario = false"
            >Cancelar</v-btn
          >
          <v-btn
            v-if="havePermission"
            variant="tonal"
            color="blue darken-1"
            text
            @click="insertarMedicion"
          >
            <v-icon icon="$complete" />Guardar
          </v-btn>
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
      permission: localStorage.getItem("permission"),
      headers: [
        { title: "Fecha", key: "Fecha", width: "120px", t: "s" },
        { title: "Hora", key: "Hora", t: "s" },
        { title: "Pozo", key: "Pozo", width: "200px", t: "s" },
        { title: "pH Medido", key: "pHMedido", align: "end", t: "n" },
        { title: "CE Medido (µS/cm)", key: "CEMedido", align: "end", t: "n" },
        { title: "STD Medido (mg/l)", key: "STDMedido", align: "end", t: "n" },
        {
          title: "Salinidad (%)",
          key: "SalinidadMedido",
          align: "end",
          t: "n",
        },
        {
          title: "Nivel Freático (m.s.n.m.)",
          key: "NivelFreaticoMedido",
          align: "end",
          t: "n",
        },
        { title: "Observaciones", key: "Observaciones", t: "s" },
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
      observaciones: [],
      reglasPozo: [(v) => !!v || "El campo Pozo es requerido."],
      reglasFecha: [(v) => !!v || "El campo Fecha es requerido."],
      reglasHora: [
        (v) => !!v || "El campo Hora es requerido.",
        (v) =>
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v) ||
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(v) ||
          "El formato de hora debe ser HH:mm.",
      ],
      observacionSeleccionada: "",
    };
  },
  async mounted() {
    await this.recargar();
    await this.cargarPozos();
    await this.cargarObservaciones();
  },
  async unmounted() {
    const datosRef = ref(database, "mediciones-insitu/");
    off(datosRef);

    const datosRefPozo = ref(database, "pozos/");
    off(datosRefPozo);

    const datosRefObs = ref(database, "observaciones/");
    off(datosRefObs);

    await this.calcularRangoFechas();
  },
  methods: {
    agregarObservacion() {
      if (this.observacionSeleccionada) {
        if (this.medicionActual.Observaciones === undefined) {
          this.medicionActual.Observaciones = this.observacionSeleccionada;
        } else {
          this.medicionActual.Observaciones +=
            " | " + this.observacionSeleccionada;
        }

        this.observacionSeleccionada = "";
      }
    },
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
    async cargarObservaciones() {
      const datosRef = ref(database, "observaciones/");
      onValue(
        datosRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Verifica si data no es null
            const observacionesArray = Object.keys(data).map((key) => ({
              ...data[key],
              id: key, // Asigna la clave única de Firebase a cada medición
            }));
            this.observaciones = observacionesArray;
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
        .filter((h) => h.key !== "Pozo" && h.key !== "Acciones")
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
              .filter((h) => h.key !== "Pozo" && h.key !== "Acciones") // Excluyendo 'Pozo' y 'Acciones'
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
        ws["!cols"][2] = { wch: 23 };
        ws["!cols"][3] = { wch: 23 };
        ws["!cols"][4] = { wch: 23 };
        ws["!cols"][5] = { wch: 23 };
        ws["!cols"][6] = { wch: 23 };
        ws["!cols"][7] = { wch: 80 };

        // Añade la hoja de cálculo al libro de trabajo
        XLSX.utils.book_append_sheet(wb, ws, pozo.Nombre);
      });

      // Genera el archivo Excel
      XLSX.writeFile(wb, `${this.obtenerFechaActual()} In Situ Mina.xlsx`);
    },
    obtenerFechaActual() {
      const hoy = new Date();
      const anio = hoy.getFullYear();
      const mes = ("0" + (hoy.getMonth() + 1)).slice(-2); // Añade un '0' si es necesario y toma los últimos 2 caracteres
      const dia = ("0" + hoy.getDate()).slice(-2); // Añade un '0' si es necesario y toma los últimos 2 caracteres
      return `${anio}-${mes}-${dia}`;
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
      if (this.medicionActual.Hora !== undefined) {
        this.medicionActual.Hora = this.medicionActual.Hora.substring(0, 5);
      }

      this.$refs.form.validate().then(({ valid: isValid }) => {
        if (isValid) {
          const data = {
            Pozo: this.medicionActual.Pozo,
            Fecha: this.medicionActual.Fecha,
            Mes: this.medicionActual.Fecha.substring(0, 7),
            Hora:
              this.medicionActual.Hora === undefined
                ? ""
                : `${this.medicionActual.Hora}:00`,
            pHMedido: this.convertirANullODecimal(this.medicionActual.pHMedido),
            CEMedido: this.convertirANullODecimal(this.medicionActual.CEMedido),
            STDMedido: this.convertirANullODecimal(
              this.medicionActual.STDMedido
            ),
            SalinidadMedido: this.convertirANullODecimal(
              this.medicionActual.SalinidadMedido
            ),
            NivelFreaticoMedido: this.convertirANullODecimal(
              this.medicionActual.NivelFreaticoMedido
            ),
            Observaciones:
              this.medicionActual.Observaciones === undefined
                ? ""
                : this.medicionActual.Observaciones,
          };

          if (this.medicionActual.id) {
            set(
              ref(database, "mediciones-insitu/" + this.medicionActual.id),
              data
            )
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
          this.recargar();
        } else {
          console.log("El formulario tiene errores.");
        }
      });
    },
  },
  computed: {
    havePermission() {
      return this.permission > 1;
    },
    medicionesAnalitics() {
      // Primero, filtrar mediciones basadas en el rango de meses y los filtros de cabecera
      const medicionesFiltradas = this.mediciones
        .filter(
          (medicion) =>
            medicion.Mes >= this.mesInicio && medicion.Mes <= this.mesFin
        )
        .filter((d) =>
          Object.keys(this.filtersHeader).every((f) => {
            if (this.filtersHeader[f] == null) return true;
            if (d[f] == null) return false;
            return (
              this.filtersHeader[f].toString().length < 1 ||
              this.filtersHeader[f].toString() === d[f].toString()
            );
          })
        );

      // Agrupar las mediciones por pozo
      const medicionesPorPozo = medicionesFiltradas.reduce((acc, medicion) => {
        (acc[medicion.Pozo] = acc[medicion.Pozo] || []).push(medicion);
        return acc;
      }, {});

      // Identificar el último registro por pozo y aplicar las verificaciones
      const ultimasMediciones = Object.values(medicionesPorPozo).map(
        (mediciones) => {
          // Ordenar por fecha (asumiendo que existe una propiedad fecha) y tomar la última
          const ultimaMedicion = mediciones.sort(
            (a, b) => new Date(b.Fecha) - new Date(a.Fecha)
          )[0];
          const pozo = this.pozos.find(
            (p) => p.Nombre.trim() === ultimaMedicion.Pozo.trim()
          );

          if (pozo) {
            const { id, ...restoPozo } = pozo;
            console.log(id);

            // Inicializar propiedades de color
            let pHMedidoColor = "",
              CEMedidoColor = "",
              STDMedidoColor = "",
              SalinidadMedidoColor = "",
              NivelFreaticoMedidoColor = "";

            // Inicializar propiedades de color
            let pHMedidoDiez = 0,
              CEMedidoDiez = 0,
              STDMedidoDiez = 0,
              SalinidadMedidoDiez = 0,
              NivelFreaticoMedidoDiez = 0;

            // Aplicar verificación solo si los valores no son null, undefined, o string vacío
            if (ultimaMedicion.pHMedido) {
              pHMedidoDiez = (
                parseFloat(ultimaMedicion.pHMedido) * 1.1
              ).toFixed(2);
              pHMedidoColor =
                pHMedidoDiez > parseFloat(restoPozo.pHInSitu) ? "red" : "";
            }

            if (ultimaMedicion.CEMedido) {
              CEMedidoDiez = (
                parseFloat(ultimaMedicion.CEMedido) * 1.1
              ).toFixed(2);
              CEMedidoColor =
                CEMedidoDiez > parseFloat(restoPozo.CEInSitu) ? "red" : "";
            }

            if (ultimaMedicion.STDMedido) {
              STDMedidoDiez = (
                parseFloat(ultimaMedicion.STDMedido) * 1.1
              ).toFixed(2);
              STDMedidoColor =
                STDMedidoDiez > parseFloat(restoPozo.STDInSitu) ? "red" : "";
            }

            if (ultimaMedicion.SalinidadMedido) {
              SalinidadMedidoDiez = (
                parseFloat(ultimaMedicion.SalinidadMedido) * 1.1
              ).toFixed(2);
              SalinidadMedidoColor =
                SalinidadMedidoDiez > parseFloat(restoPozo.SalinidadInSitu)
                  ? "red"
                  : "";
            }

            if (ultimaMedicion.NivelFreaticoMedido) {
              NivelFreaticoMedidoDiez = (
                parseFloat(ultimaMedicion.NivelFreaticoMedido) * 1.1
              ).toFixed(2);
              NivelFreaticoMedidoColor =
                NivelFreaticoMedidoDiez > parseFloat(restoPozo.NivelFreaticoInSitu)
                  ? "red"
                  : "";
            }

            // Retornar nuevo objeto combinado con propiedades de color
            return {
              ...ultimaMedicion,
              ...restoPozo,
              pHMedidoColor,
              CEMedidoColor,
              STDMedidoColor,
              SalinidadMedidoColor,
              NivelFreaticoMedidoColor,
              pHMedidoDiez,
              CEMedidoDiez,
              STDMedidoDiez,
              SalinidadMedidoDiez,
              NivelFreaticoMedidoDiez,
            };
          }

          return ultimaMedicion;
        }
      );

      // Asumiendo que 'ultimasMediciones' es un array de objetos modificados que quieres mezclar de vuelta en 'medicionesFiltradas'
      for (const ultimaMedicion of ultimasMediciones) {
        const index = medicionesFiltradas.findIndex(
          (o) => o.id === ultimaMedicion.id
        );

        if (index !== -1) {
          // Reemplazar el objeto en 'medicionesFiltradas' directamente por referencia
          medicionesFiltradas[index] = ultimaMedicion;
        }
      }

      return medicionesFiltradas;
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
