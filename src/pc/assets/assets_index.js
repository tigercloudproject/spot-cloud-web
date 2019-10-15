import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import "../../assets/scss/pc/assets/assets_index.css";
// import Menu from "./assets_menu";
// import AccountBalance from "./assets_account_balance";
// import Recharge from "./assets_recharge_drawing";
// import Transaction from "./assets_transaction_record";
// import Rebate from "./rebate";
import { connect } from "react-redux";
// import defaultAvatar from "../../assets/images/icon-heads.png";
import intl from "react-intl-universal";
import { getCookie } from "../../utils/cookie.js";

// import MediaQuery from "react-responsive";

// 资产改版中。。。
// import Deposit from "./assets_r_d_recharge.js"; // 充值
// import Withdraw from "./assets_withdraw.js"; // 提现
// import ExchangeAccount from "./assets_exchange_account.js"; // 币币账户
// import SwapAccount from "./assets_swap_account.js"; // 合约账户
import ExchangeRecord from "./exchange_transaction_record.js"; // 币币交易记录
// import SwapRecord from "./swap_transaction_record.js"; // 合约交易记录
// import SwapCapitalFlow from "./swap_capital_flow.js"; // 合约资金记录
// import ExchangeCapitalFlow from "./exchange_capital_flow.js"; // 币币资金记录
// import WithdrawAddress from "./withdraw_address.js";


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

    return <div className="assets-container">
        {/* <MediaQuery minWidth={676}>
          <div className="assets-top-box">
            <img className="avatar" src={defaultAvatar} alt="avat" />
            <div className="account-info">
              <h3>{this.props.user.email
                ? this.props.user.email
                : this.props.user.phone}</h3>
              <p>UID: {this.props.user.account_id}</p>
            </div>
            <div className="account-tab">
              <NavLink to={{ pathname: "/assets", search: `${langSearch}` }} activeClassName="active">{intl.get("contract_coin_account")}</NavLink>
              <NavLink to={{ pathname: "/contract_asset", search: `${langSearch}` }} activeClassName="active">{intl.get("contract_swap_account")}</NavLink>
            </div>
          </div>
        </MediaQuery> */}
        {/* <div className="assets-body-box"> */}
          {/* <MediaQuery minWidth={676}>
              <Menu menuList={this.state.menuList} accountType={intl.get("contract_coin_account")} />  
          </MediaQuery> */}
          <div className="assets-body">
            {/* <div className="assets-left"> */}
              <Switch>
                {/* <Route exact path={`${this.props.match.url}/`} component={AccountBalance} />
                <Route exact path={`${this.props.match.url}/balance`} component={AccountBalance} />
                <Route exact path={`${this.props.match.url}/balance/:type`} component={AccountBalance} />
                <Route exact path={`${this.props.match.url}/deposit_withdrawal`} component={Recharge} />
                <Route exact path={`${this.props.match.url}/deposit_withdrawal/:type`} component={Recharge} />
                <Route exact path={`${this.props.match.url}/transaction`} component={Transaction} />
                <Route exact path={`${this.props.match.url}/transaction/:type`} component={Transaction} />
                <Route exact path={`${this.props.match.url}/rebate`} component={Rebate} /> */}
                {/* {!this.state.token ? <Redirect to={{ pathname: "/login", search: `${langSearch}` }} /> : null} */}
                {/* 改版中 */}
                {/* <Route exact path={`${this.props.match.url}/deposit`} component={Deposit}></Route> */}
                {/* <Route exact path={`${this.props.match.url}/withdraw`} component={Withdraw}></Route> */}
                {/* <Route exact path={`${this.props.match.url}/withdraw/:type`} component={Withdraw}></Route> */}
                {/* <Route exact path={`${this.props.match.url}/exchange_account`} component={ExchangeAccount}></Route> */}
                {/* <Route exact path={`${this.props.match.url}/swap_account`} component={SwapAccount}></Route> */}
                <Route exact path={`${this.props.match.url}/exchange_record/:type`} component={ExchangeRecord}></Route>
                <Route exact path={`${this.props.match.url}/exchange_record`} component={ExchangeRecord}></Route>
                {/* <Route exact path={`${this.props.match.url}/swap_record/:type`} component={SwapRecord}></Route> */}
                {/* <Route exact path={`${this.props.match.url}/swap_record`} component={SwapRecord}></Route> */}
                {/* <Route exact path={`${this.props.match.url}/swap_capital_flow`} component={SwapCapitalFlow}></Route> */}
                {/* <Route exact path={`${this.props.match.url}/exchange_capital_flow`} component={ExchangeCapitalFlow}></Route> */}
                {/* <Route exact path={`${this.props.match.url}/withdraw_address`} component={WithdrawAddress}></Route> */}
              </Switch>
            {/* </div> */}
          </div>
        {/* </div> */}
        
      </div>;
  }
}

export default AssetsIndex;
