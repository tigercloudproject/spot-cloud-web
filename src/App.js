import intl from "react-intl-universal";
import React, { Component } from "react";
import {connect} from "react-redux";
import { setDefaultLanguage } from "./redux/lang.redux.js";
import { getGlobalConfig, getUser } from "./redux/global.redux.js";
// import IntlPolyfill from "intl";
import { getQueryString } from "./utils/getQueryString.js";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./utils/prototype.js";  //封装的prototype上的工具函数

//import PCIndex from './pc/home/pc_index';
import Layout from "./pc/component/layout";


// import TradeCompetition from "./pc/active/trade_competition.js";
// import RankList from "./pc/active/rank_list.js";

import { getCookie } from "./utils/cookie.js";
//import AssetsTransaction from "./pc/assets/assets_transaction";

import Loadable from 'react-loadable';
import Loading from "./pc/component/bbx_loading.js";
import ErrorPage from "./pc/component/error.js";

require("intl/locale-data/jsonp/en.js");
require("intl/locale-data/jsonp/zh.js");
require("intl/locale-data/jsonp/fr.js");
require("intl/locale-data/jsonp/ja.js");
require("intl/locale-data/jsonp/ko.js");


const SUPPOER_LOCALES = [
  {
    name: "English",
    value: "en-US"
  },
  {
    name: "简体中文",
    value: "zh-CN"
  },
  {
    name: "繁體中文",
    value: "zh-TW"
  },
  {
    name: "français",
    value: "fr-FR"
  },
  {
    name: "日本の",
    value: "ja-JP"
  },
  {
    name: "한국어",
    value: "ko-KR"
  },
  {
    name: "русский",
    value: "ru"
  },
  {
    name: "Tiếng việt",
    value: "vi"
  }
];

// import PCBody from "./pc/home/pc_body";
// const PCBody = Loadable({
//   loader: () => import("./pc/home/pc_body.js"),
//   loading: Loading,
//   delay: 0
// });
const PCBody = Loadable({
  loader: () => import("./pc/exchange/index"),
  loading: Loading,
  delay: 0
});
// const ExchangeNew = Loadable({
//   loader: () => import("./pc/exchange/index"),
//   loading: Loading,
//   delay: 0
// });
//import Register from "./pc/register/register";
const Register = Loadable({
  loader: () => import('./pc/register/register'),
  loading: Loading,
  delay: 0
});

//import Login from "./pc/register/login";
const Login = Loadable({
  loader: () => import('./pc/register/login'),
  loading: Loading,
  delay: 0
});

//import Retrieval from "./pc/register/retrieval";
// const Retrieval = Loadable({
//   loader: () => import('./pc/register/retrieval'),
//   loading: Loading,
//   delay: 0
// });

//import Assets from "./pc/assets/assets_index";
const Assets = Loadable({
  loader: () => import('./pc/assets/assets_index'),
  loading: Loading,
  delay: 0
});

@connect(state => ({...state.gconfig, ...state.lang}), { getGlobalConfig,setDefaultLanguage,getUser })
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initDone: false
    }
  }
  async componentWillMount() {
    this.mounted = true;

    //记录渠道号
    let search = window.location.search;
    let qd = getQueryString(search, "qd");
    if(qd) {
      localStorage.setItem("qd", qd);
    }

    //记录邀请码
    let inviter = getQueryString(search, "inviter");
    if(inviter) {
      localStorage.setItem("inviter", inviter);
    }


    if (this.props.list.length > 0) {
      this.loadLocales();
    }
    this.props.getGlobalConfig();
    // localStorage.setItem("config",JSON.stringify(this.props.clist));
  }
  componentDidMount() {
   let token = getCookie("token");
   if(!token) {
     localStorage.removeItem("user");
   }

   let user = localStorage.getItem("user");
   if(token && !user) {
     this.props.getUser().then((response) => {
       localStorage.setItem("user",JSON.stringify(response));
     });
   }
  }

  componentWillUnmount(){
    this.mounted = false;

    localStorage.removeItem("qd");
    localStorage.removeItem("inviter");
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.default && nextProps.default.value) {
      document.title = intl.get("document_title");
      let meta = document.getElementsByTagName('meta');
      meta["keywords"].setAttribute("content", intl.get("document_keyword"));
      meta["description"].setAttribute("content", intl.get("document_description"));
    }
    if(nextProps.clist) {
      localStorage.setItem("config", JSON.stringify(this.props.clist));
    }
  }

  render() {
    let LayoutRouter = <Layout>
        <Switch>
          <Route exact path="/" component={PCBody} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          {/* <Route path="/retrieval" component={Retrieval} /> */}
          <Route path="/assets" component={Assets} />
          {/* <Route path="/contract_asset" component={ContractAssets} /> */}
          {/* <Route path="/usercenter" component={UserCenter} /> */}
          {/* <Route path="/exchange" component={ExchangeNew} /> */}
          {/* <Route path="/exchange_new" component={ExchangeNew} /> */}
          {/* <Route path="/c2c" component={C2cTrade} /> */}
          {/* <Route path="/market" component={Market} /> */}
          {/* <Route path="/risk" component={Risk} /> */}
          {/* <Route path="/terms" component={Terms} /> */}
          {/* <Route path="/download" component={Download} /> */}
          {/* <Route path="/c2c_trade" component={C2cTrade} /> */}
          {/* <Route path="/about_us" component = {AboutUS} /> */}
          {/* <Route path="/join_us" component = {JoinUS} /> */}
          {/* <Route path="/super_partner" component ={SuperPartner} /> */}
          <Route path="*" component={ErrorPage}></Route>
        </Switch>
      </Layout>;

    return this.state.initDone ?<div className="container">
            <Router>
              <Switch>
                {/* <Route path="/mobile/download" component={H5Download} /> */}
                {/* <Route path="/ios_course" component={IosCourse} /> */}
                {/* <Route path="/active001" component={TradeCompetition} /> */}
                {/* <Route path="/active002" component={RankList} /> */}
                {/* <Route path="/ltc" component={Ltc}></Route> */}
                <Route path="/" render={props=> LayoutRouter} />
                <Route path="*" component={ErrorPage}></Route>
              </Switch>
            </Router>

        </div>:<Loading></Loading>
  }

  loadLocales() {
    let currentLocale = intl.determineLocale({
      urlLocaleKey: "lang",
      cookieLocaleKey: "lang"
    });

    // if (!_.find(SUPPOER_LOCALES, { value: currentLocale })) {
    //   currentLocale = "en-US";
    // }
    //console.log("#####currentLocale##处理前###",currentLocale);
    //console.log("SUPPOER_LOCALES@@@", SUPPOER_LOCALES);
    //判断当前浏览器语言是否在本地语言库（中，繁，英）
    //if(!this.isInSupporeLocales(SUPPOER_LOCALES,currentLocale)) {
      // console.log("currentLocale###", currentLocale);
      if(currentLocale.indexOf("zh-TW")>-1 || currentLocale.indexOf("tw")>-1) {
        currentLocale = "zh-TW";
      }else if(currentLocale.indexOf("zh")>-1 || currentLocale.indexOf("CN")>-1){
        currentLocale = "zh-CN";
      }else if(currentLocale.indexOf("ko")>-1) {
        currentLocale = "ko-KR";
      }else if(currentLocale.indexOf("ru")>-1) {
        currentLocale = "ru";
      }else if(currentLocale.indexOf("vi")>-1) {
        currentLocale = "vi";
      }
      else {
        currentLocale = "en-US";
      }

    this.props.setDefaultLanguage(this.props.list, String(currentLocale));

    intl.init({
      currentLocale,
      locales: {
        [currentLocale]: require(`./locales/${currentLocale}`)
      }
    });

    this.setState({ initDone: true });
  }

  //判断当前浏览器语言是否在本地语言库（中，繁，英）
  isInSupporeLocales(list,lang) {
    for(let i=0; i<list.length; i++) {
      if(list[i].value===lang) {
        return true;
      }
    }
    return false;
  }
}

export default App;
