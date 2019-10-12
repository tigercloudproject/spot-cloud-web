import React, { Component, Fragment } from "react";
import BBXTable from "../../component/bbx_table.js";
import intl from "react-intl-universal";
import { parseTime } from "../../../utils/parseTime.js";
import { connect } from "react-redux";
import { assetGetOrderHistory } from "../../../redux/assets.redux.js";
import { cutOutDecimal } from "../../../utils/dataProcess.js";

@connect(state => ({ ...state.assets }), {
    assetGetOrderHistory
})
class History extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        }
    }

    componentWillMount() {
        this.mounted = true;
        this.props.assetGetOrderHistory();

    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.asset_order_history) {
            if (this.mounted) {
                this.setState({
                    list: nextProps.asset_order_history
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
                title: intl.get("assets_order_thead_date"),
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
                title: intl.get("assets_order_thead_price"),
                render: (item) => {
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(item.price, units[item.stock_code].price_unit) : item.price}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_amount"),
                render: (item) => {
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(item.vol, units[item.stock_code].vol_unit) : item.vol}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_executed"),
                render: (item) => {
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(item.done_vol, units[item.stock_code].vol_unit) : item.done_vol}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_average_price"),
                render: (item) => {
                    let num = (item.swap_vol != 0 && item.done_vol != 0) ? cutOutDecimal(this.scientificToNumber(Number(item.swap_vol).div(item.done_vol)), 8) : "0.00"
                    return <span>
                        {num}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_action"),
                render: (item) => {
                    return <span>
                        {this.getStatus(item.errno)}
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

export default History;
