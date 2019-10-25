import React, { Component } from 'react';
import intl from "react-intl-universal";
import "../../../assets/scss/pc/component/line_switching.css";
import {setCookie, getCookie} from "../../../utils/cookie.js";
import CFG from "../../../config.js";

class LineSwitching extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            list: [
                {
                    name: intl.get("line-switch1"),
                    host: "api.bbxapp.vip"
                },
                {
                    name: intl.get("line-switch2"),
                    host: "api.bbxapp.top"
                },
                {
                    name: intl.get("line-switch3"),
                    host: "api.bbx.com"
                }
            ],
            currentHost: "",
            showGuide: false
        }
    }

    componentWillMount() {
        this.mounted = true;
        let showGuide = localStorage.getItem("isShowGuide");
        if(!showGuide) {
            localStorage.setItem("isShowGuide", "true");
            if(this.mounted) {
                this.setState({
                    showGuide: true
                })
            }
        }else {
            if(this.mounted) {
                this.setState({
                    showGuide: false
                })
            }
        }

        let c_host = getCookie('host');
        if (c_host === "api.bbx.com") {
            if (this.mounted) {
                this.setState({
                    currentHost: intl.get("line-switch3")
                })
            }
        } else if(c_host === "api.bbxapp.top") {
            if (this.mounted) {
                this.setState({
                    currentHost: intl.get("line-switch2")
                })
            }
        } else {
            if (this.mounted) {
                this.setState({
                    currentHost: intl.get("line-switch1")
                })
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {

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
            show: !this.state.showGuide
        })
    }
    switchLine(host) {
        // setHost(host);
        setCookie("host", host, 7, CFG.mainDomainName, "/");
        setTimeout(() => {
            window.location.reload();
        }, 200)
    }

    hideGuide() {
        if(this.mounted) {
            this.setState({
                showGuide: false
            })
        }
    }

    render() {
        let listStyle = {
            display: this.state.show && !this.state.showGuide ? "block" : "none"
        };

        let listLi;
        listLi = this.state.list.map((item, index) => {
            return <li key={index} onClick={() => this.switchLine(item.host)}>
                {item.name}
            </li>
        })
        return <div className="line-switching-box" onMouseOver={(e) => this.showList(e)} onMouseLeave={(e) => this.hideList(e)}>
            <div className="name">
                <span>{this.state.currentHost}</span>
                <i className={this.state.show ? 'iconDown rotate' : 'iconDown'}></i>
            </div>
            {this.state.showGuide?<div className="guide-mask" onClick={() => this.hideGuide()}></div>:null}
            {this.state.showGuide?<div className="guide">
                <p>{intl.get("line-switch-guide")}</p>
                <div><span onClick={() => this.hideGuide()}>{intl.get("line-switch-acknowledge")}</span></div>
                {/* <span className="close" onClick={() => this.hideGuide()}></span> */}
            </div>:null}
            <ul className="list" style={listStyle}>
                {listLi}
            </ul>
        </div>
    }
}

export default LineSwitching;
