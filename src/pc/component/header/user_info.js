import React, {Component} from "react";
import "../../../assets/scss/pc/component/user_info.css";
import userIcon from "../../../assets/images/icon-heads.png";
import { exitPost } from "../../../redux/user.redux";
import { connect } from "react-redux";
import { getGlobalConfig } from "../../../redux/global.redux.js";
import { getPropetyInfo } from "../../../redux/assets.redux.js";
import { getspotTickersData } from "../../../redux/index.redux.js";
import { Route, Link ,withRouter, Redirect} from "react-router-dom";
import intl from "react-intl-universal";

@withRouter
@connect(state => ({...state.lang, ...state.gconfig, ...state.user, ...state.assets, ...state.index }), {
   getGlobalConfig,
   getPropetyInfo,
   getspotTickersData,
   exitPost
})
class UserInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            user: {},
            balance: '',
            qd: localStorage.getItem("qd")
        }
        this.toggleShow = this.toggleShow.bind(this);
        this.hideList = this.hideList.bind(this);
        this.toExit = this.toExit.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
        if (!this.props.clist) {
            this.props.getGlobalConfig();
        }
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    toggleShow() {
        if(this.mounted) {
            this.setState({
                show: !this.state.show
            })
        }
    }

    hideList(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        if(this.mounted) {
            this.setState({
                show: false
            })
        }
    }

    toExit(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        this.props.exitPost();
        this.hideList(e);
        let search = "";
        if (this.props.default && this.props.default.value) {
            search = `?lang=${this.props.default.value}`;
        }
        if (this.state.qd!=="null") {
            search = search ? search + `&qd=${this.state.qd}` : `?qd=${this.state.qd}`;
        }

        this.props.history.push(`/${search}`);

    }
    gotoUsercenter(type) {
        let search = "";
        if(this.props.default && this.props.default.value) {
            search = `?lang=${this.props.default.value}`;
        }
        if(this.state.qd) {
            search = search?search+`&qd=${this.state.qd}`:`?qd=${this.state.qd}`;
        }

        this.props.history.push(`/usercenter/account_information/${type}${search}`);
    }

    render() {
        let listStyle = {
            display: this.state.show ? 'block': 'none'
        }

        let type = this.props.user.status==2?"list":"activity";
        let user = this.props.user;

        let langSearch="";
        if(this.props.default && this.props.default.value) {
            langSearch = `?lang=${this.props.default.value}`;
        }

        return (
            <div className="header-user-info-box">
                <div className="header-mask" style={listStyle} onClick={this.hideList}></div>
                <img src={userIcon} className="header-avatar"
                    onMouseOver={this.toggleShow}
                />
                <div className="header-user-info" style={listStyle} onClick={(e) => this.hideList(e)}
                    onMouseLeave={this.hideList}>
                    <div className="account-info" onClick={() => this.gotoUsercenter(type)}>
                        <div className="account">
                            {user.email
                                ? user.email
                                : user.phone}
                        </div>
                        <div className="uid">
                            UID:{user.account_id}
                        </div>
                    </div>
                    <div className="account-menu">
                        {/* 账户安全 */}
                        {/*<Link to={{ pathname: "/usercenter/account_security/list", search: langSearch }}>{intl.get("usercenter_menu2")}</Link>*/}
                        {/* 身份认证 */}
                        {/* <Link to={{ pathname: "/usercenter/kyc", search: langSearch }}>{intl.get("kyc-title")}</Link>*/}
                        {/* 邀请返佣 */}
                        {/*<Link to={{ pathname: "/usercenter/rebate", search: langSearch }}>

                            <span className="hot-marker">{intl.get("rebate-menu-text")}</span>
                        </Link>*/}
                        {/* 手续费等级 */}
                        {/*<Link to={{ pathname: "/usercenter/fee_level", search: langSearch }}>{intl.get("fee-schedule-tier")}</Link>*/}
                        {/* API管理 */}
                        {/*<Link to={{ pathname: "/usercenter/bbx_api", search: langSearch }}>{intl.get("api-key-menu-text")}</Link>*/}
                        <a className="exit" onClick={(e) => this.toExit(e)}>
                            {intl.get("header_exit")}
                        </a>
                    </div>

                </div>

            </div>
        )
    }
}

export default UserInfo;
