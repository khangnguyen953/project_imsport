/**
 * Validation utilities cho form checkout
 */

/**
 * Validate email
 * @param {string} email - Email cần validate
 * @returns {boolean} true nếu hợp lệ
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate số điện thoại Việt Nam
 * @param {string} phone - Số điện thoại cần validate
 * @returns {boolean} true nếu hợp lệ
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Validate form data trước khi submit
 * @param {Object} formData - Dữ liệu form
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateCheckoutForm = (formData) => {
  const errors = {};

  // Validate Họ và tên
  if (!formData.fullName || formData.fullName.trim().length < 2) {
    errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
  }

  // Validate Email
  if (!formData.email) {
    errors.email = "Email là bắt buộc";
  } else if (!validateEmail(formData.email)) {
    errors.email = "Email không hợp lệ";
  }

  // Validate Số điện thoại
  if (!formData.phone) {
    errors.phone = "Số điện thoại là bắt buộc";
  } else if (!validatePhone(formData.phone)) {
    errors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
  }

  // Validate Địa chỉ
  if (!formData.address || formData.address.trim().length < 5) {
    errors.address = "Địa chỉ phải có ít nhất 5 ký tự";
  }

  // Validate Tỉnh/Thành phố
  if (!formData.province) {
    errors.province = "Vui lòng chọn Tỉnh/Thành phố";
  }

  // Validate Quận/Huyện
  if (!formData.district) {
    errors.district = "Vui lòng chọn Quận/Huyện";
  }

  // Validate Phường/Xã
  if (!formData.ward) {
    errors.ward = "Vui lòng chọn Phường/Xã";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format dữ liệu đơn hàng trước khi gửi API
 * @param {Object} formData - Dữ liệu form
 * @param {Array} cartItems - Danh sách sản phẩm
 * @param {string} paymentMethod - Phương thức thanh toán
 * @param {string} discountCode - Mã giảm giá
 * @param {number} total - Tổng tiền
 * @returns {Object} Dữ liệu đã format
 */
export const formatOrderData = (
  formData,
  cartItems,
  paymentMethod,
  discountCode,
  total,
  userId
) => {
  return {
    customer_info: {
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      province: formData.province,
      district: formData.district,
      ward: formData.ward,
    },
    items: cartItems.map((item) => ({
      product_id: item.id,
      name: item.name,
      image: item.image || null,
      price: Number(item.price),
      quantity: Number(item.quantity),
      size: item.selectedSize || null,
      sku:  item.sku || null,
    })),
    payment_method: paymentMethod,
    discount_code: discountCode || null,
    total: total,
    notes: formData.notes?.trim() || null,
    user_id: userId || null,
    created_at: new Date().toISOString(),
  };
};

