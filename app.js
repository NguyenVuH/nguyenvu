// ==================== PRODUCT DATA ====================
const PRODUCTS = [
  {
    id: "p1",
    name: "MacBook Pro 14\" M3",
    category: "laptop",
    price: 45990000,
    image: "https://mac365.vn/wp-content/uploads/2024/03/2-9.png",
    description: "Chip M3 mạnh mẽ, màn hình Liquid Retina XDR",
    rating: 4.8,
    reviews: 234,
    badge: "Mới"
  },
  {
    id: "p2",
    name: "iPhone 15 Pro Max",
    category: "phone",
    price: 34990000,
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_2__5_2_1_1.jpg",
    description: "Chip A17 Pro, Camera 48MP, Titanium Design",
    rating: 4.9,
    reviews: 567,
    badge: "Hot"
  },
  {
    id: "p3",
    name: "AirPods Pro 2",
    category: "audio",
    price: 6490000,
    image: "https://via.placeholder.com/400x300?text=AirPods+Pro",
    description: "Chống ồn chủ động, Spatial Audio",
    rating: 4.7,
    reviews: 892,
    badge: null
  },
  {
    id: "p4",
    name: "Samsung Galaxy S24 Ultra",
    category: "phone",
    price: 33990000,
    image: "https://via.placeholder.com/400x300?text=Galaxy+S24",
    description: "Snapdragon 8 Gen 3, Camera 200MP, S Pen",
    rating: 4.8,
    reviews: 445,
    badge: "Mới"
  },
  {
    id: "p5",
    name: "Dell XPS 15",
    category: "laptop",
    price: 42990000,
    image: "https://via.placeholder.com/400x300?text=Dell+XPS",
    description: "Intel Core i9, RTX 4060, 32GB RAM",
    rating: 4.6,
    reviews: 178,
    badge: null
  },
  {
    id: "p6",
    name: "Sony WH-1000XM5",
    category: "audio",
    price: 8990000,
    image: "https://via.placeholder.com/400x300?text=Sony+WH",
    description: "Chống ồn tốt nhất, 30 giờ pin",
    rating: 4.9,
    reviews: 623,
    badge: "Hot"
  },
  {
    id: "p7",
    name: "iPad Pro 12.9\" M2",
    category: "accessory",
    price: 29990000,
    image: "https://via.placeholder.com/400x300?text=iPad+Pro",
    description: "Chip M2, màn hình Liquid Retina XDR",
    rating: 4.8,
    reviews: 312,
    badge: null
  },
  {
    id: "p8",
    name: "Magic Keyboard",
    category: "accessory",
    price: 3490000,
    image: "https://via.placeholder.com/400x300?text=Magic+Keyboard",
    description: "Bàn phím cao cấp cho iPad Pro",
    rating: 4.5,
    reviews: 156,
    badge: null
  },
  {
    id: "p9",
    name: "Logitech MX Master 3S",
    category: "accessory",
    price: 2490000,
    image: "https://via.placeholder.com/400x300?text=MX+Master",
    description: "Chuột không dây cao cấp, pin 70 ngày",
    rating: 4.7,
    reviews: 428,
    badge: null
  },
  {
    id: "p10",
    name: "Asus ROG Strix G16",
    category: "laptop",
    price: 38990000,
    image: "https://via.placeholder.com/400x300?text=ROG+Strix",
    description: "Intel Core i9, RTX 4070, 16GB RAM",
    rating: 4.6,
    reviews: 267,
    badge: "Gaming"
  },
  {
    id: "p11",
    name: "Google Pixel 8 Pro",
    category: "phone",
    price: 26990000,
    image: "https://via.placeholder.com/400x300?text=Pixel+8",
    description: "Google Tensor G3, Camera AI tốt nhất",
    rating: 4.7,
    reviews: 334,
    badge: null
  },
  {
    id: "p12",
    name: "JBL Flip 6",
    category: "audio",
    price: 3290000,
    image: "https://via.placeholder.com/400x300?text=JBL+Flip",
    description: "Loa bluetooth chống nước, 12 giờ pin",
    rating: 4.6,
    reviews: 512,
    badge: null
  }
];

// ==================== STATE MANAGEMENT ====================
let cart = [];
let filteredProducts = [...PRODUCTS];
let currentCategory = "all";
let currentView = "grid";

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

async function initializeApp() {
  const user = auth.currentUser;
  if (user && typeof userProfile !== 'undefined') {
    await userProfile.initUserProfile(user.uid);
    await orderHistory.initOrderHistory(user.uid);
  }
  
  loadCart();
  renderProducts();
  updateCartUI();
  setupEventListeners();
}

function setupEventListeners() {
  // Checkout button
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.onclick = handleCheckout;
  }
  
  // Close modal on outside click
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }
}

// ==================== PRODUCT RENDERING ====================
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <h3>Không tìm thấy sản phẩm nào</h3>
        <p style="color: var(--gray); margin-top: 1rem;">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
      </div>
    `;
    return;
  }
  
  filteredProducts.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.onclick = () => showProductDetail(product);
  
  card.innerHTML = `
    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
    <img src="${product.image}" alt="${product.name}" class="product-image">
    <div class="product-info">
      <div class="product-category">${getCategoryName(product.category)}</div>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <div class="product-rating">
        <span class="stars">${getStarRating(product.rating)}</span>
        <span class="rating-count">(${product.reviews})</span>
      </div>
      <div class="product-footer">
        <div class="product-price">${formatPrice(product.price)}</div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
          Thêm 🛒
        </button>
      </div>
    </div>
  `;
  
  return card;
}

function getCategoryName(category) {
  const names = {
    laptop: "Laptop",
    phone: "Điện thoại",
    accessory: "Phụ kiện",
    audio: "Âm thanh"
  };
  return names[category] || category;
}

function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let stars = "⭐".repeat(fullStars);
  if (halfStar) stars += "⭐";
  return stars;
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

// ==================== PRODUCT DETAIL MODAL ====================
function showProductDetail(product) {
  const modal = document.getElementById("productModal");
  const modalBody = document.getElementById("modalBody");
  
  if (!modal || !modalBody) return;
  
  modalBody.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: var(--radius);">
      </div>
      <div>
        <div style="display: inline-block; background: var(--primary-light); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem;">
          ${getCategoryName(product.category)}
        </div>
        <h2 style="margin-bottom: 1rem;">${product.name}</h2>
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <span style="color: var(--warning); font-size: 1.2rem;">${getStarRating(product.rating)}</span>
          <span style="color: var(--gray);">${product.rating}/5</span>
          <span style="color: var(--gray);">(${product.reviews} đánh giá)</span>
        </div>
        <p style="color: var(--gray); line-height: 1.8; margin-bottom: 2rem;">${product.description}</p>
        <div style="background: var(--light-gray); padding: 1.5rem; border-radius: var(--radius); margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Thông số kỹ thuật</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">✓ Bảo hành chính hãng 12 tháng</li>
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">✓ Hỗ trợ đổi trả trong 7 ngày</li>
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">✓ Miễn phí vận chuyển toàn quốc</li>
            <li style="padding: 0.5rem 0;">✓ Thanh toán khi nhận hàng</li>
          </ul>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${formatPrice(product.price)}</div>
          <button onclick="addToCart('${product.id}'); closeModal();" style="padding: 1rem 2rem; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-size: 1.1rem; font-weight: 600; cursor: pointer;">
            Thêm vào giỏ hàng 🛒
          </button>
          <button onclick="addToCart('${product.id}'); closeModal(); toggleCart();" style="padding: 1rem 2rem; background: var(--secondary); color: white; border: none; border-radius: var(--radius); font-size: 1.1rem; font-weight: 600; cursor: pointer;">
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

// ==================== CART MANAGEMENT ====================
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
    showToast(`Đã tăng số lượng ${product.name}`, "success");
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    showToast(`Đã thêm ${product.name} vào giỏ hàng`, "success");
  }
  
  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    showToast(`Đã xóa ${item.name} khỏi giỏ hàng`, "success");
  }
  
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, delta) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  
  item.quantity += delta;
  
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  saveCart();
  updateCartUI();
}

function clearCart() {
  if (cart.length === 0) {
    showToast("Giỏ hàng đã trống", "error");
    return;
  }
  
  if (confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
    cart = [];
    saveCart();
    updateCartUI();
    showToast("Đã xóa toàn bộ giỏ hàng", "success");
  }
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const totalEl = document.getElementById("totalPrice");
  
  // Update count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
  
  // Update cart items
  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--gray);">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
          <h3>Giỏ hàng trống</h3>
          <p style="margin-top: 0.5rem;">Hãy thêm sản phẩm vào giỏ hàng!</p>
        </div>
      `;
    } else {
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-item-controls">
              <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
              <span class="quantity-display">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
              <button class="remove-btn" onclick="removeFromCart('${item.id}')">Xóa</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal >= 50000000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;
  
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (discountEl) discountEl.textContent = discount > 0 ? `-${formatPrice(discount)}` : "0₫";
  if (totalEl) totalEl.textContent = formatPrice(total);
}

function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  if (cartSidebar) {
    cartSidebar.classList.toggle("open");
  }
}

// ==================== CART PERSISTENCE ====================
function saveCart() {
  const userId = getCurrentUserId();
  if (!userId) return;
  
  try {
    const cartData = JSON.stringify(cart);
    localStorage.setItem(`cart_${userId}`, cartData);
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

function loadCart() {
  const userId = getCurrentUserId();
  if (!userId) {
    cart = [];
    return;
  }
  
  try {
    const cartData = localStorage.getItem(`cart_${userId}`);
    if (cartData) {
      cart = JSON.parse(cartData);
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = [];
  }
}

// ==================== CHECKOUT ====================
async function handleCheckout() {
  if (cart.length === 0) {
    showToast("Giỏ hàng trống!", "error");
    return;
  }
  
  const userId = getCurrentUserId();
  if (!userId) {
    showToast("Vui lòng đăng nhập để thanh toán!", "error");
    return;
  }
  
  // Show payment options
  showPaymentModal();
}

function showPaymentModal() {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = total >= 50000000 ? total * 0.1 : 0;
  const finalTotal = total - discount;
  
  const modal = document.getElementById("productModal");
  const modalBody = document.getElementById("modalBody");
  
  if (!modal || !modalBody) return;
  
  const userBalance = typeof userProfile !== 'undefined' ? userProfile.getBalance() : 0;
  const hasEnoughBalance = userBalance >= finalTotal;
  
  console.log("Payment Modal - Balance:", userBalance, "Total:", finalTotal, "Enough?", hasEnoughBalance);
  
  modalBody.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto;">
      <h2 style="margin-bottom: 2rem; text-align: center;">Chọn phương thức thanh toán</h2>
      
      <div style="background: var(--bg-hover); padding: 1.5rem; border-radius: var(--radius); margin-bottom: 2rem; border: 2px solid var(--border);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
          <span>Tạm tính:</span>
          <span>${formatPrice(total)}</span>
        </div>
        ${discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: var(--success);">
            <span>Giảm giá:</span>
            <span>-${formatPrice(discount)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding-top: 0.75rem; border-top: 2px solid var(--border); font-size: 1.3rem; font-weight: 700; color: var(--primary);">
          <span>Tổng cộng:</span>
          <span>${formatPrice(finalTotal)}</span>
        </div>
      </div>
      
      ${typeof userProfile !== 'undefined' ? `
        <button onclick="processPayment('balance', ${finalTotal})" 
          ${!hasEnoughBalance ? 'disabled' : ''}
          style="width: 100%; padding: 1.25rem; margin-bottom: 1rem; background: ${hasEnoughBalance ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : '#6b7280'}; color: white; border: none; border-radius: var(--radius-lg); font-size: 1.05rem; font-weight: 600; cursor: ${hasEnoughBalance ? 'pointer' : 'not-allowed'};">
          💰 Thanh toán bằng số dư (${formatPrice(userBalance)})
          ${!hasEnoughBalance ? '<br><small style="font-size: 0.85rem; opacity: 0.9;">Số dư không đủ - Thiếu ' + formatPrice(finalTotal - userBalance) + '</small>' : ''}
        </button>
      ` : ''}
      
      <button onclick="processPayment('cod', ${finalTotal})" 
        style="width: 100%; padding: 1.25rem; margin-bottom: 1rem; background: var(--secondary); color: white; border: none; border-radius: var(--radius-lg); font-size: 1.05rem; font-weight: 600; cursor: pointer;">
        🚚 Thanh toán khi nhận hàng (COD)
      </button>
      
      <button onclick="closeModal()" 
        style="width: 100%; padding: 1rem; background: transparent; color: var(--text-secondary); border: 2px solid var(--border); border-radius: var(--radius-lg); font-weight: 600; cursor: pointer;">
        Hủy
      </button>
    </div>
  `;
  
  modal.classList.add("active");
}

async function processPayment(method, totalAmount) {
  console.log("Processing payment:", method, "Amount:", totalAmount);
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = total >= 50000000 ? total * 0.1 : 0;
  const finalTotal = total - discount;
  
  // Check if userProfile and orderHistory are available
  if (typeof userProfile === 'undefined' || typeof orderHistory === 'undefined') {
    console.log("Profile/Order system not available, using fallback");
    // Fallback to simple checkout
    closeModal();
    showToast("Đang xử lý đơn hàng...", "success");
    
    setTimeout(() => {
      cart = [];
      saveCart();
      updateCartUI();
      toggleCart();
      showToast("✅ Đặt hàng thành công! Cảm ơn bạn đã mua sắm!", "success");
    }, 1500);
    return;
  }
  
  // Check balance if paying with balance
  const useBalance = method === 'balance';
  if (useBalance) {
    const currentBalance = userProfile.getBalance();
    console.log("Current balance:", currentBalance, "Required:", finalTotal);
    
    if (currentBalance < finalTotal) {
      showToast("Số dư không đủ! Vui lòng nạp thêm tiền.", "error");
      return;
    }
  }
  
  // Create order with new system
  closeModal();
  showToast("Đang xử lý đơn hàng...", "success");
  
  try {
    const order = await orderHistory.createOrder(cart, method, useBalance);
    
    if (order) {
      console.log("Order created successfully:", order.id);
      
      cart = [];
      saveCart();
      updateCartUI();
      
      setTimeout(() => {
        toggleCart();
        showToast("✅ Đặt hàng thành công! Mã đơn: " + order.id, "success");
        
        // Ask if user wants to view order history
        setTimeout(() => {
          if (confirm("Đặt hàng thành công! Bạn có muốn xem lịch sử đơn hàng?")) {
            window.location.href = "profile.html";
          }
        }, 1500);
      }, 500);
    } else {
      console.error("Order creation failed");
      showToast("Đặt hàng thất bại! Vui lòng thử lại.", "error");
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    showToast("Có lỗi xảy ra: " + error.message, "error");
  }
}

// ==================== FILTERING & SORTING ====================
function filterByCategory(category) {
  currentCategory = category;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  applyFilters();
  showToast(`Lọc theo: ${getCategoryName(category)}`, "success");
}

function filterByPrice(min, max) {
  filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = currentCategory === "all" || p.category === currentCategory;
    const matchesPrice = p.price >= min && p.price < max;
    return matchesCategory && matchesPrice;
  });
  
  renderProducts();
  showToast(`Lọc giá: ${formatPrice(min)} - ${max === Infinity ? '∞' : formatPrice(max)}`, "success");
}

function applyFilters() {
  if (currentCategory === "all") {
    filteredProducts = [...PRODUCTS];
  } else {
    filteredProducts = PRODUCTS.filter(p => p.category === currentCategory);
  }
  renderProducts();
}

function sortProducts(sortType) {
  switch (sortType) {
    case "name":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      showToast("Sắp xếp theo tên A-Z", "success");
      break;
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      showToast("Sắp xếp giá: Thấp → Cao", "success");
      break;
    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      showToast("Sắp xếp giá: Cao → Thấp", "success");
      break;
    case "popular":
      filteredProducts.sort((a, b) => b.reviews - a.reviews);
      showToast("Sắp xếp theo độ phổ biến", "success");
      break;
  }
  renderProducts();
}

function resetFilters() {
  currentCategory = "all";
  filteredProducts = [...PRODUCTS];
  
  // Reset active buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector('.filter-btn').classList.add('active');
  
  renderProducts();
  showToast("Đã đặt lại bộ lọc", "success");
}

// ==================== SEARCH ====================
function searchProducts() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase().trim();
  
  if (!query) {
    filteredProducts = [...PRODUCTS];
    renderProducts();
    return;
  }
  
  filteredProducts = PRODUCTS.filter(p => {
    return p.name.toLowerCase().includes(query) ||
           p.description.toLowerCase().includes(query) ||
           getCategoryName(p.category).toLowerCase().includes(query);
  });
  
  renderProducts();
  showToast(`Tìm thấy ${filteredProducts.length} sản phẩm`, "success");
}

// Add search on enter key
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchProducts();
      }
    });
  }
});

// ==================== VIEW TOGGLE ====================
function setView(view) {
  currentView = view;
  const grid = document.getElementById("productGrid");
  const buttons = document.querySelectorAll('.view-toggle button');
  
  if (grid) {
    if (view === "list") {
      grid.classList.add("list-view");
    } else {
      grid.classList.remove("list-view");
    }
  }
  
  // Update active button
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  showToast(`Chế độ xem: ${view === 'grid' ? 'Lưới' : 'Danh sách'}`, "success");
}