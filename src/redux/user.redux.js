import axios from "../http.js";
import { userAjax, globalAjax } from '../ajax.js';
// import Cookie from 'js-cookie';
import { setCookie, delCookie, getCookie } from "../utils/cookie.js";
import CFG from "../config.js";
import { notification } from "antd";
import intl from "react-intl-universal";
import { clearSignCaches } from "../utils/common.js";
import qs from 'qs';
const PHONE_CODE = 'PHONE_CODE';
const VERIFY_CODE = 'VERIFY_CODE';
const LOGIN = "LOGIN"; //登录
const REGISTER = "REGISTER"; //注册
const RETRIEVAL = "RETRIEVAL"; //找回密码
const EXIT = "EXIT"; //退出
const BIND_PHONE = "BIND_PHONE"; //绑定手机
const BIND_EMAIL = "BIND_EMAIL"; //绑定邮箱
const ACTIVE = "ACTIVE"; //激活


//let user = JSON.parse(sessionStorage.getItem('user'));
let user;
//let cookieUser= Cookie.get("user");
let storageUser = localStorage.getItem('user');
if (storageUser) {
  user = JSON.parse(storageUser);
}

const initStatus = {
    login_success: '', //登录成功后的跳转地址
    register_success: '', //注册成功后的跳转地址
    retrieval_success: '', //找回密码成功后的跳转地址
    phone_code:[],
    verify_code: false,
    user: user?user:'',
    user_error: '',
    bind_phone: '',
    bind_email: '',
    active_success: ''
}

export function user(state = initStatus, action) {
    switch(action.type) {
        case PHONE_CODE:
            return {...state, phone_code: action.payload};
        case VERIFY_CODE:
            return {...state, verify_code: action.payload};
        case LOGIN:
            return {...state, ...action.payload, login_success: action.redirect};
        case REGISTER:
            return { ...state, ...action.payload, register_success: action.redirect };
        case RETRIEVAL:
            return { ...state, ...action.payload, retrieval_success: action.redirect };
        case EXIT:
            return {...state, ...action.payload};
        case BIND_PHONE:
            return {...state, ...action.payload, bind_phone: action.redirect};
        case BIND_EMAIL:
            return {...state, ...action.payload, bind_email: action.redirect};
        case ACTIVE:
            return {...state, ...action.payload, active_success: action.redirect};
        default:
            return state;
    }
}

function phoneCode(data) {
    return {type: PHONE_CODE, payload: data};
}

function verifyCode(data) {
    return {type: VERIFY_CODE, payload: data};
}

function setAccount( data, type, path, mod ) {
    /* data
        {
            "account_id": 103918422829,
            "phone": "+86 13621359980",
            "account_type": 2,
            "owner_type": 1,
            "status": 2,
            "register_ip": "123.113.105.177",
            "latest_login_ip": "123.113.105.177",
            "asset_password_effective_time": -2,
            "ga_key": "unbound",
            "kyc_type": 0,
            "kyc_status": 1,
            "created_at": "2019-09-11T06:14:17.620542Z",
            "updated_at": "2019-09-28T04:40:26.71804Z"
        }
     */
    let result;
    let bbxToken = data.token
      , bbxAccesskey = data.access_key
      , bbxExpiredTs = data.expired_ts
      , bbxSsid = ''
      , originUid = data.origin_uid // 子账户ID
      , bbxUid = data.account_id;

    // 转换格式
    data = {
        "account_id": bbxUid,
        "phone": '',
        "account_type": 2,
        "owner_type": 1,
        "status": 2,
        "register_ip": "",
        "asset_password_effective_time": -2,
        "ga_key": "unbound",
        "kyc_type": 0,
        "kyc_status": 1,
        "created_at": '',
        "updated_at": ''
    };

    if ( type ) {
        result = {
            user: data,
            user_error: ''
        }
        // 有token 和 用户数据则保存至 LS
        if( bbxToken && data ) {
            localStorage.setItem( "user", JSON.stringify( data ) );
        };

        // 更新 cookie
        setCookie( "origin_uid", originUid, 1, CFG.mainDomainName, "/" );
        setCookie( "bbx_token", bbxToken, 1, CFG.mainDomainName, "/" );
        setCookie( "bbx_access_key", bbxAccesskey, 1, CFG.mainDomainName, "/" );
        setCookie( "bbx_expired_ts", bbxExpiredTs, 1, CFG.mainDomainName, "/" );
        setCookie( "bbx_ssid", bbxSsid, 1, CFG.mainDomainName, "/" );
        setCookie( "bbx_uid", bbxUid, 1, CFG.mainDomainName, "/" );

        return { type: mod, payload: result, redirect: path || '/' };
    } else {
        result = {
            user_error: data,
            user: ''
        }
        return { type: mod, payload: result, redirect: '' }
    }
}


// 通用登录逻辑
function log_in( data, path, dispatch = function () {} ) {
    let opt = {
            headers: {
                'Skip-Set-Axios-Headers': 'true'
                , 'Content-type': 'application/x-www-form-urlencoded'
                , 'platform': 'web'
            }
        };

    data = qs.stringify( {
        email: data.email
        , password: data.password
    } );

    return axios[ userAjax.login.type ]( userAjax.login.url, data, opt ).then((response) => {
            /* response.data
                {
                    "code": 0,
                    "msg": "操作成功",
                    "data": {
                        "account_id": 5,
                        "token": "9a333ed5513c4ea6b2eab50bde8b5706"
                    }
                }
             */
            if ( response.data && response.data.code === 0 ) {
                let user_token = response.data.data.token || ''
                  , account_id = response.data.data.account_id || '';

                setCookie( "user_token", user_token, 1, CFG.mainDomainName, "/" );
                setCookie( "origin_uid", account_id, 1, CFG.mainDomainName, "/" );

                getChildToken()
                    .then( response => {
                        dispatch( login(
                            response
                            , 1
                            , path
                        )
                    );
                    } );
            } else {
                notification.error( {
                   message: 'LoginPost Err',
                   description: response.data
                })
                dispatch(login(response.data, 0, path));
            }
    }
    , err => {
        notification.error( {
           message: 'loginPost Err',
           description: err
        })
    });
}

function login( data, type, path) {
    return setAccount( data, type, path, LOGIN );
}

function register( data, type, path ) {
    return setAccount( data, type, path, REGISTER );
}

function exit() {
    let data = {
        user: '',
        redirect: '/',
        login_success: '',
        register_success: '',
        retrieval_success: ''
    }

    clearSignCaches();  // 清除与凭证相关的缓存数据

    return {type: EXIT, payload: data};
}

//function retrieval(data, type) {
function retrieval(data,type,path,token,ssid,uid){
    let result;
    if (type) {
        result = {
            user: data,
            user_error: ''
        }
        if (token) {
            localStorage.setItem('user', JSON.stringify(data))
        }
        setCookie( 'bbx_token', token, 1, CFG.mainDomainName, "/");
        setCookie( 'bbx_ssid', ssid, 1, CFG.mainDomainName, "/");
        setCookie( 'bbx_uid', uid, 1, CFG.mainDomainName, "/");
        let redirectPath;
        if (path) {

            redirectPath = path;
        } else {
            redirectPath = "/";
        }
       // sessionStorage.setItem('user', JSON.stringify(data))
        return { type: RETRIEVAL, payload: result, redirect: redirectPath };
    } else {
        result = {
            user_error: data,
            //user: ''
        }
        //sessionStorage.setItem('user', JSON.stringify(''))
        return { type: RETRIEVAL, payload: result, redirect: "" };
    }
}

function bindPhone(data,type) {
    let result;
    if (type) {
        result = {
            //user: '',
            user_error: ''
        }
        // sessionStorage.setItem('user', JSON.stringify(data))
        return { type: BIND_PHONE, payload: result, redirect: "/" };
    } else {
        result = {
            user_error: data,
            //user: ''
        }
        //sessionStorage.setItem('user', JSON.stringify(''))
        return { type: BIND_PHONE, payload: result, redirect: "" };
    }
}

function active(data,type) {
    let result;
    if (type) {
        result = {
            user: data,
            user_error: ''
        }
        // sessionStorage.setItem('user', JSON.stringify(data))
        localStorage.setItem("user", JSON.stringify(data));
        return { type: ACTIVE, payload: result, redirect: "/" };
    } else {
        result = {
            user_error: data,
            //user: ''
        }
        //sessionStorage.setItem('user', JSON.stringify(''))
        return { type: ACTIVE, payload: result, redirect: "" };
    }
}

function bindEmail(data, type) {
    let result;
    if (type) {
        result = {
            user: '',
            user_error: ''
        }
        // sessionStorage.setItem('user', JSON.stringify(data))
        return { type: BIND_EMAIL, payload: result, redirect: "/usercenter/account_security/list" };
    } else {
        result = {
            user_error: data,
            //user: ''
        }
        //sessionStorage.setItem('user', JSON.stringify(''))
        return { type: BIND_EMAIL, payload: result, redirect: "" };
    }
}

export function getPhoneCode() {
   return (dispatch, getState) => {
        return axios.get(userAjax.phone_code).then((response) => {
            if(response && response.data && response.data.errno==="OK"){
                dispatch(phoneCode(response.data.data));
            }
        },
        (err) => {
            console.log('getPhoneCode失败了###',err);
        }
    )
   }
}

// 获取验证码的校验方式
export function getVerifyCode(userName, name_type, type, validate) {
    let url = "";
    let params,data;
    if(name_type===1) {
        url = userAjax.verify_code + "?type=" + type +"&email=" + userName;
        params = {
            "type": type,
            "email": userName
        }
    }else {
        url = userAjax.verify_code + "?type=" + type + "&phone=" + userName;
        params = {
            "type": type,
            "phone": userName
        }
    }

    data = {
        validate: validate ? validate: ""
    }

    return (dispatch, getState) => {
        return axios.post(userAjax.verify_code,data,{
            params: params
        }).then((response) => {
                //console.log('getVerifyCode成功了####',response);
                // if(response.errno=="OK") {
                //     dispatch(verifyCode(response.data));
                // }else {
                //     return response;
                // }
                return response;

            },
            (err) => {
                console.log('getVerifyCode失败了###',err);
            }
        )
    }
}

// 注册
export function registerPost(data,path) {
    let opt = {
            headers: {
                'Skip-Set-Axios-Headers': 'true'
                , 'Content-type': 'application/x-www-form-urlencoded'
                , 'platform': 'web'
            }
        };

    let email = data.email
      , password = data.password;

    data = qs.stringify( {
        phone: data.phone
        , email
        , password
        , repass: data.qr_pwd
        , nickname: data.email
        , agreement: 'on'
    } )

    return (dispatch, getState) => {
        return axios[ userAjax.register.type ]( userAjax.register.url, data, opt ).then((response) => {
            if ( response.data.code === 0 ) {
                let origin_uid = response.data.data || '';

                setCookie( "origin_uid", origin_uid, 1, CFG.mainDomainName, "/" );

                // XXX: 注册完后自动登录
                return log_in( { email, password }, path, dispatch );
            }else {
                notification.error( {
                   message: 'RegPost Err',
                   description: response.data
                })
                dispatch(register(response.data, 0));
            }

        },
        (err) => {
            notification.error( {
               message: 'registerPost Err',
               description: err
            })
        })
    }
}

// 从母账号向子账号转钱
// Demo
export function assetApp2Account( data ) {
    let opt = {
            headers: {
                'Skip-Set-Axios-Headers': 'true'
                , 'Content-type': 'application/x-www-form-urlencoded'
                , 'e-exchange-token': getCookie( 'user_token' )
                , 'platform': 'web'
            }
        };

    return (dispatch, getState) => {
        return axios[ userAjax.asset_app2account.type ]( userAjax.asset_app2account.url, qs.stringify( data ), opt )
            .then( response => {
                let data = response.data;

                if ( data && data.code ) {

                }
                console.log( data );
            // if( response && response.data && response.data.code === 0 ) {
            //     /* response.data
            //         {
            //             "code": 0,
            //             "msg": "操作成功",
            //             "data": {
            //                 "account_id": 5,
            //                 "token": "9a333ed5513c4ea6b2eab50bde8b5706"
            //             }
            //         }
            //      */
            //     if ( response.data.code === 0 ) {
            //         // NOTE: 这里的 response.data.data.token 是账号 token，其是交易所自身账号系统，但此时还未与 BBX 建立授权操作关系
            //         // 登录成功后，拿 user token 换取 BBX 的
            //         let user_token = response.data.data.token || '';
            //         setCookie( "user_token", user_token, 1, CFG.mainDomainName, "/" );
            //         getChildToken( user_token )
            //             .then( response => {
            //                 console.log( response )
            //                 dispatch( login(
            //                     response
            //                     , 1
            //                     , path
            //                 )
            //             );
            //             } );
            //     } else {
            //         dispatch(login(response.data, 0, path));
            //     }
            // } else {
            //    dispatch(login(response.data, 0, path));
            // }
        },
        (err) => {
            notification.error( {
               message: 'assetApp2Account Err',
               description: err
            })
        })
    }
}


// 登录
export function loginPost( data, path ) {
    //console.log("loginPost####path#####",path);
    return (dispatch, getState) => {
        return log_in( data, path, dispatch )
    }
}

// 获得子账号 token
function getChildToken() {
    let data = {
            origin_uid: getCookie( 'origin_uid' )
            , 'method': 'gen.account.md5'
        }
        , opt = { headers: {
                'Skip-Set-Axios-Headers': 'true'
                , 'Content-type': 'application/x-www-form-urlencoded'
                , 'e-exchange-token': getCookie( 'user_token' )
                , 'platform': 'web'
             }
        };

        return axios[ globalAjax.child_token.type ]( globalAjax.child_token.url
                , qs.stringify( data )
                , opt )
            .then( response => {
                if ( response.data.token ) {
                    return response.data || {}
                } else {
                    notification.error( {
                       message: 'getChildToken Err',
                       description: response.data
                   });
                    return {};
                }
            },
            (err) => {
                notification.error( {
                   message: 'getChildToken Err',
                   description: err
                })
                return {};
            }
        )
}

// 修改密码
export function retrievalPost(data,path) {
    return (dispatch, getState) => {
        return axios.post(userAjax.reset_account, data).then((response) => {
            if (response && response.data && response.data.errno == "OK") {
              dispatch(retrieval(response.data.data, 1, path, response.headers["bbx-token"], response.headers["bbx-ssid"], response.headers["bbx-uid"]));
            } else {
              dispatch(retrieval(response.data, 0, path, response.headers["bbx-token"]));
            }
        },
            (err) => {
                console.log('注册失败了###', err);
            })
    }
}

//登出
export function exitPost() {
    return (dispatch, getState) => {
        return axios.get(userAjax.logout).then((response) => {
            dispatch(exit());
        },
        (err) => {
            console.log('登出失败了####',err);
        })
    }
}

// 绑定邮箱
export function bindEmailPost(data) {
    return (dispatch, getState) => {
        return axios.post(userAjax.bind_email, data).then((response) => {
            if(response && response.data && response.data.errno == "OK") {
                dispatch(bindEmail(response.data.data,1));
            } else {
                dispatch(bindEmail(response.data,0))
            }
        },
        (err) => {
            console.log('绑定邮箱失败了###',err);
        })
    }
}

// 绑定手机
export function bindPhonePost(data) {
    return (dispatch, getState) => {
        return axios.post(userAjax.bind_phone, data).then((response) => {
            if(response && response.data && response.data.errno == "OK") {
                dispatch(bindPhone(response.data.data,1));
            } else {
                dispatch(bindPhone(response.data,0));
            }
        },
        (err) => {
            console.log("绑定手机失败了###",err);
        })
    }
}

// 激活邮箱
export function activePost(data) {
    return (dispatch, getState) => {
        return axios.post(userAjax.active, data).then((response) => {
            if(response.data.errno == "OK") {
                //console.log("activePost####",response);
                dispatch(active(response.data.data,1));
            }else {
                dispatch(active(response.data,0));
            }
        },
        (err) => {
            console.log('激活邮箱失败了###',err);
        })
    }
}

//检查是否需要图片验证码
export function getCaptchCheck(action) {
    return (dispatch,getState) => {
        return axios.get(userAjax.captch_check + action).then((response) => {
            return response;
        }, (err) => {
            console.log("getCaptchCheck失败了###",err);
        })
    }
}
