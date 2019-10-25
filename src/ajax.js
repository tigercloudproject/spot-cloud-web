let host = ''
//   , contracts_kline = ''
  , bbx_websocket = ''

// 配置
switch ( window.location.hostname ) {
    case '127.0.0.1':
    case 'test.bbx.com':
        // development
        host = 'https://devapi.bbx.com/';
        bbx_websocket = "wss://devapi.bbx.com/v1/ifspot/realTime";    //测试环境和本地
        break;
    default:
        // production
        host = 'https://api.bbx.com/';
        bbx_websocket = "wss://api.bbx.com/v1/ifspot/realTime";    //测试环境和本地
};

export const globalAjax = {
    g_config: host + "v1/ifglobal/global",
    // user_config: host + "v1/ifglobal/userConfigs",
    user_config: '_simResponse/userConfigs',
    app_list: host + "v1/ifglobal/appBuilds",
    global_header: '_simResponse/globalHeader'
}

export const userAjax = {
    verify_code: host + "v1/ifaccount/verifyCode",
    // register: host + "v1/ifaccount/users/register",
    register: '_simResponse/register',
    phone_code: host + "v1/ifglobal/phoneCode",
    // login: host + "v1/ifaccount/login",
    login: '_simResponse/login',
    reset_account: host + "v1/ifaccount/users/resetPassword",
    bind_email: host + "v1/ifaccount/bindEmail",
    bind_phone: host + "v1/ifaccount/bindPhone",
    active: host + "v1/ifaccount/users/active",
    // logout: host + "v1/ifaccount/logout",
    logout: '_simResponse/logout',
    captch_check: host + "v1/ifaccount/captchCheck?action=", //检查是否需要图片验证码
}

export const indexAjax = {
    tickers: host + "v1/ifquotes/tickers",
    spot_tickers: host + "v1/ifmarket/v2/spotTickers",
    // contracts_kline,
    // quote: host + "v1/ifcontract/quote", //获取合约k线数据
    bbx_websocket
}

export const exchangeAjax = {
    spot_detail: host + "v1/ifmarket/spotDetail",
    //spot_dash: "https://api.bbx.com/v1/ifmarket/spot",
    // spot_dash_two : host + "v1/ifmarket/v2/spot?",
    spot_dash_two: '_simResponse/spot?',
    spot_dash: host + "v1/ifmarket/",
    save_order: host + "v1/ifmarket/submitOrder",
    get_order: host + "v1/ifmarket/getOrders",
    get_trade: host + "v1/ifmarket/getUserTrades",
    cancel_order: host + "v1/ifmarket/cancelOrder",
    cancel_orders: host + "v1/ifmarket/cancelOrders",
    coin_brief: host + "v1/ifglobal/coinBrief",  //币种介绍
    // spot_hour_dash: "https://api.bbx.com/v1/ifmarket/spothour",
    // spot_daily_dash: "https://api.bbx.com/v1/ifmarket/spotdaily"
    stocks: host + "v1/ifmarket/stocks", //获取现货对
}

export const assetsAjax = {
    // propety_info: host + "v1/ifaccount/users/me"  //获得用户资产信息
    propety_info: '_simResponse/me'    // 获得用户资产信息
    // recharge_list: host + "v1/ifaccount/settles", //充值记录
    // address: host + "v1/ifaccount/address", //绑定充值地址
    // drawing: host + "v1/ifaccount/withdraw",//提现
    // recharge_amount: host + "v1/ifaccount/rechargeAmount",
    // withdraw_address: host + "v1/ifaccount/withdrawAddress", //地址管理中的接口
    // rebate: host + "/v1/ifaccount/rebates",
}

export const quoteAjax = {
    // dash: host + "v1/ifquotes/",
}

export const accountAjax = {
    // fund_pwd: host + "v1/ifaccount/assetPassword", //设置资金密码
    // asset_pwd_effective: host + "v1/ifaccount/assetPasswordEffectiveTime?action=reset",
    // google_pwd: host + "v1/ifaccount/GAKey", //设置谷歌验证码相关接口
    // areas: host + "v1/ifglobal/areas", //获取地区列表
    // kyc: host + "v1/ifaccount/KYCAuth",
    // upload_img,
    // set_nickname: host + "v1/ifaccount/user/accountName",
    // api_keys: host + "v1/ifaccount/apiKeys",
    // api_key: host + "v1/ifaccount/apiKey"
}

export const contractAjax = {
    // contracts: host + "v1/ifcontract/contracts", //获取合约信息
    // user_position: host + "v1/ifcontract/userPositions", //获取用户仓位
    // accounts: host + "v1/ifcontract/accounts", //获取合约账户信息
    // userOrders: host + "v1/ifcontract/userOrders", //获取用户订单记录
    // trades: host + "v1/ifcontract/trades", //获取合约的交易记录
    // cancel_order: host + "v1/ifcontract/cancelOrders", //取消订单
    // userTrades: host + "v1/ifcontract/userTrades", //获取用户订单的交易记录
    // cash_books: host + "v1/ifcontract/cashBooks", //获取合约资产变更记录(资金流水)
    // transfer_funds: host + "v1/ifcontract/transferFunds", //资金划转
    // tickers: host + "v1/ifcontract/tickers", //获取合约的Ticker
    // quote: host + "v1/ifcontract/quote", //获取合约k线数据
}

export const c2cAjax = {
    /**
     * 无参数获取otc账户
     * ?action=create创建otc账户
     * ?action=update更新账户
     */
    // account: host + "v1/ifaccount/otc/account",
    /**
     * ?action=submit提交otc订单(post)
     * ?action=payment 声明otc订单已付款(post)
     * ?action=receipt 确认otc订单收款(post)
     * ?action=cancel 取消otc订单(post)
     * ?order_id=xxx  获取otc订单(get)
     */
    // order: host + "v1/ifaccount/otc/order",
    // refer_price: host + "v1/ifaccount/otc/referPrice", //获取场外交易参考价格
    // order_list: host + "v1/ifaccount/otc/orders", //获取订单列表
}

export const activeAjax = {
    // rank: host + "v1/ifcontract/statisprofit",
    // active_info: host + "v1/ifactivity/userActivityInfo"
}
