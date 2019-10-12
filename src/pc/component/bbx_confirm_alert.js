import React, { Component } from "react";
import intl from "react-intl-universal";
import "../../assets/scss/pc/component/bbx_confirm_alert.css";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";

@withRouter
@connect(state => ({ ...state.lang, ...state.account }))
class ConfirmAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  closeBox() {
      this.props.close();
  }

  confirmBox() {
      this.props.confirm();
  }

  render() {
    let langSearch = "";
    if (this.props.default && this.props.default.value) {
      langSearch = `?lang=${this.props.default.value}`;
    }

    return (
      <section className="bbx-confirm-alert-box">
        <div className="bbx-confirm-alert-mask" />
        <div className="bbx-confirm-alert-block">
          {/* <span className="close-btn" onClick={() => this.closeBox()} /> */}
          <h3 className="tip-limit-tit">{intl.get("tip_limit_alert_title")}</h3>
          <p className="tip-limit-con">{this.props.desc}</p>
          <div className="confirm-btn-box">
            <button className="cancel" onClick={() => this.closeBox()}>{intl.get("tip_limit_btn_cancel")}</button>
            <button className="confirm" onClick={() => this.confirmBox()}>{intl.get("tip_limit_btn_confirm")}</button>
          </div>
        </div>
      </section>
    );
  }
}

export default ConfirmAlert;