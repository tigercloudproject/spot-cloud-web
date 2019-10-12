import axios from "../http.js";
import { accountAjax } from "../ajax.js";

const SET_FUND_PASSWORD = "SET_FUND_PASSWORD";
const GET_API_KEYS = "GET_API_KEYS";

const initState = {
    set_fund: '',
    api_keys: []
}

export function account(state = initState, action) {
    switch (action.type) {
        case SET_FUND_PASSWORD:
            return { ...state, set_fund: action.payload };
        case GET_API_KEYS:
            return {...state, api_keys: action.payload};
        default:
            return { ...state };
    }
}

// function setFund(data) {
//     return {type: SET_FUND_PASSWORD, payload: data};
// }

function getApikeys(data) {
    return {type: GET_API_KEYS, payload: data }
}

export function setFundPost(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.fund_pwd + "?action=add", data).then((response) => {
            console.log("设置资金密码###",response);
            return response;
            // if (response.data.errno == "OK") {
            //     dispatch(setFund(response.data.data,1));
            // } else {
            //     dispatch(setFund(response.data,0));
            // }
        },
        (err) => {
            console.log('激活邮箱失败了###', err);
        })
    }
}

export function resetFundPost(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.fund_pwd + "?action=reset", data).then((response) => {
            //console.log("重设置资金密码###", response);
            return response;
            // if (response.data.errno == "OK") {
            //     dispatch(getApikeys(response.data.data,1));
            // } else {
            //     dispatch(setFund(response.data,0));
            // }
        },
            (err) => {
                console.log('激活邮箱失败了###', err);
            })
    }
}

export function resetFundPwdEfective(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.asset_pwd_effective,data).then((response) => {
            //console.log("重置资金密码有效时间###",response);
            return response;
        },(err) => {
            console.log("重置资金密码有效时间失败了###",err);
        })
    }
}

export function getGoogleKey() {
    return (dispatch, getState) => {
        return axios.post(accountAjax.google_pwd+"?action=query").then((response) => {
            return response;
        }, (err) => {
            console.log("获取谷歌序列号失败了####",err);
        })
    }
}

export function bindGooglePwd(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.google_pwd + "?action=add",data).then((response) => {
            return response;
        }, (err) => {
            console.log("绑定谷歌验证码失败了####", err);
        })
    }
}

export function delGooglePwd(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.google_pwd + "?action=delete", data).then((response) => {
            return response;
        }, (err) => {
            console.log("解绑谷歌验证码失败了####", err);
        })
    }
}

//获取地区列表
export function getAreaList() {
    return (dispatch, getState) => {
        return axios.get(accountAjax.areas).then((response) => {
            //console.log("获取地区列表成功了####",response);
            
            if (response.data.errno == "OK") {
                return response.data.data;
            } else {
                return [];
            }
        }, (err) => {
            console.log("获取地区列表失败了###",err);
        })
    }
}

//提交kyc表单
export function submitKycFormPost(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.kyc + "?action=update",data).then((response) => {
            return response;
        }, (err) => {
            console.log("提交kyc失败了####",err);
        })
    }
}

export function uploadeImg(data) {
    return (dispatch,getState) => {
        return axios.post(accountAjax.upload_img,data,
            {
                headers: {'Content-Type': 'multipart/form-data'}
            }
        ).then((response) => {
            return response;
        },(err)=> {
            console.log("上传图片失败了###",err);
        })
    }
}

export function getKycInfo() {
    return (dispatch, getState) => {
        return axios.post(accountAjax.kyc + "?action=query").then((response) => {
            return response;
        },(err) => {
            console.log("请求kyc信息失败####",err);
        })
    }
}

export function setNickNamePost(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.set_nickname, data).then((response) => {
            return response;
        },(err) => {
            console.log("setNickNamePost失败了####",err);
        })
    }
}

//获取apikeys列表
export function getApiKeysList() {
    return (dispatch, getState) => {
        return axios.get(accountAjax.api_keys).then((response) => {

            if (response.data.errno == "OK") {
                dispatch(getApikeys(response.data.data));
            } else {
                dispatch(getApikeys([]));
            }
        }, (err) => {
            console.log("getApiKeysList失败了###",err);
        })
    }
}

//生成apikeys
export function addApiKeysPost(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.api_key+'?action=add', data).then((response) => {
            return response;
        }, (err) => {
            console.log("addApiKeysPost失败了####",err);
        })
    }
}

//查看API
export function queryApiKeysPost(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.api_key+'?action=query',data).then((response) => {
            return response;
        }, (err) => {
            console.log("queryApiKeysPost失败了####",err);
        })
    }
}

//删除API
export function deleteApiKeysPost(data) {
    return (dispatch, getState) => {
        return axios.post(accountAjax.api_key + '?action=delete', data).then((response) => {
            return response;
        }, (err) => {
            console.log("deleteApiKeysPost失败了####", err);
        })
    }
}
