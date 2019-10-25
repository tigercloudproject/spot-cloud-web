import React, {Component} from 'react';
import {connect} from 'react-redux';
import "../../../assets/scss/pc/home/switch_language.css";
import { getGlobalConfig } from "../../../redux/global.redux.js";
import { setCookie } from "../../../utils/cookie.js";
import CFG from "../../../config.js";

@connect( state=>state.lang, {
  getGlobalConfig
})
class SwitchLanguage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      currentLang: this.props.default,

    };
    this.toggleList = this.toggleList.bind(this);
  }
  componentDidMount() {

  }
  componentWillUnmount() {

  }
  toggleList() {
    this.setState({
      show: !this.state.show
    });
  }

  hideList(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    this.setState({
      show: false
    })
  }

  showList(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    this.setState({
      show: true
    })
  }

  changeLang(item,e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    let lang = item.value;

    //切换语言时将语言存入localstorage, 为了在请求接口时带bbx-lang参数
    let slang = lang.toLowerCase();
    if (slang == "en-us") {
      slang = "en";
    }

    if (window._MEIQIA && slang.indexOf("zh") >-1) {
      window._MEIQIA("init");
    }else {
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
        } else if (lang === "vi") {
          window.zE("webWidget", "setLocale", "vi");
        } else {
          window.zE("webWidget", "setLocale", "en-US");
        }
      }

    }

    localStorage.setItem("lang", slang);
    setCookie("lang", slang, 1, CFG.mainDomainName, "/");

    let search = location.search.split("?")[1];
    let searchArr = search?search.split("&"):[];

    if(searchArr.length>0) {
      let result = `?lang=${lang}`;
      for(let i=0; i<searchArr.length; i++) {
        let name = searchArr[i].split("=")[0];
        if(name!=="lang" && name) {
          result = result + "&" + searchArr[i];
        }
      }
      location.search = result;
    }else {
      location.search = `?lang=${lang}`;
    }

    this.props.getGlobalConfig();
    this.hideList(e);

  }

  render() {
    let listStyle = {
      display: this.state.show ? "block" : "none"
    };

    let langLI = this.props.list.map((item,index) => (
      <li key={item.name} className={item.id===this.state.currentLang?'active':''} onClick={(e)=>{this.changeLang(item,e)}}>
        {item.name}
      </li>
    ));
    return (
      <div className="lang-box" onMouseOver={(e) => this.showList(e)} onMouseLeave={(e) => this.hideList(e)}>
        <span className="lang-name">
          <span>{this.props.default.name}</span>
          {this.props.color === 'white' ?
          <i className="iconDownWhite"></i>
          :<i className={this.state.show?'iconDown rotate':'iconDown'}></i>}
        </span>
        <ul className="lang-list" style={listStyle}>
          {langLI}
        </ul>
      </div>
    );
  }
}

export default SwitchLanguage;
