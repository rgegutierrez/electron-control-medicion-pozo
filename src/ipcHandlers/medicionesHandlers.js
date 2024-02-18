const { ipcMain } = require("electron");
const db = require("../../database");

const registerMedicionHandlers = () => {
  // Aquí integras el manejador de IPC para insertar datos en la tabla Medicion
  ipcMain.on("insertar-medicion", (event, medicionData) => {
    const {
      PozoId,
      Fecha,
      pHMedido,
      CEMedido,
      STDmedido,
      SO4medido,
      CuMedido,
      Enviado,
    } = medicionData;
    const sql = `INSERT INTO Medicion (
      PozoId,
      Fecha,
      pHMedido,
      CEMedido,
      STDmedido,
      SO4medido,
      CuMedido,
      Enviado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
      sql,
      [
        PozoId,
        Fecha,
        pHMedido,
        CEMedido,
        STDmedido,
        SO4medido,
        CuMedido,
        Enviado,
      ],
      function (err) {
        if (err) {
          console.error(
            `Error al insertar en la tabla Medicion: ${err.message}`
          );
          event.reply("medicion-insertado", "Error al insertar medicion", err.message);
          return;
        }
        console.log(
          `Un medicion ha sido insertado con el MedicionId: ${this.lastID}`
        );
        event.reply(
          "medicion-insertado",
          `Medicion insertado con éxito. ID: ${this.lastID}`
        );
      }
    );
  });

  ipcMain.on("actualizar-medicion", (event, medicionData) => {
    const {
      MedicionId,
      PozoId,
      Fecha,
      pHMedido,
      CEMedido,
      STDmedido,
      SO4medido,
      CuMedido,
      Enviado,
    } = medicionData;
    const sql = `UPDATE Medicion SET PozoId = ?,
    Fecha = ?,
    pHMedido = ?,
    CEMedido = ?,
    STDmedido = ?,
    SO4medido = ?,
    CuMedido = ?,
    Enviado = ? WHERE MedicionId = ?`;

    db.run(
      sql,
      [
        PozoId,
        Fecha,
        pHMedido,
        CEMedido,
        STDmedido,
        SO4medido,
        CuMedido,
        Enviado,
        MedicionId,
      ],
      function (err) {
        if (err) {
          console.error(`Error al actualizar el medicion: ${err.message}`);
          event.reply("medicion-actualizado", {
            success: false,
            message: "Error al actualizar medicion",
            error: err.message,
          });
          return;
        }
        console.log(`Medicion actualizado con éxito. ID: ${MedicionId}`);
        event.reply("medicion-actualizado", {
          success: true,
          message: `Medicion actualizado con éxito. ID: ${MedicionId}`,
          MedicionId: MedicionId,
        });
      }
    );
  });

  ipcMain.on("solicitar-mediciones", (event) => {
    const sql = `
    SELECT M.MedicionId, M.PozoId, P.Nombre AS PozoNombre, M.Fecha, M.pHMedido, M.CEMedido, M.STDmedido, M.SO4medido, M.CuMedido, M.Enviado 
    FROM Medicion AS M
    JOIN Pozo AS P ON P.PozoId = M.PozoId
    `;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error(`Error al solicitar los mediciones: ${err.message}`);
        event.reply("cargar-mediciones", {
          success: false,
          error: err.message,
        });
        return;
      }
      event.reply("cargar-mediciones", { success: true, mediciones: rows });
    });
  });
};

module.exports = { registerMedicionHandlers };
