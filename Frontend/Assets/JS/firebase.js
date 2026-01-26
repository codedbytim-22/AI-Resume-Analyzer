// Assets/JS/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvTbpSLsXpKQq0k_65gZaP4PdWZ7NZODY",
  authDomain: "ai-resume-analyzer-da512.firebaseapp.com",
  projectId: "ai-resume-analyzer-da512",
  storageBucket: "ai-resume-analyzer-da512.firebasestorage.app",
  messagingSenderId: "705543050343",
  appId: "1:705543050343:web:befd2d19467aa1705230c2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

console.log("🔥 firebase.js loaded, auth exported:", auth);
