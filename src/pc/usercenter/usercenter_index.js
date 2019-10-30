import React, { Component } from "react";
import { Route } from "react-router-dom";
import "../../assets/scss/pc/usercenter/usercenter_index.css";
import Menu from "./usercenter_menu";
import AccountInfoMation from "./account_infomation";
import { connect } from "react-redux";
import { getCookie } from "../../utils/cookie.js";

import MediaQuery from "react-responsive";

import { getPropetyInfo } from "../../redux/assets.redux";


@connect(state => ({ ...state.user, ...state.lang }), {
    getPropetyInfo
})
class UserCenterIndex extends Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.mounted = true;
        let token = getCookie( 'bbx_token' );
        if (!token) {
            let langSearch = "";
            if (this.props.default && this.props.default.value) {
                langSearch = `?lang=${this.props.default.value}`;
            }
            if (!token) {
                window.location.href = window.location.protocol + "//" + window.location.host + `/login${langSearch}`;
            }
        }
        this.props.getPropetyInfo();
    }
    componentWillUnmount() {
        this.mounted = false;
    }
    componentDidMount() {
        //console.log('match#####',this.props.match.url);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.location.pathname != this.props.location.pathname) {
            let token = getCookie( 'bbx_token' );
            //console.log("token####", token);
            let langSearch = "";
            if (this.props.default && this.props.default.value) {
                langSearch = `?lang=${this.props.default.value}`;
            }
            if (!token) {
                window.location.href = window.location.protocol + "//" + window.location.host + `/login${langSearch}`;
            }
        }
    }

    render() {
        let langSearch = "";
        if (this.props.default && this.props.default.value) {
            langSearch = `?lang=${this.props.default.value}`;
        }

        return (
            <div className="usercenter-container">
                {/* {!token?<Redirect to={{ pathname: "/", search: `${langSearch}` }}></Redirect>:null} */}
                <MediaQuery minWidth={676}>
                    <Menu />
                </MediaQuery>
                <div className="assets-body">
                    <div className="assets-left" style={{'minHeight': '709px'}}>
                        {/* <Route exact path={`${this.props.match.url}/`} component={AccountInfo} />
                        <Route exact path={`${this.props.match.url}/account_info`} component={AccountInfo} /> */}
                        <MediaQuery minWidth={676}>
                            <Route exact path={`${this.props.match.url}/`} component={AccountInfoMation} />
                        </MediaQuery>
                        <Route exact path={`${this.props.match.url}/account_info`} component={AccountInfoMation} />
                        <Route exact path={`${this.props.match.url}/account_information`} component={AccountInfoMation} />
                        <Route exact path={`${this.props.match.url}/account_information/:type`} component={AccountInfoMation} />
                    </div>
                </div>
            </div>
        );
    }
}

export default UserCenterIndex;
