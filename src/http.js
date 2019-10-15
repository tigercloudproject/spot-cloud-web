import axios from 'axios';
import {aesEncrypy} from "./utils/aes.js";
import { setCookie, delCookie, getCookie } from "./utils/cookie.js";
import { getQueryString } from "./utils/getQueryString.js";
// import Cookie from "js-cookie";

let bbxToken, bbxSsid, nonce, timestamp, bbxSign, bbxUid, bbxLang;

axios.defaults.headers["Content-Type"] = "application/json;charset=UTF-8";

//超过一秒钟的请求打点
function report(unique_id, url, method, status, errno, time) {
  let geturl = `https://stats.ln900.com/report?device_id=${unique_id}&url=${url}&method=${method}&status=${status}&errno=${errno}&time=${time}`;
  axios.get(geturl);
}


let testObj = {}; //存储超过1秒钟的请求
function getRandomToken() { //生成唯一ID
  // E.g. 8 * 32 = 256 bits token
  var randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  var hex = "";
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
}

let unique_id = localStorage.getItem("unique_id");
if(!unique_id) {
    unique_id = getRandomToken();
    localStorage.setItem("unique_id",unique_id);
}

let test_name;

axios.interceptors.request.use(config => {

    if (config.url.indexOf("https://stats.ln900.com/report")>-1) {
        return config;
    }

    timestamp = new Date().valueOf();
    nonce = timestamp + "000";

    //给所以请求加时间戳
    if (config.url && config.url.indexOf("?") > -1) {
        config.url = config.url + "&t=" + timestamp;
    } else {
        config.url = config.url + "?t=" + timestamp;
    }

    

    test_name =config.url;

    testObj[test_name] = {};
    testObj[test_name]["unique_id"] = unique_id;
    testObj[test_name]["method"] = config.method;
    testObj[test_name]["start"] = timestamp;
    testObj[test_name]["url"] = test_name;

    //设置头部信息
    config.headers.common['Bbx-Ver'] = "1.0";
    config.headers.common['Bbx-Dev'] = "web";
    config.headers.common['Bbx-Ts'] = nonce;
    config.headers.common['Content-Type'] = "application/json";
    //取cookie里的token
    let cookietoken = getCookie("token");
    //bbxToken = cookietoken?cookietoken:localStorage.getItem("bbxToken");
    bbxToken = cookietoken;
    // bbxSsid = localStorage.getItem("bbxSsid");
    // bbxUid = localStorage.getItem("bbxUid");
    // bbxLang = localStorage.getItem("lang");

    bbxSsid = getCookie("ssid");
    bbxUid = getCookie("uid");
    bbxLang = localStorage.getItem("lang");
    if(bbxLang.indexOf("zh")<0) {
        bbxLang = "en";
    } else if(bbxLang.indexOf("zh-tw")>-1) {
        bbxLang = "zh-cn";
    }

    if(bbxToken) {
        bbxSign = aesEncrypy(bbxToken,nonce);
        config.headers.common['Bbx-Sign'] = bbxSign;
    }
    if(bbxSsid) {
        config.headers.common['Bbx-Ssid'] = bbxSsid;
    }

    if(bbxUid) {
        config.headers.common['Bbx-Uid'] = bbxUid;
    }

    if(bbxLang) {
        config.headers.common["Bbx-Language"] = bbxLang;
    }
    

    return config;
}, (err) => {
    //console.log("request###err##@@@######",err);
})

let test_end;
let test_response_name;
axios.interceptors.response.use(response => {

    // test_end = new Date().valueOf();
    // test_response_name = response.config.url;

    // if (test_response_name.indexOf("https://stats.ln900.com/report") > -1) {
    //   return response;
    // }

    // if (testObj[test_response_name]) {
    //     testObj[test_response_name]["end"] = test_end;
    //     testObj[test_response_name]["status"] = response.status;
    //     testObj[test_response_name]["errno"] = response.data.errno;
    //     testObj[test_response_name]["time"] = testObj[response.config.url]["end"] - testObj[response.config.url]["start"];

    //     if (testObj[response.config.url]["end"] - testObj[response.config.url]["start"] > 1000) {

    //         report(testObj[test_response_name]["unique_id"],
    //             testObj[test_response_name]["url"],
    //             testObj[test_response_name]["method"],
    //             testObj[test_response_name]["status"],
    //             testObj[test_response_name]["errno"],
    //             testObj[test_response_name]["time"])
    //     }

    //     delete testObj[response.config.url];
    // }
    

    //非法请求 跳转到登录
    if(response.data.errno == "FORBIDDEN") {
        localStorage.removeItem("user");
        delCookie("token","bbx.com", "/");
        delCookie("ssid", "bbx.com", "/");
        delCookie("uid", "bbx.com", "/");
        let path = getQueryString(window.location.search,"path");
       
        // 只有在usercenter和assets相关的页面发生FORBIDDEN时跳到登录页
        if (window.location.href.indexOf("assets")>0 || window.location.href.indexOf("usercenter")>0) {
            if (path) {
                window.location.href = window.location.protocol + "//" + window.location.host + `/login?path=${path}`;
            } else {
                window.location.href = window.location.protocol + "//" + window.location.host + '/login';
            }
        } 
    }

    if(response.headers["bbx-token"]) {
        //localStorage.setItem("bbxToken",response.headers["bbx-token"]);
        setCookie("token", response.headers["bbx-token"], 1, "bbx.com", "/");
    }
    if (response.headers["bbx-ssid"]) {
        //localStorage.setItem("bbxSsid",response.headers["bbx-ssid"]);
        setCookie("ssid", response.headers["bbx-ssid"], 1, "bbx.com", "/");
    }
    if (response.headers["bbx-uid"]) {
        //localStorage.setItem("bbxUid", response.headers["bbx-uid"]);
        setCookie("uid", response.headers["bbx-uid"], 1, "bbx.com", "/");
    }
    
    return response;
}, (err) => {
    if(!err.response) {
        return;
    }

    // test_end = new Date().valueOf();
    // test_response_name = err.response.config.url;
    // if (test_response_name.indexOf("https://stats.ln900.com/report") > -1) {
    //   return;
    // }


    // let response = err.response;
    // testObj[test_response_name]["end"] = test_end;
    // testObj[test_response_name]["status"] = response.status;
    // testObj[test_response_name]["errno"] = response.data.errno;
    // testObj[test_response_name]["time"] = testObj[response.config.url]["end"] - testObj[response.config.url]["start"];

    // if (testObj[response.config.url]["end"] - testObj[response.config.url]["start"] > 1000) {
    //     //console.log("testObj[response.config.url]####", testObj[response.config.url]);
    //     report(testObj[test_response_name]["unique_id"],
    //         testObj[test_response_name]["url"],
    //         testObj[test_response_name]["method"],
    //         testObj[test_response_name]["status"],
    //         testObj[test_response_name]["errno"],
    //         testObj[test_response_name]["time"]) 
    // }

    // delete testObj[response.config.url];
}
)

export default axios;