//合并所有reducer 并返回
import { combineReducers } from 'redux';
import { kindex } from "./redux/kindex.redux";
import { lang } from "./redux/lang.redux";
import { gconfig } from "./redux/global.redux";
import { index } from "./redux/index.redux";
import { sdetails } from "./redux/exchange.redux";
import { user } from "./redux/user.redux";
import { assets } from "./redux/assets.redux";
import { account } from "./redux/account.redux";
import { active } from "./redux/active.redux.js"
import { trade } from "./redux/trade.redux.js";

export default combineReducers({ kindex, lang, gconfig, index, sdetails, user, assets, account, active, trade});
