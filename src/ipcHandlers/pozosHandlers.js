const { ipcMain } = require('electron');
const db = require('../../database');

const registerPozoHandlers = () => {
  // Aquí integras el manejador de IPC para insertar datos en la tabla Pozo
  ipcMain.on("insertar-pozo", (event, pozoData) => {
    const { Nombre, Tipo } = pozoData;
    const sql = `INSERT INTO Pozo (Nombre, Tipo) VALUES (?, ?)`;

    db.run(sql, [Nombre, Tipo], function (err) {
      if (err) {
        console.error(`Error al insertar en la tabla Pozo: ${err.message}`);
        event.reply("pozo-insertado", "Error al insertar pozo");
        return;
      }
      console.log(`Un pozo ha sido insertado con el PozoId: ${this.lastID}`);
      event.reply(
        "pozo-insertado",
        `Pozo insertado con éxito. ID: ${this.lastID}`
      );
    });
  });

  ipcMain.on("actualizar-pozo", (event, pozoData) => {
    const { PozoId, Nombre, Tipo } = pozoData;
    const sql = `UPDATE Pozo SET Nombre = ?, Tipo = ? WHERE PozoId = ?`;

    db.run(sql, [Nombre, Tipo, PozoId], function (err) {
      if (err) {
        console.error(`Error al actualizar el pozo: ${err.message}`);
        event.reply("pozo-actualizado", {
          success: false,
          message: "Error al actualizar pozo",
          error: err.message,
        });
        return;
      }
      console.log(`Pozo actualizado con éxito. ID: ${PozoId}`);
      event.reply("pozo-actualizado", {
        success: true,
        message: `Pozo actualizado con éxito. ID: ${PozoId}`,
        PozoId: PozoId,
      });
    });
  });

  ipcMain.on("solicitar-pozos", (event) => {
    const sql = `SELECT * FROM Pozo`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error(`Error al solicitar los pozos: ${err.message}`);
        event.reply("cargar-pozos", { success: false, error: err.message });
        return;
      }
      event.reply("cargar-pozos", { success: true, pozos: rows });
    });
  });
};

module.exports = { registerPozoHandlers };
