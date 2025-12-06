// MẪU DỮ LIỆU SẢN PHẨM (Bạn có thể thay bằng API hoặc Firestore sau)
const PRODUCTS = [
  { id: "p1", name: "Áo Hoodie", price: 250000, img: "https://via.placeholder.com/400x300?text=Áo+Hoodie" },
  { id: "p2", name: "Giày Sneaker", price: 450000, img: "https://via.placeholder.com/400x300?text=Giày+Sneaker" },
  { id: "p3", name: "Balo Thời Trang", price: 180000, img: "https://via.placeholder.com/400x300?text=Balo" }
];

let cart = []; // [{id, name, price, qty}]
let currentUserUid = null;

// Khởi tạo giao diện khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  initAuthAndCart();
  document.getElementById("checkoutBtn").onclick = checkout;
});

// Vẽ danh sách sản phẩm
function renderProducts() {
  const container = document.getElementById("productList");
  if (!container) return;
  container.innerHTML = "";
  PRODUCTS.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">${p.price.toLocaleString()}đ</p>
      <button class="btn" onclick="addToCart('${p.id}', '${p.name}', ${p.price})">Thêm vào giỏ</button>
    `;
    container.appendChild(div);
  });
}

// Xử lý thêm sản phẩm vào giỏ
function addToCart(id, name, price) {
  // Kiểm tra nếu đã có -> tăng qty
  const found = cart.find(item => item.id === id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart();
  renderCart();
}

// Xóa 1 item khỏi giỏ
function removeFromCart(id) {
  cart = cart.filter(it => it.id !== id);
  saveCart();
  renderCart();
}

// Thay đổi số lượng
function changeQty(id, delta) {
  const it = cart.find(x => x.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty < 1) it.qty = 1;
  saveCart();
  renderCart();
}

// Tính tổng
function computeTotal() {
  return cart.reduce((s, it) => s + it.price * it.qty, 0);
}

// Hiển thị giỏ hàng
function renderCart() {
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  if (!list || !totalEl) return;

  list.innerHTML = "";
  if (cart.length === 0) {
    list.innerHTML = "<li>Chưa có sản phẩm trong giỏ</li>";
  } else {
    cart.forEach(it => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div style="flex:1">
          <strong>${it.name}</strong><br>
          <small>${it.price.toLocaleString()}đ x ${it.qty}</small>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div>
            <button onclick="changeQty('${it.id}', -1)" class="btn outline" style="padding:4px 8px">-</button>
            <button onclick="changeQty('${it.id}', 1)" class="btn outline" style="padding:4px 8px">+</button>
          </div>
          <button onclick="removeFromCart('${it.id}')" class="btn outline" style="padding:6px 8px">Xóa</button>
        </div>
      `;
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "space-between";
      list.appendChild(li);
    });
  }

  totalEl.textContent = "Tổng: " + computeTotal().toLocaleString() + "đ";
}

// ------------------- LƯU / LOAD GIỎ HÀNG RIÊNG CHO MỖI USER -------------------
// Lưu cart vào localStorage theo key = cart_<uid>
function saveCart() {
  if (!currentUserUid) return; // nếu chưa đăng nhập thì không lưu (thoả mãn yêu cầu: lưu theo user)
  try {
    localStorage.setItem("cart_" + currentUserUid, JSON.stringify(cart));
  } catch (e) {
    console.error("Lưu cart lỗi", e);
  }
}

function loadCart() {
  if (!currentUserUid) { cart = []; renderCart(); return; }
  try {
    const raw = localStorage.getItem("cart_" + currentUserUid);
    cart = raw ? JSON.parse(raw) : [];
  } catch (e) {
    cart = [];
  }
  renderCart();
}

// ------------------- KẾT HỢP VỚI AUTH -------------------
function initAuthAndCart() {
  // firebase (compat) đã được load trong index.html trước
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      currentUserUid = user.uid;
      // Load cart cho user
      loadCart();
      // Hiển thị tên (nếu cần)
      const welcome = document.getElementById("welcomeText");
      if (welcome) welcome.textContent = user.displayName || user.email || "Người dùng";
    } else {
      // Nếu chưa login -> chuyển đến login (auth.js cũng làm, nhưng phòng trường hợp)
      currentUserUid = null;
      cart = [];
      renderCart();
      // redirect if not on login
      const path = window.location.pathname.split("/").pop();
      if (!path || path === "index.html" || path === "index") {
        window.location.href = "login.html";
      }
    }
  });
}

// ------------------- CHECKOUT MÔ PHỎNG -------------------
function checkout() {
  if (!currentUserUid) {
    alert("Bạn cần đăng nhập để thanh toán.");
    window.location.href = "login.html";
    return;
  }
  if (cart.length === 0) {
    alert("Giỏ hàng rỗng.");
    return;
  }

  // Mô phỏng thanh toán: xóa giỏ hàng sau khi "thanh toán thành công"
  const total = computeTotal();
  if (confirm(`Thanh toán mô phỏng: ${total.toLocaleString()}đ ? (Sẽ xoá giỏ hàng)`)) {
    cart = [];
    saveCart();
    renderCart();
    alert("Thanh toán thành công (mô phỏng). Cảm ơn bạn!");
  }
}
