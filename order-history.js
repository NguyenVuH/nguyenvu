// ==================== ORDER HISTORY MANAGEMENT ====================
// File: order-history.js
// Quản lý lịch sử đơn hàng cho từng user

class OrderHistory {
  constructor() {
    this.orders = [];
    this.currentUser = null;
  }

  // Khởi tạo lịch sử đơn hàng cho user
  async initOrderHistory(userId) {
    if (!userId) return;
    
    this.currentUser = userId;
    await this.loadOrders(userId);
  }

  // Load danh sách đơn hàng từ localStorage
  async loadOrders(userId) {
    try {
      const stored = localStorage.getItem(`orders_${userId}`);
      this.orders = stored ? JSON.parse(stored) : [];
      
      // Sắp xếp theo ngày mới nhất
      this.orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    } catch (error) {
      console.error("Error loading orders:", error);
      this.orders = [];
    }
  }

  // Tạo đơn hàng mới
  async createOrder(cartItems, paymentMethod = "cod", useBalance = false) {
    if (!this.currentUser) {
      console.error("User not logged in");
      return null;
    }
    
    // Tính toán giá trị đơn hàng
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal >= 50000000 ? subtotal * 0.1 : 0; // 10% giảm giá cho đơn >= 50 triệu
    const shippingFee = subtotal >= 500000 ? 0 : 30000; // Free ship cho đơn >= 500k
    const total = subtotal - discount + shippingFee;
    
    // Kiểm tra số dư nếu thanh toán bằng tài khoản
    if (useBalance && typeof userProfile !== 'undefined') {
      const canPay = await userProfile.updateBalance(total, "subtract");
      if (!canPay) {
        console.error("Insufficient balance");
        return null;
      }
    }
    
    // Tạo đối tượng đơn hàng
    const order = {
      id: this.generateOrderId(),
      items: cartItems.map(item => ({ ...item })),
      subtotal: subtotal,
      discount: discount,
      shippingFee: shippingFee,
      total: total,
      paymentMethod: paymentMethod,
      paymentStatus: useBalance ? "paid" : "pending",
      orderStatus: "pending", // pending, processing, shipping, delivered, cancelled
      orderDate: new Date().toISOString(),
      deliveryDate: null,
      customerInfo: typeof userProfile !== 'undefined' ? userProfile.getUserInfo() : {},
      trackingNumber: this.generateTrackingNumber()
    };
    
    // Thêm vào đầu danh sách (đơn mới nhất)
    this.orders.unshift(order);
    
    // Lưu vào localStorage
    await this.saveOrders();
    
    return order;
  }

  // Lưu danh sách đơn hàng
  async saveOrders() {
    if (!this.currentUser) return false;
    
    try {
      localStorage.setItem(`orders_${this.currentUser}`, JSON.stringify(this.orders));
      
      // Đồng bộ lên Firestore nếu có
      if (typeof db !== 'undefined' && db) {
        await db.collection("orders").doc(this.currentUser).set({
          orders: this.orders,
          lastUpdated: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error saving orders:", error);
      return false;
    }
  }

  // Lấy tất cả đơn hàng
  getOrders() {
    return [...this.orders];
  }

  // Lấy đơn hàng theo ID
  getOrderById(orderId) {
    return this.orders.find(order => order.id === orderId);
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, status) {
    const order = this.getOrderById(orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return false;
    }
    
    order.orderStatus = status;
    
    // Nếu đơn đã giao, cập nhật ngày giao và trạng thái thanh toán
    if (status === "delivered") {
      order.deliveryDate = new Date().toISOString();
      order.paymentStatus = "paid";
    }
    
    return await this.saveOrders();
  }

  // Hủy đơn hàng
  async cancelOrder(orderId) {
    const order = this.getOrderById(orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return false;
    }
    
    // Không thể hủy đơn đang giao hoặc đã giao
    if (order.orderStatus === "delivered" || order.orderStatus === "shipping") {
      if (typeof showToast === 'function') {
        showToast("Không thể hủy đơn hàng đang giao hoặc đã giao!", "error");
      }
      return false;
    }
    
    // Hoàn tiền nếu đã thanh toán
    if (order.paymentStatus === "paid" && typeof userProfile !== 'undefined') {
      await userProfile.updateBalance(order.total, "add");
    }
    
    order.orderStatus = "cancelled";
    return await this.saveOrders();
  }

  // Thống kê đơn hàng
  getOrderStats() {
    const stats = {
      total: this.orders.length,
      pending: 0,
      processing: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
      totalSpent: 0
    };
    
    this.orders.forEach(order => {
      // Đếm số lượng theo trạng thái
      if (stats.hasOwnProperty(order.orderStatus)) {
        stats[order.orderStatus]++;
      }
      
      // Tính tổng chi tiêu (chỉ đơn đã giao)
      if (order.orderStatus === "delivered") {
        stats.totalSpent += order.total;
      }
    });
    
    return stats;
  }

  // Tạo mã đơn hàng (ORD + timestamp)
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  // Tạo mã tracking
  generateTrackingNumber() {
    const prefix = "VN";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  // Lọc đơn hàng theo trạng thái
  filterOrdersByStatus(status) {
    if (status === "all") {
      return this.orders;
    }
    return this.orders.filter(order => order.orderStatus === status);
  }

  // Lọc đơn hàng theo khoảng thời gian
  filterOrdersByDateRange(startDate, endDate) {
    return this.orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  // Tìm kiếm đơn hàng theo mã hoặc tên sản phẩm
  searchOrders(query) {
    const lowerQuery = query.toLowerCase();
    return this.orders.filter(order => {
      // Tìm theo mã đơn
      if (order.id.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Tìm theo tên sản phẩm
      return order.items.some(item => 
        item.name.toLowerCase().includes(lowerQuery)
      );
    });
  }

  // Format trạng thái đơn hàng thành text và màu
  static getStatusText(status) {
    const statusMap = {
      pending: { 
        text: "Chờ xác nhận", 
        color: "#f59e0b",
        icon: "⏳"
      },
      processing: { 
        text: "Đang xử lý", 
        color: "#3b82f6",
        icon: "📦"
      },
      shipping: { 
        text: "Đang giao hàng", 
        color: "#8b5cf6",
        icon: "🚚"
      },
      delivered: { 
        text: "Đã giao hàng", 
        color: "#22c55e",
        icon: "✅"
      },
      cancelled: { 
        text: "Đã hủy", 
        color: "#ef4444",
        icon: "❌"
      }
    };
    
    return statusMap[status] || { 
      text: status, 
      color: "#71717a",
      icon: "❓"
    };
  }

  // Format phương thức thanh toán
  static getPaymentMethodText(method) {
    const methodMap = {
      cod: "Thanh toán khi nhận hàng (COD)",
      balance: "Thanh toán bằng số dư tài khoản",
      bank: "Chuyển khoản ngân hàng",
      momo: "Ví MoMo",
      vnpay: "VNPay",
      zalopay: "ZaloPay",
      credit: "Thẻ tín dụng/Ghi nợ"
    };
    
    return methodMap[method] || method;
  }

  // Tính tổng doanh thu (cho admin)
  getTotalRevenue() {
    return this.orders
      .filter(order => order.orderStatus === "delivered")
      .reduce((sum, order) => sum + order.total, 0);
  }

  // Lấy sản phẩm bán chạy nhất
  getBestSellingProducts(limit = 10) {
    const productSales = {};
    
    this.orders
      .filter(order => order.orderStatus === "delivered")
      .forEach(order => {
        order.items.forEach(item => {
          if (!productSales[item.id]) {
            productSales[item.id] = {
              ...item,
              totalQuantity: 0,
              totalRevenue: 0
            };
          }
          productSales[item.id].totalQuantity += item.quantity;
          productSales[item.id].totalRevenue += item.price * item.quantity;
        });
      });
    
    // Chuyển thành array và sắp xếp
    return Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  // Xóa tất cả đơn hàng (dùng cho testing hoặc reset)
  async clearAllOrders() {
    if (!this.currentUser) return false;
    
    this.orders = [];
    return await this.saveOrders();
  }

  // Export đơn hàng ra CSV (cho admin)
  exportToCSV() {
    if (this.orders.length === 0) {
      return "No orders to export";
    }
    
    const headers = [
      "Mã đơn hàng",
      "Ngày đặt",
      "Trạng thái",
      "Thanh toán",
      "Tạm tính",
      "Giảm giá",
      "Phí ship",
      "Tổng cộng",
      "Số sản phẩm"
    ];
    
    const rows = this.orders.map(order => [
      order.id,
      new Date(order.orderDate).toLocaleString('vi-VN'),
      OrderHistory.getStatusText(order.orderStatus).text,
      OrderHistory.getPaymentMethodText(order.paymentMethod),
      order.subtotal,
      order.discount,
      order.shippingFee,
      order.total,
      order.items.length
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }
}

// Tạo instance global
const orderHistory = new OrderHistory();

// Export nếu dùng module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OrderHistory, orderHistory };
}