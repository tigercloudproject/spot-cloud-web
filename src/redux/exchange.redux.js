import axios from "../http.js";
import { exchangeAjax } from "../ajax.js";

const SPOT_DETAILS = "SPOT_DETAILS";
const SPOT_DASH_DATA = "SPOT_DASH_DATA";
const SPOT_HOUR_DASH_DATA = "SPOT_HOUR_DASH_DATA";
const SPOT_DAILY_DASH_DATA = "SPOT_DAILY_DASH_DATA";
const SAVE_ORDER = "SAVE_ORDER";
const OPEN_ORDERS = "OPEN_ORDERS";
const ORDER_HISTORY = "ORDER_HISTORY";
const TRADE_RECORDS = "TRADE_RECORDS";
const CANCEL_ORDER = "CANCEL_ORDER";
const CHANGE_CURRENT_PRICE = "CHANGE_CURRENT_PRICE"; //选择深度列表中的数据
const EXCHANGE_CHANGE_COINPAIR = "EXCHANGE_CHANGE_COINPAIR"; //交易切换交易对
const GET_COIN_BRIEF = "GET_COIN_BRIEF";

const initState = {
    spot_details: [],
    spot_dash: [],
    spot_hour_dash: [],
    spot_daily_dash: [],
    save_order: '',
    open_order: '',
    order_history: '',
    trade_records: '',
    cancel_order: '',
    current_price: '',
    current_price_type: '', //买还是卖
    current_price_list: [], //当前类型价格列表
    dash_cancel: '',
    exchange_current_coinpair: '',
    coin_brief: ''
}

export function sdetails(state=initState, action) {
    switch(action.type) {
        case SPOT_DETAILS:
            return {...state, spot_details: action.payload};
        case SPOT_DASH_DATA:
           // return {...state, spot_dash: action.payload, dash_cancel: action.cancel};
            return {...state, spot_dash: action.payload};
        case SPOT_HOUR_DASH_DATA:
            return {...state, spot_hour_dash: action.payload};
        case SPOT_DAILY_DASH_DATA:
            return {...state, spot_daily_dash: action.payload};
        case SAVE_ORDER:
            return {...state, save_order: action.payload}
        case OPEN_ORDERS:
            return {...state, open_order: action.payload}
        case ORDER_HISTORY:
            return {...state, order_history: action.payload}
        case TRADE_RECORDS:
            return {...state, trade_records: action.payload}
        case CANCEL_ORDER:
            return {...state, cancel_order: action.payload}
        case CHANGE_CURRENT_PRICE:
            return {...state, current_price: action.payload,current_price_type: action.priceType, current_price_list: action.priceList}
        case EXCHANGE_CHANGE_COINPAIR:
            return {...state, exchange_current_coinpair:action.payload}
        case GET_COIN_BRIEF:
            return {...state, coin_brief:action.payload}
        default:
            return state;
    }
}

function spotDetails(details) {
    return { type: SPOT_DETAILS, payload: details};
}

// function spotDash(data,cancel) {
//     return { type: SPOT_DASH_DATA, payload: data, cancel: cancel};
// }
function spotDash(data) {
    return { type: SPOT_DASH_DATA, payload: data};
}

function spotHourDash(data) {
    return { type: SPOT_HOUR_DASH_DATA, payload: data };
}

function spotDailyDash(data) {
    return { type: SPOT_DAILY_DASH_DATA, payload: data };
}

//保存订单
function saveOrder(data) {
    return { type: SAVE_ORDER, payload: data }
}

function openOrders(data) {
    return {type: OPEN_ORDERS,payload: data};
}

function orderHistory(data) {
    return {type: ORDER_HISTORY, payload: data};
}

function tradeRecords(data) {
    return {type: TRADE_RECORDS, payload: data};
}

function cancelOrder(data) {
    return {type: CANCEL_ORDER, payload: data};
}

function coinBrief(data) {
    return {type: GET_COIN_BRIEF, payload: data};
}

//交易页切换币值对
export function changeCurrentCoinPair(data) {
    //console.log("data###",data);
    return {type: EXCHANGE_CHANGE_COINPAIR, payload: data};
}

//选择深度列表中的数据
export function changeCurrentPrice(data, type, list) { //price价格, type是买还是卖, list相应类型的显示列表
    return {type: CHANGE_CURRENT_PRICE, payload:data, priceType: type, priceList: list}
}

const spotDetailCancelToken = axios.CancelToken;
let spotDetailsCancel;

export function getSpotDetails(type) {
    let data = JSON.stringify({
        "stock_code": type,
        "depth_params": { "offset": 0 },
        "trade_params": { "offset": 0 }
    })
    cancelSpotDetail();
    return (dispatch, getState) => {
        return axios.post(exchangeAjax.spot_detail,data,{
            cancelToken: new spotDetailCancelToken(function executor(c) {
                spotDetailsCancel = c;
            }),
        }).then((response) => {
            if (response && response.data && response.data.data) {
              dispatch(spotDetails(response.data.data));
            } else {
              dispatch(spotDetails([]));
            }
        },
        (err) => {
            console.log('getSpotDetails失败了###',err);
        })
    }
}

function cancelSpotDetail() {
    if (typeof spotDetailsCancel === "function") {
      // console.log("quxiaole##");
        spotDetailsCancel();
    }
}

const CancelToken = axios.CancelToken;
let cancel;

//改造成可取消的请求
export function getSpotDash(code, type, start, end, isIncremental) {

    end = end ? end : Date.parse(String(new Date()).replace(/-/g, "/"));
    end = Date.parse(String(new Date()).replace(/-/g, "/"));
    if(isIncremental) { //增量查询
        start = end - 10000;
    }else { //查询全部
        start = start ? start : end - 86400000;
    }
    console.log(start, end, 999)
    start = parseInt(start / 1000);
    end = parseInt(end / 1000);

    code = code ? code : "EOS/ETH";
    type = type ? type : ""
    code = String(code);
    let getUrl;

    getUrl = exchangeAjax.spot_dash + type + "?stockCode=" + code + "&startTime=" + start + "&endTime=" + end;

    // let CancelToken = axios.CancelToken;
    // let cancel;

    cancelDash();

    return (dispatch, getState) => {
        return axios.get(getUrl,{
            cancelToken: new CancelToken(function executor(c) {
                cancel = c
            }),
            // timeout: 5000
        }).then((response) => {
            if(response.data.errno=="OK") {
                //dispatch(spotDash(response.data.data, cancel));
                dispatch(spotDash(response.data.data));
            }else {
                //dispatch(spotDash([], cancel));
                dispatch(spotDash([]));
            }

        },
        (err) => {
           // console.log('getSpotDash失败了###', err);
            //dispatch(spotDash([], cancel));
            dispatch(spotDash([]));

        }).catch((thrown) => {
            //dispatch(spotDash([], cancel));
            dispatch(spotDash([]));
           // console.log("getSpotDash_catch####",thrown);

        })
    }
}

//改造成可取消的请求
export function getSpotDashTwo(code, type, unit, start, end, isIncremental) {
    //end = end ? end : Date.parse(String(new Date()).replace(/-/g, "/"));
    // end = Date.parse(String(new Date()).replace(/-/g, "/"));
    // if(isIncremental) { //增量查询
    //     start = end - 10000;
    // }else { //查询全部
    //     start = start ? start : end - 86400000;
    // }

    start = parseInt(start / 1000, 10 );
    end = parseInt(end / 1000, 10 );

    code = ( code == null || code === 'null' )? "EOS/ETH" : code;
    type = type ? type : ""
    code = String(code);

    let getUrl;
    // 'spot' + "?stockCode=" + code +
    getUrl = exchangeAjax.spot_dash_two  + "stockCode=" + code + "&startTime=" + start + "&endTime=" + end + '&resolution=' + type + '&unit=' + unit;
    // let CancelToken = axios.CancelToken;
    // let cancel;
    //console.log("axios.get(getUrl####)", axios.get(getUrl));
    return axios.get(getUrl)
}



export function cancelDash() {
    if(typeof cancel === 'function') {
       // console.log("quxiaole##");
        cancel();
    }
}

export function getSpotHourDash() {

}

export function getSpotDailyDash() {

}

export function saveOrderPost(data,fundPwd) {
    //console.log('data是什么###',data);
    let headers = {};
    if (fundPwd) {
        headers = {
            'Bbx-AssetPassword': fundPwd
        }
    }
    return (dispatch, getState) => {
        return axios.post(exchangeAjax.save_order,data, {
            headers: headers
        }).then((response)=>{
            //console.log('saveOrderPost成功了###',response);
            //dispatch(saveOrder(response.data));
            return response;
        },
        (err) => {
            console.log('saveOrderPost失败了###',err);
            //dispatch(saveOrder(err.data));
        });
    }
}

export function getOpenOrders(coinPair) {
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
                dispatch(openOrders(response.data.data.orders));
            }
            if (response.data.errno == "NOT_FOUND") {
                dispatch(openOrders([]));
            }
        },(err) => {
            console.log('getOpenOrders失败了###',err);
        })
    }
}

export function getOrderHistory(coinPair) {
    let url;
    if (coinPair) {
        url = exchangeAjax.get_order + "?stockCode=" + coinPair + "&status=3";
    } else {
        url = exchangeAjax.get_order + "?status=3";
    }
    return (dispatch, getState) => {
        return axios.get(url).then((response) => {
            if (response.data.errno == "OK") {
                dispatch(orderHistory(response.data.data.orders));
            }
            if (response.data.errno == "NOT_FOUND") {
                dispatch(orderHistory([]));
            }
        }, (err) => {
            console.log("getOrderHistory失败了###", err);
        })
    }
}

export function getTradeRecords(coinPair) {
    let url;
    if(coinPair) {
        url = exchangeAjax.get_trade + "?stockCode=" + coinPair;
    }else {
        url = exchangeAjax.get_trade;
    }

    return (dispatch, getState) => {
        return axios.get(url).then((response) => {
            // console.log("getTradeRecords成功了###",response);
            if (response.data.errno == "OK") {
                dispatch(tradeRecords(response.data.data.trades));
            }
            if (response.data.errno == "NOT_FOUND") {
                dispatch(tradeRecords([]));
            }
        }, (err) => {
            console.log("getTradeRecords失败了###",err);
        })
    }
}

export function cancelOrderPost(id,coinPair,fundPwd) {
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
            //dispatch(cancelOrder(response.data));
            //console.log('取消订单成功了###',response);
            return response;
        },(err) => {
            dispatch(cancelOrder(err.data));
        })
    }
}


//获取币种介绍
export function getCoinBrief(coin) {
    return (dispatch, getState) => {
        return axios.get(exchangeAjax.coin_brief + "?coinCode=" + coin).then((response) => {
            //console.log("获取币种介绍成功了#####", response);
            if(response && response.data && response.data.errno === "OK") {
                dispatch(coinBrief(response.data.data));
            }else {
                dispatch(coinBrief({}));
            }
        }, (err) => {
            console.log("获取币种介绍失败了####", err);
        });
    }
}
