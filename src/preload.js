const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => {
    const wrapper = (_, ...args) => func(...args);
    ipcRenderer.on(channel, wrapper);

    // Retorna una función para eliminar el oyente
    return () => ipcRenderer.removeListener(channel, wrapper);
  },
});
