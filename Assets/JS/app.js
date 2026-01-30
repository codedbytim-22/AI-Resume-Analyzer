// Assets/JS/app.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /* ==============================
     AUTH STATE (SINGLE SOURCE OF TRUTH)
  ============================== */
  onAuthStateChanged(auth, (user) => {
    const emailSpan = document.getElementById("userEmail");

    if (user) {
      sessionStorage.setItem("uid", user.uid);
      sessionStorage.setItem("email", user.email);
      if (emailSpan) emailSpan.textContent = user.email;
    } else {
      sessionStorage.clear();

      if (body.classList.contains("protected")) {
        window.location.href = "/login.html";
      }
    }
  });

  /* ==============================
     LOGIN
  ============================== */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        await signInWithEmailAndPassword(
          auth,
          emailInput.value.trim(),
          passwordInput.value.trim(),
        );
        window.location.href = "/dashboard.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  /* ==============================
     SIGNUP
  ============================== */
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (passwordInput.value !== confirmPasswordInput.value) {
        alert("Passwords do not match");
        return;
      }

      try {
        await createUserWithEmailAndPassword(
          auth,
          emailInput.value.trim(),
          passwordInput.value.trim(),
        );
        window.location.href = "/dashboard.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  /* ==============================
     UPLOAD
  ============================== */
  const uploadForm = document.getElementById("uploadForm");
  if (uploadForm) {
    const resumeInput = document.getElementById("resume");

    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!window.pdfjsLib) {
        alert("PDF engine failed to load.");
        return;
      }

      const file = resumeInput.files[0];
      if (!file || file.type !== "application/pdf") {
        alert("Upload a valid PDF resume");
        return;
      }

      try {
        const text = await extractTextFromPDF(file);

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) throw new Error("AI analysis failed");

        const analysis = await response.json();
        sessionStorage.setItem("analysis", JSON.stringify(analysis));
        sessionStorage.setItem("resumeName", file.name);

        window.location.href = "/analyzing.html";
      } catch (err) {
        console.error(err);
        alert("Resume analysis failed.");
      }
    });
  }

  /* ==============================
     ANALYZING PAGE
  ============================== */
  if (document.querySelector(".analyzing-container")) {
    setTimeout(() => {
      window.location.href = "/results.html";
    }, 3000);
  }

  /* ==============================
     RESULTS
  ============================== */
  const results = document.getElementById("results-content");
  if (results) {
    const analysis = JSON.parse(sessionStorage.getItem("analysis"));

    if (!analysis) {
      results.innerHTML = "<p>No analysis found.</p>";
      return;
    }

    results.innerHTML = `
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
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      sessionStorage.clear();
      window.location.href = "/index.html";
    });
  }
});

/* ==============================
   PDF UTILS
============================== */
async function extractTextFromPDF(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}
