<template>
  <v-container>
    <v-toolbar border title="Usuarios" class="mb-2">
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
            @click="agregarUsuario"
          >
            <v-icon icon="$plus" />
            Agrega Usuario
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>

    <!-- Tabla de Usuarios -->
    <v-data-table
      :headers="headers"
      :items="usuarios"
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

      <template v-slot:[`item.Acciones`]="{ item }">
        <v-btn
          variant="tonal"
          icon
          color="primary"
          size="small"
          @click="editarObservacion(item)"
        >
          <v-icon icon="$edit" />
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="mostrarFormulario" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >{{ obsActual.id ? "Editar" : "Agregar" }} Usuario</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="form">
              <v-text-field
                v-model="obsActual.Usuario"
                label="Usuario"
                :rules="reglasRequerido"
              ></v-text-field>
              <v-text-field
                v-model="obsActual.Nombre"
                label="Nombre del Usuario"
                :rules="reglasRequerido"
              ></v-text-field>
              <v-text-field
                v-model="obsActual.Tipo"
                label="Tipo"
                :rules="reglasRequerido"
              ></v-text-field>
              <v-text-field
                v-if="!obsActual.id"
                v-model="obsActual.Password"
                label="Password"
                :type="'password'"
                :rules="reglasRequerido"
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
            @click="insertarUsuario"
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
import CryptoJS from "crypto-js";

export default {
  data() {
    return {
      headers: [
        { text: "Usuario", value: "Usuario" },
        { text: "Nombre", value: "Nombre" },
        { text: "Tipo", value: "Tipo" },
        { text: "Acciones", value: "Acciones", sortable: false },
      ],
      usuarios: [],
      mostrarFormulario: false,
      obsActual: {
        Usuario: "",
        Nombre: "",
        Tipo: "",
        Password: "",
      },
      reglasRequerido: [(v) => !!v || "El campo es requerido."],
    };
  },

  async mounted() {
    await this.recargar();
  },
  unmounted() {
    const datosRef = ref(database, "usuarios/");
    off(datosRef);
  },
  methods: {
    convertirANullODecimal(valor) {
      // Convierte el valor a decimal si es posible; de lo contrario, devuelve null
      const numero = Number(valor);
      return isNaN(numero) ? null : numero;
    },
    async recargar() {
      const datosRef = ref(database, "usuarios/");
      onValue(
        datosRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Verifica si data no es null
            const obsArray = Object.keys(data).map((key) => ({
              ...data[key],
              id: key, // Asigna la clave única de Firebase a cada medición
            }));
            this.usuarios = obsArray;
          } else {
            this.usuarios = [];
          }
        },
        {
          onlyOnce: true,
        }
      );
    },
    agregarUsuario() {
      this.obsActual = {}; // Resetear obsActual para un nuevo usuario
      this.mostrarFormulario = true;
    },
    editarObservacion(usuario) {
      this.obsActual = { ...usuario }; // Copiar el usuario a editar en obsActual
      this.mostrarFormulario = true;
    },
    async insertarUsuario() {
      this.$refs.form.validate().then(({ valid: isValid }) => {
        if (isValid) {
          const passwordHashed = CryptoJS.SHA256(
            this.obsActual.Password
          ).toString(CryptoJS.enc.Hex);
          const data = {
            Usuario: this.obsActual.Usuario,
            Nombre: this.obsActual.Nombre,
            Tipo: this.obsActual.Tipo,
            Password: passwordHashed,
          };

          if (this.obsActual.id) {
            set(ref(database, "usuarios/" + this.obsActual.id), data)
              .then(() => {
                console.log("Datos guardados correctamente.");
              })
              .catch((error) => {
                console.log("Error al guardar datos: ", error);
              });
          } else {
            // Crea una nueva referencia con un ID único en la colección "usuarios"
            const nuevaRef = push(ref(database, "usuarios"));

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
};
</script>
<style>
.border-bottom {
  border-top: none !important;
  border-bottom: thin solid rgba(0, 0, 0, 0.12) !important;
}
</style>
