import axios from "axios"

import BaseUrl from "./BaseUrl";

const AuthAPI={
    login : async (data) =>{
        try {
            const respose = await axios.post(`${BaseUrl}/login`, data)
            console.log('respose', respose.message);
            return respose.data
        } catch (error) {
            console.log('error', error.response);
            // Xử lý các trường hợp lỗi khác nhau
            if (error.response) {
                // Server trả về lỗi với status code
                return {
                    data: null,
                    error: error.response.data?.message || error.response.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
                    status: error.response.status
                };
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                return {
                    data: null,
                    error: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
                    status: null
                };
            } else {
                // Lỗi khác
                return {
                    data: null,
                    error: 'Có lỗi xảy ra. Vui lòng thử lại.',
                    status: null
                };
            }
        }
    },
    register : async (data) =>{
        try {
            const respose = await axios.post(`${BaseUrl}/register`, data)
            console.log('respose', respose.message);
            return respose.data
        } catch (error) {
            console.log('error', error.response);
            // Xử lý các trường hợp lỗi khác nhau
            if (error.response) {
                // Server trả về lỗi với status code
                return {
                    data: null,
                    error: error.response.data?.message || error.response.data?.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
                    status: error.response.status
                };
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                return {
                    data: null,
                    error: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
                    status: null
                };
            } else {
                // Lỗi khác
                return {
                    data: null,
                    error: 'Có lỗi xảy ra. Vui lòng thử lại.',
                    status: null
                };
            }
        }
    }
}
export default AuthAPI;