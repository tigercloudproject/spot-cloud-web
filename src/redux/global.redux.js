import axios from '../http.js';
import { globalAjax, assetsAjax } from '../ajax.js';

const GLOBAL_CONFIG = 'GLOBAL_CONFIG';
const USER_CONFIG = 'USER_CONFIG';
const APP_LIST = 'APP_LIST'; //安卓IOS应用信息列表

const initState = {
    clist: [],
    user_config: [],
    app_list: [],
}

//reducer
export function gconfig(state = initState, action) {
    switch(action.type) {
        case GLOBAL_CONFIG:
            return {...state, clist: action.payload};
        case USER_CONFIG:
            return {...state, user_config: action.payload};
        case APP_LIST:
            return {...state, app_list: action.payload};
        default:
            return state;
    }
}

function globalConfig(clist) {
    return {type:GLOBAL_CONFIG, payload: clist};
}

function userConfig(data) {
    return {type: USER_CONFIG, payload: data};
}

function appList(data) {
    return {type: APP_LIST, payload: data}
}

export function getGlobalConfig() {
    return (dispatch, getState) => {
        return axios.get(globalAjax.g_config).then(
            (response) => {
                if(response && response.data.errno == "OK") {
                    dispatch(globalConfig(response.data.data));
                }
            },
            (err) => {
                console.log("getGlobalConfig error###", err);
            }
        );
    }
}

export function getUserConfig() {
    return (dispatch, getState) => {
        return axios.get(globalAjax.user_config).then(
            (response) => {
                if (response && response.data.errno == "OK") {
                    dispatch(userConfig(response.data.data));
                }
            },
            (err) => {
                console.log("getUserConfig失败了####", err);
            }
        )
    }
}

export function getUser() {
    return (dispatch, getState) => {
        return axios.get(assetsAjax.propety_info).then((response) => {
            // console.log('getPropetyInfo成功了####',response);
            // console.log("getUser成功了####",response);
            if (response && response.data.errno === "OK") {
                return response.data.data;
            }else {
                return {};
            }
        }, (err) => {
            return {};
            console.log('getPropetyInfo失败了###', err);
        })
    }
}

export function getAppList() {
    return (dispatch, getState) => {
        return axios.get(globalAjax.app_list).then((response) => {
            //console.log("getAppList成功了####",response);
            if(response && response.data.errno === "OK") {
                return response.data.data;
            }else {
                return []
            }
        });
    }
}
