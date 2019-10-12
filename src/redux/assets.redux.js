import axios from "../http.js";
import { assetsAjax, exchangeAjax } from "../ajax.js";

const PROPETY_INFO = "GET_PROPETYINFO";
const SETTLES_LIST = "SETTLES_LIST"; //充值记录
const RECHARGE_ADDRESS = "RECHARGE_ADDRESS"; //充值地址
const SUBMIT_DRAWING = "SUBMIT_DRAWING";
const RECHARGE_AMOUNT = "RECHARGE_AMOUNT"; //充值时对deposit_style为2的币 手动请求
const ASSET_OPEN_ORDERS = "ASSET_OPEN_ORDERS";
const ASSET_ORDER_HISTORY = "ASSET_ORDER_HISTORY";
const ASSET_TRADE_RECORDS = "ASSET_TRADE_RECORDS";
const ASSET_CANCEL_ORDER = "ASSET_CANCEL_ORDER";
const GET_WITHDRAW_ADDRESS = "GET_WITHDRAW_ADDRESS";
const GET_WITHDRAW_ADDRESS_COIN_LIST = "GET_WITHDRAW_ADDRESS_COIN_LIST";
const GET_REBATE = "GET_REBATE";


const initStatus = {
    propety_info: '',
    settles_list: [],
    recharge_address: '',
    submit_drawing: '',
    recharge_amount: '',
    asset_open_order: '',
    asset_order_history: '',
    asset_trade_records: '',
    asset_cancel_order: '',
    withdraw_address_list: [],
    withdraw_address_coin_list: [],
    rebate: '',
}

export function assets(state = initStatus, action) {
    switch(action.type) {
        case PROPETY_INFO:
            return {...state,propety_info: action.payload};
        case SETTLES_LIST:
            return {...state,settles_list: action.payload};
        case RECHARGE_ADDRESS:
            return {...state,recharge_address: action.payload};
        case SUBMIT_DRAWING:
            return {...state,submit_drawing: action.payload};
        case RECHARGE_AMOUNT:
            return {...state,recharge_amount: action.payload};
        case ASSET_OPEN_ORDERS:
            return { ...state, asset_open_order: action.payload };
        case ASSET_ORDER_HISTORY:
            return { ...state, asset_order_history: action.payload };
        case ASSET_TRADE_RECORDS:
            return { ...state, asset_trade_records: action.payload };
        case ASSET_CANCEL_ORDER:
            return { ...state, asset_cancel_order: action.payload };
        case GET_WITHDRAW_ADDRESS:
            return { ...state, withdraw_address_list: action.payload};
        case GET_WITHDRAW_ADDRESS_COIN_LIST:
            return {...state, withdraw_address_coin_list: action.payload};
        case GET_REBATE:
            return {...state, rebate: action.payload};
        default:
            return state;
    }
}

function propetyInfo(data) {
    return {type: PROPETY_INFO, payload: data};
}

function settlesList(data) {
    return {type: SETTLES_LIST, payload: data};
}

function rechargeAddress(data) {
    return {type: RECHARGE_ADDRESS, payload: data};
}

function submitDrawing(data) {
    return {type: SUBMIT_DRAWING, payload: data};
}

function rechargeAmount(data) {
    return {type: RECHARGE_AMOUNT, payload: data};
}


function assetOpenOrders(data) {
    return { type: ASSET_OPEN_ORDERS, payload: data };
}

function assetOrderHistory(data) {
    return { type: ASSET_ORDER_HISTORY, payload: data };
}

function assetTradeRecords(data) {
    return { type: ASSET_TRADE_RECORDS, payload: data };
}

function assetCancelOrder(data) {
    return { type: ASSET_CANCEL_ORDER, payload: data };
}

function getWithDrawAddress(data) {
    return { type: GET_WITHDRAW_ADDRESS, payload: data};
}

function getWithDrawAddressCoinList(data) {
    return {type: GET_WITHDRAW_ADDRESS_COIN_LIST, payload: data}
}

function getRebate(data) {
    return {type: GET_REBATE, payload: data}
}

export function postRechargeAmount(data) {
    return (dispatch, getState) => {
        return axios.post(assetsAjax.recharge_amount,data).then((response) => {
            if(response.data.errno == "OK") {
                dispatch(rechargeAmount(response.data.data));
            }
        },(err) => {
            console.log("postRechargeAmount失败了###",err);
        })
    }
}

export function getPropetyInfo() {
    return (dispatch, getState) => {
        return axios.get(assetsAjax.propety_info).then((response)=>{
           // console.log('getPropetyInfo成功了####',response);
            if (response.data.errno == "OK") {
                dispatch(propetyInfo(response.data.data));
            }
        },(err) => {
            console.log('getPropetyInfo失败了###',err);
        })
    }
}

//获取充值提现，空投，奖励记录
//type: deposit 充值  // withdraw 提现 // airdrop 空投 // bouns 奖励
export function getSettlesList(type,coin,limit,offset) {
    limit=limit?limit:5;
    offset=offset?offset:0;
    let url = assetsAjax.recharge_list + "?limit=" + limit + "&offset=" + offset;

    if(coin) {
        url = url + "&coin="+coin;
    }

    if(type) {
        url = url + "&type="+type;
    }
    
    return (dispatch,getState) => {
        return axios.get(url).then((response) => {
            //console.log('getSettlesList成功了###',response);
            if(response.data.errno=="OK"){
                dispatch(settlesList(response.data.data));
            }else {
                dispatch(settlesList([]));
            }
        },(err) => {
            dispatch(settlesList([]));
            console.log('getSettlesList失败了####',err);
        })
    }
}

//获取充值地址
export function getRechargeAddress(coin , group = '') {
    // let url = assetsAjax.address + "?coin=" + coin;
    let url = assetsAjax.address + "?coin=" + coin + "&group=" + group ;
    // group:USDT   OMNI用
    // group:ETH    ERC20用
    // console.log(coin, group)
    return (dispatch, getState) => {
        return axios.get(url).then((response) => {
            //console.log('getRechargeAddress###',response);
            if(response.data.errno=="OK") {
                dispatch(rechargeAddress(response.data.data));
            }else {
                dispatch(rechargeAddress([]));
            }
            
        }, (err) => {
            dispatch(rechargeAddress([]));
            console.log('rechargeAddress失败了###',err);
        })
    }
}

//提现
export function submitDrawingPost(data,fundPwd) {
    let headers = {};
    if (fundPwd) {
        headers = { "Bbx-AssetPassword": fundPwd };
    }
    return (dispatch, getState) => {
        return axios.post(assetsAjax.drawing,data,{
            headers: headers
        }).then((response) => {
            //console.log('submitDrawingPost成功了###',response);
            //dispatch(submitDrawing(response.data));
            return response;
        },(err) => {
            console.log('submitDrawingPost失败了###',err);
        })
    }
}



//资产里面的当前交易，历史交易，所有交易   为了在浏览器后退时不和交易页的记录互相影响，顾在这里在定义一份

export function assetGetOpenOrders(coinPair) {
    //let url = exchangeAjax.get_order + "?stockCode=" + coinPair + "&status=2";
    let url;
    if (coinPair) {
        url = exchangeAjax.get_order + "?stockCode=" + coinPair + "&status=2";
    } else {
        url = exchangeAjax.get_order + "?status=2";
    }

    return (dispatch, getState) => {
        return axios.get(url).then((response) => {
            //console.log('getOpenOrders成功了###',response);
            if (response.data.errno == "OK") {
                dispatch(assetOpenOrders(response.data.data.orders));
            }
            if (response.data.errno == "NOT_FOUND") {
                dispatch(assetOpenOrders([]));
            }
        }, (err) => {
            console.log('getOpenOrders失败了###', err);
        })
    }
}

export function assetGetOrderHistory(coinPair) {
    let url;
    if (coinPair) {
        url = exchangeAjax.get_order + "?stockCode=" + coinPair + "&status=3";
    } else {
        url = exchangeAjax.get_order + "?status=3";
    }
    return (dispatch, getState) => {
        return axios.get(url).then((response) => {
            if (response.data.errno == "OK") {
                dispatch(assetOrderHistory(response.data.data.orders));
            }
            if (response.data.errno == "NOT_FOUND") {
                dispatch(assetOrderHistory([]));
            }
        }, (err) => {
            console.log("getOrderHistory失败了###", err);
        })
    }
}

export function assetGetTradeRecords(coinPair) {
    let url;
    if (coinPair) {
        url = exchangeAjax.get_trade + "?stockCode=" + coinPair;
    } else {
        url = exchangeAjax.get_trade;
    }

    return (dispatch, getState) => {
        return axios.get(url).then((response) => {
            //console.log("getTradeRecords成功了###",response);
            if (response.data.errno == "OK") {
                dispatch(assetTradeRecords(response.data.data.trades));
            }
            if (response.data.errno == "NOT_FOUND") {
                dispatch(assetTradeRecords([]));
            }
        }, (err) => {
            console.log("getTradeRecords失败了###", err);
        })
    }
}

export function assetCancelOrderPost(id, coinPair,fundPwd) {
    let nonce = new Date().valueOf();
    let data = {
        "order_id": id,
        "stock_code": coinPair,
        "nonce": nonce
    }
    let headers = {};
    if (fundPwd) {
        headers = { "Bbx-AssetPassword": fundPwd };
    }
    return (dispatch, getState) => {
        return axios.post(exchangeAjax.cancel_order, data, {
            headers: headers
        }).then((response) => {
            //dispatch(assetCancelOrder(response.data));
            return response;
            //console.log('取消订单成功了###',response);
        }, (err) => {
            dispatch(assetCancelOrder(err.data));
        })
    }
}


//地址管理相关接口
//增加地址(自定义)
export function addWithDrawAddressPost(data) {
    return (dispatch, getState) => {
        return axios.post(assetsAjax.withdraw_address+"?action=add",data).then((response) => {
            return response;
        }, (err) => {
            console.log("addWithDrawAddressPost失败了###",err);
        });
    }
}

//获取提币地址（自定义）
export function getWithDrawAddressPost(data) {
    return (dispatch, getState) => {
        return axios.post(assetsAjax.withdraw_address+"?action=query",data).then((response) => {
            //return response;
            if(response.data.errno == "OK") {
                dispatch(getWithDrawAddress(response.data.data));
            }else {
                dispatch(getWithDrawAddress([]));
            }
        }, (err) => {
            console.log("getWithDrawAddressPost失败了###",err);
        })
    }
}

//删除提币地址(自定义)
export function deleteDrawAddressPost(data) {
    return (dispatch, getState) => {
        return axios.post(assetsAjax.withdraw_address+"?action=delete",data).then((response) => {
            return response;
        }, (err) => {
            console.log("deleteDrawAddressPost失败了###",err);
        })
    }
}

export function getWithDrawAddressCoinListPost() {
    return (dispatch, getState) => {
        return axios.post(assetsAjax.withdraw_address + "?action=query", {}).then((response) => {
            //return response;
            if (response.data.errno == "OK") {
                dispatch(getWithDrawAddressCoinList(response.data.data));
            } else {
                dispatch(getWithDrawAddressCoinList([]));
            }
        }, (err) => {
            console.log("getWithDrawAddressPost失败了###", err);
        })
    }
}

export function getRebateGet() {
    return (dispatch, getState) => {
        return axios.get(assetsAjax.rebate).then((response) => {
            if(response.data.errno == "OK"){
                dispatch(getRebate(response.data.data.rebate));
            }else {
                dispatch(getRebate([]));
            }
        },(err) => {
            console.log("getRebateGet失败了###",err);
        })
    }
}
