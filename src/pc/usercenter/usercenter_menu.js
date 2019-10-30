import React, { Component } from 'react';
import "../../assets/scss/pc/assets/assets_menu.css";
import defaultAvatar from "../../assets/images/icon-heads.png";
import { Route, Link, NavLink,withRouter } from "react-router-dom";
import { connect } from "react-redux";
import intl from "react-intl-universal";


@withRouter
@connect(state => state.user)
class UserCenterMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuList: [
                {
                    name: intl.get("usercenter_menu1"),
                    id: 0,
                    url: "/usercenter/account_information"
                }
                // {
                //     name: intl.get("usercenter_menu2"),
                //     id: 1,
                //     url: "/usercenter/account_security"
                // },
                // {
                //     name: intl.get("kyc-title"),
                //     id: 2,
                //     url: "/usercenter/kyc"
                // },
                // {
                //     name: intl.get("rebate-menu-text"),
                //     id: 3,
                //     url: "/usercenter/rebate"
                // },
                // {
                //     name: intl.get("fee-schedule-tier"),
                //     id: 4,
                //     url: "/usercenter/fee_level"
                // },
                // {
                //     name: intl.get("c2c-payment-account-bind"),
                //     id: 5,
                //     url: "/usercenter/c2c"
                // },
                // {
                //     name: intl.get("api-key-menu-text"),
                //     id: 6,
                //     url: "/usercenter/bbx_api"
                // }
            ],
            currentMenu: 0
        }
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }
    selectMenu(index) {
        if (this.mounted) {
            this.setState({
                currentMenu: index
            });
        }
    }

    render() {
        let MenuLink = this.state.menuList.map((item, index) => {

            return (
                <NavLink
                    key={index}
                    activeClassName="active"
                    to={{
                        pathname: item.url,
                        search: location.search
                    }}
                    className={location.pathname.indexOf(item.url) > -1 ? 'active' : ''}
                >
                    <span>{item.name}</span>
                </NavLink>
            );
        });
        return (
            <section className="assets-menu">
                <div className="assets-top">
                    <img src={defaultAvatar} />
                    {this.props.user.status == 1 ? (
                        <span className="status">{intl.get("header_inactive")}</span>
                    ) : (
                            ""
                        )}
                    <p className="uid">UID: {this.props.user.account_id}</p>
                    <div className="email">
                        {this.props.user.email
                            ? this.props.user.email
                            : this.props.user.phone}
                    </div>
                </div>
                {/* <ul className="menu-list">
                {MenuLi}
            </ul> */}
                <div className="menu-list user-center-menu-list">{MenuLink}</div>
            </section>
        )
    }
}

export default UserCenterMenu;;
