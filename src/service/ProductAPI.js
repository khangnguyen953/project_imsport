import axios from "axios"
import BaseUrl from "./BaseUrl";

const ProductAPI = {
    getProducts: async () => {
        const response = await axios.get(`${BaseUrl}/products`)
        return response.data
    },
    getProductDetail: async (id) => {
        try {
            const response = await axios.get(`${BaseUrl}/products/${id}`)
            return response.data
        } catch (error) {
            console.log("error", error);
            return null;
        }
    },
    createProduct: async (data) => {
        const response = await axios.post(`${BaseUrl}/products`, data)
        return response.data
    },
    updateProduct: async (id, data) => {
        const response = await axios.put(`${BaseUrl}/products/${id}`, data)
        return response.data
    },
    deleteProduct: async (id) => {
        const response = await axios.delete(`${BaseUrl}/products/${id}`)
        return response.data
    },
    getCategories: async () => {
        const response = await axios.get(`${BaseUrl}/categories`)
        return response.data
    },
}

export default ProductAPI