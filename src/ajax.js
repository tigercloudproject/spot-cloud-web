import { getCookie } from "./utils/cookie.js";

// let host1 = getHost();
let c_host = getCookie("host");
let host1 = ''
  , contracts_kline = ''
  , bbx_websocket = ''
  , upload_img = '';


// 配置
switch ( document.domain ) {
    case 'test.bbx.com':
        // development
        host1 = "https://devapi.bbx.com/";
        // contracts_kline = 'wss://devapi.bbx.com/v1/ifspot/realTime'; //测试环境和本地
        bbx_websocket = "wss://devapi.bbx.com/v1/ifspot/realTime";    //测试环境和本地
        // upload_img = "https://devfile.bbx.com/upload?type=image"
        break;
    default:
        // production
        host1 = c_host ? 'https://' + c_host + '/' : 'https://api.bbxapp.vip/';
        // contracts_kline = 'wss://' + (c_host?c_host:'api.bbxapp.vip') + '/v1/ifcontract/realTime'; //合约k线数据websocket
        bbx_websocket = "wss://"+ (c_host?c_host:'api.bbxapp.vip') + "/v1/ifspot/realTime";
        // upload_img = "https://upload.bbx.com/upload?type=image";
};

export const globalAjax = {
    g_config: host1 + "v1/ifglobal/global",
    user_config: host1 + "v1/ifglobal/userConfigs",
    app_list: host1 + "v1/ifglobal/appBuilds"
}

export const userAjax = {
    verify_code: host1 + "v1/ifaccount/verifyCode",
    register: host1 + "v1/ifaccount/users/register",
    phone_code: host1 + "v1/ifglobal/phoneCode",
    login: host1 + "v1/ifaccount/login",
    reset_account: host1 + "v1/ifaccount/users/resetPassword",
    bind_email: host1 + "v1/ifaccount/bindEmail",
    bind_phone: host1 + "v1/ifaccount/bindPhone",
    active: host1 + "v1/ifaccount/users/active",
    logout: host1 + "v1/ifaccount/logout", //登出
    captch_check: host1 + "v1/ifaccount/captchCheck?action=", //检查是否需要图片验证码
}



export const indexAjax = {
    tickers: host1 + "v1/ifquotes/tickers",
    spot_tickers: host1 + "v1/ifmarket/v2/spotTickers",
    contracts_kline,
    quote: host1 + "v1/ifcontract/quote", //获取合约k线数据
    bbx_websocket
}

export const exchangeAjax = {
    spot_detail: host1 + "v1/ifmarket/spotDetail",
    //spot_dash: "https://api.bbx.com/v1/ifmarket/spot",
    spot_dash_two : host1 + "v1/ifmarket/v2/spot?",
    spot_dash: host1 + "v1/ifmarket/",
    save_order: host1 + "v1/ifmarket/submitOrder",
    get_order: host1 + "v1/ifmarket/getOrders",
    get_trade: host1 + "v1/ifmarket/getUserTrades",
    cancel_order: host1 + "v1/ifmarket/cancelOrder",
    cancel_orders: host1 + "v1/ifmarket/cancelOrders",
    coin_brief: host1 + "v1/ifglobal/coinBrief",  //币种介绍
    // spot_hour_dash: "https://api.bbx.com/v1/ifmarket/spothour",
    // spot_daily_dash: "https://api.bbx.com/v1/ifmarket/spotdaily"
    stocks: host1 + "v1/ifmarket/stocks", //获取现货对
}

export const assetsAjax = {
    // propety_info: host1 + "v1/ifaccount/users/me",  //获得用户资产信息
    // recharge_list: host1 + "v1/ifaccount/settles", //充值记录
    // address: host1 + "v1/ifaccount/address", //绑定充值地址
    // drawing: host1 + "v1/ifaccount/withdraw",//提现
    // recharge_amount: host1 + "v1/ifaccount/rechargeAmount",
    // withdraw_address: host1 + "v1/ifaccount/withdrawAddress", //地址管理中的接口
    // rebate: host1 + "/v1/ifaccount/rebates",
}

export const quoteAjax = {
    // dash: host1 + "v1/ifquotes/",
}

export const accountAjax = {
    // fund_pwd: host1 + "v1/ifaccount/assetPassword", //设置资金密码
    // asset_pwd_effective: host1 + "v1/ifaccount/assetPasswordEffectiveTime?action=reset",
    // google_pwd: host1 + "v1/ifaccount/GAKey", //设置谷歌验证码相关接口
    // areas: host1 + "v1/ifglobal/areas", //获取地区列表
    // kyc: host1 + "v1/ifaccount/KYCAuth",
    // upload_img,
    // set_nickname: host1 + "v1/ifaccount/user/accountName",
    // api_keys: host1 + "v1/ifaccount/apiKeys",
    // api_key: host1 + "v1/ifaccount/apiKey"
}

export const contractAjax = {
    // contracts: host1 + "v1/ifcontract/contracts", //获取合约信息
    // user_position: host1 + "v1/ifcontract/userPositions", //获取用户仓位
    // accounts: host1 + "v1/ifcontract/accounts", //获取合约账户信息
    // userOrders: host1 + "v1/ifcontract/userOrders", //获取用户订单记录
    // trades: host1 + "v1/ifcontract/trades", //获取合约的交易记录
    // cancel_order: host1 + "v1/ifcontract/cancelOrders", //取消订单
    // userTrades: host1 + "v1/ifcontract/userTrades", //获取用户订单的交易记录
    // cash_books: host1 + "v1/ifcontract/cashBooks", //获取合约资产变更记录(资金流水)
    // transfer_funds: host1 + "v1/ifcontract/transferFunds", //资金划转
    // tickers: host1 + "v1/ifcontract/tickers", //获取合约的Ticker
    // quote: host1 + "v1/ifcontract/quote", //获取合约k线数据
}

export const c2cAjax = {
    /**
     * 无参数获取otc账户
     * ?action=create创建otc账户
     * ?action=update更新账户
     */
    // account: host1 + "v1/ifaccount/otc/account",
    /**
     * ?action=submit提交otc订单(post)
     * ?action=payment 声明otc订单已付款(post)
     * ?action=receipt 确认otc订单收款(post)
     * ?action=cancel 取消otc订单(post)
     * ?order_id=xxx  获取otc订单(get)
     */
    // order: host1 + "v1/ifaccount/otc/order",
    // refer_price: host1 + "v1/ifaccount/otc/referPrice", //获取场外交易参考价格
    // order_list: host1 + "v1/ifaccount/otc/orders", //获取订单列表
}

export const activeAjax = {
    // rank: host1 + "v1/ifcontract/statisprofit",
    // active_info: host1 + "v1/ifactivity/userActivityInfo"
}
