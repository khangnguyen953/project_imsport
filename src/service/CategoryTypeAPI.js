import axios from "axios";
import BaseUrl from "./BaseUrl";

const CategoryTypeAPI={
    getCategoryType : async () =>{
        try {
            const response = await axios.get(`${BaseUrl}/category-types`)
            return response.data
        } catch (error) {
            console.log('error', error.response);
            if (error.response) {
                return {
                    data: null,
                    error: error.response.data?.message || error.response.data?.error || 'Lấy loại danh mục thất bại. Vui lòng thử lại.',
                    status: error.response.status
                }
            }
        }
    },
    createCategoryType : async (payload) =>{
        try {
            const response = await axios.post(`${BaseUrl}/category-types`, payload)
            return response.data
        } catch (error) {
            console.log('error', error.response);
            if (error.response) {
                return {
                    data: null,
                    error: error.response.data?.message || error.response.data?.error || 'Tạo loại danh mục thất bại. Vui lòng thử lại.',
                    status: error.response.status
                }
            }
        }
    },
    updateCategoryType : async (id, payload) =>{
        try {
            const response = await axios.put(`${BaseUrl}/category-types/${id}`, payload)
            return response.data
        } catch (error) {
            console.log('error', error.response);
            if (error.response) {
                return {
                    data: null,
                    error: error.response.data?.message || error.response.data?.error || 'Cập nhật loại danh mục thất bại. Vui lòng thử lại.',
                    status: error.response.status
                }
            }
        }
    },
    deleteCategoryType : async (id) =>{
        try {
            const response = await axios.delete(`${BaseUrl}/category-types/${id}`)
            return response.data
        } catch (error) {
            console.log('error', error.response);
            if (error.response) {
                return {
                    data: null,
                    error: error.response.data?.message || error.response.data?.error || 'Xóa loại danh mục thất bại. Vui lòng thử lại.',
                    status: error.response.status
                }
            }
        }
    }
}
export default CategoryTypeAPI;