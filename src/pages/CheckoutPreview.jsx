import React, { useState } from 'react';
import '../styles/pages/Checkout.scss';

const CheckoutPreview = () => {
    // Mock data để preview
    const [formData, setFormData] = useState({
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0912345678',
        address: '123 Đường ABC',
        province: '1',
        district: '1',
        ward: '1',
        notes: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [discountCode, setDiscountCode] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    // Mock cart data
    const mockCart = [
        {
            id: 1,
            name: 'Bộ Quần Áo Ba Môn Nữ Zoot Women\'s Ltd Tri Aero Fz Racesuit - Bella - M',
            price: 6990000,
            quantity: 1,
            image: 'https://via.placeholder.com/150'
        }
    ];

    const provinces = [
        { id: 1, name: 'Hà Nội' },
        { id: 2, name: 'Hồ Chí Minh' },
        { id: 3, name: 'Đà Nẵng' }
    ];

    const districts = [
        { id: 1, name: 'Quận 1' },
        { id: 2, name: 'Quận 2' },
        { id: 3, name: 'Quận 3' }
    ];

    const wards = [
        { id: 1, name: 'Phường 1' },
        { id: 2, name: 'Phường 2' },
        { id: 3, name: 'Phường 3' }
    ];

    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
            .replace('₫', '')
            .replace(/\s/g, '')
            .replace(/\u00A0/g, '') + ' VNĐ';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const subtotal = mockCart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
    const shippingFee = 0;
    const total = subtotal + shippingFee;

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="checkout-title">THANH TOÁN</h1>
                
                <div className="checkout-content">
                    {/* Bên trái: Thông tin hóa đơn */}
                    <div className="checkout-section billing-info">
                        <h2 className="section-title">
                            <span className="section-number">1</span>
                            Thông tin hóa đơn
                        </h2>
                        <form>
                            <div className="form-group">
                                <label htmlFor="fullName">
                                    Họ và tên<span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    Email<span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    Điện thoại<span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Số điện thoại"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">
                                    Địa chỉ<span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group form-group-half">
                                    <label htmlFor="province">
                                        Tỉnh/ Thành phố<span className="required">*</span>
                                    </label>
                                    <select
                                        id="province"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Chọn Tỉnh/ thành phố</option>
                                        {provinces.map((province) => (
                                            <option key={province.id} value={province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group form-group-half">
                                    <label htmlFor="district">
                                        Quận/ Huyện<span className="required">*</span>
                                    </label>
                                    <select
                                        id="district"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Chọn Quận/ Huyện</option>
                                        {districts.map((district) => (
                                            <option key={district.id} value={district.id}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="ward">
                                    Phường/ Xã<span className="required">*</span>
                                </label>
                                <select
                                    id="ward"
                                    name="ward"
                                    value={formData.ward}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Chọn Phường/ Xã</option>
                                    {wards.map((ward) => (
                                        <option key={ward.id} value={ward.id}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Ghi chú đơn hàng</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Giữa: Phương thức thanh toán */}
                    <div className="checkout-section payment-method">
                        <h2 className="section-title">
                            <span className="section-number">2</span>
                            Phương thức thanh toán
                        </h2>
                        
                        <div className="payment-option">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>Thanh toán tiền mặt khi nhận hàng (COD)</span>
                            </label>
                        </div>

                        <div className="payment-option">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="bank"
                                    checked={paymentMethod === 'bank'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>Chuyển khoản qua ngân hàng</span>
                            </label>
                            
                            <div className="bank-info">
                                <p><strong>Công Ty TNHH Thể Thao Thung Lũng Mặt Trời</strong></p>
                                <p><strong>Tài khoản số:</strong> 116600115858</p>
                                <p><strong>Ngân hàng TMCP Công Thương Việt Nam (Viettinbank)</strong></p>
                                <p><strong>Nội dung thanh toán:</strong> Số Điện Thoại + Sản Phẩm Mua</p>
                            </div>
                        </div>
                    </div>

                    {/* Bên phải: Thông tin giỏ hàng */}
                    <div className="checkout-section cart-info">
                        <h2 className="section-title">
                            <span className="section-number">3</span>
                            Thông tin giỏ hàng
                        </h2>
                        
                        <div className="cart-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tên sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockCart.map((item) => (
                                        <tr key={item.id}>
                                            <td className="product-link">
                                                {item.name}
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{formatPrice(Number(item.price) * Number(item.quantity))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí vận chuyển:</span>
                                <span>{formatPrice(shippingFee)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Tổng cộng:</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>

                        <div className="discount-section">
                            <label htmlFor="discountCode">Nhập mã ưu đãi</label>
                            <div className="discount-input-group">
                                <input
                                    type="text"
                                    id="discountCode"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    placeholder="Nhập vào nếu có"
                                />
                                <button type="button" className="apply-btn">Áp dụng</button>
                            </div>
                        </div>

                        <div className="checkout-actions">
                            <button className="btn-continue">
                                Tiếp tục mua hàng
                            </button>
                            <button className="btn-checkout">
                                Tiến hành thanh toán
                            </button>
                        </div>

                        <div className="terms-checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                />
                                <span>
                                    Tôi đồng ý với <a href="#" className="terms-link">điều kiện</a> và <a href="#" className="terms-link">chính sách giao hàng</a> của website
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPreview;

