import axios from "../http.js";
import {exchangeAjax, assetsAjax} from "../ajax.js";
import { setCookie, delCookie, getCookie } from "../utils/cookie.js";
import { aesEncrypy } from "../utils/aes.js";
import { quickSortTime } from "../utils/quickSort.js";


const BBX_TICKER_INFO = "BBX_TICKER_INFO";  //当前ticker
const SET_CURRENT_COINPAIR = "SET_CURRENT_COINPAIR"; //当前币值对
const GET_STOCKS = "GET_STOCKS"; //币值对数据相关的配置信息
const BBX_TRANSACTION = "BBX_TRANSACTION"; //最新成交
const BBX_DEPTH_BUY_LIST = "BBX_DEPTH_BUY_LIST"; //深度
const BBX_DEPTH_SELL_LIST = "BBX_DEPTH_SELL_LIST"; //深度
const BBX_CURRENT_COIN_PRICE = "BBX_CURRENT_COIN_PRICE"; //当前价
const BBX_ORDER = "BBX_ORDER"; //订单
const BBX_ASSETS_LIST = "BBX_ASSETS_LIST"; //bbx资产列表
const BBX_SET_SHOW_ALL = "BBX_SET_SHOW_ALL";

const initState = {
    bbx_ticker_info: null,
    current_coin_pair: "",
    stocks: [],
    transactions: [], //最新成交
    bbx_depth_buy: [], //深度  买
    bbx_depth_sell: [], //深度 卖
    bbx_current_coin_price: null,
    bbx_current_coin_price_rate: null,
    bbx_current_coin_rise_fall_rate: null,
    bbx_current_entrust: [], //当前委托
    bbx_history_entrust: [], //历史委托
    bbx_transation_record: [], //交易记录
    bbx_assets_list: [], //bbx资产
    bbx_show_all: true  //是否显示其他交易对
}

export function trade(state=initState, action) {
    switch(action.type) {
        case BBX_TICKER_INFO:
            return { ...state, bbx_ticker_info: action.payload};
        case SET_CURRENT_COINPAIR:
            return {...state, current_coin_pair: action.payload};
        case GET_STOCKS:
            return {...state, stocks: action.payload};
        case BBX_TRANSACTION:
            return {...state, transactions: action.payload};
        case BBX_DEPTH_BUY_LIST:
            return {...state, bbx_depth_buy: action.payload};
        case BBX_DEPTH_SELL_LIST:
            return {...state, bbx_depth_sell: action.payload};
        case BBX_CURRENT_COIN_PRICE:
            return {...state, ...action.payload};
        case BBX_ASSETS_LIST:
            return {...state, ...action.payload};
        case BBX_ORDER:
            return {...state, ...action.payload};
        case BBX_SET_SHOW_ALL:
            return { ...state, bbx_show_all: action.payload}
        default:
            return state
    }
}

//设置当前币值对
function currentCoinPair(data) {
    return { type: SET_CURRENT_COINPAIR, payload: data };
}

export function setCurrentCoinPair(code) {
    return (dispatch, getState) => {
        return setTimeout(() => {
            dispatch(currentCoinPair(code));
        }, 100);
    }
}

function stocks(data) {
    return { type: GET_STOCKS, payload: data };
}

//获取币币交易图表数据
export function getKlineDate(code, type, unit, start, end, isIncremental) {
    start = parseInt( start / 1000, 10 );
    end = parseInt( end / 1000, 10 );

    code = ( code == null || code === 'null' ) ? "BTC/USDT" : code;
    type = type ? type : ""

    code = String( code );

    let getUrl;
    getUrl = exchangeAjax.spot_dash_two + "stockCode=" + code + "&startTime=" + start + "&endTime=" + end + '&resolution=' + type + '&unit=' + unit;

    return axios.get(getUrl);
}

//获取stocks配置信息
export function getStocks() {
    return (dispatch, getState) => {
        return axios.get(exchangeAjax.stocks).then(
            (response) => {
                // console.log("getStocks####", response);
                if (response && response.data && response.data.errno === "OK" && response.data.data) {
                    dispatch(stocks(response.data.data.stocks));
                }
            }
        ).catch((err) => {
            console.log("getStocks失败了###", err);
            dispatch(stocks([]));
        })
    }
}


export function bbxTickerInfo(data) { //当前ticker
    return { type: BBX_TICKER_INFO, payload: data };
}

function bbxTransactions(data) { //最新交易
    return { type: BBX_TRANSACTION, payload: data };
}

function bbxDepthBuy(data) {
    return { type: BBX_DEPTH_BUY_LIST, payload: data };
}

function bbxDepthSell(data) {
    return { type: BBX_DEPTH_SELL_LIST, payload: data};
}

//获取最新成交,深度和当前ticker值
let ticker_info_time_out = null;
let depth_info_time_out = null;
let themeOut = null;
export function getBbxTickerInfo(coin_pair) {
    bbxUnsubscribe();
    let data = JSON.stringify({
      stock_code: coin_pair,
      depth_params: { offset: 0 },
      trade_params: { offset: 0 }
    });
    return (dispatch, getState) => {
        return axios.post(exchangeAjax.spot_detail, data).then((res) => {
            let state = getState();
            coin_pair = state.trade.current_coin_pair;
            if(res && res.data && res.data.errno === "OK" && res.data.data) {
                dispatch(bbxTransactions(res.data.data.trades)); //最新成交

                if (res.data.data.depth && res.data.data.depth.buys) {
                    dispatch(bbxDepthBuy(res.data.data.depth.buys));
                } else { //res.data.data.depth.buys为null则传空数组
                    dispatch(bbxDepthBuy([]));
                }

                if (res.data.data.depth && res.data.data.depth.sells) {
                    dispatch(bbxDepthSell(res.data.data.depth.sells));
                }else {
                    dispatch(bbxDepthSell([]));
                }
            }

            // let action = `"Depth:${coin_pair}","Trade:${coin_pair}"`;

            let args = [];
            args.push(`Trade:${coin_pair}`);
            args.push(`Depth:${coin_pair}`);
            args = JSON.stringify(args);

            let args_ticker = [];
            args_ticker.push(`Depth:${coin_pair}`);
            args_ticker = JSON.stringify(args_ticker);

            let errorFn = () => {
                clearTimeout(ticker_info_time_out);
                if (window.webSocket_bbx.isConnection()) {
                    // window.webSocket_bbx.webSocketSend(`{"action": "subscribe", "args": [${action}]}`);
                    window.webSocket_bbx.webSocketSend(`{"action": "subscribe", "args": ${args_ticker}}`);
                }else {
                    ticker_info_time_out = setTimeout(() => {
                        getBbxTickerInfo();
                    }, 2000)
                }
            }

            window.webSocket_bbx.errorCallBackFunObj["Trade:" + coin_pair] = errorFn;
            window.webSocket_bbx.successFn["Trade:" + coin_pair] = res => {
                // console.log("websocket---trade####", res);
              if(res.data) {
                let state = getState();
                let transactions = state.trade.transactions;
                // let arr = [];
                // for(let i=res.data.length; i>0; i--) {
                //     transactions.push(res.data[i]);
                // }
                dispatch(bbxTransactions([...res.data,...transactions]));
              }
            };


            let depth_args = [];
            depth_args.push(`Depth:${coin_pair}`);
            depth_args = JSON.stringify(args);

            // console.log("coin_pair###", coin_pair)
            // console.log("current_coin_pair####", state.trade.current_coin_pair);
            let depthErrorFn = () => {
                clearTimeout(depth_info_time_out);
                if(window.webSocket_bbx.isConnection()) {
                    window.webSocket_bbx.webSocketSend(`{"action": "subscribe", "args": ${depth_args}}`);
                }else {
                    depth_info_time_out = setTimeout(() => {
                        getBbxTickerInfo();
                    }, 2000)
                }
            }

            window.webSocket_bbx.errorCallBackFunObj["Depth:" + coin_pair] = depthErrorFn;

            window.webSocket_bbx.successFn["Depth:" + coin_pair] = res => {
                if(res.data) {
                    if(Number(res.data.way)===2) {
                        dispatch(bbxDepthSell(res.data.depths)); //深度卖
                    }else if(Number(res.data.way)===1){
                        dispatch(bbxDepthBuy(res.data.depths)); //深度买
                    }
                }
            }

            themeOut = `{"action":"unsubscribe","args":${args}}`;
            window.webSocket_bbx.webSocketSend(`{"action": "subscribe", "args": ${args}}`);


        })
    }
}

//取消订阅
function bbxUnsubscribe() {
    // console.log("themeOut####", themeOut);
    clearTimeout(ticker_info_time_out)
    clearTimeout(depth_info_time_out);
    if (themeOut) {
        window.webSocket_bbx.webSocketSend(themeOut)
        // delete window.webSocket_bbx.errorCallBackFunObj['Ticker']
    }
}

export function setBbxCurrentCoinPrice(data) {
    return { type: BBX_CURRENT_COIN_PRICE, payload: data}
}

//设置订单（当前委托，历史委托， 交易记录)
function setBbxOrder(data) {
    return { type: BBX_ORDER, payload: data};
}

function setBbxAssets(data) {
    return { type: BBX_ASSETS_LIST, payload: data};
}

//获取当前委托
function getCurrentOrder(coinPair) {
    let url;
    if (coinPair) {
        url = exchangeAjax.get_order + "?stockCode=" + coinPair + "&status=2";
    } else {
        url = exchangeAjax.get_order + "?status=2";
    }
    return axios.get(url);
}
//获取历史委托
function getHistoryOrder(coinPair) {
  let url;
  if (coinPair) {
    url = exchangeAjax.get_order + "?stockCode=" + coinPair + "&status=3";
  } else {
    url = exchangeAjax.get_order + "?status=3";
  }
  return axios.get(url);
}
//获取交易记录
function getTradeRecords(coinPair) {
    let url;
    if (coinPair) {
        url = exchangeAjax.get_trade + "?stockCode=" + coinPair;
    } else {
        url = exchangeAjax.get_trade;
    }

    return axios.get(url);
}
//获取用户资产
function getUserAssetsInfo() {
    return axios.get(assetsAjax.propety_info);
}

let assets_websocket_time_out = null;
//获取BBX资产相关
export function getAssets(coinPair) {
    return (dispatch, getState) => {
        let arr = [getUserAssetsInfo(),getCurrentOrder(coinPair), getHistoryOrder(coinPair), getTradeRecords(coinPair)];
        return Promise.all(arr).then((res) => {
            //用户资产
            if (res[0] && res[0].data && res[0].data.errno === "OK" && res[0].data.data && res[0].data.data.user_assets) {
                dispatch(setBbxAssets({ bbx_assets_list: res[0].data.data.user_assets}));
            }
            //当前委托
            if (res[1] && res[1].data && res[1].data.errno === "OK") {
                dispatch(setBbxOrder({ bbx_current_entrust: res[1].data.data.orders ? res[1].data.data.orders: [] }));
            }
            //历史委托
            if (res[2] && res[2].data && res[2].data.errno === "OK") {
                dispatch(setBbxOrder({ bbx_history_entrust: res[2].data.data.orders ? res[2].data.data.orders: [] }));
            }
            //交易记录
            // if (res[3] && res[3].data && res[3].data.errno === "OK") {
            //     dispatch(setBbxOrder({ bbx_transation_record: res[3].data.data.trades ? res[3].data.data.trades: [] }));
            // }


            //websocket
            let token = getCookie( 'bbx_token' );
            let bbxUid = getCookie( 'bbx_uid' );
            let timestamp = new Date().valueOf();
            let nonce = timestamp + "000";
            let bbxSign = aesEncrypy(token, nonce);

            let errorFn = () => {
                clearTimeout(assets_websocket_time_out);
                if (window.webSocket_bbx.isConnection()) {
                    window.webSocket_bbx.webSocketSend(`{"action": "access","args":["${bbxUid}","web","1.0","${bbxSign}","${nonce}"]}`);
                } else {
                    assets_websocket_time_out = setTimeout(() => {
                        getAssets();
                    }, 5000);
                    // setTimeout(() => {
                    //     getAssets();
                    // }, 3000);
                }
            }

            window.webSocket_bbx.errorCallBackFunObj["authenticate"] = errorFn;
            window.webSocket_bbx.successFn["authenticate"] = (res) => {
                window.webSocket_bbx.webSocketSend(`{"action":"subscribe", "args":["unicast"]}`)
                window.webSocket_bbx.successFn['SUD'] = (res) => {
                    // console.log("SUD#####", res);
                    if (res.data) {
                        let state = getState();
                        let bbx_current_entrust = state.trade.bbx_current_entrust;
                        let bbx_history_entrust = state.trade.bbx_history_entrust;

                        let bbx_assets_list = state.trade.bbx_assets_list;
                        let newAssets = [];
                        for (let i = 0; i < res.data.length; i++) {
                            if (res.data[i].action === 3) {
                                bbx_current_entrust = bbx_current_entrust.filter(item => {
                                    return item.order_id !== res.data[i].order.order_id;
                                })
                            }

                            //订单处理
                            if (res.data[i].order) {
                                if (res.data[i].order.status === 2 || res.data[i].order.status === 1) {
                                    bbx_current_entrust = bbx_current_entrust.filter(item => {
                                        return item.order_id !== res.data[i].order.order_id;
                                    })
                                    bbx_current_entrust = [res.data[i].order, ...bbx_current_entrust];

                                } else if (res.data[i].order.status === 3) {
                                    bbx_history_entrust = bbx_history_entrust.filter(item => {
                                        return item.order_id !== res.data[i].order.order_id;
                                    })
                                    bbx_history_entrust = [res.data[i].order, ...bbx_history_entrust];
                                    //如果交易结束则从当前委托中删除
                                    bbx_current_entrust = bbx_current_entrust.filter(item => {
                                        return item.order_id !== res.data[i].order.order_id;
                                    })
                                }
                            }

                            //资产列表处理
                            if (res.data[i].s_assets) {
                                res.data[i].s_assets.forEach((item) => {
                                    bbx_assets_list = bbx_assets_list.filter((assets) => {
                                        return item.coin_code !== assets.coin_code
                                    })
                                })
                                bbx_assets_list = [...bbx_assets_list, ...res.data[i].s_assets];
                            }
                        }

                        bbx_history_entrust = quickSortTime(bbx_history_entrust, "created_at", 2);

                        dispatch(setBbxOrder({ bbx_history_entrust: bbx_history_entrust }));
                        dispatch(setBbxOrder({ bbx_current_entrust: bbx_current_entrust }));
                        dispatch(setBbxAssets({ bbx_assets_list: bbx_assets_list }));
                    }
                }
            }
            window.webSocket_bbx.webSocketSend(`{"action": "authenticate","args":["${bbxUid}","web","1.0","${bbxSign}","${nonce}"]}`);
        }).catch(err => {
            console.log("getAssets###err###", err);
        })
    }
}

//获取用户交易记录（交易记录无websocket推送，只能手动刷新）
export function getTradeRecordsList(coinPair) {
    return (dispatch, getState) => {
        let url;
        if (coinPair) {
            url = exchangeAjax.get_trade + "?stockCode=" + coinPair;
        } else {
            url = exchangeAjax.get_trade;
        }

        return axios.get(url).then((res) => {
            // console.log("getTradeRecordsList####", res);
            if(res && res.data && res.data.errno === "OK") {
                dispatch(setBbxOrder({ bbx_transation_record: res.data.data.trades ? res.data.data.trades : [] }));

            }
        })
    }
}

//设置是否选中显示其他交易对
export function setShowAll(value) {
    return { type: BBX_SET_SHOW_ALL, payload: value}
}

//批量取消
export function batchRevocation(data, fundPwd) {

    let headers = {};
    if (fundPwd) {
        headers = { "Bbx-AssetPassword": fundPwd };
    }
    return (dispatch, getState) => {
        return axios.post(exchangeAjax.cancel_orders,data, {
            headers: headers
        }).then(res => {
            return res;
        }, err => {
            console.log("批量撤销失败了###", err);
        });
    }
}
