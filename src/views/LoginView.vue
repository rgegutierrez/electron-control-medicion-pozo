<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Acceso</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form">
              <v-text-field
                v-model="usuario"
                :rules="reglasRequerido"
                label="Usuario"
                name="Usuario"
                type="text"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                name="Password"
                type="Password"
              ></v-text-field>
              <!-- Mensaje de error -->
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-2"
                dense
              >
                {{ errorMessage }}
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="tonal" @click="login"
              >Iniciar Sesión</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CryptoJS from "crypto-js";
import { ref, get } from "firebase/database";
import { database } from "../firebaseConfig";

export default {
  name: "LoginView",
  data() {
    return {
      permission: localStorage.getItem("permission"),
      usuario: "",
      password: "",
      errorMessage: "",
      reglasRequerido: [(v) => !!v || "El campo es requerido."],
    };
  },
  created() {
    if (localStorage.getItem("isAuthenticated") === "true") {
      this.$router.push("/");
    }
  },
  methods: {
    login() {
      this.$refs.form.validate().then(({ valid: isValid }) => {
        if (isValid) {
          const usuariosRef = ref(database, "usuarios/");
          get(usuariosRef)
            .then((snapshot) => {
              if (snapshot.exists()) {
                const usuarios = snapshot.val();
                let usuarioEncontrado = null;
                // Iterar sobre los usuarios para encontrar una coincidencia
                Object.keys(usuarios).forEach((key) => {
                  const usuario = usuarios[key];
                  if (usuario.Usuario === this.usuario) {
                    usuarioEncontrado = usuario;
                  }
                });

                if (usuarioEncontrado) {
                  // Verificar si el usuario está activo
                  if (usuarioEncontrado.Activo === 0) {
                    this.errorMessage =
                      "La cuenta está inactiva. Contacte al administrador.";
                    return; // Detiene la ejecución si el usuario está inactivo
                  }

                  const passwordHashed = CryptoJS.SHA256(
                    this.password
                  ).toString(CryptoJS.enc.Hex); // Codifica la contraseña
                  if (usuarioEncontrado.Password === passwordHashed) {
                    localStorage.setItem("isAuthenticated", "true");
                    localStorage.setItem("permission", usuarioEncontrado.Tipo);
                    localStorage.setItem("user", usuarioEncontrado.Usuario);
                    window.location.reload();
                  } else {
                    this.errorMessage = "Contraseña incorrecta.";
                  }
                } else {
                  this.errorMessage = "Usuario no encontrado.";
                }
              } else {
                this.errorMessage = "No hay usuarios registrados.";
              }
            })
            .catch((error) => {
              console.error("Error al acceder a Firebase", error);
              this.errorMessage =
                "Error al iniciar sesión, por favor intente más tarde.";
            });
        }
      });
    },
  },
};
</script>
