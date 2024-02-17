const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,

  pluginOptions: {
    vuetify: {
      // Configuración de Vuetify si es necesario
    },
    electronBuilder: {
      // Especifica la ubicación de tu archivo preload.js
      preload: "src/preload.js",
    },
  },

  // Añade esta sección para configurar Webpack
  configureWebpack: {
    externals: {
      // Indica a Webpack que no intente empaquetar estos módulos
      fs: "commonjs fs",
      path: "commonjs path",
    },
  },
});
