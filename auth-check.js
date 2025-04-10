// auth-check.js
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html"; // redirect if not logged in
  }
  