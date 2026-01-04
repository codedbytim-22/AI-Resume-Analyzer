// Global JS

document.addEventListener("DOMContentLoaded", () => {
  //LOGIN FORM HANDLING//
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // stop page reload

      // No authentication yet
      // Simulate successful login
      window.location.href = "dashboard.html";
    });
  }

  //RESUME UPLOAD HANDLING//
  const uploadForm = document.getElementById("uploadForm");

  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fileInput = document.getElementById("resumeFile");

      if (!fileInput || fileInput.files.length === 0) {
        alert("Please select a resume file.");
        return;
      }

      // Simulate upload + analysis start
      window.location.href = "analyzing.html";
    });
  }

  //ANALYZING PAGE AUTO-REDIRECT//
  const analyzingPage = document.getElementById("analyzingPage");

  if (analyzingPage) {
    // Simulate AI processing time
    setTimeout(() => {
      window.location.href = "results.html";
    }, 3000); // 3 seconds
  }
});
