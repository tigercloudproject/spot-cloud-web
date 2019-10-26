import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import "../../assets/scss/pc/assets/assets_index.css";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import { getCookie } from "../../utils/cookie.js";
import ExchangeRecord from "./exchange_transaction_record.js"; // 币币交易记录



@connect(state => ({...state.user,...state.lang}))
class AssetsIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuList: [
        {
          name: intl.get("assets_menu1"),
          id: 0,
          url: `/assets/balance`,
        },
        // {
        //   name: intl.get("assets_menu2"),
        //   id: 1,
        //   url: `/assets/deposit_withdrawal`
        // },
        {
          name: intl.get("assets_menu3"),
          id: 2,
          url: `/assets/transaction`
        },
        {
          name: intl.get("rebate-menu-text"),
          id: 3,
          url: "/assets/rebate"
        }
      ],
      token: "",
    }
  }
  componentWillMount() {
    this.mounted = true;
    let token = getCookie("token");
    if (!token) {
      let langSearch = "";
      if (this.props.default && this.props.default.value) {
        langSearch = `?lang=${this.props.default.value}`;
      }
      if (!token) {
        window.location.href = window.location.protocol + "//" + window.location.host + `/login${langSearch}`;
      }
    }
  }
  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    //监听路由变化
    if(nextProps.location.pathname != this.props.location.pathname) {
      let token = getCookie("token");
      let langSearch = "";
      if (this.props.default && this.props.default.value) {
        langSearch = `?lang=${this.props.default.value}`;
      }
      if(!token) {
          window.location.href = window.location.protocol + "//" + window.location.host + `/login${langSearch}`;
      }
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    let langSearch = "";
    if(this.props.default && this.props.default.value) {
      langSearch = `?lang=${this.props.default.value}`;
    }

    return  <div className="assets-container">
              <div className="assets-body">
                  <Switch>
                    <Route exact path={`${this.props.match.url}/exchange_record/:type`} component={ExchangeRecord}></Route>
                    <Route exact path={`${this.props.match.url}/exchange_record`} component={ExchangeRecord}></Route>
                  </Switch>
              </div>
            </div>;
  }
}

export default AssetsIndex;
