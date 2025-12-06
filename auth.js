// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
  apiKey: "AIzaSyBKlrmrJR2egolzqqbYut1vdFUfrAOj1vU",
  authDomain: "shoptool-b35ac.firebaseapp.com",
  projectId: "shoptool-b35ac",
  storageBucket: "shoptool-b35ac.appspot.com",
  messagingSenderId: "947433094698",
  appId: "1:947433094698:web:c3c72e86c6fddd1defcd53",
  measurementId: "G-KLS9NEG4JN"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore ? firebase.firestore() : null;

// ==================== AUTH STATE MANAGEMENT ====================
let currentUser = null;
let authStateInitialized = false;

auth.onAuthStateChanged(user => {
  currentUser = user;
  
  // Lấy tên file hiện tại
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";
  
  console.log("Auth state changed. User:", user ? user.email : "null", "Page:", page);
  
  // Chỉ redirect một lần
  if (!authStateInitialized) {
    authStateInitialized = true;
    
    // Redirect logic
    if (!user) {
      // Nếu chưa đăng nhập và KHÔNG PHẢI trang login
      if (page !== "login.html") {
        console.log("Not logged in, redirecting to login");
        window.location.href = "login.html";
      }
    } else {
      // Nếu đã đăng nhập và đang ở trang login
      if (page === "login.html") {
        console.log("Already logged in, redirecting to index");
        window.location.href = "index.html";
      }
      
      // Cập nhật UI nếu đang ở các trang khác
      if (page === "index.html" || page === "") {
        updateUserInfo(user);
      }
    }
  }
});

// ==================== USER INFO ====================
function updateUserInfo(user) {
  const userInfoEl = document.getElementById("userInfo");
  if (userInfoEl) {
    const displayName = user.displayName || user.email?.split('@')[0] || "User";
    userInfoEl.textContent = `Xin chào, ${displayName}`;
  }
}

// ==================== AUTH FUNCTIONS ====================
function getCurrentUser() {
  return currentUser;
}

function getCurrentUserId() {
  return currentUser ? currentUser.uid : null;
}

// ==================== LOGOUT ====================
function handleLogout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    auth.signOut()
      .then(() => {
        showToast("Đăng xuất thành công!", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 500);
      })
      .catch(error => {
        showToast("Lỗi đăng xuất: " + error.message, "error");
      });
  }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}