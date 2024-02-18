<template>
  <v-container>
    <!-- Botón para agregar un medicion -->
    <v-btn color="primary" @click="mostrarFormularioAgregar"
      >Agregar Medición</v-btn
    >
    <v-btn color="success" @click="algo">Sincronizar</v-btn>

    <!-- Tabla de Mediciones -->
    <v-data-table
      :headers="headers"
      :items="mediciones"
      class="elevation-1"
      item-key="MedicionId"
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
            >{{
              medicionActual.MedicionId ? "Editar" : "Agregar"
            }}
            Medición</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form>
              <v-autocomplete
                label="Pozo"
                :items="pozos"
                item-title="Nombre"
                item-value="PozoId"
                v-model="medicionActual.PozoId"
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
import { ref, set } from "firebase/database";

export default {
  data() {
    return {
      // Ajusta los headers para reflejar los datos de un medicion
      headers: [
        { title: "Medición", key: "MedicionId" },
        { title: "Fecha", key: "Fecha" },
        { title: "Pozo", key: "PozoNombre" },
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

    console.log(`this.pozos`, this.pozos);
  },
  methods: {
    algo() {
      console.log(`algo`);
      set(ref(database, "users/" + 1), {
        username: "algo",
        email: "algo@google.com",
      })
        .then(() => {
          console.log("Datos guardados correctamente.");
        })
        .catch((error) => {
          console.log("Error al guardar datos: ", error);
        });
    },
    async cargarPozos() {
      // Enviar un mensaje al proceso principal para solicitar los datos de los pozos
      window.electronAPI.send("solicitar-pozos");

      // Escuchar la respuesta con los datos de los pozos
      const removeListener = window.electronAPI.receive(
        "cargar-pozos",
        (result) => {
          console.log(`cargar-pozos`, result.pozos);
          this.pozos = result.pozos; // Actualizar la propiedad pozos con los datos recibidos
          console.log(`this.pozos 2`, this.pozos);
          removeListener();
        }
      );
    },
    async cargarMediciones() {
      // Enviar un mensaje al proceso principal para solicitar los datos de los mediciones
      window.electronAPI.send("solicitar-mediciones");

      // Escuchar la respuesta con los datos de los mediciones
      const removeListener = window.electronAPI.receive(
        "cargar-mediciones",
        (result) => {
          console.log(`cargar-mediciones`, result);
          this.mediciones = result.mediciones; // Actualizar la propiedad mediciones con los datos recibidos
          removeListener();
        }
      );
    },
    async sincronizarMediciones() {
      console.log(`sincronizarMediciones`);

      // Solicitar el token
      window.electronAPI.send("solicitar-token");

      try {
        // Esperar por el token
        const tokenResult = await new Promise((resolve, reject) => {
          const removeListener = window.electronAPI.receive(
            "cargar-token",
            (result) => {
              if (result.error) {
                reject(result.error);
              } else {
                console.log(`cargar-token`, result);
                removeListener();
                resolve(result.accessToken);
              }
            }
          );
        });

        // Una vez que tenemos el token, solicitamos los emails
        window.electronAPI.send("solicitar-emails", {
          accessToken: tokenResult,
        });

        // Esperar por los emails
        const emailsResult = await new Promise((resolve, reject) => {
          const removeListenerEmails = window.electronAPI.receive(
            "cargar-emails",
            (result) => {
              if (result.error) {
                reject(result.error);
              } else {
                console.log(`cargar-emails`, result.messages);
                removeListenerEmails();
                resolve(result.messages);
              }
            }
          );
        });

        // Aquí puedes hacer algo con los emails recibidos
        console.log(emailsResult);
      } catch (error) {
        console.error("Error en sincronizarMediciones:", error);
      }
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
      if (this.medicionActual.MedicionId) {
        const medicionDataSimplificado = {
          MedicionId: this.medicionActual.MedicionId,
          PozoId: this.medicionActual.PozoId,
          Fecha: this.medicionActual.Fecha,
          pHMedido: this.medicionActual.pHMedido,
          CEMedido: this.medicionActual.CEMedido,
          STDmedido: this.medicionActual.STDmedido,
          SO4medido: this.medicionActual.SO4medido,
          CuMedido: this.medicionActual.CuMedido,
          Enviado: 0,
        };

        // Actualizar medicion existente
        window.electronAPI.send(
          "actualizar-medicion",
          medicionDataSimplificado
        );

        const removeListener = window.electronAPI.receive(
          "medicion-actualizado",
          (arg) => {
            console.log(arg); // arg contiene la respuesta del proceso principal, por ejemplo, el ID del medicion actualizado
            removeListener();
          }
        );
      } else {
        const medicionDataSimplificado = {
          PozoId: this.medicionActual.PozoId,
          Fecha: this.medicionActual.Fecha,
          pHMedido: this.medicionActual.pHMedido,
          CEMedido: this.medicionActual.CEMedido,
          STDmedido: this.medicionActual.STDmedido,
          SO4medido: this.medicionActual.SO4medido,
          CuMedido: this.medicionActual.CuMedido,
          Enviado: 0,
        };

        // Insertar nuevo medicion
        window.electronAPI.send("insertar-medicion", medicionDataSimplificado);

        const removeListener = window.electronAPI.receive(
          "medicion-insertado",
          (arg) => {
            console.log(arg); // arg contiene la respuesta del proceso principal, por ejemplo, el ID del medicion insertado
            removeListener();
          }
        );
      }

      // Cerrar el formulario después de insertar/editar
      this.mostrarFormulario = false;
      await this.cargarMediciones();
    },
  },
};
</script>
