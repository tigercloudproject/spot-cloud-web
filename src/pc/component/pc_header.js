import React from "react";
import "../../assets/scss/pc/home/home_header.css";
import { getspotTickersData } from "../../redux/index.redux.js";
import SwitchLanguage from "./header/switch_language.js";
import LineSwitching from "./header/line_switching.js";
import HeaderAssets from "./header/assets.js";
import intl from "react-intl-universal";
import { NavLink, Link, withRouter } from "react-router-dom";
import UserInfo from "./header/user_info";
import { getCookie } from "../../utils/cookie.js";

import {connect} from "react-redux";
import MediaQuery from "react-responsive";

import logo from "../../assets/images/bbx_logo.svg";
import avatarGray from "../../assets/images/h5/H5-ICON-my1.svg";
import avatarLight from "../../assets/images/icon-heads.png";
import menuIcon from "../../assets/images/h5/H5-ICON-Setting.svg";
import closeIcon from "../../assets/images/h5/H5-ICON-close.svg";
import { setCookie } from "../../utils/cookie.js";
import QRCode from "../component/qrcode.js";
import config from "../../hostConfig.js";
import { getPropetyInfo } from "../../redux/assets.redux";


@withRouter
@connect(state=>({...state.user,...state.lang, ...state.index, ...state.assets}),{
  getspotTickersData,
  getPropetyInfo
})
class PCHeader extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        firstCoinPair: 'BTC/USDT',
        qd: localStorage.getItem("qd"),
        h5MenuShow: false,
        isShowContract: false
      }

      this.h5MenuToggle = this.h5MenuToggle.bind(this);
      this.closeH5Menu = this.closeH5Menu.bind(this);
    }

    componentWillMount() {
      this.mounted = true;
      this.props.getspotTickersData();

      let token = getCookie("token");
      if (token) {
        this.props.getPropetyInfo()
      }
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    componentDidMount() {
      let lang = localStorage.getItem("lang") || this.props.default.value;

      if (window._MEIQIA) {
        if(lang.indexOf("zh")>-1) {
          window._MEIQIA("init");
        }else {
          let root = document.getElementById("root");
          let newScript = document.createElement("script");
          newScript.src = "https://static.zdassets.com/ekr/snippet.js?key=0bf69005-6b8a-4c0f-9eea-414d4f52511c";
          newScript.id = "ze-snippet";
          root.appendChild(newScript);

          newScript.onload = function() {
            if (lang.indexOf("ko") > -1) {
              window.zE("webWidget", "setLocale", "ko");
            } else if (lang === "ru") {
              window.zE("webWidget", "setLocale", "ru");
            } else if (lang.indexOf("vi") > -1) {
              window.zE("webWidget", "setLocale", "vi");
            } else {
              window.zE("webWidget", "setLocale", "en-US");
            }
          }
        }
      }

    }

    componentWillReceiveProps(nextProps) {
      // if (nextProps.propety_info) {
      //   console.log('nextProps.propety_info####', nextProps.propety_info);
      // }
    }

    h5MenuToggle() {
      if(this.mounted) {
        this.setState({
          h5MenuShow: !this.state.h5MenuShow
        })
      }
    }

    closeH5Menu() {
      if(this.mounted) {
        this.setState({
          h5MenuShow: false
        })
      }
    }

    changeLang(item, e) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();

      let lang = item.value;

      //切换语言时将语言存入localstorage, 为了在请求接口时带bbx-lang参数
      let slang = lang.toLowerCase();
      if (slang == "en-us") {
        slang = "en";
      }

      if (window._MEIQIA) {
        if (slang.indexOf("zh") > -1) {
          window._MEIQIA("init");
        } else {
          let root = document.getElementById("root");
          let newScript = document.createElement("script");
          newScript.src = "https://static.zdassets.com/ekr/snippet.js?key=0bf69005-6b8a-4c0f-9eea-414d4f52511c";
          newScript.id = "ze-snippet";
          root.appendChild(newScript);
          newScript.onload = function () {
            if (lang.indexOf("ko") > -1) {
              window.zE("webWidget", "setLocale", "ko");
            } else if (lang === "ru") {
              window.zE("webWidget", "setLocale", "ru");
            } else if(lang === "vi") {
              window.zE("webWidget", "setLocale", "vi");
            } else {
              window.zE("webWidget", "setLocale", "en-US");
            }
          }
        }
      }

      localStorage.setItem("lang", slang);
      setCookie("lang", slang, 1, "bbx.com", "/");

      let search = location.search.split("?")[1];
      let searchArr = search ? search.split("&") : [];

      if (searchArr.length > 0) {
        let result = `?lang=${lang}`;
        for (let i = 0; i < searchArr.length; i++) {
          let name = searchArr[i].split("=")[0];
          if (name !== "lang" && name) {
            result = result + "&" + searchArr[i];
          }
        }
        location.search = result;
      } else {
        location.search = `?lang=${lang}`;
      }

      this.props.getGlobalConfig();
      this.hideList(e);

    }

    showContractList() {
      if(this.mounted) {
        this.setState({
          isShowContract: true
        })
      }
    }

    hideContractList() {
      if(this.mounted) {
        this.setState({
          isShowContract: false
        })
      }
    }

    render() {
        let langSearch, langIndex;
        if (this.props.default && this.props.default.value) {
          langSearch = `?lang=${this.props.default.value}`;
          langIndex = this.props.default.index;
        }

        let HeaderButton;
        let lang_code = '',search='';

        if(this.props.default && this.props.default.value) {
          lang_code = this.props.default.value;
          search = `?lang=${lang_code}`;
        }

        if(this.state.qd!=="null") {
          if(search) {
            search = search + `&qd=${this.state.qd}`;
          }else {
            search = `?qd=${this.state.qd}`;
          }

        }

        let token = getCookie("token");

        if(token) {
          HeaderButton = (
            <div className="avatar-box"><UserInfo></UserInfo></div>
          )
        }else {
          HeaderButton = (
            <div className="no-login">
              <NavLink to={{pathname:"/register",search:`${search}`}} activeClassName="active" className="sign-in">{intl.get("SIGNUP")}</NavLink>
              <NavLink to={{pathname:"/login",search:`${search}`}} activeClassName="active" className="log-in">{intl.get("LOGIN")}</NavLink>
            </div>)
        }


        let exchangeSearch = "";
        if (this.props.default && this.props.default.value) {
          exchangeSearch=`?coinPair=${this.state.firstCoinPair}&lang=${this.props.default.value}`;
        } else {
          exchangeSearch=`?coinPair=${this.state.firstCoinPair}`;
        }

        if(this.state.qd !== "null") {
          exchangeSearch = exchangeSearch + `&qd=${this.state.qd}`;
        }

        let lang = this.props.default;
        let langCode = lang.value.toLowerCase();

        const h5MenuShow = this.state.h5MenuShow;


        let langLI = this.props.list.map((item, index) => (
          <li key={item.name} onClick={(e) => { this.changeLang(item, e) }}>
            {item.name}
          </li>
        ));

        return <header className="pc-header-box">
            <MediaQuery minWidth={676}>
              <div className="pc-header">
                <Link to={`/${search}`} className="logo">
                  <img src={logo} alt="logo" />
                </Link>
                {/* <div className="pc-nav-left">
                  {
                    this.state.firstCoinPair ?
                          <NavLink className="exchange" activeStyle={{ color: "#5f8ed4" }} to={{ pathname: "/exchange", search: `${exchangeSearch}` }}>
                            {intl.get("EXCHANGE")}
                          </NavLink>
                          : <a className="exchange">{intl.get("EXCHANGE")}</a>
                  }
                </div> */}

                <nav className="pc-nav clearfix">
                  {/* <div className="jump-list">
                    {token ? <div className="header-assets"><HeaderAssets></HeaderAssets></div> : null}
                  </div> */}

                  {HeaderButton}
                  {/* <div className="line-switch">
                    <LineSwitching></LineSwitching>
                  </div> */}
                  <div className="language">
                    <SwitchLanguage />
                  </div>
                </nav>
              </div>
            </MediaQuery>
            <MediaQuery maxWidth={676}>
                <div className="pc-header-h5">
                  <div className="menu">
                    {
                      h5MenuShow ?
                        <img className="icon-close" src={closeIcon} onClick={this.h5MenuToggle} />:
                        <img className="icon-menu" src={menuIcon} onClick={this.h5MenuToggle} />
                    }
                    <Link to={`/${search}`} className="logo"><img className="logo" src={logo} alt="logo"/></Link>
                    {
                      token?<Link to={{pathname: "/usercenter",search: `${search}`}}><img className="avatar" src={avatarLight} alt="avatar"/></Link>:
                      <NavLink to={{pathname:"/login",search:`${search}`}} activeClassName="active" className="sign-in"><img className="avatar" src={avatarGray} alt="avatar"/></NavLink>
                    }

                  </div>
                  {this.state.h5MenuShow?<ul className="nav-h5" onClick={this.closeH5Menu}>
                    {/* <li><NavLink to={{ pathname: "/", search: `${search}`}} activeStyle={{ color: "#5f8ed4" }}>{intl.get("HOME")}</NavLink></li> */}
                    {/* <li><NavLink to={{ pathname: "/exchange", search: `${exchangeSearch}` }} activeStyle={{ color: "#5f8ed4" }}>{intl.get("EXCHANGE")}</NavLink></li> */}
                    {/* <li><a href={config.swapHost}>{intl.get("realTrading")}</a></li> */}
                    {/* <li><a href={`${config.swapHost}/game/trade`}>{intl.get("simulationTrading")}</a></li> */}
                    {/* <li><NavLink activeStyle={{ color: "#5f8ed4" }} to={{ pathname: "/c2c_trade", search: `${search}` }}>{intl.get("c2c")}</NavLink></li> */}
                    {/* <li><a className="contract_bouns" href={`${config.swapHost}/competition`}>{intl.get("swapCompetition")}</a></li> */}
                    {/*<li><NavLink activeStyle={{ color: "#5f8ed4" }} to={{pathname: "/super_partner", search: `${search}`}}>{intl.get("super-partners")}</NavLink></li>*/}
                    {/* <li><a href={`${config.swapHost}/m/bonus`}>{intl.get("contractBonus")}</a></li> */}
                    {/* <li>
                      {token ? <NavLink activeStyle={{ color: "#5f8ed4" }} to={{ pathname: "/usercenter/rebate", search: `${search}` }}>
                        {intl.get("rebate-menu-text")}
                      </NavLink> : <a href={`https://support.bbx.com/hc/${lang_code.toLowerCase()}/articles/360004879913`} target="_blank">
                          {intl.get("rebate-menu-text")}
                        </a>}
                    </li> */}
                    {/* <li>
                      <a href={`https://support.bbx.com/hc/${langCode}/sections/360001701593`} target="_blank">
                        {intl.get("contract_help")}
                      </a>
                    </li> */}
                    {/* <li>
                      <a target="_blank" href={`https://support.bbx.com/hc/${langCode}/categories/360000051514`}>
                        {intl.get("ANNOUNCEMENT")}
                      </a>
                    </li> */}

                    {/* {token ?<li>
                       <NavLink activeStyle={{ color: "#5f8ed4" }} to={{ pathname: "/assets", search: `${search}` }}>
                        {intl.get("ASSETS")}
                      </NavLink>
                    </li>: null} */}

                    {langLI}

                  </ul>:null}
                </div>
            </MediaQuery>
          </header>;

    }
}

export default PCHeader;
