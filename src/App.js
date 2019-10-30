import intl from "react-intl-universal";
import React, { Component } from "react";
import {connect} from "react-redux";
import { setDefaultLanguage } from "./redux/lang.redux.js";
import { getGlobalConfig, getUser } from "./redux/global.redux.js";
// import IntlPolyfill from "intl";
import { getQueryString } from "./utils/getQueryString.js";
import { clearSignCaches } from "./utils/common.js";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./utils/prototype.js";  //封装的prototype上的工具函数

import Layout from "./pc/component/layout";

import { getCookie } from "./utils/cookie.js";

import Loadable from 'react-loadable';
import Loading from "./pc/component/bbx_loading.js";
import ErrorPage from "./pc/component/error.js";

require("intl/locale-data/jsonp/en.js");
require("intl/locale-data/jsonp/zh.js");
require("intl/locale-data/jsonp/fr.js");
require("intl/locale-data/jsonp/ja.js");
require("intl/locale-data/jsonp/ko.js");

const PCBody = Loadable({
  loader: () => import("./pc/exchange/index"),
  loading: Loading,
  delay: 0
});

const Register = Loadable({
  loader: () => import('./pc/register/register'),
  loading: Loading,
  delay: 0
});

const Login = Loadable({
  loader: () => import('./pc/register/login'),
  loading: Loading,
  delay: 0
});

const Assets = Loadable({
  loader: () => import('./pc/assets/assets_index'),
  loading: Loading,
  delay: 0
});

const UserCenter = Loadable({
  loader: () => import('./pc/usercenter/usercenter_index'),
  loading: Loading,
  delay: 0
});

@connect(state => ({...state.gconfig, ...state.lang}), { getGlobalConfig, setDefaultLanguage,getUser })
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
   let token = getCookie( 'bbx_token' );
   if(!token) {
     clearSignCaches();
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
          <Route path="/assets" component={Assets} />
          <Route path="/usercenter" component={UserCenter} />
          <Route path="*" component={ErrorPage}></Route>
        </Switch>
      </Layout>;

    return this.state.initDone ?<div className="container">
            <Router>
              <Switch>
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
