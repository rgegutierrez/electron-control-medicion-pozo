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
            v-if="havePermission"
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

      <!-- Usuario -->
      <template v-slot:[`item.Usuario`]="{ item }">
        <span style="font-weight: bold">{{ item.Usuario }}</span>
      </template>

      <!-- Nombre -->
      <template v-slot:[`item.Nombre`]="{ item }">
        <span style="font-weight: bold">{{ item.Nombre }}</span>
      </template>

      <template v-slot:[`item.Acciones`]="{ item }">
        <v-btn
          v-if="havePermission"
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
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-2"
                dense
              >
                {{ errorMessage }}
              </v-alert>
              <v-text-field
                v-model="obsActual.Usuario"
                label="Usuario"
                :rules="reglasUsuario"
                :readonly="!!obsActual.id"
              ></v-text-field>
              <v-text-field
                v-model="obsActual.Nombre"
                label="Nombre del Usuario"
                :rules="reglasNombre"
              ></v-text-field>
              <v-autocomplete
                class="mb-6"
                label="Permisos"
                :items="tipos"
                item-title="title"
                item-value="value"
                hide-details="auto"
                v-model="obsActual.Tipo"
                small-chips
                dense
                solo
              ></v-autocomplete>
              <v-text-field
                v-model="obsActual.Password"
                label="Password"
                type="password"
                :rules="getReglasPassword()"
                :placeholder="
                  obsActual.id ? 'Dejar vacío para mantener la actual' : ''
                "
              ></v-text-field>

              <v-select
                v-model="obsActual.Activo"
                :items="lstActivo"
                item-value="value"
                item-text="text"
                label="Estado"
                solo
              ></v-select>
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
import { ref, set, onValue, off, push, get } from "firebase/database";
import CryptoJS from "crypto-js";

export default {
  data() {
    return {
      permission: localStorage.getItem("permission"),
      headers: [
        { title: "Usuario", key: "Usuario" },
        { title: "Nombre", key: "Nombre" },
        { title: "Permisos", key: "Permiso" },
        { title: "Activo", key: "ActivoStr" }, // Añade esta línea
        { title: "Acciones", key: "Acciones", sortable: false },
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
      reglasUsuario: [
        (v) => !!v || "El campo es requerido.",
        (v) => (v && v.length >= 4) || "El usuario debe tener al menos 4 caracteres.",
        (v) =>
          (v && v.length <= 16) ||
          "La usuario debe tener máximo 16 caracteres.",
        (v) =>
          /^[a-zA-Z0-9_]*$/.test(v) ||
          "No se permiten espacios, puntos ni caracteres especiales.",
      ],
      reglasNombre: [
        (v) => !!v || "El campo es requerido.",
        (v) => (v && v.length >= 4) || "El Nombre debe tener al menos 4 caracteres.",
        (v) =>
          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(v) || "Formato de nombre no válido.",
      ],
      reglasPassword: [
        (v) => !!v || "El campo es requerido.",
        (v) =>
          (v && v.length >= 4) ||
          "La contraseña debe tener al menos 4 caracteres.",
        (v) =>
          (v && v.length <= 8) ||
          "La contraseña debe tener máximo 8 caracteres.",
      ],
      tipos: [
        { value: 1, title: "Lectura" },
        { value: 2, title: "Creación / Edición" },
        { value: 3, title: "Admin" },
      ],
      lstActivo: [
        { value: 1, title: "Activo" },
        { value: 0, title: "Inactivo" },
      ],
      errorMessage: null,
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
    getReglasPassword() {
      // Si obsActual.id tiene un valor, es una edición y la contraseña no es requerida.
      // Si no, es un nuevo usuario y la contraseña es requerida.
      return this.obsActual.id ? [] : this.reglasPassword;
    },
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
            const obsArray = Object.keys(data).map((key) => {
              const tipoObjeto = this.tipos.find(
                (o) => o.value == data[key].Tipo
              );

              const activoObjeto = this.lstActivo.find(
                (o) => o.value == data[key].Activo
              );
              return {
                ...data[key],
                id: key, // Asigna la clave única de Firebase a cada medición
                Permiso: tipoObjeto ? tipoObjeto.title : "Permiso Desconocido", // Proporciona un valor predeterminado
                ActivoStr: activoObjeto ? activoObjeto.title : "Inactivo", // Proporciona un valor predeterminado
              };
            });

            this.usuarios = obsArray.filter((o) => o.Tipo <= 3);
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
      this.errorMessage = null;
    },
    editarObservacion(usuario) {
      this.obsActual = { ...usuario }; // Copiar el usuario a editar en obsActual
      this.obsActual.Password = null;
      this.mostrarFormulario = true;
      this.errorMessage = null;
    },
    usuarioExiste(nombreUsuario) {
      return new Promise((resolve, reject) => {
        const usuariosRef = ref(database, "usuarios/");
        get(usuariosRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const usuarios = snapshot.val();
              const usuarioEncontrado = Object.keys(usuarios).some(
                (key) => usuarios[key].Usuario === nombreUsuario
              );
              resolve(usuarioEncontrado);
            } else {
              resolve(false); // No hay usuarios, por lo que no puede estar duplicado
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    async insertarUsuario() {
      this.errorMessage = null;

      this.$refs.form.validate().then(async ({ valid: isValid }) => {
        if (isValid) {
          // Verifica si el usuario ya existe solo si es un nuevo usuario
          if (!this.obsActual.id) {
            const usuarioYaExiste = await this.usuarioExiste(
              this.obsActual.Usuario
            );
            if (usuarioYaExiste) {
              this.errorMessage = "El nombre de usuario ya está en uso.";
              return; // Detiene la ejecución si el usuario ya existe
            }
          }

          let data = {
            Usuario: this.obsActual.Usuario,
            Nombre: this.obsActual.Nombre,
            Tipo: this.obsActual.Tipo,
            Activo: this.obsActual.Activo,
          };

          // Codifica y actualiza la contraseña solo si se ha proporcionado una nueva
          if (this.obsActual.Password) {
            const passwordHashed = CryptoJS.SHA256(
              this.obsActual.Password
            ).toString(CryptoJS.enc.Hex);
            data.Password = passwordHashed;
          } else if (this.obsActual.id) {
            // Si estamos editando y no se proporcionó una nueva contraseña, usa la contraseña actual
            const usuarioActual = this.usuarios.find(
              (u) => u.id === this.obsActual.id
            );
            if (usuarioActual && usuarioActual.Password) {
              data.Password = usuarioActual.Password; // Asigna la contraseña existente
            }
          }

          if (this.obsActual.id) {
            // Actualiza el usuario existente
            set(ref(database, "usuarios/" + this.obsActual.id), {
              ...data,
            })
              .then(() => {
                console.log("Datos actualizados correctamente.");
              })
              .catch((error) => {
                console.log("Error al actualizar datos: ", error);
                this.errorMessage = "Error al actualizar el usuario.";
              });
          } else {
            // Inserta un nuevo usuario
            const nuevaRef = push(ref(database, "usuarios"));
            set(nuevaRef, data)
              .then(() => {
                console.log("Usuario insertado con éxito.");
              })
              .catch((error) => {
                console.log("Error al insertar usuario: ", error);
                this.errorMessage = "Error al insertar el usuario.";
              });
          }

          // Cierra el formulario y recarga la lista de usuarios
          this.mostrarFormulario = false;
          await this.recargar();
        }
      });
    },
  },
  computed: {
    havePermission() {
      return this.permission > 1;
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
