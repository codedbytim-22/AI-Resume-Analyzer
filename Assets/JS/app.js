// Assets/JS/app.js
// Update CONFIG at the top of your file:
const CONFIG = {
  VERSION: "1.4.0",
  // ... existing config ...

  // NEW: Premium Configuration
  PREMIUM: {
    // Limits for free tier
    FREE_LIMITS: {
      MAX_GOALS: 1,
      MAX_EXPORTS: 0,
      HAS_WRAPPED: false,
      HAS_ANALYTICS: false,
      HAS_CLOUD_SYNC: false,
      HAS_CUSTOM_THEMES: false,
    },

    // Premium tier limits (for future)
    PREMIUM_LIMITS: {
      MAX_GOALS: Infinity,
      MAX_EXPORTS: Infinity,
      HAS_WRAPPED: true,
      HAS_ANALYTICS: true,
      HAS_CLOUD_SYNC: true,
      HAS_CUSTOM_THEMES: true,
    },

    // Fake door settings
    FAKE_DOOR: {
      ENABLED: true,
      TRACK_CLICKS: true,
      SHOW_WAITLIST: true,
    },

    // Storage keys
    STORAGE_KEYS: {
      CLICKS: "dayly_premium_clicks",
      WAITLIST: "dayly_premium_waitlist",
    },
  },
};

// Add this helper function for data safety
function ensureDataSafety(storageKey, defaultValue) {
  try {
    const existing = localStorage.getItem(storageKey);
    if (!existing || existing === "undefined" || existing === "null") {
      localStorage.setItem(storageKey, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(existing);
  } catch (e) {
    console.error(`Data safety error for ${storageKey}:`, e);
    // Never reset existing data on error
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) return JSON.parse(existing);
    } catch (e2) {
      // Last resort: use default but don't overwrite storage
      return defaultValue;
    }
    return defaultValue;
  }
}

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
        try {
          // Send resume text to your API
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
          });

          if (!response.ok) {
            throw new Error("API request failed");
          }

          const analysis = await response.json();

          sessionStorage.setItem("analysis", JSON.stringify(analysis));
          sessionStorage.setItem("resumeName", file.name);
          sessionStorage.setItem("resumeUploaded", "true");

          window.location.href = "analyzing.html";
        } catch (err) {
          console.error(err);
          alert("Failed to analyze resume.");
        }

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
