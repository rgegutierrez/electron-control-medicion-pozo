const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,

  pluginOptions: {
    vuetify: {
      // Configuración de Vuetify si es necesario
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

  pluginOptions: {
    electronBuilder: {
      // Opciones de configuración de Electron Builder
      productName: "Control Medición Pozo",
      appId: "com.jgutierrez.cmp",
      icon: "icon.ico"
    }
  }
});
