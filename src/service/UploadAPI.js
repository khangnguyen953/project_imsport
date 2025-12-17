import axios from "axios";
import BaseUrl from "./BaseUrl";

// TODO: Cập nhật lại endpoint này cho đúng với Lambda của bạn
// Ví dụ backend có route POST /uploads/presign để trả về presigned URL
const PRESIGN_ENDPOINT = `${BaseUrl}/upload/presign`;

const UploadAPI = {
  /**
   * Gửi thông tin file lên Lambda/API để lấy presigned URL
   * Backend nên trả về dạng: { uploadUrl, fileUrl }
   */
  getPresignedUrl: async (fileName, contentType) => {
    const response = await axios.post(PRESIGN_ENDPOINT, {
      fileName: fileName,
      contentType: contentType,
    });
    return response.data;
  },
};

export default UploadAPI;
