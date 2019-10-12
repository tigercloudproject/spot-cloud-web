import React, { Component } from "react";
import "../../assets/scss/pc/component/bbx_tip.css";

class BbxTip extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let titStyle = {
            color: this.props.color ? this.props.color :'##1890ff'
        }
        return <div className="bbx-tip-box">
              <a className="bbx-tip-tit" style={titStyle}>{this.props.tit}</a>
              <p className="bbx-tip-desc">{this.props.desc}</p>
          </div>;
    }
}

export default BbxTip;