import axios from "axios";
import BaseUrl from "./BaseUrl";

const CategoryTypeAPI={
    getCategoryType : async () =>{
        const respose = await axios.get(`${BaseUrl}/category-types`)
        return respose.data
    }
}
export default CategoryTypeAPI;