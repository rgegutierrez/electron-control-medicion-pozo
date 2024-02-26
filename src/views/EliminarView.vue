<template>
  <v-container>
    <v-toolbar border title="Eliminar Nodos" class="mb-2">
      <v-row class="fill-height">
        <v-col class="d-flex justify-end">
          <v-btn class="mx-2" variant="tonal" color="error" @click="EliminarNodos">
            <v-icon icon="$warning" />
            Eliminar
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>
    <!-- Alerta de éxito -->
    <v-alert v-if="alertSuccess.show" type="success" dense dismissible @click="alertSuccess.show = false">
      {{ alertSuccess.message }}
    </v-alert>
    <!-- Alerta de error -->
    <v-alert v-if="alertError.show" type="error" dense dismissible @click="alertError.show = false">
      {{ alertError.message }}
    </v-alert>
  </v-container>
</template>

<script>
import { database } from "../firebaseConfig";
import { ref, remove } from "firebase/database";

export default {
  data() {
    return {
      alertSuccess: {
        show: false,
        message: '',
      },
      alertError: {
        show: false,
        message: '',
      },
    };
  },
  methods: {
    async EliminarNodos() {
      const actions = [
        { path: "mediciones", successMessage: "Nodo 'mediciones' eliminado exitosamente." },
        { path: "mediciones-insitu", successMessage: "Nodo 'mediciones-insitu' eliminado exitosamente." }
      ];

      const promises = actions.map(action => this.attemptRemoval(action.path, action.successMessage));

      await Promise.all(promises).then(() => {
        if (this.alertSuccess.message === '') {
          this.setAlert('error', 'No se pudo eliminar ningún nodo correctamente.');
        }
      });
    },
    attemptRemoval(path, successMessage) {
      const refEliminar = ref(database, path);
      return remove(refEliminar)
        .then(() => {
          this.setAlert('success', successMessage);
        })
        .catch((error) => {
          this.setAlert('error', `Error al eliminar nodo '${path}': ${error.message}`);
          throw error; // Propagar el error para el manejo en Promise.all
        });
    },
    setAlert(type, message) {
      if (type === 'success') {
        this.alertSuccess.show = true;
        this.alertSuccess.message += `${message}\n`; // Agrega mensajes de éxito
      } else {
        this.alertError.show = true;
        this.alertError.message += `${message}\n`; // Agrega mensajes de error
      }
    }
  }
};
</script>
