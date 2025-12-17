import axios from "axios"

import BaseUrl from "./BaseUrl";

const CategoryAPI={
    getCategory : async () =>{
        const respose = await axios.get(`${BaseUrl}/categories`)
        return respose.data
    },
    createCategory: async (payload) => {
        const response = await axios.post(`${BaseUrl}/categories`, payload);
        return response.data;
    },
    updateCategory: async (id, payload) => {
        const response = await axios.put(`${BaseUrl}/categories/${id}`, payload);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await axios.delete(`${BaseUrl}/categories/${id}`);
        return response.data;
    }
}
export default CategoryAPI;