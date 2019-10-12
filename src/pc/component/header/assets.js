import React, {Component} from "react";
import "../../../assets/scss/pc/component/bbx_header_assets.css";
import intl from "react-intl-universal";
import { connect } from "react-redux";
import { NavLink, Link, withRouter } from "react-router-dom";

@withRouter
@connect(state => ({ ...state.lang }))
class HeaderAssets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
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
            show: true
        })
    }

    render() {
        let langSearch;
        if(this.props.default && this.props.default.value) {
            langSearch = `?lang=${this.props.default.value}`;
        }

        let listStyle = {
            display: this.state.show ? "block" : "none"
        };
        return <div className="header-assets-menu" onMouseOver={(e) => this.showList(e)} onMouseLeave={(e) => this.hideList(e)}>
            <div>
                <span>{intl.get("ASSETS")}</span>
                <i className={this.state.show ? 'iconDown rotate' : 'iconDown'}></i>
            </div>

              <ul style={listStyle}>
                {/*<li><Link to={{ pathname: "/assets/deposit", search: langSearch}}>{intl.get("assets_btn_deposit")}</Link></li>*/}
                {/*<li><Link to={{ pathname: "/assets/withdraw", search: langSearch }}>{intl.get("assets_btn_withdrawal")}</Link></li>*/}
                {/*<li><Link to={{ pathname: "/assets/exchange_account", search: langSearch}}>{intl.get("contract_coin_account")}</Link></li>*/}
                {/*<li><Link to={{ pathname: "/assets/swap_account", search: langSearch }}>{intl.get("contract_swap_account")}</Link></li>*/}
            </ul>

        </div>
    }
}

export default HeaderAssets;
