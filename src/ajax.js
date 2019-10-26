import CFG from "./config.js";

export const globalAjax = {
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    user_config: CFG.isSimRespon
        ? '_simResponse/userConfigs'
        : CFG.reqHost + 'v1/ifglobal/userConfigs',
    // 获得 token 等
    global_header: CFG.isSimRespon
        ? '_simResponse/globalHeader'
        : 'http://192.168.1.121:8080/common/genAccountMD5',  // 需修改为自己后端的该功能接口
    // ================================== DEMO END =============================
    g_config: CFG.reqHost + "v1/ifglobal/global",
    app_list: CFG.reqHost + "v1/ifglobal/appBuilds"
}

export const userAjax = {
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 账号注册
    register: CFG.isSimRespon
        ? { url: '_simResponse/register', type: 'get' }
        : { url: CFG.reqHost + "v1/ifaccount/users/register", type: 'post' },
    // 账号登录
    login: CFG.isSimRespon
        ? { url: '_simResponse/login', type: 'get' }
        : { url: CFG.reqHost + 'v1/ifaccount/login', type: 'post' },
    // 账号登出
    logout: CFG.isSimRespon
        ? '_simResponse/logout'
        : CFG.reqHost + 'v1/ifaccount/logout',
    // ================================== DEMO END =============================
    verify_code: CFG.reqHost + "v1/ifaccount/verifyCode",
    phone_code: CFG.reqHost + "v1/ifglobal/phoneCode",
    reset_account: CFG.reqHost + "v1/ifaccount/users/resetPassword",
    bind_email: CFG.reqHost + "v1/ifaccount/bindEmail",
    bind_phone: CFG.reqHost + "v1/ifaccount/bindPhone",
    active: CFG.reqHost + "v1/ifaccount/users/active",
    captch_check: CFG.reqHost + "v1/ifaccount/captchCheck?action=", //检查是否需要图片验证码
}

export const indexAjax = {
    tickers: CFG.reqHost + "v1/ifquotes/tickers",
    spot_tickers: CFG.reqHost + "v1/ifmarket/v2/spotTickers",
    bbx_websocket: CFG.reqWebsocket
}

export const exchangeAjax = {
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 交易图表数据
    spot_dash_two : CFG.isSimRespon
        ? '_simResponse/spot?'
        : CFG.reqHost + "v1/ifmarket/v2/spot?",
    // ================================== DEMO END =============================
    spot_detail: CFG.reqHost + "v1/ifmarket/spotDetail",
    //spot_dash: "https://api.bbx.com/v1/ifmarket/spot",
    spot_dash: CFG.reqHost + "v1/ifmarket/",
    save_order: CFG.reqHost + "v1/ifmarket/submitOrder",
    get_order: CFG.reqHost + "v1/ifmarket/getOrders",
    get_trade: CFG.reqHost + "v1/ifmarket/getUserTrades",
    cancel_order: CFG.reqHost + "v1/ifmarket/cancelOrder",
    cancel_orders: CFG.reqHost + "v1/ifmarket/cancelOrders",
    coin_brief: CFG.reqHost + "v1/ifglobal/coinBrief",  //币种介绍
    // spot_hour_dash: "https://api.bbx.com/v1/ifmarket/spothour",
    // spot_daily_dash: "https://api.bbx.com/v1/ifmarket/spotdaily"
    stocks: CFG.reqHost + "v1/ifmarket/stocks", //获取现货对
}

export const assetsAjax = {
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 获得用户资产信息
    propety_info: CFG.isSimRespon
        ?  CFG.reqHost + 'v1/ifaccount/users/me'
        : '_simResponse/me'
    // ================================== DEMO END =============================
}

export const quoteAjax = {
    // dash: CFG.reqHost + "v1/ifquotes/",
}

export const accountAjax = {
    // fund_pwd: CFG.reqHost + "v1/ifaccount/assetPassword", //设置资金密码
    // asset_pwd_effective: CFG.reqHost + "v1/ifaccount/assetPasswordEffectiveTime?action=reset",
    // google_pwd: CFG.reqHost + "v1/ifaccount/GAKey", //设置谷歌验证码相关接口
    // areas: CFG.reqHost + "v1/ifglobal/areas", //获取地区列表
    // set_nickname: CFG.reqHost + "v1/ifaccount/user/accountName",
    // api_keys: CFG.reqHost + "v1/ifaccount/apiKeys",
    // api_key: CFG.reqHost + "v1/ifaccount/apiKey"
}

export const activeAjax = {
    // rank: CFG.reqHost + "v1/ifcontract/statisprofit",
    // active_info: CFG.reqHost + "v1/ifactivity/userActivityInfo"
}
