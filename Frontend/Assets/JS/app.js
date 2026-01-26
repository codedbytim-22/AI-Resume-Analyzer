// Assets/JS/app.js
import { analyzeResumeWithAI } from "./ai.js";

// 🔹 IMPORTS (MUST BE FIRST)
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// 🔹 MAIN APP LOGIC
document.addEventListener("DOMContentLoaded", () => {
  /* ==============================
     AUTH STATE (GLOBAL)
  ============================== */
  onAuthStateChanged(auth, (user) => {
    if (user) {
      sessionStorage.setItem("uid", user.uid);
      sessionStorage.setItem("email", user.email);

      const emailSpan = document.getElementById("userEmail");
      if (emailSpan) {
        emailSpan.textContent = user.email;
      }
    } else {
      sessionStorage.clear();

      if (document.querySelector(".dashboard-header")) {
        window.location.href = "login.html";
      }
    }
  });

  /* ==============================
     LOGIN PAGE
  ============================== */
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        alert("Please enter your email and password.");
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  /* ==============================
     SIGNUP PAGE
  ============================== */
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document
        .getElementById("confirmPassword")
        .value.trim();

      if (!email || !password || !confirmPassword) {
        alert("All fields are required.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  /* ==============================
     UPLOAD PAGE (UPDATED)
  ============================== */
  const uploadForm = document.getElementById("uploadForm");

  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fileInput = document.getElementById("resume");
      const file = fileInput.files[0];

      if (!file) {
        alert("Please select a resume PDF.");
        return;
      }

      if (file.type !== "application/pdf") {
        alert("Only PDF resumes are supported.");
        return;
      }

      try {
        const text = await extractTextFromPDF(file);

        // 🔥 REAL AI ANALYSIS
        const analysis = await analyzeResumeWithAI(text);

        sessionStorage.setItem("analysis", JSON.stringify(analysis));
        sessionStorage.setItem("resumeName", file.name);
        sessionStorage.setItem("resumeUploaded", "true");

        window.location.href = "analyzing.html";
      } catch (err) {
        console.error(err);
        alert("Failed to analyze resume.");
      }
    });
  }

  /* ==============================
     ANALYZING PAGE
  ============================== */
  if (document.querySelector(".analyzing-container")) {
    setTimeout(() => {
      window.location.href = "results.html";
    }, 3000);
  }

  /* ==============================
     RESULTS PAGE (UPDATED)
  ============================== */
  const resultsContainer = document.getElementById("results-content");

  if (resultsContainer) {
    const analysis = JSON.parse(sessionStorage.getItem("analysis"));
    const resumeName = sessionStorage.getItem("resumeName");

    if (!analysis) {
      resultsContainer.innerHTML = "<p>Analysis not found.</p>";
      return;
    }

    resultsContainer.innerHTML = `
      <h3>Resume: ${resumeName}</h3>

      <h4>Skills</h4>
      <ul>${analysis.skills.map((s) => `<li>${s}</li>`).join("")}</ul>

      <h4>Recommendations</h4>
      <ul>${analysis.recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>

      <h4>Careers</h4>
      <ul>${analysis.careers.map((c) => `<li>${c}</li>`).join("")}</ul>
    `;
  }

  /* ==============================
     LOGOUT
  ============================== */
  document.querySelectorAll('a[href="index.html"]').forEach((link) => {
    link.addEventListener("click", async () => {
      await signOut(auth);
      sessionStorage.clear();
    });
  });
});

/* ==============================
   PDF TEXT EXTRACTION
============================== */
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    fullText += strings.join(" ") + "\n";
  }

  return fullText.trim();
}
