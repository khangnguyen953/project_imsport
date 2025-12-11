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
    updateCart : async (id, data) =>{
        const respose = await axios.put(`${BaseUrl}/carts/${id}`, data)
        return respose.data
    },
}
export default CartAPI;