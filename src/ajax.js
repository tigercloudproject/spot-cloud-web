import CFG from "./config.js";

export const globalAjax = {
    g_config: CFG.reqHost + "v1/ifglobal/global",
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 用户信息
    user_config: CFG.reqHost + 'v1/ifglobal/userConfigs',
    // user_config: '_simResponse/userConfigs',
    // 获得 token 等
    global_header: 'http://192.168.1.121:8080/common/genAccountMD5',  // 需修改为自己后端的该功能接口
    // global_header: '_simResponse/globalHeader',
    // ================================== DEMO END =============================
    app_list: CFG.reqHost + "v1/ifglobal/appBuilds"
}

export const userAjax = {
    verify_code: CFG.reqHost + "v1/ifaccount/verifyCode",
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 账号注册
    register: CFG.reqHost + "v1/ifaccount/users/register",
    // register: '_simResponse/register',
    // ================================== DEMO END =============================
    phone_code: CFG.reqHost + "v1/ifglobal/phoneCode",
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 账号登录
    login: CFG.reqHost + "v1/ifaccount/login",
    // login: '_simResponse/login',
    // ================================== DEMO END =============================
    reset_account: CFG.reqHost + "v1/ifaccount/users/resetPassword",
    bind_email: CFG.reqHost + "v1/ifaccount/bindEmail",
    bind_phone: CFG.reqHost + "v1/ifaccount/bindPhone",
    active: CFG.reqHost + "v1/ifaccount/users/active",
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 账号登出
    logout: CFG.reqHost + "v1/ifaccount/logout",
    // logout: '_simResponse/logout',
    // ================================== DEMO END =============================
    captch_check: CFG.reqHost + "v1/ifaccount/captchCheck?action=", //检查是否需要图片验证码
}

export const indexAjax = {
    tickers: CFG.reqHost + "v1/ifquotes/tickers",
    spot_tickers: CFG.reqHost + "v1/ifmarket/v2/spotTickers",
    // contracts_kline,
    // quote: CFG.reqHost + "v1/ifcontract/quote", //获取合约k线数据
    bbx_websocket: CFG.reqWebsocket
}

export const exchangeAjax = {
    spot_detail: CFG.reqHost + "v1/ifmarket/spotDetail",
    //spot_dash: "https://api.bbx.com/v1/ifmarket/spot",
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 交易图表数据
    spot_dash_two : CFG.reqHost + "v1/ifmarket/v2/spot?",
    // spot_dash_two: '_simResponse/spot?',
    // ================================== DEMO END =============================
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
    propety_info: CFG.reqHost + "v1/ifaccount/users/me"
    // propety_info: '_simResponse/me'
    // ================================== DEMO END =============================
    // recharge_list: CFG.reqHost + "v1/ifaccount/settles", //充值记录
    // address: CFG.reqHost + "v1/ifaccount/address", //绑定充值地址
    // drawing: CFG.reqHost + "v1/ifaccount/withdraw",//提现
    // recharge_amount: CFG.reqHost + "v1/ifaccount/rechargeAmount",
    // withdraw_address: CFG.reqHost + "v1/ifaccount/withdrawAddress", //地址管理中的接口
    // rebate: CFG.reqHost + "/v1/ifaccount/rebates",
}

export const quoteAjax = {
    // dash: CFG.reqHost + "v1/ifquotes/",
}

export const accountAjax = {
    // fund_pwd: CFG.reqHost + "v1/ifaccount/assetPassword", //设置资金密码
    // asset_pwd_effective: CFG.reqHost + "v1/ifaccount/assetPasswordEffectiveTime?action=reset",
    // google_pwd: CFG.reqHost + "v1/ifaccount/GAKey", //设置谷歌验证码相关接口
    // areas: CFG.reqHost + "v1/ifglobal/areas", //获取地区列表
    // kyc: CFG.reqHost + "v1/ifaccount/KYCAuth",
    // upload_img,
    // set_nickname: CFG.reqHost + "v1/ifaccount/user/accountName",
    // api_keys: CFG.reqHost + "v1/ifaccount/apiKeys",
    // api_key: CFG.reqHost + "v1/ifaccount/apiKey"
}

export const contractAjax = {
    // contracts: CFG.reqHost + "v1/ifcontract/contracts", //获取合约信息
    // user_position: CFG.reqHost + "v1/ifcontract/userPositions", //获取用户仓位
    // accounts: CFG.reqHost + "v1/ifcontract/accounts", //获取合约账户信息
    // userOrders: CFG.reqHost + "v1/ifcontract/userOrders", //获取用户订单记录
    // trades: CFG.reqHost + "v1/ifcontract/trades", //获取合约的交易记录
    // cancel_order: CFG.reqHost + "v1/ifcontract/cancelOrders", //取消订单
    // userTrades: CFG.reqHost + "v1/ifcontract/userTrades", //获取用户订单的交易记录
    // cash_books: CFG.reqHost + "v1/ifcontract/cashBooks", //获取合约资产变更记录(资金流水)
    // transfer_funds: CFG.reqHost + "v1/ifcontract/transferFunds", //资金划转
    // tickers: CFG.reqHost + "v1/ifcontract/tickers", //获取合约的Ticker
    // quote: CFG.reqHost + "v1/ifcontract/quote", //获取合约k线数据
}

export const c2cAjax = {
    /**
     * 无参数获取otc账户
     * ?action=create创建otc账户
     * ?action=update更新账户
     */
    // account: CFG.reqHost + "v1/ifaccount/otc/account",
    /**
     * ?action=submit提交otc订单(post)
     * ?action=payment 声明otc订单已付款(post)
     * ?action=receipt 确认otc订单收款(post)
     * ?action=cancel 取消otc订单(post)
     * ?order_id=xxx  获取otc订单(get)
     */
    // order: CFG.reqHost + "v1/ifaccount/otc/order",
    // refer_price: CFG.reqHost + "v1/ifaccount/otc/referPrice", //获取场外交易参考价格
    // order_list: CFG.reqHost + "v1/ifaccount/otc/orders", //获取订单列表
}

export const activeAjax = {
    // rank: CFG.reqHost + "v1/ifcontract/statisprofit",
    // active_info: CFG.reqHost + "v1/ifactivity/userActivityInfo"
}
