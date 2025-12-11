import axios from "axios"

import BaseUrl from "./BaseUrl";

const CartAPI={
    addToCart : async (data) =>{
        try {
            const respose = await axios.post(`${BaseUrl}/carts`, data)
            return respose.data
        } catch (error) {
            console.log('error', error.response);
            return {
                data: null,
                error: error.response.data?.message || error.response.data?.error || 'Thêm vào giỏ hàng thất bại. Vui lòng thử lại.',
                status: error.response.status
            };
        }
    },
    getCart : async (userId) =>{
        const respose = await axios.get(`${BaseUrl}/carts/${userId}`)
        return respose.data
    },
    updateCart : async (userId, data) =>{
        try {
            const respose = await axios.put(`${BaseUrl}/carts/${userId}`, data)
            return respose.data
        } catch (error) {
            console.log('error', error.response);
            if (error.response) {
                return {
                    data: null,
                    error: error.response.data?.message || error.response.data?.error || 'Cập nhật giỏ hàng thất bại. Vui lòng thử lại.',
                    status: error.response.status
                };
            } else if (error.request) {
                return {
                    data: null,
                    error: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
                    status: null
                };
            } else {
                return {
                    data: null,
                    error: 'Có lỗi xảy ra. Vui lòng thử lại.',
                    status: null
                };
            }
        }
    },
    removeCart : async (userId, data) =>{
        try {
            console.log('data', data);
            
            const respose = await axios.delete(`${BaseUrl}/carts/${userId}`, {data: data})
            return respose.data
        } catch (error) {
            console.log('error', error.response);
            if (error.response) {
                return {
                data: null,
                error: error.response.data?.message || error.response.data?.error || 'Xóa giỏ hàng thất bại. Vui lòng thử lại.',
                status: error.response.status
            }
        } else if (error.request) {
            return {
                data: null,
                error: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
                status: null
            };
        } else {
            return {
                data: null,
                error: 'Có lỗi xảy ra. Vui lòng thử lại.',
                status: null
            };
        }
        }
    },
    mergeCart : async (data) =>{
        try {
            const respose = await axios.post(`${BaseUrl}/carts/merge`, data)
            return {
                data: respose.data,
                error: null,
                status: respose.status
            };
        } catch (error) {
            console.log('error', error.response);
            return {
                data: null,
                error: error.response.data?.message || error.response.data?.error || 'Merge cart thất bại. Vui lòng thử lại.',
                status: error.response.status
            };
        }
    },
}
export default CartAPI;