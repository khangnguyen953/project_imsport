import axios from "axios";
import BaseUrl from "./BaseUrl";

const CheckoutAPI = {
  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @param {Object} orderData.customerInfo - Thông tin khách hàng
   * @param {Array} orderData.items - Danh sách sản phẩm trong giỏ hàng
   * @param {string} orderData.paymentMethod - Phương thức thanh toán (cod/bank)
   * @param {number} orderData.total - Tổng tiền
   * @param {string} orderData.discountCode - Mã giảm giá (nếu có)
   * @param {string} orderData.notes - Ghi chú đơn hàng
   * @returns {Promise} Response từ API
   */
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(`${BaseUrl}/orders`, orderData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tỉnh/thành phố
   * @returns {Promise} Danh sách tỉnh/thành phố
   */
  getProvinces: async () => {
    try {
      const response = await axios.get(`${BaseUrl}/address/provinces`);
      return response.data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách quận/huyện theo tỉnh/thành phố
   * @param {string|number} provinceId - ID tỉnh/thành phố
   * @returns {Promise} Danh sách quận/huyện
   */
  getDistricts: async (provinceId) => {
    try {
      const response = await axios.get(
        `${BaseUrl}/address/districts?province_id=${provinceId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phường/xã theo quận/huyện
   * @param {string|number} districtId - ID quận/huyện
   * @returns {Promise} Danh sách phường/xã
   */
  getWards: async (districtId) => {
    try {
      const response = await axios.get(
        `${BaseUrl}/address/wards?district_id=${districtId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw error;
    }
  },

  /**
   * Áp dụng mã giảm giá
   * @param {string} discountCode - Mã giảm giá
   * @param {number} total - Tổng tiền
   * @returns {Promise} Thông tin giảm giá
   */
  applyDiscountCode: async (discountCode, total) => {
    try {
      const response = await axios.post(`${BaseUrl}/discounts/apply`, {
        code: discountCode,
        total: total,
      });
      return response.data;
    } catch (error) {
      console.error("Error applying discount code:", error);
      throw error;
    }
  },

  /**
   * Xác nhận thanh toán (sau khi đã tạo đơn hàng)
   * @param {string|number} orderId - ID đơn hàng
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @returns {Promise} Kết quả thanh toán
   */
  confirmPayment: async (orderId, paymentData) => {
    try {
      const response = await axios.post(
        `${BaseUrl}/orders/${orderId}/payment`,
        paymentData
      );
      return response.data;
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  },
};

export default CheckoutAPI;

