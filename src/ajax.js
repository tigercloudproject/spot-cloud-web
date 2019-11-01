import CFG from "./config.js";

export const globalAjax = {
    user_config: CFG.reqHost + '/v1/ifglobal/userConfigs',
    g_config: CFG.reqHost + "/v1/ifglobal/global",  // 全局配置
    app_list: CFG.reqHost + "/v1/ifglobal/appBuilds"
}

export const userAjax = {
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 账号注册
    register: CFG.isSimRespon
        ? { url: '_simResponse/register', type: 'get' }
        : { url: "https://v-exchange.bbx.com/reg", type: 'post' },
    // 账号登录
    login: CFG.isSimRespon
        ? { url: '_simResponse/login', type: 'get' }
        : { url: 'https://v-exchange.bbx.com/login', type: 'post' },
    // 账号登出
    logout: CFG.isSimRespon
        ? '_simResponse/logout'
        : CFG.reqHost + '/v1/ifaccount/logout',
    // 获得子账号对应的 token 等向老虎云请求时必须的参数
    child_token: CFG.isSimRespon
        ? { url: '_simResponse/childToken', type: 'get' }
        : { url: 'https://v-exchange.bbx.com/common', type: 'post' },
    // 从母账号向子账号转钱
    asset_app2account: CFG.isSimRespon
        ? { url: '_/asset_app2account', type: 'get' }
        : { url: 'https://v-exchange.bbx.com/spot', type: 'post' },
    // 查询账号 币币资产
    asset_query_account: CFG.isSimRespon
        ? { url: '_/asset_query_account', type: 'get' }
        : { url: 'https://v-exchange.bbx.com/spot', type: 'post' },
    // ================================== DEMO END =============================
    verify_code: CFG.reqHost + "/v1/ifaccount/verifyCode",
    phone_code: CFG.reqHost + "/v1/ifglobal/phoneCode",
    reset_account: CFG.reqHost + "/v1/ifaccount/users/resetPassword",
    bind_email: CFG.reqHost + "/v1/ifaccount/bindEmail",
    bind_phone: CFG.reqHost + "/v1/ifaccount/bindPhone",
    active: CFG.reqHost + "/v1/ifaccount/users/active",
    // 检查是否需要图片验证码
    captch_check: CFG.reqHost + "/v1/ifaccount/captchCheck?action=",
}

export const indexAjax = {
    tickers: CFG.reqHost + "/v1/ifquotes/tickers",
    spot_tickers: CFG.reqHost + "/v1/ifmarket/v2/spotTickers",
    bbx_websocket: CFG.reqWebsocket
}

export const exchangeAjax = {
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 交易图表数据
    spot_dash_two : CFG.isSimRespon
        ? '_simResponse/spot?'
        : CFG.reqHost + "/v1/ifmarket/v2/spot?",
    // ================================== DEMO END =============================
    // 现货交易信息
    spot_detail: CFG.reqHost + "/v1/ifmarket/spotDetail",
    //spot_dash: "https://api.bbx.com/v1/ifmarket/spot",
    spot_dash: CFG.reqHost + "/v1/ifmarket/",
    // 提交订单
    save_order: CFG.reqHost + "/v1/ifmarket/submitOrder",
    // 委托记录
    get_order: CFG.reqHost + "/v1/ifmarket/getOrders",
    // 用户交易记录
    get_trade: CFG.reqHost + "/v1/ifmarket/getUserTrades",
    // 撤销订单
    cancel_order: CFG.reqHost + "/v1/ifmarket/cancelOrder",
    // 批量撤单
    cancel_orders: CFG.reqHost + "/v1/ifmarket/cancelOrders",
    // 币种介绍
    coin_brief: CFG.reqHost + "/v1/ifglobal/coinBrief",
    // spot_hour_dash: "https://api.bbx.com/v1/ifmarket/spothour",
    // spot_daily_dash: "https://api.bbx.com/v1/ifmarket/spotdaily"
    // 获取现货对
    stocks: CFG.reqHost + "/v1/ifmarket/stocks"
}

export const assetsAjax = {
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 获得用户资产信息
    propety_info: CFG.isSimRespon
        ?  '_simResponse/me'
        : CFG.reqHost + '/v1/ifaccount/users/me'
    // ================================== DEMO END =============================
}

export const quoteAjax = {
    // dash: CFG.reqHost + "/v1/ifquotes/",
}

export const accountAjax = {
    // fund_pwd: CFG.reqHost + "/v1/ifaccount/assetPassword", //设置资金密码
    // asset_pwd_effective: CFG.reqHost + "/v1/ifaccount/assetPasswordEffectiveTime?action=reset",
    // google_pwd: CFG.reqHost + "/v1/ifaccount/GAKey", //设置谷歌验证码相关接口
    // areas: CFG.reqHost + "/v1/ifglobal/areas", //获取地区列表
    // set_nickname: CFG.reqHost + "/v1/ifaccount/user/accountName",
    // api_keys: CFG.reqHost + "/v1/ifaccount/apiKeys",
    // api_key: CFG.reqHost + "/v1/ifaccount/apiKey"
}

export const activeAjax = {
    // active_info: CFG.reqHost + "/v1/ifactivity/userActivityInfo"
}
