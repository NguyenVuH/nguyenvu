// ==================== FORM TOGGLE ====================
let isLoginMode = true;

function toggleForm() {
  isLoginMode = !isLoginMode;
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const formTitle = document.getElementById("formTitle");
  const formSubtitle = document.getElementById("formSubtitle");
  
  if (isLoginMode) {
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
    formTitle.textContent = "Đăng nhập";
    formSubtitle.textContent = "Chào mừng bạn quay trở lại!";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
    formTitle.textContent = "Đăng ký";
    formSubtitle.textContent = "Tạo tài khoản mới để bắt đầu mua sắm!";
  }
  
  clearMessage();
}

// ==================== MESSAGE HANDLING ====================
function showMessage(message, type = "error") {
  const messageEl = document.getElementById("authMessage");
  if (!messageEl) return;
  
  messageEl.textContent = message;
  messageEl.className = `auth-message ${type} show`;
  
  setTimeout(() => {
    messageEl.classList.remove("show");
  }, 5000);
}

function clearMessage() {
  const messageEl = document.getElementById("authMessage");
  if (messageEl) {
    messageEl.classList.remove("show");
  }
}

// ==================== LOGIN ====================
function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  
  // Validation
  if (!email) {
    showMessage("Vui lòng nhập email!", "error");
    return;
  }
  
  if (!password) {
    showMessage("Vui lòng nhập mật khẩu!", "error");
    return;
  }
  
  if (!isValidEmail(email)) {
    showMessage("Email không hợp lệ!", "error");
    return;
  }
  
  // Login
  showMessage("Đang đăng nhập...", "success");
  
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      showMessage("Đăng nhập thành công! Đang chuyển hướng...", "success");
      showToast("Đăng nhập thành công!", "success");
      
      // Save remember me preference
      const rememberMe = document.getElementById("rememberMe").checked;
      if (rememberMe) {
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      }
      
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    })
    .catch(error => {
      console.error("Login error:", error);
      let errorMessage = "Đăng nhập thất bại!";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Email không tồn tại!";
          break;
        case "auth/wrong-password":
          errorMessage = "Mật khẩu không đúng!";
          break;
        case "auth/invalid-email":
          errorMessage = "Email không hợp lệ!";
          break;
        case "auth/user-disabled":
          errorMessage = "Tài khoản đã bị vô hiệu hóa!";
          break;
        case "auth/too-many-requests":
          errorMessage = "Quá nhiều lần thử. Vui lòng thử lại sau!";
          break;
        default:
          errorMessage = error.message;
      }
      
      showMessage(errorMessage, "error");
      showToast(errorMessage, "error");
    });
}

// ==================== REGISTER ====================
function handleRegister() {
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;
  const agreeTerms = document.getElementById("agreeTerms").checked;
  
  // Validation
  if (!name) {
    showMessage("Vui lòng nhập họ tên!", "error");
    return;
  }
  
  if (!email) {
    showMessage("Vui lòng nhập email!", "error");
    return;
  }
  
  if (!isValidEmail(email)) {
    showMessage("Email không hợp lệ!", "error");
    return;
  }
  
  if (!password) {
    showMessage("Vui lòng nhập mật khẩu!", "error");
    return;
  }
  
  if (password.length < 6) {
    showMessage("Mật khẩu phải có ít nhất 6 ký tự!", "error");
    return;
  }
  
  if (password !== confirmPassword) {
    showMessage("Mật khẩu xác nhận không khớp!", "error");
    return;
  }
  
  if (!agreeTerms) {
    showMessage("Vui lòng đồng ý với điều khoản dịch vụ!", "error");
    return;
  }
  
  // Register
  showMessage("Đang đăng ký...", "success");
  
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      // Update profile with display name
      return userCredential.user.updateProfile({
        displayName: name
      }).then(() => userCredential.user);
    })
    .then(user => {
      showMessage("Đăng ký thành công! Đang chuyển hướng...", "success");
      showToast("Đăng ký thành công!", "success");
      
      // Optional: Create user document in Firestore
      if (db) {
        db.collection("users").doc(user.uid).set({
          name: name,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          cart: []
        }).catch(err => console.error("Error creating user doc:", err));
      }
      
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    })
    .catch(error => {
      console.error("Register error:", error);
      let errorMessage = "Đăng ký thất bại!";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email đã được sử dụng!";
          break;
        case "auth/invalid-email":
          errorMessage = "Email không hợp lệ!";
          break;
        case "auth/weak-password":
          errorMessage = "Mật khẩu quá yếu!";
          break;
        default:
          errorMessage = error.message;
      }
      
      showMessage(errorMessage, "error");
      showToast(errorMessage, "error");
    });
}

// ==================== GOOGLE LOGIN ====================
function handleGoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  showMessage("Đang kết nối với Google...", "success");
  
  auth.signInWithPopup(provider)
    .then(result => {
      showMessage("Đăng nhập thành công! Đang chuyển hướng...", "success");
      showToast("Đăng nhập với Google thành công!", "success");
      
      // Optional: Create/update user document in Firestore
      if (db) {
        const user = result.user;
        db.collection("users").doc(user.uid).set({
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(err => console.error("Error updating user doc:", err));
      }
      
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    })
    .catch(error => {
      console.error("Google login error:", error);
      let errorMessage = "Đăng nhập Google thất bại!";
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Bạn đã đóng cửa sổ đăng nhập!";
      } else if (error.code === "auth/cancelled-popup-request") {
        return; // Don't show error for cancelled popup
      }
      
      showMessage(errorMessage, "error");
      showToast(errorMessage, "error");
    });
}

// ==================== HELPERS ====================
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ==================== ENTER KEY HANDLING ====================
document.addEventListener("DOMContentLoaded", () => {
  // Login form
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  
  if (loginEmail) {
    loginEmail.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  }
  
  if (loginPassword) {
    loginPassword.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  }
  
  // Register form
  const registerConfirmPassword = document.getElementById("registerConfirmPassword");
  
  if (registerConfirmPassword) {
    registerConfirmPassword.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleRegister();
    });
  }
});