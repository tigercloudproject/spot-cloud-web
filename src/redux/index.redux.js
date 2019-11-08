//import axios from 'axios';
import axios from '../http.js';
import { indexAjax, exchangeAjax } from "../ajax.js";

const SPOT_TICKERS_DATA = "SPOT_TICKERS";
const CURRENT_INDEX_CONTRACT = "CURRENT_INDEX_CONTRACT";

const CONTRACT_TICKER = "CONTRACT_TICKER";
const BBX_TICKER = "BBX_TICKER";

const initState = {
    tickers: [],
    spot_tickers: [],
    current_index_contract_id: "",
    contract_ticker: [],
    bbx_ticker: [],
}

export function index(state = initState, action) {
    switch(action.type) {
        case SPOT_TICKERS_DATA:
            return {...state, spot_tickers: action.payload};
        case CURRENT_INDEX_CONTRACT:
            return {...state, current_index_contract_id: action.payload};
        case CONTRACT_TICKER:
            return {...state, contract_ticker: action.payload};
        case BBX_TICKER:
            return {...state, bbx_ticker: action.payload};
        default:
            return state;
    }
}

function spotTickersData(spot_tickers) {
    return {type: SPOT_TICKERS_DATA, payload: spot_tickers};
}

//首页切换合约
export function changeIndexConractId(id) {
    return { type: CURRENT_INDEX_CONTRACT, payload: id}
}


const spotTickerCancelToken = axios.CancelToken;
let spotTickerCancel;
export function getspotTickersData() {
    cancelSpotTicker();
    return (dispatch, getState) => {
        return axios.get(indexAjax.spot_tickers,{
            cancelToken: new spotTickerCancelToken(function executor(c) {
                spotTickerCancel = c;
            }),
            timeout: 5000
        }).then(
            (response) => {
                if(response.status == 200 && response.data.errno == "OK") {
                    dispatch(spotTickersData(response.data.data));
                }
            },
            (err) => {
                //console.log("getspotTickersData error###", err);
                dispatch(spotTickersData([]));
            }
        ).catch((thrown) => {
            dispatch(spotTickersData([]));
        })
    }
}

function cancelSpotTicker() {
    if (typeof spotTickerCancel === "function") {
      // console.log("quxiaole##");
        spotTickerCancel();
    }
}
//获取k线数据
export function getBar(code, type, unit, start, end) {
    start = parseInt(start / 1000, 10);
    end = parseInt(end / 1000, 10);
    code = code || 1;
    type = type || '';
    code = String(code);
    let getUrl;
    getUrl = indexAjax.quote + "?contractID=" + code + "&startTime=" + start + "&endTime=" + end + "&resolution=" + type + "&unit=" + unit;
    return axios.get(getUrl);
}

//获取币币ticker
function bbxTicker(data) {
    return { type: BBX_TICKER, payload: data};
}

let bbx_ticker_timeout = null;

//stocks根据rank字段排序
function stockSortBy(field) {
    return function(a,b) {
        return a.stock[field] - b.stock[field];
    }
}

export function getBbxTicker() {
    return (dispatch, getState) => {
        let arr = [axios.get(indexAjax.spot_tickers), axios.get(exchangeAjax.stocks)];
        return Promise.all(arr).then((res) => {
            // console.log('Promise.all333######', res);
            let tickers = [], stocks = [], stocks_json=[];
            if (res[0] && res[0].data && res[0].data.errno==="OK" && res[0].data.data && res[0].data.data.tickers) {
                // dispatch(bbxTicker(res[0].data.data.tickers));
                tickers = res[0].data.data.tickers;
            }

            if(res[1] && res[1].data && res[1].data.errno === "OK" && res[1].data.data && res[1].data.data.stocks) {
                stocks = res[1].data.data.stocks;
                let stocks_arr = []; //设置websocket成功回调时用
                stocks.forEach((item) => {
                    stocks_json.push("Ticker:" + item.stock.name);
                    stocks_arr.push("Ticker:" + item.stock.name);
                    // stocks_arr.push(item.stock.name);
                })

                stocks = stocks.sort(stockSortBy("rank"));


                let tickerRankList = [];

                // console.log('stocks###', stocks);

                stocks.forEach((stock) => {
                    tickers.forEach((ticker) => {
                        if (stock.stock.name === ticker.stock_code) {
                            tickerRankList.push ({
                                stock: stock.stock,
                                ticker: ticker
                            })
                        }
                    })
                })

                dispatch(bbxTicker(tickerRankList));
                // console.log("tickerRankList####", tickerRankList);

                // let errorFn = (args) => {
                //     clearTimeout(bbx_ticker_timeout);
                //     if(window.webSocket_bbx.isConnection()) {
                //         window.webSocket_bbx.webSocketSend(`{"action": "subscribe", "args": ${args}}`);
                //     } else {
                //         bbx_ticker_timeout = setTimeout(() => {
                //             getBbxTicker();
                //         }, 2000)
                //     }
                // }

                stocks_arr.forEach((item) => {
                    let args = [item];
                    args = JSON.stringify(args);
                    window.webSocket_bbx.errorCallBackFunObj[item] = () => {
                        clearTimeout(bbx_ticker_timeout);
                        if (window.webSocket_bbx.isConnection()) {
                            window.webSocket_bbx.webSocketSend(`{"action": "subscribe", "args": ${args}}`);
                        } else {
                            bbx_ticker_timeout = setTimeout(() => {
                                getBbxTicker();
                            }, 2000)
                        }
                    }
                    window.webSocket_bbx.successFn[item] = (res) => {
                        if(res.data) {
                            let state = getState();
                            let tickerList = state.index.bbx_ticker;
                            let stock_code = res.data.stock_code;
                            tickerList = tickerList.map((item) => {
                                return item.ticker.stock_code === stock_code ? { stock: item.stock, ticker: res.data } : item;
                            })
                            // console.log("tickerList######%%%%", tickerList);
                            dispatch(bbxTicker(tickerList));
                        }
                    }
                })

                // window.webSocket_bbx.errorCallBackFunObj['Ticker'] = errorFn;

                // for (let item in window.webSocket_bbx.successFn) {
                //     if (~item.indexOf("Ticker")) {
                //       delete window.webSocket_bbx.successFn[item];
                //     }
                // }

                // console.log("window.webSocket_bbx.successFn###", window.webSocket_bbx.successFn);
                // for()

                // window.webSocket_bbx.successFn['Ticker'] = (res) => {
                //     console.log('bbx-ticker-websocket####', res);
                //     let state = getState();
                //     let tickerList = state.index.bbx_ticker;
                //     let stock_code = res.data.stock_code;
                //     tickerList = tickerList.map((item) => {
                //         return item.ticker.stock_code === stock_code ? {stock: item.stock,ticker:res.data}: item;
                //     })

                //     dispatch(bbxTicker(tickerList));
                // }

                // NOTE: 交易对内容过多，会造成 1009 自动关闭 ws close，目前后端最大 512 字符长度
                const maxLength = 10;
                for(var i=0;i<stocks_json.length;i=i+maxLength){
                    console.log( stocks_json.slice(i,i+maxLength) )
                    window.webSocket_bbx.webSocketSend(`{"action": "subscribe", "args": ${ JSON.stringify( stocks_json.slice(i,i+maxLength ))}}`);
                }
            }
        }).catch((err) =>{
            clearTimeout(bbx_ticker_timeout);
            bbx_ticker_timeout = setTimeout(() => {
                getBbxTicker();
            }, 2000);
        })
    }
}
