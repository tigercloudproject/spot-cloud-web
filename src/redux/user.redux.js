import axios from "../http.js";
import { userAjax } from '../ajax.js';
// import Cookie from 'js-cookie';
import { setCookie, delCookie } from "../utils/cookie.js";
import CFG from "../config.js";

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

function login(data,type,path,token,ssid,uid) {
    let result;

    if ( type ) {
        result = {
            user: data,
            user_error: ''
        }
        // 有token 和 用户数据则保存至 LS
        if( token && data ) {
            localStorage.setItem("user", JSON.stringify(data));
        };
        console.log( 'login token', token )
        token
            && setCookie( "token", token, 1, CFG.mainDomainName, "/" );
        ssid
            && setCookie( "ssid", ssid, 1, CFG.mainDomainName, "/" );
        uid
            && setCookie( "uid", uid, 1, CFG.mainDomainName, "/" );

        let redirectPath;
        if(path) {
            redirectPath = path;
        } else {
            redirectPath = "/";
        }
        return { type: LOGIN, payload: result, redirect: redirectPath };
    } else {
        result = {
            user_error: data,
            user: ''
        }

        return { type: LOGIN, payload: result, redirect: "" };
    }
}

function register(data,type,path,token,ssid,uid) {
    let result;
    if(type) {
        result = {
            user: data,
            user_error: ''
        }
        // 有token 和 用户数据则保存至 LS
        if( token && data ) {
            localStorage.setItem('user', JSON.stringify(data))
        }
        setCookie("token", token, 1, CFG.mainDomainName, "/");
        setCookie("ssid", ssid, 1, CFG.mainDomainName, "/");
        setCookie("uid", uid, 1, CFG.mainDomainName, "/");

        let redirectPath;
        if (path) {

            redirectPath = path;
        } else {
            redirectPath = "/";
        }

        return { type: REGISTER, payload: result, redirect: redirectPath };
    }else {
        result = {
            user_error: data,
            user: ''
        }
        //sessionStorage.setItem('user', JSON.stringify(''))
        //Cookie.set("user", "");
        return { type: REGISTER, payload: result, redirect: '' }
    }

}

function exit() {
    let data = {
        user: '',
        redirect: '/',
        login_success: '',
        register_success: '',
        retrieval_success: ''
    }

    localStorage.removeItem("user");

    delCookie("token", CFG.mainDomainName,"/");
    delCookie("uid", CFG.mainDomainName, "/");
    delCookie("ssid", CFG.mainDomainName, "/");

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
        setCookie("token", token, 1, CFG.mainDomainName, "/");
        setCookie("ssid", ssid, 1, CFG.mainDomainName, "/");
        setCookie("uid", uid, 1, CFG.mainDomainName, "/");
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
export function registerPost(data,path,qd,markcode) {
    let url = (qd && qd !== "null" && qd !== null) ? userAjax.register + `?qd=${qd}` : userAjax.register;
    if (markcode && markcode !== "null" && markcode !==null) {
        if (qd && qd !== "null" && qd !== null) {
            url = url + "&markcode=" + markcode;
        }else {
            url = url + "?markcode=" + markcode;
        }
    }
    return (dispatch, getState) => {
        // get -> post
        return axios.get(url,data).then((response) => {
            if (response && response.data && response.data.errno==="OK") {
                dispatch(register(response.data.data, 1,path,response.headers["bbx-token"],response.headers["bbx-ssid"],response.headers["bbx-uid"]));
            }else {
                dispatch(register(response.data, 0));
            }

        },
        (err) => {
            console.log('注册失败了###',err);
        })
    }
}

// 登录
export function loginPost(data,path) {
    //console.log("loginPost####path#####",path);
    return (dispatch, getState) => {
        // get -> post
        return axios.get(userAjax.login,data).then((response) => {
            if(response && response.data && response.data.errno == "OK") {
              dispatch(login(response.data.data, 1, path, response.headers["bbx-token"], response.headers["bbx-ssid"], response.headers["bbx-uid"]));
            } else {
              dispatch(login(response.data, 0, path, response.headers["bbx-token"]));
            }
        },
        (err) => {
            console.log('登录失败了###',err);
        })
    }
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
