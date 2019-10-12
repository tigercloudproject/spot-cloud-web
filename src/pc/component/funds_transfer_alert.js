import React, {Component} from "react";
import {connect} from "react-redux";
import "../../assets/scss/pc/component/funds_transfer_alert.css";
import intl from "react-intl-universal";
import { getContractInfo, getUserPosition, getConstractAccounts, contractTransferFundsPost } from "../../redux/contract_assets.redux";
import { IsReverse, MarginCoin } from "../../utils/contractFormula/common";
import { calculateCloseLongProfitAmount, CalculateCloseShortProfitAmount } from "../../utils/contractFormula/close";
import { stringCutOut, cutOut } from "../../utils/dataProcess.js";
import DefaultSelect from "../component/default_select.js";
import MediaQuery from "react-responsive";

@connect(state => ({ ...state.contract, ...state.assets, ...state.gconfig, ...state.lang }), {
    getContractInfo,
    getUserPosition,
    getConstractAccounts,
    contractTransferFundsPost,
})
class FundsTransferAlert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tStyleLeft: {
                left: "0px"
            },
            tStyleRight: {
                left: "300px"
            },
            transferFlag: this.props.transferFlag, //永续-币币
            num: "",

            contractBalance: 0,
            coinBalance: 0,
            currentCoin: "",
            accountList: [],
        }

        this.selectCoin = this.selectCoin.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
        this.props.getConstractAccounts().then((response) => {
            //console.log("accounts@@#@#@#@#@####",response);
            if (this.props.coinList) {
                if (this.mounted) {
                    this.setState({
                        accountList: response.accounts
                    })
                }
                if(!this.props.defaultCoin) {
                    this.getCanWithdraw(this.props.coinList[0], response.accounts);
                }else {
                    this.getCanWithdraw(this.props.defaultCoin, response.accounts);
                }   
                
            }
        })
        
        
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    closeTransferAlert() {
        this.props.close();
    }

    //切换永续-币币  切换币币-永续
    transferAccount() {
        if(this.mounted) {
            this.setState({
                transferFlag: !this.state.transferFlag,
                num: ""
            })
        }
    }

    toTransfer() {
        // console.log("toTransfer###currentCoin###",this.state.currentCoin);
        this.props.transferFunds({
            value: this.state.num,
            type: !this.state.transferFlag?2:1
        },this.state.currentCoin);
    }

    onChange(value) {
        if(this.mounted) {
            this.setState({
                num: value
            })
        }
    }

    getAll(){
        if(this.mounted) {
            this.setState({
                num: !this.state.transferFlag ? this.state.contractBalance : this.state.coinBalance
            })
        }
    }

    //选择可划转币种
    selectCoin(coin){
        //console.log("selectCoin####",coin);
        this.getCanWithdraw(coin,this.state.accountList);
        if(this.mounted) {
            this.setState({
                currentCoin: coin
            })
        }

    }

    //获取可划转币种
    getCanWithdraw(coin, accountList) {
       // console.log("accountList###",accountList);
        //let accountList = this.props.accounts?this.props.accounts:[];
        let accounts = this.getCoinAccount(accountList, coin);
        // console.log("coin###",coin);
        if(this.mounted) {
            this.setState({
                currentCoin: coin
            })
        }

        this.props.getUserPosition("", coin).then((response) => {
            //console.log("获取仓位######",response);
            let positions = response.positions?response.positions:[];
            let size, quote_coin, price_coin, contract, isReverse;
            let result = 0; //算未实现盈亏
            let price = 0;
            let loss = 0; //算全仓亏损
            let bond = 0; //仓位保证金
            //calculateCloseLongProfitAmount, CalculateCloseShortProfitAmount
            for (let i = 0; i < positions.length; i++) {
                contract = this.getContractSizeAndCoin(positions[i].contract_id);
                // console.log("contract###",contract);
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
            //console.log("a@@@",a);
            let b = Number(cashVol).sub(Math.max(0, a));
            //console.log("b###",b);
            let contractBalance = Number(Math.min(Number(availableVol), Number(b))).sub(Number(loss));
            let coinBalance = this.getCoinBalance(this.props.userAssets, coin);

            let volUnit = this.getVolUnit(this.props.spotCoins,coin);
            //console.log("volUnit####",volUnit);
            // console.log("canWithdraw####", canWithdraw);
            // console.log("coinBalance#####", coinBalance);
            coinBalance = coinBalance>0?coinBalance:0;
            contractBalance = contractBalance > 0 ? contractBalance:0;
            this.setState({
                coinBalance: cutOut(coinBalance, volUnit),
                contractBalance: cutOut(contractBalance, volUnit)
            });

        })
    }

    getVolUnit(list,coin) {
        //console.log("list@@@@",list);
        for(let i=0; i<list.length; i++) {
            if(list[i].name === coin) {
                let volUnit = list[i].vol_unit.split(".")[1] ? list[i].vol_unit.split(".")[1].length : 0;
                return volUnit;
            }
        }
        return 2;
    }

    getCoinBalance(list, coin) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].coin_code === coin) {
                return list[i].available_vol;
            }
        }
        return 0;
    }

    //获取相应币的账户信息
    getCoinAccount(list, coin) {
        for(let i=0;i<list.length;i++) {
            if(list[i].coin_code === coin) {
                return list[i];
            }
        }
        return {};
    }

    //获取合约大小和，QuoteCoin, PriceCoin
    getContractSizeAndCoin(id) {
        let list = this.props.contracts ? this.props.contracts : [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].contract.contract_id === id) {
                return list[i].contract;
            }
        }
        return null;
    }

    render() {
        let options;
        // if(this.props.coinList) {
        //     options = this.props.coinList.map((item,index) => {
        //         return <option key={index} value={item}>
        //             {item}
        //         </option>
        //     })
        // }
        // if (this.props.account) {
        //     options = this.props.account.map((item, index) => {
        //         return <option key={index} value={item.coin_code}>
        //             {item.coin_code}
        //         </option>
        //     })
        // }

        let lang;
        if(this.props.default && this.props.default.index) {
            lang = this.props.default.index;
        }


        return <div className="funds-transfer-alert">
            <div className="funds-transfer-mask" />

            <div className="funds-transfer-box">
              <span className="close-btn" onClick={() => this.closeTransferAlert()} />
              <div className="funds-transfer-tit">
                <span>{intl.get("contract_capital_transfer")}</span>
                {/* <select onChange={(e) => this.selectCoin(e.target.value)}>
                        {options}
                    </select> */}
                <div className="coin-select" style={{width: "100px", height: "30px"}}>
                    <DefaultSelect 
                        width="100px" height="30px" 
                        select={this.selectCoin} 
                        list={this.props.coinList}
                        color="#1f2636"
                        background= "#ffffff"
                        listBorder = "#d6dde5"
                        listTextColor = "#5b6585"
                        defaultItem = {this.state.currentCoin}
                    />
                </div>
              </div>
              <div className="funds-transfer-con">
                    <MediaQuery minWidth={676}>
                        <div className="transfer">
                            {lang !== 3 ? <span className="transfer-item" style={!this.state.transferFlag ? { left: "0px" } : { left: "320px" }}>
                                {intl.get("contract_swap_account")}
                            </span> :
                                <span className="transfer-item" style={!this.state.transferFlag ? { left: "0px" } : { left: "269px" }}>
                                    {intl.get("contract_swap_account")}
                                </span>}
                            <i className="exchange-icon" onClick={() => this.transferAccount()} />
                            {lang !== 3 ? <span className="transfer-item" style={this.state.transferFlag ? { left: "0px" } : { left: "320px" }}>
                                {intl.get("contract_coin_account")}
                            </span> :
                                <span className="transfer-item" style={this.state.transferFlag ? { left: "0px" } : { left: "231px" }}>
                                    {intl.get("contract_coin_account")}
                                </span>
                            }
                        </div>
                    </MediaQuery>

                    <MediaQuery maxWidth={676}>
                        <div className="transfer">
                            {lang !== 3 ? <span className="transfer-item" style={!this.state.transferFlag ? { left: "0px" } : { left: "204px" }}>
                                {intl.get("contract_swap_account")}
                            </span> :
                                <span className="transfer-item" style={!this.state.transferFlag ? { left: "0px" } : { left: "174px" }}>
                                    {intl.get("contract_swap_account")}
                                </span>}
                            <i className="exchange-icon" onClick={() => this.transferAccount()} />
                            {lang !== 3 ? <span className="transfer-item" style={this.state.transferFlag ? { left: "0px" } : { left: "204px" }}>
                                {intl.get("contract_coin_account")}
                            </span> :
                                <span className="transfer-item" style={this.state.transferFlag ? { left: "0px" } : { left: "149px" }}>
                                    {intl.get("contract_coin_account")}
                                </span>
                            }
                        </div>
                    </MediaQuery>
                
                <div className="amount-box">
                  <label>{intl.get("exchange_data_amount")}</label>
                  <div className="form-control">
                    <input type="text" value={this.state.num || ""} onChange={e => this.onChange(e.target.value)} />
                    <p className="amount-info">
                      <span>
                        {intl.get("contract_can_withdraw")}：{!this.state.transferFlag ? this.state.contractBalance : this.state.coinBalance} {this.state.currentCoin}
                      </span>
                      <a onClick={() => this.getAll()}>
                        {intl.get("index_data_all")}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="btn-box">
                  <button onClick={() => this.closeTransferAlert()}>
                    {intl.get("tip_limit_btn_cancel")}
                  </button>
                  <button onClick={() => this.toTransfer()}>
                    {intl.get("tip_limit_btn_confirm")}
                  </button>
                </div>
              </div>
            </div>
          </div>;
    }
}

export default FundsTransferAlert;