import React, { useState, useEffect, use } from 'react';
import { useNavigate, Link, redirect } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Filter/Breadcrumb';
import CheckoutAPI from '../service/CheckoutAPI';
import { validateCheckoutForm, formatOrderData } from '../utils/checkoutValidation';
import '../styles/pages/Checkout.scss';
import { useTranslation } from 'react-i18next';
const Checkout = () => {
    
    const { cart, totalPrice,userId ,setCartCount} = useCart();
    console.log('cart in checkout', cart);
         console.log('use', userId);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const language = i18n.language;
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
            // setDistricts([]);
            // setWards([]);
        }
    }, [formData.province]);

    // Load wards when district changes
    useEffect(() => {
        if (formData.district) {
            loadWards(formData.district);

            setFormData(prev => ({ ...prev, ward: '' }));
            // setWards([]);
        }
    }, [formData.district]);

    // Load provinces from API
    const loadProvinces = async () => {
        try {
            setIsLoadingAddress(true);

            const data = await CheckoutAPI.getProvinces();
            console.log("log tỉnh", data);

            setProvinces(data.data);

        } catch (error) {
            console.error('Error loading provinces:', error);
            setError(t('checkout.loadProvincesError'));
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // Load districts from API
    const loadDistricts = async (provinceId) => {
        try {
            setIsLoadingAddress(true);
            // TODO: Uncomment khi API sẵn sàng
            const data = await CheckoutAPI.getDistricts(provinceId);
            setDistricts(data.data);
            // Tạm thời dùng dummy data
            // setDistricts(data
            //              );
        } catch (error) {
            console.error('Error loading districts:', error);
            setError(t('checkout.loadDistrictsError'));
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // Load wards from API
    const loadWards = async (districtId) => {
        try {
            setIsLoadingAddress(true);
            // TODO: Uncomment khi API sẵn sàng
            const data = await CheckoutAPI.getWards(districtId);
            setWards(data.data);

        } catch (error) {
            console.error('Error loading wards:', error);
            setError(t('checkout.loadWardsError'));
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const formatPrice = (price) => {
        const locale = language === 'vi' ? 'vi-VN' : 'en-US';
        const currencyString = price.toLocaleString(locale, { style: 'currency', currency: 'VND' });
        if (language === 'vi') {
            return currencyString
                .replace('₫', '')
                .replace(/\s/g, '')
                .replace(/\u00A0/g, '') + ' VNĐ';
        }
        return currencyString;
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
            setError(t('checkout.discountErrorEmpty'));
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
                message: t('checkout.discountSuccess')
            });
            setError(null);
        } catch (error) {
            console.error('Error applying discount:', error);
            setError(error.response?.data?.message || t('checkout.discountErrorInvalid'));
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
            setError(t('checkout.agreeTermsError'));
            return;
        }

        // Validate form
        const validation = validateCheckoutForm(formData);
        if (!validation.isValid) {
            setFormErrors(validation.errors);
            setError(t('checkout.formError'));
            return;
        }

        try {
            setIsLoading(true);

            // Calculate totals
            const subtotal = cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
            const discountAmount = discountApplied?.discount || 0;
            const shippingFee = 0;
            const total = subtotal - discountAmount + shippingFee;
       
            // --- LOGIC MỚI: TÌM TÊN ĐỊA CHỈ TỪ ID ---
            const provinceName = provinces.find(p => p.id === formData.province)?.name || '';
            const districtName = districts.find(d => d.id === formData.district)?.name || '';
            const wardName = wards.find(w => w.id === formData.ward)?.name || '';

            // Tạo object formData mới với tên địa chỉ thay vì ID
            const formDataWithNames = {
                ...formData,
                province: provinceName,
                district: districtName,
                ward: wardName
            };
            // ----------------------------------------

            // Format order data (Sử dụng formDataWithNames)
            const orderData = formatOrderData(
                formDataWithNames, // Truyền object đã sửa tên vào đây
                cart,
                paymentMethod,
                discountCode,
                total,
                userId,
            );

            console.log('Order data to send:', orderData);

            const result = await CheckoutAPI.createOrder(orderData);
            console.log('Order creation result:', result);
            if(result){
                navigate('/');
                 localStorage.setItem("cart", "");
            setCartCount(0);
            }
             
            //   navigate
            // ... (Phần code gọi API giữ nguyên)
            // const result = {
            //     orderId: 'ORD-' + Date.now(),
            //     message: t('checkout.orderSuccessMessage')
            // };

            // if (paymentMethod === 'bank') {
            //     // await CheckoutAPI.confirmPayment(result.orderId, { method: 'bank' });
            // }

            // alert(t('checkout.orderSuccessAlert', { orderId: result.orderId }));
          

        } catch (error) {
            console.error('Error creating order:', error);
            setError(error.response?.data?.message || t('checkout.orderError'));
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
            <Breadcrumb otherSlugName={t('checkout.breadcrumb')} />
            <div className="container">
                <h1 className="checkout-title">{t('checkout.title')}</h1>
                
                <div className="checkout-content">
                    {/* Bên trái: Thông tin hóa đơn */}
                    <div className="checkout-section billing-info">
                        <h2 className="section-title">{t('checkout.billingInfo')}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="fullName">
                                    {t('checkout.fullName')}<span className="required">*</span>
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
                                    {t('checkout.email')}<span className="required">*</span>
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
                                    {t('checkout.phone')}<span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder={t('checkout.phonePlaceholder')}
                                    className={formErrors.phone ? 'error' : ''}
                                    required
                                />
                                {formErrors.phone && (
                                    <span className="error-message">{formErrors.phone}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">
                                    {t('checkout.address')}<span className="required">*</span>
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
                                        {t('checkout.province')}<span className="required">*</span>
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
                                        <option value="">{t('checkout.provincePlaceholder')}</option>
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
                                        {t('checkout.district')}<span className="required">*</span>
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
                                        <option value="">{t('checkout.districtPlaceholder')}</option>
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
                                    {t('checkout.ward')}<span className="required">*</span>
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
                                    <option value="">{t('checkout.wardPlaceholder')}</option>
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
                                <label htmlFor="notes">{t('checkout.orderNotes')}</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder={t('checkout.orderNotesPlaceholder')}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Giữa: Phương thức thanh toán */}
                    <div className="checkout-section payment-method">
                        <h2 className="section-title">{t('checkout.paymentMethod')}</h2>
                        
                        <div className="payment-option">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>{t('checkout.paymentCod')}</span>
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
                                <span>{t('checkout.paymentBank')}</span>
                            </label>

                            {paymentMethod === 'bank' && (
                                <div className="bank-info">
                                    <p><strong>{t('checkout.bankCompanyNameLabel')}</strong> {t('checkout.bankCompanyName')}</p>
                                    <p><strong>{t('checkout.bankAccountNumberLabel')}</strong> {t('checkout.bankAccountNumber')}</p>
                                    <p><strong>{t('checkout.bankNameLabel')}</strong> {t('checkout.bankName')}</p>
                                    <p><strong>{t('checkout.bankTransferContentLabel')}</strong> {t('checkout.bankTransferContent')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bên phải: Thông tin giỏ hàng */}
                    <div className="checkout-section cart-info">
                        <h2 className="section-title">{t('checkout.cartInfo')}</h2>
                        
                        <div className="cart-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('checkout.productNameColumn')}</th>
                                        <th>{t('checkout.quantityColumn')}</th>
                                        <th>{t('checkout.priceColumn')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Link to={`/product/${item.id}`} className="product-link">
                                                    {item?.translations[language].name}
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
                                <span>{t('checkout.subtotal')}</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            {discountApplied && (
                                <div className="summary-row discount">
                                    <span>{t('checkout.discount')}</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            <div className="summary-row">
                                <span>{t('checkout.shippingFee')}</span>
                                <span>{formatPrice(shippingFee)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>{t('checkout.total')}</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>

                        <div className="discount-section">
                            <label htmlFor="discountCode">{t('checkout.discountCodeLabel')}</label>
                            <div className="discount-input-group">
                                <input
                                    type="text"
                                    id="discountCode"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    placeholder={t('checkout.discountCodePlaceholder')}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="apply-btn"
                                    onClick={handleApplyDiscount}
                                    disabled={isLoading || !discountCode.trim()}
                                >
                                    {isLoading ? t('checkout.applying') : t('checkout.applyDiscount')}
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
                                {t('checkout.continueShopping')}
                            </Link>
                            <button
                                type="button"
                                className="btn-checkout"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? t('checkout.applying') : t('checkout.proceedToCheckout')}
                            </button>
                        </div>

                        <div className="terms-checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                />
                                <span>{t('checkout.agreeTerms')}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

