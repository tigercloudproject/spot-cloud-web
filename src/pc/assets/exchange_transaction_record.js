import React, { Component } from "react";
// import Breadcrumbs from "./record/breadcrumbs.js";
import HeaderTab from "./account/header_tab.js";
// import Operating from "./record/operating.js";
import "../../assets/scss/pc/assets/exchange_transaction_record.css";
import { connect } from "react-redux";
import { getStocks } from "../../redux/trade.redux.js";
import { withRouter } from "react-router-dom";
import Current from "./record/current.js";
import History from "./record/history.js";
import Transaction from "./record/transaction.js";
import intl from "react-intl-universal";

import H5Header from "../component/h5_header.js";
import MediaQuery from "react-responsive";

@withRouter
@connect(state => ({ ...state.assets, ...state.gconfig, ...state.trade }), {
    getStocks
})

class TransactionRecord extends Component {
    constructor(props) {
        super(props);
        this.state = {
            breadcrumbsList: [ // 面包屑导航
                {
                    name: intl.get("contract_coin_account"),  //币币账户
                    url: "/assets/exchange_account"
                },
                {
                    name: intl.get("assets_menu3"), // 交易记录
                    url: ""
                }
            ],
            tabList: [ // tab切换
                {
                    name: intl.get("assets_open_orders"), // 当前委托
                    url: "/assets/exchange_record/current"
                },
                {
                    name: intl.get("assets_order_history"), // 历史委托
                    url: "/assets/exchange_record/history"
                },
                {
                    name: intl.get("assets_menu3"), // 交易记录
                    url: "/assets/exchange_record/transaction"
                }
            ],
            units: {}, //单位
        }
    }

    componentWillMount() {
        this.mounted= true;
        if (!this.props.stocks || this.props.stocks.length<1) {
            this.props.getStocks();
        } else {
            this.setUnitList(this.props.stocks);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.stocks !== nextProps.stocks) {
            this.setUnitList(nextProps.stocks);
        }
    }

    //设置单位列表
    setUnitList(list) {
        let result = {};
        list.forEach((item, index) => {
            result[item.stock.name] = {
                price_unit: item.stock.price_unit,
                vol_unit: item.stock.vol_unit
            };
        });

        if (this.mounted) {
            this.setState({
                units: result
            });
        }
    }

    render() {
        let type = this.props.match.params.type;
        type = type ? type : "current"

        return <div className="transaction-record-box">
            <MediaQuery maxWidth={700}>
                <H5Header title={intl.get("assets_menu3")}></H5Header>
            </MediaQuery>
            {/*<Breadcrumbs list={ this.state.breadcrumbsList }></Breadcrumbs>*/}
            <div className="record-body">
                <div className="record-header-tab">
                    <HeaderTab list={this.state.tabList}></HeaderTab>
                </div>
                {/* <div className="table-operate">
                    <Operating></Operating>
                </div> */}
            </div>
            <div className="record-list">
                {type==="current"?<Current units={this.state.units}></Current>:null}
                {type==="history"?<History units={this.state.units}></History>:null}
                {type === "transaction" ? <Transaction units={this.state.units}></Transaction>:null}
            </div>

        </div>
    }
}

export default TransactionRecord;
