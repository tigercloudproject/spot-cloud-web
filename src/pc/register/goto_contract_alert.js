import React, {Component} from "react";
import intl from "react-intl-universal";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "../../assets/scss/pc/register/goto_contract_alert.css";
import config from "../../config.js";

@withRouter
@connect(state => ({ ...state.lang }))
class GotoContractAlert extends Component {
  constructor(props) {
    super(props);
  }

  close() {
      this.props.close();
  }

  render() {

    let langIndex = this.props.default?this.props.default.index:"";
    let fontSizeStyle = {
        fontSize: langIndex===3?"28px":"34px"
    }
    let subTitSize = {
        fontSize: langIndex === 3 ? "30px" : "38px"
    }
    return (
      <div className="goto-contract-alert-box">
        <div className="mask" />
        <div className="goto-contract-alert">
          <span className="close" onClick={() => this.close()}/>
          <p className="tit">{intl.get("goto-contract-title")}</p>
          {/* <p className="sub-tit" style={fontSizeStyle}>{intl.get("goto-contract-sub-title1")}<span style={subTitSize}> {intl.get("goto-contract-sub-title2")} </span>{intl.get("goto-contract-sub-title3")}</p> */}
          <p className="sub-tit">{intl.get("goto-contract-sub-title1")}<span>{intl.get("goto-contract-sub-title2")}</span></p>
          <p className="sub-tit">{intl.get("goto-contract-sub-title3")}</p>
          <a href="###" className="goto-contract-btn">{intl.get("goto-contract-button-text")}</a>
        </div>
      </div>
    );
  }
}

export default GotoContractAlert;
