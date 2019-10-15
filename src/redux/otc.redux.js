import axios from "../http.js";
import { c2cAjax } from "../ajax.js";

const CREATE_OTC_ACCOUNT = "CREATE_OTC_ACCOUNT"; //创建otc账户
const GET_OTC_ACCOUNT = "GET_OTC_ACCOUNT"; //获取otc账户
const UPDATE_OTC_ACCOUNT = "UPDATE_OTC_ACCOUNT"; //更新otc账户

const GET_OTC_ORDER_LIST = "GET_OTC_ORDER_LIST"; //获取otc订单列表
const SUBMIT_OTC_ORDER = "SUBMIT_OTC_ORDER"; //提交otc订单
const PAYMENT_OTC_ORDER = "PAYMENT_OTC_ORDER"; //声明otc订单已付款
const RECEIPT_OTC_ORDER = "RECEIPT_OTC_ORDER"; //确认otc订单收款
const CANCEL_OTC_ORDER = "CANCEL_OTC_ORDER"; //取消otc订单
const GET_OTC_ORDER_ITEM = "GET_OTC_ORDER_ITEM"; // 获取otc订单

const GET_REFER_PRICE = "GET_REFER_PRICE"; //获取场外交易参考价格

const SET_CURRENT_ORDER_ID = "SET_CURRENT_ORDER_ID";

const initState = {
    create_otc:"",
    otc_account: "",
    update_otc: "",
    otc_order_list: [],
    submit_otc_order: "",
    payment_otc_order: "",
    receipt_otc_order: "",
    cancle_otc_order: "",
    otc_order_item: "",
    otc_refer_price: "",
    otc_current_order_id: "",
}
export function otc(state = initState, action) {
    switch (action.type) {
        case CREATE_OTC_ACCOUNT:
            return {...state, create_otc: action.payload};
        case GET_OTC_ACCOUNT:
            return {...state, otc_account: action.payload};
        case UPDATE_OTC_ACCOUNT:
            return {...state, update_otc: action.payload};
        case GET_OTC_ORDER_LIST:
            return {...state, otc_order_list: action.payload};
        case SUBMIT_OTC_ORDER:
            return {...state, submit_otc_order: action.payload};
        case PAYMENT_OTC_ORDER:
            return {...state, payment_otc_order: action.payload};
        case RECEIPT_OTC_ORDER:
            return {...state, receipt_otc_order: action.payload};
        case CANCEL_OTC_ORDER:
            return {...state, cancle_otc_order: action.payload};
        case GET_OTC_ORDER_ITEM:
            return {...state, otc_order_item: action.payload};
        case GET_REFER_PRICE:
            return {...state, otc_refer_price: action.payload};
        case SET_CURRENT_ORDER_ID:
            return {...state, otc_current_order_id: action.payload};
        default: 
            return {...state};
    }
}

function getOtcOrder(data) {
    return {type: GET_OTC_ORDER_LIST, payload: data};
}

function getOtcAccount(data) {
    return {type: GET_OTC_ACCOUNT, payload: data};
}

function referPrice(data) {
    return {type: GET_REFER_PRICE, payload: data};
}

export function setCurrentOrderId(data) {
    return {type: SET_CURRENT_ORDER_ID, payload: data};
}


//获取订单列表
export function getOtcOrderPost(data) {
    return (dispatch, getState) => {
        return axios.post(c2cAjax.order_list + "?action=query",data).then((response) => {
            if (response && response.data && response.data.errno == "OK") {
                dispatch(getOtcOrder(response.data.data));
            }else {
                dispatch(getOtcOrder({
                    total:0,
                    otc_orders: []
                }))
            }
        },
        (err) => {
            console.log("获取订单失败了###",err);
            dispatch(getOtcOrder({
                total: 0,
                otc_orders: []
            }))
        });
    }
}

//获取指定订单
export function getOtcOrderItem(id) {
    return (dispatch,getState) => {
        return axios.get(c2cAjax.order+`?order_id=${id}`).then((response) => {
            return response;
        }, (err) =>{
            console.log("getOtcOrderItem失败了####",err);
        })
    }
}

//获取otc账户
export function getOtcAccountGet() {
    return (dispatch, getState) => {
        return axios.get(c2cAjax.account).then((response) => {
            if(response && response.data && response.data.errno == "OK") {
                dispatch(getOtcAccount(response.data.data));
            }else {
                dispatch(getOtcAccount(null));
            }
        }, (err) => {
            
        })
    }
}


//创建otc账户
export function createOtcAccount(data) {
    return (dispatch, getState) => {
        return axios.post(c2cAjax.account+"?action=create",data).then((response) => {
            return response;
        }, (err) => {

        })
    }
}

//更新otc账户(绑定银行卡，微信，支付宝 和修改绑定都掉这个接口)
export function updateOtcAccount(data) {
    return (dispatch, getState) => {
        return axios.post(c2cAjax.account + "?action=update",data).then((response) => {
            return response;
        }, (err) => {

        })
    }
}

//获取场外交易实时价格
export function getReferPrice(coin) {
    return (dispatch, getState) => {
        return axios.get(c2cAjax.refer_price+`?coin_code=${coin}`).then((response) => {
            if (response && response.data && response.data.errno == "OK") {
                dispatch(referPrice(response.data.data));
            } else {
                dispatch(referPrice(null));
            }
        }, (err) => {
            console.log("getReferPrice出错了####",err);
        });
    }
}

//提交订单
export function submitOtcOrder(data) {
    return (dispatch, getState) => {
        return axios.post(c2cAjax.order + "?action=submit",data).then((response) => {
            return response;
        }, (err) => {

        })
    }
}

//取消订单
export function cancelOtcOrder(data) {
    return (dispatch, getState) => {
        return axios.post(c2cAjax.order + "?action=cancel",data).then((response) => {
            return response;
        }, (err) => {
            console.log("cancelOtcOrder失败了###",err);
        })
    }
}

//确认付款
export function paymentOtcOrderPost(data) {
    return (dispatch, getState) => {
        return axios.post(c2cAjax.order + "?action=payment",data).then((response) => {
            return response;
        }, (err) => {
            console.log("paymentOtcOrderPost失败了###", err);
        })
    }
}

//确认收款(确认放币)
export function receiptOtcOrderPost(data) {
    return (dispatch, getState) => {
        return axios.post(c2cAjax.order + "?action=receipt", data).then((response) => {
            return response;
        }, (err) => {
            console.log("receiptOtcOrderPost失败了###", err);
        })
    }
}
