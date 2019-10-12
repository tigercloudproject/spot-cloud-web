import React, {Component} from "react";
import "../../assets/scss/pc/assets/assets_account.css";
// import HeaderTab from "./account/header_tab.js"; // 头部tab切换
import Valuation from "./account/valuation.js"; // 资产估值
import TableTop from "./account/account_table_top.js"; // 表格头部
import BBXTable from "../component/bbx_table.js";
import { connect } from "react-redux";
import { getGlobalConfig } from "../../redux/global.redux.js";
import { getPropetyInfo } from "../../redux/assets.redux.js";
// import { getspotTickersData } from "../../redux/index.redux.js";
import { getBbxTicker } from "../../redux/index.redux.js";

import { webExchange, webExchangeSingle } from "../../utils/exchange2.js";
import { cutOutDecimal, cutOut } from "../../utils/dataProcess.js";
import { getSortUp, getSortDown } from "../../utils/sort.js";
import intl from "react-intl-universal";
import { Link } from "react-router-dom";
import { notification } from "antd";
import { debounce } from "../../utils/debounce.js";

import H5Header from "../component/h5_header.js";
import MediaQuery from "react-responsive";


//资金划转相关
import { getContractInfo, getUserPosition, getConstractAccounts, contractTransferFundsPost } from "../../redux/contract_assets.redux";
import { calculateCloseLongProfitAmount, CalculateCloseShortProfitAmount } from "../../utils/contractFormula/close";
import { IsReverse, MarginCoin } from "../../utils/contractFormula/common";
import FundsTransferAlert from "../component/funds_transfer_alert.js";

@connect(state => ({ ...state.gconfig, ...state.user, ...state.assets, ...state.index, ...state.lang }), {
    getGlobalConfig,
    getPropetyInfo,
    // getspotTickersData,
    getBbxTicker,

    getContractInfo,
    getUserPosition,
    getConstractAccounts,
    contractTransferFundsPost
})
class ExchangeAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabList: [
                {
                    name: intl.get("contract_coin_account"),
                    url: "/assets/exchange_account"
                }
                // {
                //     name: intl.get("contract_swap_account"),
                //     url: "/assets/swap_account"
                // }
            ],
            valuationData: null,
            contracts: [], //合约
            contractBalance: 0, //合约可提现额
            coinBalance: 0, //币币可提现额
            showTransform: false, //是否显示资金转化
            coinList: [],  //可划转币种列表
            contractAccounts: null, //合约账户信息
            spot_coins: [],
            spotTickers: [],
            coinPrice: [],
            usdRates: [],
            userAssetList: [],
            origin_userAssetList: [],
            coinRateBase: [],//选项
            currentCoin: '', //当前币种
            valuation: 0, //估值
            totalAmount: 0, //总额
            availableVol: 0, //可用
            freezeVol: 0, //冻结
            priceUSD: null,
            valuationCNY: 0,
            valuationUSD: 0,
            valuationUSDT: 0,
            zeroList: [],
            origin_zeroList: [],
            isShowZero: false, // 是否显示为0资产
            currentCoinName: "", // 当前币种名称(资金划转默认币种)
            defaultIsShowZero: false,
        }

        this.toggleZeroAssets = this.toggleZeroAssets.bind(this);
        this.closeTransformAlert = this.closeTransformAlert.bind(this);
        this.openTransformAlert = this.openTransformAlert.bind(this);
        this.transferFunds = this.transferFunds.bind(this);
        this.searchChange = this.searchChange.bind(this);


        //搜索我的资产
        this.toSearch = debounce(function (data) {
            let result = [];
            this.state.origin_userAssetList.forEach((item) => {
                if (item.coin_code.indexOf(data.toUpperCase()) > -1) {
                    result.push(item);
                }
            })

            if (this.mounted) {
                this.setState({
                    userAssetList: result
                })
            }

            let searchZeroList = [];
            this.state.origin_zeroList.forEach((item) => {
                if (item.name.indexOf(data.toUpperCase()) > -1) {
                    searchZeroList.push(item);
                }
            })

            if (this.mounted) {
                this.setState({
                    zeroList: searchZeroList
                })
            }

        }, 500);
    }

    componentWillMount() {
        this.mounted = true;
        this.props.getGlobalConfig();
        this.props.getPropetyInfo();
        // this.props.getspotTickersData();
        this.props.getBbxTicker();
        this.getContractBalance(); //获取合约可提现额

        if (this.props.clist && this.props.clist.coin_prices) {
            this.setPrice(this.props.clist.coin_prices);
        }

        if(this.mounted) {
            this.setState({
                defaultIsShowZero: localStorage.getItem("defaultIsShowZero")
            })
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.clist && nextProps.clist.spot_coins) {
            this.setState({
                spot_coins: nextProps.clist.spot_coins
            })
        }
        //获取bbx_ticker
        if (nextProps.bbx_ticker) {
            if (this.mounted) {
                this.setState({
                    spotTickers: nextProps.bbx_ticker
                })
            }
        }
        //获取coinPrice
        if (nextProps.clist && nextProps.clist.coin_prices) {
            if (this.mounted) {
                this.setState({
                    coinPrice: nextProps.clist.coin_prices
                })
            }
            this.setPrice(nextProps.clist.coin_prices);
        }

        //获取usdRates
        if (nextProps.clist && nextProps.clist.usd_rates) {
            if (this.mounted) {
                this.setState({
                    usdRates: nextProps.clist.usd_rates
                })
            }
        }

        //获取user_assets
        if (nextProps.propety_info && nextProps.propety_info.user_assets && this.state.origin_userAssetList.length < 1) {
            if (this.mounted) {
                let assets = nextProps.propety_info.user_assets ? nextProps.propety_info.user_assets : [];
                let balance = this.getCoinBalance(assets, "USDT");

                this.setState({
                    userAssetList: nextProps.propety_info.user_assets,
                    origin_userAssetList: nextProps.propety_info.user_assets,
                    coinBalance: balance
                })
            }
        }

        //获取coin_rate_base
        if (nextProps.clist && nextProps.clist.coin_rate_bases) {
            if (this.mounted) {
                this.setState({
                    coinRateBase: nextProps.clist.coin_rate_bases
                })
                if (!this.state.currentCoin) {
                    this.setState({
                        currentCoin: nextProps.clist.coin_rate_bases[0].name
                    })
                }
            }
        }

        if (nextProps.bbx_ticker && nextProps.clist && nextProps.clist.coin_prices && nextProps.clist.usd_rates && nextProps.propety_info && nextProps.propety_info.user_assets && nextProps.clist.coin_rate_bases && this.state.priceUSD) {
            // let array = this.state.userAssetList;
            // console.log("11");
            let array = nextProps.propety_info.user_assets;

            // let toCode = !this.state.currentCoin ? nextProps.clist.coin_rate_bases[0].name : this.state.currentCoin;
            let toCode = "USDT";
            let coin_price = nextProps.clist.coin_prices;
            let usd_rates = nextProps.clist.usd_rates;
            let spotTickers = nextProps.bbx_ticker;

            // 资产列表中资产都加USDT换算

            let available = webExchange(array, toCode, coin_price, usd_rates, spotTickers, "available_vol");
            let freezeVol = webExchange(array, toCode, coin_price, usd_rates, spotTickers, "freeze_vol");
            let usdt = Number(available).add(Number(freezeVol));
            let priceUSD = this.state.priceUSD;
            let usd = usdt.mul(Number(priceUSD["USDT"]));
            let cny = this.getCNYrate(nextProps.clist.usd_rates);
            let cny_result = Number(usd).mul(Number(cny));
            if (this.mounted) {
                this.setState({
                    // totalAmount: cutOut(amount, 2),
                    // availableVol: cutOut(available, 2),
                    // freezeVol: cutOut(freezeVol, 2)
                    valuationCNY: cny_result,
                    valuationUSD: usd,
                    valuationUSDT: usdt
                })
            }
            this.addConversionUSDT(array, coin_price, usd_rates, spotTickers, priceUSD);
        }

        //获取余额为0的币
        if (nextProps.clist && nextProps.clist.spot_coins && nextProps.propety_info) {
            if (nextProps.propety_info.user_assets) {
                this.setZeroCoinList(nextProps.clist.spot_coins, nextProps.propety_info.user_assets);
            } else {
                this.setZeroCoinList(nextProps.clist.spot_coins, []);
            }

        }
    }

    //加入 usdt换算后的值
    addConversionUSDT(list, coin_price, usd_rates, spotTickers, priceUSD) {
        // console.log("priceUSD###", priceUSD);
        // webExchangeSingle
        let result = [], usd=0, usdt=0,resultItem,amount=0,code="";
        // console.log("list###", list);
        list.forEach((item, index) => {
            code = item.coin_code.toUpperCase();
            amount = Number(item.available_vol).add(Number(item.freeze_vol));
            if (priceUSD[code]) {
                usd = Number(priceUSD[code]).mul(amount);
                usdt = usd.div(Number(priceUSD["USDT"]));
            } else {
                usdt = webExchangeSingle(item.coin_code, "USDT", amount, coin_price, usd_rates, spotTickers);
                usd = usd.mul(Number(priceUSD["USDT"]));
            }
            // console.log("usd####",item.coin_code,":###", usd);
            // usdt = usd.div(Number(priceUSD["USDT"]));
            // console.log("usdt####", item.coin_code, ":###", usdt);
            resultItem = {...item};
            resultItem["usdt"] = usdt;
            result.push(resultItem);
        })
        // console.log("result###", result);
        // return result;
        if (this.mounted) {
            this.setState({
                userAssetList: result,
                origin_userAssetList: result,
            })
        }

        // 如果defaultIsShowZero是true则显示隐藏最小额的列表
        const defaultIsShowZero = localStorage.getItem("defaultIsShowZero");
        if (defaultIsShowZero === "true") {
            this.toggleZeroAssets(true);
        }
    }

    getCNYrate(list) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].name === "CNY") {
                return list[i].rate;
            }
        }
    }

    // 设置USD转换率
    setPrice(list) {
        let priceUSD = {};
        list.forEach(item => {
            priceUSD[item.Name] = item.price_usd;
        });

        if (this.mounted) {
            this.setState({
                priceUSD: priceUSD
            });
        }
    }

    //获取资金划转时 币币账户的可提现额
    getCoinBalance(list, coin) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].coin_code === coin) {
                return list[i].available_vol;
            }
        }
        return 0;
    }

    // 获取合约资产可提现额
    getContractBalance(coin) {
        Promise.all([
            this.props.getContractInfo(),
            this.props.getConstractAccounts()
        ]).then((response) => {
            if (response[1].accounts.length < 1) {
                if (this.mounted) {
                    this.setState({
                        contractBalance: 0,
                        contracts: response[0].contracts,
                    });
                }
            } else {
                if (coin) {

                } else {
                    this.setUserPosition(response[1].accounts[0].coin_code, response[1].accounts[0]);
                }

                if (this.mounted) {
                    this.setState({
                        contractAccounts: response[1].accounts
                    })
                }
            }
            // this.getTransferCoinList(response[0].contracts);
            this.getTransferCoinList(response[0].contracts, response[1].accounts);

        })
    }

    // 获取可划转的币种
    getTransferCoinList(contracts, list) {
        //console.log("contracts######", contracts);
        let arr1 = [], arr2 = [], result = [], coin;
        // console.log("contracts####", contracts);
        contracts.forEach((item) => {
            coin = MarginCoin(item.contract.base_coin, item.contract.quote_coin, item.contract.price_coin);
            arr1.push(coin);
        })

        // arr1 = Array.from(new Set(arr1));

        list.forEach((item) => {
            arr2.push(item.coin_code)
        })

        result = new Set([...arr1, ...arr2]);
        result = Array.from(result);
        if (this.mounted) {
            this.setState({
                coinList: result
            })
        }
    }

    processVolUnit(list, spot_coins) {
        let p;
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < spot_coins.length; j++) {
                if (list[i].coin_code == spot_coins[j].name) {
                    p = spot_coins[j].vol_unit.split(".")[1] ? spot_coins[j].vol_unit.split(".")[1].length : 0;
                    list[i]["vol_unit"] = p;
                    //设置是否可充可提
                    list[i]["cash_ability"] = spot_coins[j].cash_ability;
                    continue;
                }
            }
        }
        return list;
    }

    //spotTicker中有以币开头的交易对，则跳转到该交易对交易
    getExchangeBtn(bbx_ticker, item) {
        // let firstCoin;
        for (let i = 0; i < bbx_ticker.length; i++) {

            if (bbx_ticker[i].ticker && bbx_ticker[i].ticker.stock_code.indexOf(item.coin_code) > -1) {
                return <Link to={`/exchange?coinPair=${bbx_ticker[i].ticker.stock_code}`}>{intl.get("assets_btn_exchange")}</Link>
            }
        }
        return <a className="disabled">{intl.get("assets_btn_exchange")}</a>
    }

    setZeroCoinList(spot_coins, user_assets) {
        let result = [];
        let flags;
        let item;
        for (let i = 0; i < spot_coins.length; i++) {
            flags = true;
            for (let j = 0; j < user_assets.length; j++) {
                if (spot_coins[i].name == user_assets[j].coin_code) {
                    flags = false;
                }
            }
            item = spot_coins[i];
            item["coin_code"] = item.name;
            item["available_vol"] = 0;
            item["freeze_vol"] = 0;
            if (flags) {
                result.push(item);
            }
        }
        if (this.mounted) {
            this.setState({
                zeroList: result,
                origin_zeroList: result
            })
        }
    }

    // 是否可资金划转
    isCanTransfer(coin_code) {
        let list = this.state.coinList;
        for (let i =0; i<list.length; i++) {
            if (list[i] === coin_code) {
                return true;
            }
        }
        return false;
    }
    // 获取表格字段列表
    getTableColumns() {
        let langCode = '', langIndex;
        if (this.props.default && this.props.default.value) {
            langCode = this.props.default.value;
            langIndex = this.props.default.index;
        }
        const columns = [
            {
                title: intl.get("assets_all_records_coin"),
                dataIndex: "coin_code"
            },
            {
                title: "总额",
                render: (item) => {
                    let total = Number(item.available_vol).add(Number(item.freeze_vol));
                    return <span>
                        {item.vol_unit ? cutOutDecimal(Number(total), item.vol_unit) : total}
                    </span>
                }
            },
            {
                title: intl.get("assets_available"),
                render: (item) => {
                    return <span>
                        {item.vol_unit ? cutOutDecimal(Number(item.available_vol),item.vol_unit):item.available_vol}
                    </span>
                }
            },
            {
                title: intl.get("assets_blocked"),
                render: (item) => {
                    return <span>
                        {item.vol_unit ? cutOutDecimal(Number(item.freeze_vol), item.vol_unit) : item.freeze_vol}
                    </span>
                }
            },
            {
                title: intl.get("withdraw_address_action"),
                width: langIndex === 1? "260px" :"350px",
                render: (item) => {
                    let flag = this.isCanTransfer(item.coin_code);
                    return <div>
                        {
                            (item.cash_ability == 1 || item.cash_ability == 3) ? <Link to={{ pathname: "/assets/deposit", search: `?lang=${langCode}`, state: `${item.coin_code}` }}>{intl.get("assets_btn_deposit")}</Link> :
                              <a className="disabled">{intl.get("assets_btn_deposit")}</a>

                        }

                        {
                            (item.cash_ability == 2 || item.cash_ability == 3) ? <Link to={{ pathname: "/assets/withdraw", search: `?lang=${langCode}&coin=${item.coin_code}&type=1`}}>{intl.get("assets_btn_withdrawal")}</Link> :
                                <a className="disabled">{intl.get("assets_btn_withdrawal")}</a>

                        }

                        {this.getExchangeBtn(this.state.spotTickers, item)}
                        <a className={flag ? "" : "disabled"} onClick={() => this.openTransformAlert(item)}>{intl.get("contract_capital_transfer")}</a>
                    </div>
                }
            }
        ];
        return columns;
    }

    // 是否显示小于1USDT的
    toggleZeroAssets(value) {
        let result = [];
        if (value) {
            this.state.origin_userAssetList.forEach((item, index) => {
                if(item.usdt > 1) {
                    result.push(item);
                }
            })
        }

        if (this.mounted) {
            this.setState({
                isShowZero: value,
                userAssetList: value ? result : this.state.origin_userAssetList
            })
        }

        localStorage.setItem("defaultIsShowZero", value);
    }

    //搜索
    searchChange(value) {
        this.toSearch(value);
    }

    //设置所有用户仓位
    setUserPosition(coin_code, accounts) { //list为合约数组

        this.props.getUserPosition("", coin_code).then((response) => {

            let positions = response.positions ? response.positions : [];
            let size, quote_coin, price_coin, contract, isReverse;
            let result = 0; //算未实现盈亏
            let price = 0;
            let loss = 0; //算全仓亏损
            let bond = 0; //仓位保证金

            for (let i = 0; i < positions.length; i++) {
                contract = this.getContractSizeAndCoin(positions[i].contract_id);

                size = contract ? contract.contract_size : 0;
                quote_coin = contract ? contract.quote_coin : 0;
                price_coin = contract ? contract.price_coin : 0;
                isReverse = IsReverse(quote_coin, price_coin);

                if (positions[i].position_type === 1) {//开多
                    price = calculateCloseLongProfitAmount(
                        positions[i].hold_vol,
                        positions[i].hold_avg_price,
                        positions[i].close_avg_price,
                        size,
                        isReverse
                    )
                } else {//开空
                    price = CalculateCloseShortProfitAmount(
                        positions[i].hold_vol,
                        positions[i].hold_avg_price,
                        positions[i].close_avg_price,
                        size,
                        isReverse
                    )
                }
                result = result + price;
                bond = Number(bond).add(Number(positions[i].im));

                if (positions[i].open_type === 2 && price < 0) {
                    if (Number(positions[i].im) + price < 0) {
                        loss = loss + Number(positions[i].im) + price;
                    }
                }
            }

            //可提现额度
            let freezeVol = accounts.freeze_vol ? accounts.freeze_vol : 0;
            let realisedVol = accounts.realised_vol ? accounts.realised_vol : 0;
            let earningsVol = accounts.earnings_vol ? accounts.earnings_vol : 0;
            let cashVol = accounts.cash_vol ? accounts.cash_vol : 0;
            let availableVol = accounts.available_vol ? accounts.available_vol : 0;

            let a = Number(Number(freezeVol).sub(Number((Number(realisedVol).sub(Number(earningsVol))))));
            let b = Number(cashVol).sub(Math.max(0, a));
            let canWithdraw = Number(Math.min(Number(availableVol), Number(b))).sub(Number(loss));

            //console.log("canWithdraw####", canWithdraw);
            if (this.mounted) {
                this.setState({
                    contractBalance: Number(canWithdraw) > 0 ? canWithdraw : 0
                })
            }
        });
    }

    //关闭资金划转
    closeTransformAlert() {
        if (this.mounted) {
            this.setState({
                showTransform: false
            })
        }
    }
    //打开资金划转
    openTransformAlert(item) {
        if (this.mounted) {
            this.setState({
                currentCoinName: item.coin_code,
                showTransform: true
            })
        }
    }

    //资金划转
    transferFunds(item, coin) {
        //console.log("transferFunds####",item);
        this.props.contractTransferFundsPost({
            coin_code: coin,
            vol: String(item.value),
            type: parseInt(item.type)
        }).then((response) => {
            if (response.data.errno === "OK") {
                this.closeTransformAlert(); //关闭弹窗
                this.getContractBalance(); //刷新合约可提现额
                this.props.getPropetyInfo(); //刷新币币账户信息
                notification.success({
                    message: intl.get("alert_tip"),
                    description: intl.get("assets_success")
                });

            } else {
                notification.error({
                    message: intl.get("error_message_title"),
                    description: response.data.message
                });
            }
        })
    }


    render() {
        let { valuationUSDT, valuationUSD, valuationCNY} = this.state;
        let valuationData = {
            name: intl.get("exchange_account_est"),
            usdt: cutOutDecimal(valuationUSDT, 2),
            usd: cutOutDecimal(valuationUSD, 2),
            cny: cutOutDecimal(valuationCNY, 2),
            fund_rcord: "/assets/exchange_capital_flow",
            trade_rcord: "/assets/exchange_record/transaction"
        };

        let list = [], zeroList = [], tableList = [];
        if (this.state.userAssetList.length > 0 && this.state.spotTickers && this.state.spot_coins.length > 0) {
            let rankList = getSortDown(this.state.userAssetList, "available_vol");
            list = this.processVolUnit(rankList, this.state.spot_coins);
        }

        if (this.state.zeroList.length > 0 && this.state.spotTickers && this.state.spot_coins.length > 0) {
            // console.log("this.state.zeroList###", this.state.zeroList);
            zeroList = this.state.zeroList;
        }
        // 表格列表数据
        tableList = !this.state.isShowZero ? [...list, ...zeroList] : list

        // console.log("this.state.coinList###", this.state.coinList);

        return <div className="assets-account">
            <MediaQuery maxWidth={700}>
                <H5Header title={intl.get("contract_coin_account")}></H5Header>
            </MediaQuery>
            {/*<HeaderTab list={this.state.tabList}></HeaderTab>*/}
            <Valuation data={valuationData}></Valuation>
            <div className="assets-list-box">
                <TableTop checktoggle={this.toggleZeroAssets} search={this.searchChange} default={this.state.defaultIsShowZero}></TableTop>
                <div className="assets_record">
                    {this.state.spotTickers.length > 0 ?<BBXTable data={tableList} columns={this.getTableColumns()}></BBXTable>:null}
                </div>
            </div>

            {this.state.showTransform ? <FundsTransferAlert
                close={this.closeTransformAlert}
                transferFunds={this.transferFunds}
                userAssets={this.state.userAssetList}
                spotCoins={this.state.spot_coins}
                contracts={this.state.contracts}
                accounts={this.state.contractAccounts}
                coinList={this.state.coinList}
                transferFlag={false}
                defaultCoin={this.state.currentCoinName}
            /> : null}
        </div>
    }
}

export default ExchangeAccount;
