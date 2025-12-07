import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Filter/Breadcrumb';
import CheckoutAPI from '../service/CheckoutAPI';
import { validateCheckoutForm, formatOrderData } from '../utils/checkoutValidation';
import '../styles/pages/Checkout.scss';

const Checkout = () => {
    const { cart, totalPrice } = useCart();
    const navigate = useNavigate();
    
    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        notes: ''
    });

    // UI state
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(null);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    
    // Loading & Error states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [error, setError] = useState(null);
    
    // Address data from API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Load provinces on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        // TODO: Uncomment khi muốn check giỏ hàng trống
        // if (cart.length === 0) {
        //     navigate('/cart');
        //     return;
        // }
        
        // Load provinces từ API
        loadProvinces();
    }, [cart, navigate]);

    // Load districts when province changes
    useEffect(() => {
        if (formData.province) {
            loadDistricts(formData.province);
            // Reset district and ward when province changes
            setFormData(prev => ({ ...prev, district: '', ward: '' }));
            setDistricts([]);
            setWards([]);
        }
    }, [formData.province]);

    // Load wards when district changes
    useEffect(() => {
        if (formData.district) {
            loadWards(formData.district);
            // Reset ward when district changes
            setFormData(prev => ({ ...prev, ward: '' }));
            setWards([]);
        }
    }, [formData.district]);

    // Load provinces from API
    const loadProvinces = async () => {
        try {
            setIsLoadingAddress(true);
            // TODO: Uncomment khi API sẵn sàng
            // const data = await CheckoutAPI.getProvinces();
            // setProvinces(data);
            
            // Tạm thời dùng dummy data
            setProvinces([
                { id: 1, name: 'Hà Nội' },
                { id: 2, name: 'Hồ Chí Minh' },
                { id: 3, name: 'Đà Nẵng' },
                { id: 4, name: 'Hải Phòng' },
                { id: 5, name: 'Cần Thơ' }
            ]);
        } catch (error) {
            console.error('Error loading provinces:', error);
            setError('Không thể tải danh sách tỉnh/thành phố');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // Load districts from API
    const loadDistricts = async (provinceId) => {
        try {
            setIsLoadingAddress(true);
            // TODO: Uncomment khi API sẵn sàng
            // const data = await CheckoutAPI.getDistricts(provinceId);
            // setDistricts(data);
            
            // Tạm thời dùng dummy data
            setDistricts([
                { id: 1, name: 'Quận 1' },
                { id: 2, name: 'Quận 2' },
                { id: 3, name: 'Quận 3' },
                { id: 4, name: 'Quận 4' },
                { id: 5, name: 'Quận 5' }
            ]);
        } catch (error) {
            console.error('Error loading districts:', error);
            setError('Không thể tải danh sách quận/huyện');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // Load wards from API
    const loadWards = async (districtId) => {
        try {
            setIsLoadingAddress(true);
            // TODO: Uncomment khi API sẵn sàng
            // const data = await CheckoutAPI.getWards(districtId);
            // setWards(data);
            
            // Tạm thời dùng dummy data
            setWards([
                { id: 1, name: 'Phường 1' },
                { id: 2, name: 'Phường 2' },
                { id: 3, name: 'Phường 3' },
                { id: 4, name: 'Phường 4' },
                { id: 5, name: 'Phường 5' }
            ]);
        } catch (error) {
            console.error('Error loading wards:', error);
            setError('Không thể tải danh sách phường/xã');
        } finally {
            setIsLoadingAddress(false);
        }
    };

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
        // Clear error khi user nhập lại
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Apply discount code
    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            setError('Vui lòng nhập mã giảm giá');
            return;
        }

        try {
            setIsLoading(true);
            const subtotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
            
            // TODO: Uncomment khi API sẵn sàng
            // const result = await CheckoutAPI.applyDiscountCode(discountCode, subtotal);
            // setDiscountApplied(result);
            
            // Tạm thời: Mock response
            setDiscountApplied({
                discount: 100000,
                message: 'Áp dụng mã giảm giá thành công'
            });
            setError(null);
        } catch (error) {
            console.error('Error applying discount:', error);
            setError(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
            setDiscountApplied(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Submit order
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate terms
        if (!agreeTerms) {
            setError('Vui lòng đồng ý với điều kiện và chính sách giao hàng');
            return;
        }

        // Validate form
        const validation = validateCheckoutForm(formData);
        if (!validation.isValid) {
            setFormErrors(validation.errors);
            setError('Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }

        try {
            setIsLoading(true);
            
            // Calculate totals
            const subtotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
            const discountAmount = discountApplied?.discount || 0;
            const shippingFee = 0;
            const total = subtotal - discountAmount + shippingFee;

            // Format order data
            const orderData = formatOrderData(
                formData,
                cart,
                paymentMethod,
                discountCode,
                total
            );

            // TODO: Uncomment khi API sẵn sàng
            // const result = await CheckoutAPI.createOrder(orderData);
            
            // Tạm thời: Mock response
            console.log('Order data to send:', orderData);
            const result = {
                orderId: 'ORD-' + Date.now(),
                message: 'Đặt hàng thành công!'
            };

            // Nếu là chuyển khoản, có thể cần xác nhận thanh toán
            if (paymentMethod === 'bank') {
                // TODO: Uncomment khi API sẵn sàng
                // await CheckoutAPI.confirmPayment(result.orderId, { method: 'bank' });
            }

            // Redirect to success page hoặc hiển thị thông báo
            alert(`Đặt hàng thành công! Mã đơn hàng: ${result.orderId}`);
            
            // Clear cart và redirect
            // navigate('/order-success', { state: { orderId: result.orderId } });
            
        } catch (error) {
            console.error('Error creating order:', error);
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
    const discountAmount = discountApplied?.discount || 0;
    const shippingFee = 0;
    const total = subtotal - discountAmount + shippingFee;

    return (
        <div className="checkout-page">
            <Breadcrumb otherSlugName="Thanh toán" />
            <div className="container">
                <h1 className="checkout-title">THANH TOÁN</h1>
                
                <div className="checkout-content">
                    {/* Bên trái: Thông tin hóa đơn */}
                    <div className="checkout-section billing-info">
                        <h2 className="section-title">Thông tin hóa đơn</h2>
                        <form onSubmit={handleSubmit}>
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
                                    className={formErrors.fullName ? 'error' : ''}
                                    required
                                />
                                {formErrors.fullName && (
                                    <span className="error-message">{formErrors.fullName}</span>
                                )}
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
                                    className={formErrors.email ? 'error' : ''}
                                    required
                                />
                                {formErrors.email && (
                                    <span className="error-message">{formErrors.email}</span>
                                )}
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
                                    className={formErrors.phone ? 'error' : ''}
                                    required
                                />
                                {formErrors.phone && (
                                    <span className="error-message">{formErrors.phone}</span>
                                )}
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
                                    className={formErrors.address ? 'error' : ''}
                                    required
                                />
                                {formErrors.address && (
                                    <span className="error-message">{formErrors.address}</span>
                                )}
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
                                        className={formErrors.province ? 'error' : ''}
                                        disabled={isLoadingAddress}
                                        required
                                    >
                                        <option value="">Chọn Tỉnh/ thành phố</option>
                                        {provinces.map((province) => (
                                            <option key={province.id} value={province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.province && (
                                        <span className="error-message">{formErrors.province}</span>
                                    )}
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
                                        className={formErrors.district ? 'error' : ''}
                                        disabled={!formData.province || isLoadingAddress}
                                        required
                                    >
                                        <option value="">Chọn Quận/ Huyện</option>
                                        {districts.map((district) => (
                                            <option key={district.id} value={district.id}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.district && (
                                        <span className="error-message">{formErrors.district}</span>
                                    )}
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
                                    className={formErrors.ward ? 'error' : ''}
                                    disabled={!formData.district || isLoadingAddress}
                                    required
                                >
                                    <option value="">Chọn Phường/ Xã</option>
                                    {wards.map((ward) => (
                                        <option key={ward.id} value={ward.id}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.ward && (
                                    <span className="error-message">{formErrors.ward}</span>
                                )}
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
                        <h2 className="section-title">Phương thức thanh toán</h2>
                        
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
                            
                            {paymentMethod === 'bank' && (
                                <div className="bank-info">
                                    <p><strong>Tên công ty:</strong> Công Ty TNHH Thể Thao Thung Lũng Mặt Trời</p>
                                    <p><strong>Số tài khoản:</strong> 116600115858</p>
                                    <p><strong>Ngân hàng:</strong> Ngân hàng TMCP Công Thương Việt Nam (Viettinbank)</p>
                                    <p><strong>Nội dung chuyển khoản:</strong> Số Điện Thoại + Sản Phẩm Mua</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bên phải: Thông tin giỏ hàng */}
                    <div className="checkout-section cart-info">
                        <h2 className="section-title">Thông tin giỏ hàng</h2>
                        
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
                                    {cart.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <Link to={`/product/${item.id}`} className="product-link">
                                                    {item.name}
                                                </Link>
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
                            {discountApplied && (
                                <div className="summary-row discount">
                                    <span>Giảm giá:</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}
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
                                    disabled={isLoading}
                                />
                                <button 
                                    type="button" 
                                    className="apply-btn"
                                    onClick={handleApplyDiscount}
                                    disabled={isLoading || !discountCode.trim()}
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Áp dụng'}
                                </button>
                            </div>
                            {discountApplied && (
                                <p className="discount-success">{discountApplied.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="error-alert">
                                {error}
                            </div>
                        )}

                        <div className="checkout-actions">
                            <Link to="/cart" className="btn-continue" onClick={(e) => isLoading && e.preventDefault()}>
                                Tiếp tục mua hàng
                            </Link>
                            <button 
                                type="button" 
                                className="btn-checkout"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                            </button>
                        </div>

                        <div className="terms-checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                />
                                <span>Tôi đồng ý với điều kiện và chính sách giao hàng của website</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

