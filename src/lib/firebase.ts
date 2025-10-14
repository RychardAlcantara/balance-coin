// src/lib/firebase.ts

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwgA7TyGT_7Be2VElTT8jzeFdEnPvfGkI",
  authDomain: "balancecoin-e006a.firebaseapp.com",
  projectId: "balancecoin-e006a",
  storageBucket: "balancecoin-e006a.firebasestorage.app",
  messagingSenderId: "971072477493",
  appId: "1:971072477493:web:8edd7c309b840ef9bd947c"
};

// Garante que o Firebase só será inicializado uma vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporta os serviços que você vai usar
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, app, database };
