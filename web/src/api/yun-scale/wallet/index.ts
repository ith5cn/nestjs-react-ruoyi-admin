import request from "@/utils/request";

export const getBalance = () => {
    return request.get('/yun-sale/wallet/balance');
}