import axios from "../http.js";
import { contractAjax } from "../ajax.js";

const GET_CONTRACT_INFO = "GET_CONTRACT_INFO";

const initState = {
    contract_info: []
}

export function contract(state=initState, action) {
    switch (action.type) {
        case GET_CONTRACT_INFO:
            return {...state,contract_info: action.payload};
        default:
            return {...state};
    }
}

// function contractInfo(data) {
//     return {type: "GET_CONTRACT_INFO"}
// }

//获取合约信息
export function getContractInfo() {
    return (dispatch, getState) => {
        return axios.get(contractAjax.contracts).then(response => {
            //console.log("获取合约信息成功了###",response);
            if (response && response.data.errno==="OK") {
                return response.data.data;
            }else {
                return [
                    {
                        contracts:[]
                    }
                ];
            }
        }, err => {
            return [{ contracts: [] }];
            console.log("获取合约信息失败了###", err);
        });
    }
}

//获取用户仓位
export function getUserPosition(id,coin_code) {
    let url = contractAjax.user_position;
    if(id) {
        url = contractAjax.user_position + `?contractID=${id}`;
    }
    if(coin_code) {
        url = contractAjax.user_position + `?coinCode=${coin_code}`;
    }
    return (dispatch, getState) => {
        return axios.get(url).then(response => {
            if (response && response.data && response.data.errno === "OK") {
                return response.data.data;
            } else {
                return {
                    positions: []
                };
            }
        }, err => {
            console.log("获取用户仓位失败了###", err);
            return {
                positions: []
            };
        });
    }
}

//获取合约账户信息
export function getConstractAccounts(coin) {
    let url = coin?contractAjax.accounts+`?coinCode=${coin}`:contractAjax.accounts;
    return (dispatch, getState) => {
        return axios.get(url).then(response => {
            //console.log("获取合约账户信息成功了###", response);
            if (response.data.errno === "OK") {
                return response.data.data;
            } else {
                return {
                    accounts: []
                };
            }
        }, err => {
            console.log("获取合约账户信息失败了###", err);
            return {
                accounts: []
            };
        });
    }
}

//获取用户订单记录
export function getContractUserOrders(id,status,offset,size) {
    return (dispatch, getState) => {
        return axios.get(contractAjax.userOrders + `?contractID=${id}&status=${status}&offset=${offset}&size=${size}`).then(response => {
          //console.log("获取合约用户订单记录成功了###", response);
          if (response.data.errno === "OK") {
            return response.data.data;
          } else {
            return [];
          }
        }, err => {
          console.log("获取合约账户信息失败了###", err);
          return [];
        });
    };
}

//获取合约的交易记录
export function getContractTrades(status, offset, size) {
    return (dispatch, getState) => {
        return axios.get(contractAjax.trades).then(response => {
            console.log("获取合约交易记录成功了###", response);
            if (response.data.errno === "OK") {
                return response.data.data;
            } else {
                return [];
            }
        }, err => {
            console.log("获取合约交易记录成功了###", err);
            return [];
        });
    };
}

//取消订单
export function cancelContractOrdersPost(data) {
    return (dispatch,getState) => {
        return axios.post(contractAjax.cancel_order,data).then((response) => {
            //取消合约订单成功了
            // if (response.data.errno === "OK") {
            //     return response.data.data;
            // } else {
            //     return [];
            // }
            return response;
        },err => {
            console.log("取消合约资产失败了####",err);
            //return [];
        })
    }
}


//获取用户订单的交易记录
export function getContractOrderTrades(contract_id) {
    return (dispatch, getState) => {
        return axios.get(contractAjax.userTrades + `?contractID=${contract_id}`).then((response) => {
            //console.log("获取用户订单的交易记录成功了####",response);
            if (response.data.errno === "OK") {
              return response.data.data;
            } else {
              return [];
            }
        }, err => {
            console.log("获取用户订单的交易记录失败了", err);
        })
    }
}

//获取合约资产变更记录(资金流水)
export function getContractCapitalFlow(data) {
    return (dispatch, getState) => {
        return axios.post(contractAjax.cash_books,data).then((response) => {
            if (response.data.errno === "OK") {
                return response.data.data;
            } else {
                return {
                    cash_books:[],
                    total: 0,
                };
            }
        }, err => {
            console.log("获取资产变更记录失败了###",err);
            return {
                cash_books: [],
                total: 0,
            };
        })
    }
}

//资金划转
export function contractTransferFundsPost(data) {
    return (dispatch,getState) => {
        return axios.post(contractAjax.transfer_funds,data).then((response) => {
            return response;
        }, (err) => {
            console.log("资金转化失败了###",err);
        })
    }
}

//获取ticker
export function getConstractTickers() {

    return (dispatch, getState) => {
        return axios.get(contractAjax.tickers).then(response => {
            if (response.data.errno === "OK") {
              return response.data.data.tickers;
            } else {
              return { tickers: [] };
            }
          }, err => {
            console.log("getConstractTickers失败了###", err);
            return { tickers: [] };
          });
    }
}

export function getTickers(id) {
    let url = id ? contractAjax.tickers + `?contractID=${id}` : contractAjax.tickers;
    return axios.get(url).then(response => {
        if (response && response.data && response.data.errno === "OK") {
            return response.data.data.tickers;
        } else {
            return {
                tickers: []
            };
        }
    }, err => {
        console.log("getTickers失败了###", err);
        return {
            tickers: []
        };
    });

}

//获取k线
export function getContractKLine(code, type, unit, start, end) {
   let now = new Date().valueOf();
  start = start?parseInt(start / 1000):parseInt(now/1000) - 13700; //为了取228个点 即228分钟数据
  end = end?parseInt(end / 1000):parseInt(now/1000);
  unit = unit ? unit: 1;
  code = code || 1;
  type = type || "M";
  code = String(code);
  let getUrl;
  getUrl =
    contractAjax.quote +
    "?contractID=" +
    code +
    "&startTime=" +
    start +
    "&endTime=" +
    end +
    "&resolution=" +
    type +
    "&unit=" +
    unit;
  return axios.get(getUrl).then((response) => {
      if (response && response.data && response.data.errno === "OK") {
          return response.data.data;
      } else {
          return [];
      }
  }, err => {
      return [];
  });
}