<template>
  <v-container>
    <v-overlay :value="estaCargando">
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      ></v-progress-circular>
    </v-overlay>

    <v-toolbar border title="Cargar Archivo" class="mb-2">
      <v-row class="fill-height">
        <v-col class="d-flex justify-end">
          <v-file-input
            v-model="archivoSeleccionado"
            label="Cargar archivo Excel"
            @change="handleFileUpload"
            class="my-file-input"
          ></v-file-input>
          <v-btn
            v-if="havePermission"
            :disabled="tieneErrores"
            class="mx-2"
            variant="tonal"
            color="secondary"
            @click="cargarDatos"
          >
            <v-icon icon="$complete" />
            Cargar Datos
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>

    <v-alert type="info" variant="tonal" class="mb-2" closable>
      El archivo que contenga mediciones In Situ debe incluir una hoja dedicada
      para cada pozo registrado en el sistema de mantenimiento. Es crucial
      asegurarse de que todas las hojas destinadas a ser cargadas posean el
      nombre adecuado para facilitar la correcta incorporación de la
      información.
    </v-alert>
    <v-alert type="info" variant="tonal" class="mb-2" closable>
      Antes de proceder con la carga de datos, es imprescindible verificar que
      los pozos estén correctamente registrados en el mantenedor de pozos.
    </v-alert>
    <v-alert type="warning" variant="tonal" class="mb-2" closable>
      Por favor, evite subir el mismo archivo múltiples veces, ya que esto
      resultará en la duplicación de los datos.
    </v-alert>

    <v-alert type="warning" variant="tonal" class="mb-2" closable>
      Antes de proceder con la carga, asegúrese de que los datos estén
      correctamente estructurados según la siguiente tabla.
    </v-alert>

    <v-alert
      v-if="cantidadErrores > 0"
      type="error"
      variant="tonal"
      class="mb-2"
    >
      Existen {{ cantidadErrores }} registros con errores que se deben corregir
      para cargar el archivo.
    </v-alert>

    <v-container>
      <v-row>
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

      <template v-slot:[`item.Acciones`]="{ item }">
        <v-btn
          v-if="item.error"
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
            color="blue darken-1"
            text
            @click="insertarMedicion"
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

import * as XLSX from "xlsx";

export default {
  data() {
    return {
      permission: localStorage.getItem("permission"),
      // Ajusta los headers para reflejar los datos de un medicion
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
      nombreArchivo: "",
      Pozo: "",
      archivoSeleccionado: null,
      estaCargando: false,
      filtersHeader: {},
    };
  },
  async mounted() {
    await this.cargarPozos();
  },
  unmounted() {
    const datosRefPozo = ref(database, "pozos/");
    off(datosRefPozo);
  },
  methods: {
    async cargarDatos() {
      this.estaCargando = true; // Inicia el indicador de carga

      // Array para almacenar todas las promesas creadas por las inserciones de datos
      const promesas = [];

      for (const item of this.mediciones) {
        const data = {
          Pozo: item.Pozo,
          Fecha: item.Fecha,
          Mes: item.Mes,
          Hora: item.Hora,
          pHMedido: this.convertirANullODecimal(item.pHMedido),
          CEMedido: this.convertirANullODecimal(item.CEMedido),
          STDMedido: this.convertirANullODecimal(item.STDMedido),
          SalinidadMedido: this.convertirANullODecimal(item.SalinidadMedido),
          NivelFreaticoMedido: this.convertirANullODecimal(
            item.NivelFreaticoMedido
          ),
          Observaciones:
            item.Observaciones === undefined ? "" : item.Observaciones,
        };

        // Crea una promesa para la inserción de cada item y la añade al array de promesas
        const promesa = new Promise((resolve, reject) => {
          const nuevaRef = push(ref(database, "mediciones-insitu"));
          set(nuevaRef, data)
            .then(() => {
              console.log("Datos insertados con ID único: ", nuevaRef.key);
              resolve(nuevaRef.key); // Resuelve la promesa con el ID único
            })
            .catch((error) => {
              console.error("Error al insertar datos: ", error);
              reject(error); // Rechaza la promesa si hay un error
            });
        });

        promesas.push(promesa);
      }

      // Espera a que todas las promesas se resuelvan
      try {
        await Promise.all(promesas);
        console.log("Todas las inserciones se han completado.");
      } catch (error) {
        console.error("Error al insertar alguna de las mediciones: ", error);
      }

      // Después de completar todas las inserciones, limpia las variables
      this.mediciones = [];
      this.archivoSeleccionado = null;
      this.estaCargando = false; // Inicia el indicador de carga
    },
    convertirANullODecimal(valor) {
      if (valor === undefined) {
        return null;
      }
      // Convierte el valor a decimal si es posible; de lo contrario, devuelve null
      const numero = Number(valor);

      if (numero == 0) return null;

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
    async editarMedicion(medicion) {
      this.medicionActual = { ...medicion }; // Copiar el medicion a editar en medicionActual
      this.mostrarFormulario = true;
    },
    insertarMedicion() {
      const itemEncontrado = this.mediciones.find(
        (item) => item.Fecha === this.medicionActual.Fecha
      );

      itemEncontrado.pHMedido = this.convertirANullODecimal(
        this.medicionActual.pHMedido
      );
      itemEncontrado.CEMedido = this.convertirANullODecimal(
        this.medicionActual.CEMedido
      );
      itemEncontrado.STDMedido = this.convertirANullODecimal(
        this.medicionActual.STDMedido
      );
      itemEncontrado.SalinidadMedido = this.convertirANullODecimal(
        this.medicionActual.SalinidadMedido
      );
      itemEncontrado.NivelFreaticoMedido = this.convertirANullODecimal(
        this.medicionActual.NivelFreaticoMedido
      );
      itemEncontrado.Observaciones = this.medicionActual.Observaciones;

      // Cerrar el formulario después de insertar/editar
      this.mostrarFormulario = false;
    },
    excelTimeToReadable(timeDecimal) {
      // Convertir el decimal a horas totales
      const hoursTotal = timeDecimal * 24;
      const hours = Math.floor(hoursTotal);

      // Convertir la parte decimal de las horas a minutos
      const minutesTotal = (hoursTotal - hours) * 60;
      const minutes = Math.floor(minutesTotal);

      // Convertir la parte decimal de los minutos a segundos
      const seconds = Math.floor((minutesTotal - minutes) * 60);

      // Formatear a HH:MM:SS, asegurándose de que cada componente tenga dos dígitos
      const formattedTime = [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
      ].join(":");

      if (formattedTime === "NaN:NaN:NaN") {
        return null;
      }

      return formattedTime;
    },
    excelSerialDateToJSDate(serial) {
      const fechaBase = new Date(1899, 11, 30); // La fecha base es el 30 de diciembre de 1899
      const dias = serial;
      const fecha = new Date(fechaBase.getTime() + dias * 86400000);

      // Formatear la fecha a yyyy-MM-dd
      const year = fecha.getFullYear();
      let month = fecha.getMonth() + 1; // getMonth() devuelve un índice basado en cero, por lo tanto sumamos 1
      let day = fecha.getDate();

      // Asegurarse de que el mes y el día tengan dos dígitos
      month = month < 10 ? "0" + month : month;
      day = day < 10 ? "0" + day : day;

      return `${year}-${month}-${day}`;
    },
    handleFileUpload(event) {
      this.mediciones = [];

      const file = event.target.files[0];
      if (!file) return; // Salir si no hay archivo

      this.nombreArchivo = file.name; // Guardar el nombre del archivo

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        this.leerHojaDeTrabajo(workbook);
      };
      reader.readAsBinaryString(file);
    },
    leerHojaDeTrabajo(workbook) {
      for (const name of workbook.SheetNames) {
        const PozoObj = this.pozos.find(
          (item) =>
            name.trim().replaceAll(" ", "") === item.Nombre.replaceAll(" ", "")
        );
        if (!PozoObj) {
          console.error(`No se encontró el pozo ${name}`);
          continue;
        }
        const Pozo = PozoObj.Nombre;

        const hoja = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(hoja, { header: 1 }); // Obtenemos la data como un array de arrays
        const columnasDeInteres = [
          "Fecha",
          "Hora",
          "pH",
          "Salinidad",
          "STD",
          "Nivel Freático",
          "Conduc.",
          "Observaciones",
        ];

        const indexFila = this.encontrarFilaConFecha(data);

        if (indexFila === -1) return;

        const indicesDeColumnas = this.identificarIndicesDeColumnas(
          data[indexFila],
          columnasDeInteres
        );
        const datosFiltrados = this.extraerDatosPorColumna(
          data,
          indicesDeColumnas,
          Pozo,
          indexFila
        );
        this.mediciones = this.mediciones.concat(datosFiltrados);
      }
    },
    identificarIndicesDeColumnas(filaEncabezado, columnasDeInteres) {
      const indices = {};
      filaEncabezado.forEach((nombreColumna, indice) => {
        const nombreColumnaTrimmed = nombreColumna.toString().trim();
        if (columnasDeInteres.includes(nombreColumnaTrimmed)) {
          indices[nombreColumnaTrimmed] = indice;
        }
      });
      return indices;
    },
    encontrarFilaConFecha(datos) {
      // Recorrer cada fila de los datos
      for (let i = 0; i < datos.length; i++) {
        const fila = datos[i];
        // Recorrer cada columna de la fila actual
        for (let j = 0; j < fila.length; j++) {
          const valorCelda = fila[j].toString().trim();
          // Verificar si la celda contiene la palabra 'Fecha'
          if (valorCelda.includes("Fecha")) {
            return i; // Retornar el número de fila actual si se encuentra la palabra 'Fecha'
          }
        }
      }
      return -1; // Retornar -1 si no se encuentra la palabra 'Fecha' en ninguna celda
    },
    extraerDatosPorColumna(data, indicesDeColumnas, Pozo, indexFila) {
      const mapeoColumnas = {
        Fecha: "Fecha",
        Hora: "Hora",
        pH: "pHMedido",
        "Nivel Freático": "NivelFreaticoMedido",
        STD: "STDMedido",
        Salinidad: "SalinidadMedido",
        "Conduc.": "CEMedido",
        Observaciones: "Observaciones",
      };

      let fecha = "";
      let NV = 0;
      // let vamosAUsarElNVAnterior = false;

      const datosFiltrados = data
        .slice(indexFila)
        .reduce((acumulador, fila, index) => {
          // Inicializa el objeto que potencialmente agregaremos al acumulador
          const filaFiltrada = {};

          // Bandera para verificar si la fecha es válida
          let fechaEsValida = true;

          Object.keys(indicesDeColumnas).forEach((columna) => {
            const nombreColumnaAmigable = mapeoColumnas[columna];

            if (columna === "Fecha") {
              let fechaAux = fila[indicesDeColumnas[columna]];

              if (fechaAux === undefined && index > indexFila) {
                fechaAux = fecha;
                // vamosAUsarElNVAnterior = true;
              } else {
                fecha = fila[indicesDeColumnas[columna]];
                // vamosAUsarElNVAnterior = false;
              }

              let fechaConvertida = this.excelSerialDateToJSDate(fechaAux);

              // Verifica si la fechaConvertida está en el formato yyyy-MM-dd
              const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
              if (!regexFecha.test(fechaConvertida)) {
                // fechaConvertida = fecha;
                fechaEsValida = false;
                return; // Sale de la iteración actual del forEach
              }

              filaFiltrada[nombreColumnaAmigable] = fechaConvertida;
              filaFiltrada["Mes"] = fechaConvertida.substring(0, 7);
              filaFiltrada["Pozo"] = Pozo;
            } else {
              filaFiltrada[nombreColumnaAmigable] =
                fila[indicesDeColumnas[columna]];
            }

            if (columna === "Hora") {
              filaFiltrada[nombreColumnaAmigable] = this.excelTimeToReadable(
                fila[indicesDeColumnas[columna]]
              );
            }

            //TODO
            if (columna === "Nivel Freático") {
              let NVAux = fila[indicesDeColumnas[columna]];

              if (NVAux === undefined && index > indexFila) {
                NVAux = NV;
              } else {
                NV = fila[indicesDeColumnas[columna]];
              }

              if (Pozo == "ROM I-4A") {
                if (filaFiltrada["Hora"] !== null) {
                  filaFiltrada[nombreColumnaAmigable] =
                    this.ajustarADecimalYConvertir(NVAux);
                } else {
                  filaFiltrada[nombreColumnaAmigable] = undefined;
                }
              } else {
                if (filaFiltrada["pHMedido"] !== undefined) {
                  filaFiltrada[nombreColumnaAmigable] =
                    this.ajustarADecimalYConvertir(NVAux);
                } else {
                  filaFiltrada[nombreColumnaAmigable] = undefined;
                }
              }
            }
          });

          // Si la fecha es válida, agrega la fila filtrada al acumulador
          if (fechaEsValida) {
            acumulador.push(filaFiltrada);
          }

          return acumulador;
        }, []); // Inicializa el acumulador como un array vacío

      return datosFiltrados;
    },
    ajustarADecimalYConvertir(variable) {
      if (
        variable !== null &&
        variable !== undefined &&
        typeof variable === "number"
      ) {
        // Primero, convierte el número a una cadena con 3 decimales
        const resultadoConFormato = variable.toFixed(3);
        // Luego, convierte la cadena de vuelta a un número decimal
        return parseFloat(resultadoConFormato);
        // O, alternativamente, puedes usar: return Number(resultadoConFormato);
      } else {
        // Retorna la variable tal cual si no es un número
        return variable;
      }
    },
  },
  computed: {
    havePermission() {
      return this.permission > 1;
    },
    cantidadErrores() {
      return this.medicionesAnalitics.filter((medicion) => medicion.error)
        .length;
    },
    tieneErrores() {
      return this.medicionesAnalitics.some((medicion) => medicion.error);
    },
    medicionesAnalitics() {
      return this.mediciones
        .filter((d) =>
          Object.keys(this.filtersHeader).every((f) => {
            if (this.filtersHeader[f] == null) return true;
            if (d[f] == null) return false;
            return (
              this.filtersHeader[f].toString().length < 1 ||
              this.filtersHeader[f].toString() === d[f].toString()
            );
          })
        )
        .map((medicion) => {
          // Buscar el pozo correspondiente y excluir el campo id
          const pozo = this.pozos.find(
            (p) => p.Nombre.trim() === medicion.Pozo.trim()
          );
          if (pozo) {
            const { id, ...restoPozo } = pozo;
            console.log(id);

            let error = false; // Indica si hay un error en las mediciones

            // Función para verificar si un valor es un número decimal
            const esDecimal = (valor) =>
              !isNaN(valor) && !isNaN(parseFloat(valor));

            // Verificar si cada medición es un número decimal
            const campos = [
              "pHMedido",
              "CEMedido",
              "STDMedido",
              "SalinidadMedido",
              "NivelFreaticoMedido",
            ];

            campos.forEach((campo) => {
              if (medicion[campo] == undefined) {
                medicion[campo] = null;
              } else {
                if (!esDecimal(medicion[campo])) {
                  error = true; // Marcar error si el campo no es un número decimal
                }
              }
            });

            // Retornar nuevo objeto combinado con propiedades de color
            return {
              ...medicion,
              ...restoPozo,
              error, // Agregar el campo de error
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
.v-input--density-default .v-field--variant-solo,
.v-input--density-default .v-field--variant-solo-inverted,
.v-input--density-default .v-field--variant-solo-filled,
.v-input--density-default .v-field--variant-filled {
  --v-input-control-height: 20px;
  --v-field-padding-bottom: 4px;
}

.border-bottom {
  border-top: none !important;
  border-bottom: thin solid rgba(0, 0, 0, 0.12) !important;
}
</style>
