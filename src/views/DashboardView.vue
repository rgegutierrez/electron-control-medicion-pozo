<template>
  <v-container>
    <v-toolbar border title="Dashboard" class="mb-2">
      <v-row class="fill-height">
        <v-col class="d-flex justify-end">
          <v-btn
            class="mx-2"
            prepend-icon="mdi-reload"
            variant="tonal"
            color="primary"
          >
            Recargar
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>
  </v-container>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>
