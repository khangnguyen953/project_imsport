import React, { useState, useMemo, useEffect } from 'react';
import CheckoutAPI from '../service/CheckoutAPI';
import { useCart } from '../context/CartContext';
import Breadcrumb from './Filter/Breadcrumb';

// --- UTILS ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('vi-VN');
};

// --- COMPONENT MODAL (Giữ nguyên) ---
const OrderModal = ({ order, onClose }) => {
  if (!order) return null;
  const customer = order.customer_info || {};
  const items = order.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{order.order_id || order.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl font-bold">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Thông tin khách hàng</h3>
              <p><span className="font-medium">Họ tên:</span> {customer.full_name}</p>
              <p><span className="font-medium">SĐT:</span> {customer.phone}</p>
              <p><span className="font-medium">Email:</span> {customer.email}</p>
              <p><span className="font-medium">Địa chỉ:</span> {customer.address}, {customer.ward}, {customer.district}, {customer.province}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Thông tin đơn hàng</h3>
              <p><span className="font-medium">Ngày đặt:</span> {formatDate(order.created_at)}</p>
              <p><span className="font-medium">Thanh toán:</span> <span className="uppercase">{order.payment_method}</span></p>
              <p><span className="font-medium">Ghi chú:</span> {order.notes || "Không có"}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Sản phẩm đã đặt</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">SL</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">{item.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">{item.size}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end border-t pt-4">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between text-xl font-bold text-red-600">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-right rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">Đóng</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---

export default function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { userId } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Hàm xử lý logic call API
    const fetchData = async () => {
      // LOGIC MỚI:
      // Nếu KHÔNG CÓ userId (Khách vãng lai) VÀ nhập chưa đủ 10 ký tự => Không làm gì cả
      if (!userId && searchTerm.trim().length < 10) {
        setOrders([]); // Xóa danh sách cũ nếu có
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let responseData = "";
        
        // Gọi API
        if (!userId) {
          // Trường hợp khách vãng lai: Gọi API lấy tất cả (hoặc API search nếu có)
          responseData = await CheckoutAPI.getOrderAllHistory();
        } else {
          // Trường hợp user đăng nhập: Gọi API theo UserID
          responseData = await CheckoutAPI.getOrderAllHistoryByUser(userId);
        }

        let finalOrders = [];
        // Xử lý dữ liệu trả về
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

        // Sắp xếp
        finalOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(finalOrders);

      } catch (error) {
        console.error("Lỗi lấy lịch sử đơn hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Sử dụng debounce (trì hoãn) để không gọi API liên tục khi đang gõ
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 800); // Đợi 800ms sau khi ngừng gõ mới chạy

    // Cleanup function
    return () => clearTimeout(delayDebounceFn);

  }, [userId, searchTerm]); // Chạy lại khi userId hoặc searchTerm thay đổi

  // Lọc dữ liệu hiển thị (Client-side filtering)
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
      <Breadcrumb otherSlugName="Lịch sử đơn hàng" />
      <div className="max-w-5xl mx-auto p-6 font-sans">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Lịch sử đơn hàng</h1>

        {/* Thanh tìm kiếm */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder={userId ? "Tìm theo Mã đơn, Tên khách, hoặc SĐT..." : "Nhập số điện thoại (10 số) để tra cứu..."}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {/* Gợi ý cho người dùng nếu chưa nhập đủ */}
          {!userId && searchTerm.length > 0 && searchTerm.length < 10 && (
             <p className="text-sm text-red-500 mt-2 ml-2">* Vui lòng nhập đủ số điện thoại (ít nhất 10 ký tự) để tìm kiếm.</p>
          )}
        </div>

        {/* Danh sách đơn hàng */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
              {!userId && searchTerm.length < 10 
                ? "Vui lòng nhập Số điện thoại để tra cứu lịch sử đơn hàng." 
                : "Không tìm thấy đơn hàng phù hợp."}
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <div
                key={order.order_id || order.id || index}
                onClick={() => setSelectedOrder(order)}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-blue-600 group-hover:text-blue-700">#{order.order_id || order.id}</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Thành công</span>
                  </div>
                  <div className="text-gray-800 font-medium">
                    <span className="text-gray-500 font-normal">Khách hàng:</span> {order.customer_info?.full_name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="text-gray-500">SĐT:</span> {order.customer_info?.phone}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{formatDate(order.created_at)}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">{order.items ? order.items.length : 0} sản phẩm</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(order.total)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </>
  );
}