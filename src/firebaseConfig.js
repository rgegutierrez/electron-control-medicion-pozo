// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCiucCHZbacDIvjUS6L9BfNPGqTR2q6ArQ",
  authDomain: "control-medicion-pozo.firebaseapp.com",
  databaseURL: "https://control-medicion-pozo-default-rtdb.firebaseio.com/",
  projectId: "control-medicion-pozo",
  storageBucket: "control-medicion-pozo.appspot.com",
  messagingSenderId: "tu-messagingSenderId",
  appId: "1072746524976"
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
