import React, { useState, useMemo, useEffect } from 'react';
import CheckoutAPI from '../service/CheckoutAPI';
import Breadcrumb from './Filter/Breadcrumb';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

// --- UTILS ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
};

// --- COMPONENT MODAL ADMIN (Xem & Sửa) ---
const AdminOrderModal = ({ order, onClose, onUpdateSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);

    // State quản lý dữ liệu form
    const [formData, setFormData] = useState({
        status: order.status || 'pending', // Giả sử có trường status
        full_name: order.customer_info?.full_name || '',
        phone: order.customer_info?.phone || '',
        address: order.customer_info?.address || '',
        notes: order.notes || ''
    });

    const items = order.items || [];

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý lưu thay đổi
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Gọi API cập nhật (Cần bổ sung hàm này trong CheckoutAPI)
            // Ví dụ: await CheckoutAPI.updateOrder(order.id, formData);
            console.log("Dữ liệu cập nhật:", { id: order.id || order.order_id, ...formData });
            const responseData = await CheckoutAPI.updateOrder(order.id || order.order_id, formData);
            if (responseData) {
                alert("Cập nhật đơn hàng thành công!");
                onUpdateSuccess(); // Refresh lại danh sách bên ngoài
                onClose();
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Cập nhật thất bại!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Quản lý đơn hàng #{order.order_id || order.id}</h2>
                        <p className="text-sm text-gray-500">Ngày tạo: {formatDate(order.created_at)}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-3xl font-bold">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Cột trái: Form chỉnh sửa thông tin */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-3">Trạng thái đơn hàng</h3>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="pending">Mới</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                            <h3 className="font-bold text-gray-800 border-b pb-2">Thông tin khách hàng</h3>

                            <div>
                                <label className="text-xs font-semibold text-gray-500">Họ tên</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500">Địa chỉ</label>
                                <textarea
                                    name="address"
                                    rows="3"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500">Ghi chú (Admin)</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1 bg-yellow-50"
                                    placeholder="Ghi chú nội bộ..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Danh sách sản phẩm (Read-only) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-bold text-gray-800">Chi tiết sản phẩm</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Size</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">SL</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                                            <td className="px-4 py-3 text-sm text-center">{item.size}</td>
                                            <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-right font-medium">
                                                {formatCurrency(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <div className="text-right space-y-1">
                                <p className="text-sm text-gray-600">Thanh toán: <span className="font-bold uppercase">{order.payment_method}</span></p>
                                <p className="text-xl font-bold text-red-600">Tổng cộng: {formatCurrency(order.total)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang lưu...
                            </>
                        ) : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---

export default function OrderAdmin() {
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useCart();
    const navigate = useNavigate();
    // Hàm tải dữ liệu (Tách ra để tái sử dụng khi update thành công)
    const fetchAdminData = async () => {
        setIsLoading(true);
        try {
            // Gọi API lấy TẤT CẢ đơn hàng (Không truyền ID)
            // Giả sử hàm này lấy toàn bộ list cho admin
            const responseData = await CheckoutAPI.getOrderAllHistory();
            console.log("Dữ liệu đơn hàng nhận về:", responseData);
            let finalOrders = [];
            if (Array.isArray(responseData)) {
                finalOrders = responseData;
            } else if (responseData.body) {
                try {
                    const parsed = typeof responseData.body === 'string' ? JSON.parse(responseData.body) : responseData.body;
                    finalOrders = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    finalOrders = [];
                }
            }

            // Sắp xếp đơn mới nhất lên đầu
            finalOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setOrders(finalOrders);
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("user", user);
        
        if(!user || user.role != 'ROLE_ADMIN') {
            navigate('/')
            return;
          }
        fetchAdminData();
    }, []);

    const filteredOrders = useMemo(() => {
        if (!orders || orders.length === 0) return [];

        return orders.filter(order => {
            const fullName = order.customer_info?.full_name?.toLowerCase() || '';
            const phone = order.customer_info?.phone || '';
            const orderId = (order.order_id || order.id || '').toString().toLowerCase();
            const term = searchTerm.toLowerCase();

            return fullName.includes(term) || orderId.includes(term) || phone.includes(term);
        });
    }, [searchTerm, orders]);

    return (
        <>

            <div className="max-w-7xl mx-auto p-6 font-sans">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
                    <button onClick={fetchAdminData} className="text-sm text-blue-600 hover:underline">Làm mới dữ liệu</button>
                </div>

                {/* Thanh tìm kiếm */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Mã đơn, Khách hàng, SĐT..."
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Danh sách đơn hàng */}
                <div className="bg-white rounded-lg shadow border overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu hệ thống...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-2 text-lg">Không tìm thấy đơn hàng nào.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.order_id || order.id} className="hover:bg-blue-50 transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-blue-600 font-bold">#{order.order_id || order.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{order.customer_info?.full_name}</div>
                                                <div className="text-sm text-gray-500">{order.customer_info?.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            order.status === 'shipping' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.status || 'Mới'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(order);
                                                }} className="text-blue-600 hover:text-blue-900">Chi tiết / Sửa</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal Admin */}
                {selectedOrder && (
                    <AdminOrderModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onUpdateSuccess={fetchAdminData}
                    />
                )}
            </div>
        </>
    );
}
