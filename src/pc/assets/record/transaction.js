import React, { Component, Fragment } from "react";
import BBXTable from "../../component/bbx_table.js";
import intl from "react-intl-universal";
import { parseTime } from "../../../utils/parseTime.js";
import { connect } from "react-redux";
import { assetGetTradeRecords } from "../../../redux/assets.redux.js";
import { cutOutDecimal } from "../../../utils/dataProcess.js";

@connect(state => ({ ...state.assets }), {
    assetGetTradeRecords
})
class Transaction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        }
    }

    componentWillMount() {
        this.mounted = true;
        this.props.assetGetTradeRecords();

    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.asset_trade_records) {
            if (this.mounted) {
                this.setState({
                    list: nextProps.asset_trade_records
                })
            }
        }
    }
    scientificToNumber(num) {
        var str = num.toString();
        var reg = /^(\d+)(e)([\-]?\d+)$/;
        var arr, len,
            zero = '';

        /*6e7或6e+7 都会自动转换数值*/
        if (!reg.test(str)) {
            return num;
        } else {
            /*6e-7 需要手动转换*/
            arr = reg.exec(str);
            len = Math.abs(arr[3]) - 1;
            for (var i = 0; i < len; i++) {
                zero += '0';
            }

            return '0.' + zero + arr[1];
        }
    }

    getStatus(status) {
        switch (status) {
            case 0: {
                return intl.get("assets_order_status0");
            }
            case 1: {
                return intl.get("assets_order_status1");
            }
            case 2: {
                return intl.get("assets_order_status2");
            }
            case 3: {
                return intl.get("assets_order_status3");
            }
            case 4: {
                return intl.get("assets_order_status4");
            }
        }
    }

    // 获取表格字段列表
    getTableColumns() {
        let units = this.props.units;
        const columns = [
            {
                title: intl.get("assets_order_thead_date2"),
                width: "180px",
                render: (item) => {
                    return parseTime(item.created_at)
                }
            },
            {
                title: intl.get("assets_order_thead_pairs"),
                dataIndex: "stock_code"
            },

            {
                title: intl.get("assets_order_thead_type"),
                render: (item) => {
                    return (
                        item.way == 1 ? (
                            <span className="green">{intl.get("assets_order_tab_buy")}</span>
                        ) : (
                                <span className="red">{intl.get("assets_order_tab_sell")}</span>
                            )
                    )
                }
            },
            {
                title: intl.get("assets_order_thead_done_price"),
                render: (item) => {
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(item.deal_price, units[item.stock_code].price_unit) : item.deal_price}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_done_amount"),
                render: (item) => {
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(item.deal_vol, units[item.stock_code].vol_unit) : item.deal_vol}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_done_total"),
                render: (item) => {
                    let num = Number(item.deal_vol).mul(Number(item.deal_price));
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(num, units[item.stock_code].price_unit) : num}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_fee"),
                render: (item) => {
                    let num = cutOutDecimal(item.fee, 8) + item.fee_coin_code;
                    return <span>
                        {num}
                    </span>
                }
            }
        ];
        return columns;
    }

    render() {
        return <Fragment>
            <BBXTable data={this.state.list} columns={this.getTableColumns()}></BBXTable>
        </Fragment>
    }
}

export default Transaction;
