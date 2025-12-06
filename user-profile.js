// ==================== USER PROFILE MANAGEMENT ====================
// File: user-profile.js
// Quản lý thông tin người dùng và số dư tài khoản

class UserProfile {
  constructor() {
    this.currentUser = null;
    this.userBalance = 0;
    this.userInfo = {};
  }

  // Khởi tạo profile người dùng
  async initUserProfile(userId) {
    if (!userId) {
      console.error("User ID is required");
      return;
    }
    
    this.currentUser = userId;
    await this.loadUserData(userId);
    await this.loadUserBalance(userId);
  }

  // Load thông tin người dùng từ localStorage hoặc Firestore
  async loadUserData(userId) {
    try {
      // Thử load từ Firestore trước (nếu có)
      if (typeof db !== 'undefined' && db) {
        try {
          const userDoc = await db.collection("users").doc(userId).get();
          if (userDoc.exists) {
            this.userInfo = userDoc.data();
            console.log("Loaded user data from Firestore");
            return;
          }
        } catch (firestoreError) {
          console.log("Firestore not available, using localStorage");
        }
      }
      
      // Load từ localStorage
      const stored = localStorage.getItem(`user_info_${userId}`);
      if (stored) {
        this.userInfo = JSON.parse(stored);
        console.log("Loaded user data from localStorage");
      } else {
        // Tạo thông tin mặc định
        const currentUser = typeof auth !== 'undefined' ? auth.currentUser : null;
        this.userInfo = {
          name: currentUser?.displayName || "Khách hàng",
          email: currentUser?.email || "",
          phone: "",
          address: "",
          city: "",
          district: "",
          birthday: "",
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        // Lưu thông tin mặc định
        await this.saveUserData();
        console.log("Created default user data");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      
      // Fallback data
      const currentUser = typeof auth !== 'undefined' ? auth.currentUser : null;
      this.userInfo = {
        name: currentUser?.displayName || "Khách hàng",
        email: currentUser?.email || "",
        phone: "",
        address: "",
        city: "",
        district: "",
        birthday: ""
      };
    }
  }

  // Load số dư tài khoản
  async loadUserBalance(userId) {
    try {
      const stored = localStorage.getItem(`user_balance_${userId}`);
      this.userBalance = stored ? parseFloat(stored) : 0;
      
      // Đảm bảo số dư không âm
      if (this.userBalance < 0) {
        this.userBalance = 0;
      }
      
      console.log("User balance loaded:", this.userBalance);
    } catch (error) {
      console.error("Error loading balance:", error);
      this.userBalance = 0;
    }
  }

  // Lưu thông tin người dùng
  async saveUserData() {
    if (!this.currentUser) {
      console.error("No user logged in");
      return false;
    }
    
    try {
      this.userInfo.lastUpdated = new Date().toISOString();
      
      // Lưu vào localStorage
      localStorage.setItem(`user_info_${this.currentUser}`, JSON.stringify(this.userInfo));
      
      // Đồng bộ lên Firestore nếu có
      if (typeof db !== 'undefined' && db) {
        try {
          await db.collection("users").doc(this.currentUser).set(this.userInfo, { merge: true });
          console.log("User data synced to Firestore");
        } catch (firestoreError) {
          console.log("Firestore sync failed, data saved to localStorage only");
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  }

  // Cập nhật số dư tài khoản
  async updateBalance(amount, type = "add") {
    if (!this.currentUser) {
      console.error("No user logged in");
      return false;
    }
    
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      console.error("Invalid amount:", amount);
      return false;
    }
    
    try {
      const oldBalance = this.userBalance;
      
      if (type === "add") {
        // Thêm tiền vào tài khoản
        this.userBalance += amount;
      } else if (type === "subtract") {
        // Trừ tiền từ tài khoản
        if (this.userBalance >= amount) {
          this.userBalance -= amount;
        } else {
          // Số dư không đủ
          if (typeof showToast === 'function') {
            showToast("Số dư không đủ!", "error");
          }
          console.error("Insufficient balance. Current:", this.userBalance, "Required:", amount);
          return false;
        }
      } else if (type === "set") {
        // Set số dư cụ thể
        this.userBalance = amount;
      }
      
      // Đảm bảo số dư không âm
      if (this.userBalance < 0) {
        this.userBalance = 0;
      }
      
      // Lưu vào localStorage
      localStorage.setItem(`user_balance_${this.currentUser}`, this.userBalance.toString());
      
      console.log(`Balance updated: ${oldBalance} -> ${this.userBalance} (${type} ${amount})`);
      return true;
    } catch (error) {
      console.error("Error updating balance:", error);
      return false;
    }
  }

  // Lấy thông tin người dùng
  getUserInfo() {
    return { ...this.userInfo };
  }

  // Lấy số dư
  getBalance() {
    return this.userBalance;
  }

  // Cập nhật thông tin cá nhân
  async updateUserInfo(data) {
    if (!this.currentUser) {
      console.error("No user logged in");
      return false;
    }
    
    // Merge data mới với data cũ
    this.userInfo = { 
      ...this.userInfo, 
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    return await this.saveUserData();
  }

  // Format số dư thành tiền tệ
  formatBalance() {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(this.userBalance);
  }

  // Kiểm tra số dư có đủ không
  hasEnoughBalance(amount) {
    return this.userBalance >= amount;
  }

  // Lấy lịch sử giao dịch số dư
  getBalanceHistory() {
    if (!this.currentUser) return [];
    
    try {
      const stored = localStorage.getItem(`balance_history_${this.currentUser}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading balance history:", error);
      return [];
    }
  }

  // Lưu lịch sử giao dịch
  async saveBalanceTransaction(type, amount, description = "") {
    if (!this.currentUser) return false;
    
    try {
      const history = this.getBalanceHistory();
      
      const transaction = {
        id: `TXN${Date.now()}`,
        type: type, // "add", "subtract", "refund"
        amount: amount,
        description: description,
        balanceBefore: this.userBalance - (type === "add" ? amount : -amount),
        balanceAfter: this.userBalance,
        timestamp: new Date().toISOString()
      };
      
      history.unshift(transaction);
      
      // Chỉ lưu 100 giao dịch gần nhất
      if (history.length > 100) {
        history.length = 100;
      }
      
      localStorage.setItem(`balance_history_${this.currentUser}`, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error("Error saving balance transaction:", error);
      return false;
    }
  }

  // Reset tất cả dữ liệu user (dùng cho testing)
  async resetUserData() {
    if (!this.currentUser) return false;
    
    try {
      localStorage.removeItem(`user_info_${this.currentUser}`);
      localStorage.removeItem(`user_balance_${this.currentUser}`);
      localStorage.removeItem(`balance_history_${this.currentUser}`);
      
      this.userInfo = {};
      this.userBalance = 0;
      
      console.log("User data reset");
      return true;
    } catch (error) {
      console.error("Error resetting user data:", error);
      return false;
    }
  }

  // Xuất thông tin user (cho backup)
  exportUserData() {
    return {
      userInfo: this.userInfo,
      balance: this.userBalance,
      balanceHistory: this.getBalanceHistory(),
      exportDate: new Date().toISOString()
    };
  }

  // Nhập thông tin user (từ backup)
  async importUserData(data) {
    if (!this.currentUser || !data) return false;
    
    try {
      if (data.userInfo) {
        this.userInfo = data.userInfo;
        await this.saveUserData();
      }
      
      if (typeof data.balance === 'number') {
        await this.updateBalance(data.balance, "set");
      }
      
      if (data.balanceHistory) {
        localStorage.setItem(
          `balance_history_${this.currentUser}`, 
          JSON.stringify(data.balanceHistory)
        );
      }
      
      console.log("User data imported successfully");
      return true;
    } catch (error) {
      console.error("Error importing user data:", error);
      return false;
    }
  }
}

// Tạo instance global
const userProfile = new UserProfile();

// Export nếu dùng module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UserProfile, userProfile };
}