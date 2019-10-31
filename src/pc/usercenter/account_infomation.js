import React, { Component } from "react";
import "../../assets/scss/pc/usercenter/account_infomation.css";
import { setCookie, delCookie, getCookie } from "../../utils/cookie.js";
import { connect } from "react-redux";
import { Route, Link, Redirect, withRouter } from "react-router-dom";
import { getPropetyInfo } from "../../redux/assets.redux";
import { getActiveInfo } from "../../redux/active.redux";
import Activity from "./activity";
import intl from "react-intl-universal";
import { assetApp2Account, assetQueryAccount } from "../../redux/user.redux";
import H5Header from "../component/h5_header.js";
import MediaQuery from "react-responsive";


@withRouter
@connect(state => ({ ...state.user, ...state.lang, ...state.assets, ...state.active }),{
    getPropetyInfo,
    getActiveInfo,
    assetApp2Account,
    assetQueryAccount
})
class AccountSecurity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {}
            // Demo
            , assetApp2Account: {
                origin_uid: getCookie( 'origin_uid' )
                , vol: 1
                , coin_code: 'BTC'
            }
            , assetQueryAccount: {
                origin_uid: getCookie( 'origin_uid' )
                , coin_code: 'BTC'
            }
            , currentLevel: null
        }

        this.assetApp2AccountSubmit = this.assetApp2AccountSubmit.bind( this );
        this.assetQueryAccountSubmit = this.assetQueryAccountSubmit.bind( this );
    }

    componentWillMount() {
        this.mounted = true;
        if(this.props.user) {
            if(this.mounted) {
                this.setState({
                    user: this.props.user
                })
            }
        }
        if(!this.props.propety_info) {
           this.props.getPropetyInfo();
        }

        //设置当前用户等级
        if (this.props.active_info) {
            if(this.mounted) {
                this.setState({
                    currentLevel: this.props.active_info
                })
            }
        } else {
            this.props.getActiveInfo();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate() {

    }

    componentWillReceiveProps(nextProps) {
        //console.log('account_information###nextProps###',nextProps);
        if(nextProps.user) {
            if(this.mounted) {
                this.setState({
                    user: nextProps.user
                })
            }
        }

        //设置用户等级
        if(nextProps.active_info && !this.state.currentLevel && this.mounted) {
            this.setState({
                currentLevel: nextProps.active_info
            })
        }
    }

    //监听表单项变化
  // handleValueChange( key, name, value ) {
  //       const { form } = this.state;
  //
  //       switch ( field ) {
  //           case 'agree':
  //               assetApp2Account
  //                   newFieldObj.valid = false;
  //               }
  //               break;
  //           default:
  //       }
  //
  //       if(this.mounted) {
  //
  //       }
  //     }

    //获取绑定验证码
    getBindingVrifyCode() { }

    assetApp2AccountSubmit() {
        let { origin_uid, vol, coin_code } = this.state.assetApp2Account

        this.props.assetApp2Account( {
                origin_uid
                , vol
                , coin_code
            } )
            .then( e => {
                console.log( e )
            } );
    }

    assetQueryAccountSubmit() {
        let { origin_uid, coin_code } = this.state.assetQueryAccount

        this.props.assetQueryAccount( {
                origin_uid
                , coin_code
            } )
            .then( e => {
            } );
    }

    //获取激活验证码
    getActivityVrifyCode() { }

    render() {
        //list 就显示账号列表， activity就显示激活
        let type = this.props.match.params.type;
        //console.log("type####",type);

        let tabBoxStyle = {
            paddingTop: "20px",
            paddingBottom: "20px",
            minHeight: "338px",
            width: "100%"
        };

        //let user = this.state.user;
        let user = JSON.parse(localStorage.getItem("user")) || {};
        //console.log("user###",user);

       // console.log("user###",user);
        let propety_info = this.props.propety_info;

        let nickname = user && user.account_name ? user.account_name :propety_info&&propety_info.account_name?propety_info.account_name:"";

        return (
            <section className="account-security">

                {!type ? (
                    <Redirect
                        to={{
                            pathname: "/usercenter/account_information/list",
                            search: `${location.search}`
                        }}
                    />
                ) : (
                        ""
                    )}
                {/* 修改密码 */}
                {/* {type == "reset_pwd" ? <ResetPwd /> : ""} */}

                {/* 激活 */}
                {type == "activity" ? <Activity /> : null}

                {/* 账号列表 */}
                {type == "list" ? (
                    <div className="account-list">
                        <MediaQuery minWidth={676}>
                            <div className="security-top">
                                {intl.get("usercenter_menu1")}
                                {/* <Link
                                    className="reset-pwd"
                                    to={{ pathname: "/usercenter/account_information/reset_pwd", search: `${location.search}` }}
                                >
                                    {intl.get("usercenter_change_password")}
                                </Link> */}
                            </div>
                            <div style={tabBoxStyle}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>UID</td>
                                            <td>{ user && user.account_id ? user.account_id : null}</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <dl class="assetApp2Account">
                                    <dt>
                                        <h3>Demo - 从母账号向子账号转钱</h3>
                                        <p>用户账号登录后，用一开始获得的 origin_uid 和 user_token 进行请求</p>
                                    </dt>
                                    <dd>
                                        <ul>
                                            <li><label>origin_uid 源账号Id</label><input type="text" onChange={(e) =>
                                                this.setState({
                                                    assetApp2Account: {
                                                        ...this.state.assetApp2Account
                                                        , 'origin_uid': e.target.value
                                                    }
                                                })
                                            } value={ this.state.assetApp2Account.origin_uid || '' } /></li>
                                            <li><label>vol 不要太大数额</label><input type="text" onChange={(e) =>
                                                this.setState({
                                                    assetApp2Account: {
                                                        ...this.state.assetApp2Account
                                                        , 'vol': e.target.value
                                                    }
                                                })
                                            } value={ this.state.assetApp2Account.vol || '' } /></li>
                                            <li><label>coin_code 币种</label><input type="text" onChange={(e) =>
                                                this.setState({
                                                    assetApp2Account: {
                                                        ...this.state.assetApp2Account
                                                        , 'coin_code': e.target.value
                                                    }
                                                })
                                            } value={ this.state.assetApp2Account.coin_code || '' } /></li>
                                            <li><label></label><button className="submit" onClick={this.assetApp2AccountSubmit}>提交</button></li>
                                        </ul>
                                    </dd>
                                </dl>
                                <dl>
                                    <dt>
                                        <h3>Demo - 查询账号币币资产</h3>
                                        <p>通过上面的转钱后，可以在这里查询</p>
                                    </dt>
                                    <dd>
                                        <ul>
                                            <li><label>origin_uid 源账号Id</label><input type="text" onChange={(e) =>
                                                this.setState({
                                                    assetQueryAccount: {
                                                        ...this.state.assetQueryAccount
                                                        , 'origin_uid': e.target.value
                                                    }
                                                })
                                            } value={ this.state.assetQueryAccount.origin_uid || '' } /></li>
                                            <li><label>coin_code 币种</label><input type="text" onChange={(e) =>
                                                this.setState({
                                                    assetQueryAccount: {
                                                        ...this.state.assetQueryAccount
                                                        , 'coin_code': e.target.value
                                                    }
                                                })
                                            } value={ this.state.assetQueryAccount.coin_code || '' } /></li>
                                            <li><label></label><button className="submit" onClick={this.assetQueryAccountSubmit}>提交</button></li>
                                        </ul>
                                    </dd>
                                </dl>
                            </div>
                        </MediaQuery>
                        <MediaQuery maxWidth={676}>
                            <div className="h5-box-fixed">
                                <H5Header title={intl.get("usercenter_menu1")}></H5Header>
                                <ul className="account-list-h5">
                                    <li className="clearfix">
                                        <p>UID：{ user && user.account_id ? user.account_id : null}</p>
                                    </li>
                                    <li className="clearfix">
                                        <p>{intl.get("nickname")}：{ nickname ? nickname : "BBX_" + user.account_id}</p>
                                        {nickname ? null
                                            : <Link to={{ pathname: "/usercenter/account_information/set_nickname", search: `${location.search}` }}>
                                                {intl.get("nickname-set")}
                                            </Link>}
                                    </li>
                                    <li className="clearfix">
                                        <p>{intl.get("usercenter_email")}：{user.email ? user.email : null}</p>
                                        {user.status == 1 ? (
                                            <Link to={{ pathname: "/usercenter/account_information/activity", search: `${location.search}` }}>
                                                {intl.get("usercenter_inactivated")}
                                            </Link>
                                        ) : null}
                                        {user.status == 2 && !user.email ? (
                                            <Link to={{ pathname: "/usercenter/account_information/bind_email", search: `${location.search}` }}>
                                                {intl.get("usercenter_go_bind")}
                                            </Link>
                                        ) : null}
                                        {user.status == 2 && user.email
                                            ? <span>{intl.get("usercenter_is_bind")}</span>
                                            : null}
                                    </li>
                                    <li className="clearfix">
                                        <p>{intl.get("usercenter_phone")}：{user.phone ? user.phone : null}</p>
                                        {!user.phone ? (
                                            <Link to={{ pathname: "/usercenter/account_information/bind_phone", search: `${location.search}` }}>
                                                {intl.get("usercenter_go_bind")}
                                            </Link>
                                        ) : (
                                                <span>{intl.get("usercenter_is_bind")}</span>
                                            )}
                                    </li>
                                    <li className="clearfix">
                                        <p>{intl.get("fee-schedule-tier")}: Lv5</p>
                                        <Link to={{ pathname: "/usercenter/fee_level", search: `${location.search}`}}>{intl.get("see-fee-details")}</Link>
                                    </li>
                                </ul>
                            </div>
                        </MediaQuery>
                    </div>

                ) : null}

            </section>
        );
    }
}

export default AccountSecurity;
