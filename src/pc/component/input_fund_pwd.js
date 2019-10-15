import React, { Component } from "react";
import intl from "react-intl-universal";
import "../../assets/scss/pc/usercenter/set_fund_pwd.css";
import PwdBlockInput from "../component/pwd_block_input";
import { connect } from "react-redux";
import MD5 from "../../utils/md5.js";
import { Link, withRouter } from "react-router-dom";

@withRouter
@connect(state => ({ ...state.lang, ...state.account }))
class inputFundPwd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fundPwd: "", //资金密码
      errorText: "",
      canSubmit: true
    };

    this.setFundPwd = this.setFundPwd.bind(this);
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  closePwdBox() {
    this.props.close(1);
  }

  setFundPwdSubmit(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    let pwdReg = /^([0-9]){6}/;
    if (!pwdReg.test(this.state.fundPwd)) {
      if (this.mounted) {
        this.setState({
          errorText: intl.get("register_pwd_error1")
        });
      }

      return;
    }

    if (this.mounted) {
      this.setState({
        canSubmit: false
      });
    }

    let password = new MD5(this.state.fundPwd);

    if(this.props.title) {
      this.props.setFundPwd(this.state.fundPwd);
    }else {
      this.props.setFundPwd(password.hash());
    }
    

    this.props.close();
  }

  setFundPwd(value) {
    //console.log("资金密码###",value);
    if (this.mounted) {
      this.setState({
        fundPwd: value,
        errorText: ""
      });
    }
  }

  gotoResetPwd() {

    this.props.close(1);

    let langSearch = "";
    if (this.props.default && this.props.default.value) {
      langSearch = `?lang=${this.props.default.value}`;
    }

    // this.props.history.push({
    //   pathname: "/usercenter/account_security/reset_fund_pwd",
    //   search: langSearch
    // });
  }

  render() {
    let langSearch = "";
    if (this.props.default && this.props.default.value) {
      langSearch = `?lang=${this.props.default.value}`;
    }

    let submitValid = this.state.canSubmit && this.state.fundPwd.length === 6;

    let user = localStorage.getItem("user");
    let effective, effectiveText;
    if (user) {
      user = JSON.parse(user);
      effective = user.asset_password_effective_time;
      if (effective == -1) {
        effectiveText = intl.get("account_fund_pwd_no_effective");
      } else if (effective == 0) {
        effectiveText = intl.get("account_fund_pwd_single_effective");
      } else if (effective == 900) {
        effectiveText = intl.get("account_fund_pwd_15m_effective");
      } else if (effective == 7200) {
        effectiveText = intl.get("account_fund_pwd_2h_effective");
      }
    }

    let title = this.props.title ? this.props.title : intl.get("account_input_fund_pwd_placeholder");
    let subTitle = this.props.subtit ? this.props.subtit : intl.get("account_input_fund_pwd_care");
    return (
      <section className="set-fund-pwd-box">
        <div className="set-fund-pwd-mask" />
        <div
          className="set-fund-pwd-block"
          style={{ height: "364px", marginTop: "-182px" }}
        >
          <span className="close-btn" onClick={() => this.closePwdBox()} />
          <h3 className="set-fund-pwd-title">
            {title}
          </h3>
          <p className="set-fund-pwd-sub-title">
            {subTitle}
          </p>
          <div className="set-pwd-form">
            <div className="set-pwd-control">
              <PwdBlockInput change={this.setFundPwd} isgoogle={this.props.isgoogle}/>
            </div>
          </div>
          <p className="set-fund-pwd-error">
            {submitValid ? <span>{this.state.errorText}</span> : <span />}
          </p>
          <button
            className="set-fund-pwd-btn"
            onClick={e => this.setFundPwdSubmit(e)}
            disabled={!submitValid}
          >
            {intl.get("account_confirm")}
          </button>
          {/* <p className="effective-time">{intl.get("account_fund_pwd_effective_time")}：<a>{effectiveText}</a></p> */}
          {!this.props.title?<p className="reset-fund-password">
            {intl.get("account_forgot_password")}
            <a onClick={() => this.gotoResetPwd()}>
              {intl.get("account_goto_change")}
            </a>
          </p>:null}
        </div>
      </section>
    );
  }
}

export default inputFundPwd;