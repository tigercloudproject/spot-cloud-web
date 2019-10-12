/**
 * close  关闭弹窗
 * type   一个按钮还是两个按钮  1为一个按钮  2为两个按钮
 * left 左边按钮的事件
 * right 右边按钮的事件
 * single  只有一个按钮时的按钮事件
 * leftText 左边按钮文字
 * rightText 右边按钮文字
 * singleText  一个按钮文字
 * content   弹框内容
 */
// 可配置的弹框
import React, {Component} from "react";
import "../../assets/scss/pc/component/bbx_configurable_alert.css";
import intl from "react-intl-universal";
import cautionIcon from "../../assets/images/icon-Caution.svg";

class ConfigurableAlert extends Component {
    constructor(props) {
        super(props);
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

    leftButtonOnClick() {
        this.props.left();
    }

    rightButtonOnClick() {
        this.props.right();
    }

    singleButtonOnClick() {
        this.props.single();
    }

    render() {
        return <div className="bbx-configurable-alert">
            <div className="mask" />
            <div className="bbx-configurable-block">
              <i className="iconfont icon-close" onClick={() => this.closeBox()}></i>
                
                <h3 className="title">
                    {this.props.isHaveCaution?<img src={cautionIcon}/>: null}
                    <span>{this.props.tipsTitle ? this.props.tipsTitle : intl.get("tip_limit_alert_title")}</span>
                </h3>
                <p className="con">{this.props.content}</p>
                {this.props.type === 1 ? <div className="one-btn-box">
                    <button onClick={() => this.singleButtonOnClick()}>{this.props.singleText}</button>
                </div> : null}
                {this.props.type === 2 ? <div className="two-btn-box">
                    <button className="cancle" onClick={() => this.rightButtonOnClick()}>{this.props.rightText}</button>
                    <button onClick={() => this.leftButtonOnClick()}>{this.props.leftText}</button>
                </div> : null}
              
            </div>
          </div>;
    }
}

export default ConfigurableAlert;