const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.resolve(__dirname, "mediciones.db");

let db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Conectado a la base de datos SQLite.");
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS Pozo (
    PozoId INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT,
    Tipo TEXT
  )`,
  (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Tabla Pozo creada con éxito.");
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS ParametroLimite (
    ParametroLimiteId INTEGER PRIMARY KEY AUTOINCREMENT,
    PozoId INTEGER,
    pHInferior REAL,
    pHsuperior REAL,
    CE REAL,
    STD REAL,
    SO4 REAL,
    CuDisuelto REAL,
    FOREIGN KEY (PozoId) REFERENCES Pozo(PozoId)
  )`,
  (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Tabla ParametroLimite creada con éxito.");
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS Medicion (
    MedicionId INTEGER PRIMARY KEY AUTOINCREMENT,
    PozoId INTEGER,
    Fecha TEXT,
    pHMedido REAL,
    CEMedido REAL,
    STDmedido REAL,
    SO4medido REAL,
    CuMedido REAL,
    Enviado INTEGER,
    FOREIGN KEY (PozoId) REFERENCES Pozo(PozoId)
  )`,
  (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Tabla Medicion creada con éxito.");
  }
);

module.exports = db;
