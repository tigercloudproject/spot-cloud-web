import React, {Component} from "react";
import {connect} from "react-redux";
import "../../assets/scss/pc/exchange/exchange_depth.css";
import { quickSort } from "../../utils/quickSort.js";
import MediaQuery from "react-responsive";
import { cutOutFloor, stringCutOut } from "../../utils/dataProcess.js";
import intl from "react-intl-universal";
import { changeCurrentPrice } from "../../redux/exchange.redux";

@connect(
    state => (
        { ...state.lang, ...state.trade }), {
            changeCurrentPrice
        }
)
class ExchangeDepth extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list1: [1,2,3,4,5,6,6,7,8,9,0],
            list2: [1,2,3,4,5,6,5,6,7,8,9],
            buys:[],
            sells: [],
            oldBuys: [],
            oldSells: [],
            stocks: [], //币值对配置信息
            priceUnit: 8,
            volUnit: null,
            decimal: null,
            currentCoinPair: "", //当前币值对
            showType: "all", //显示方式
            buys_origin: [],
            sells_origin: []
        }

        this.selectDecimalPlace = this.selectDecimalPlace.bind(this);
    }

    componentWillMount() {
        this.mounted = true;

        if(this.props.stocks) {
            if(this.mounted) {
                this.setState({
                    stocks: this.props.stocks
                })
            }
        }

        //设置单位
        if (this.props.stocks && this.props.current_coin_pair) {
            this.setUnit(this.props.stocks, this.props.current_coin_pair);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        // console.log("depth####nextProps####", nextProps);
        if (this.props.stocks !== nextProps.stocks || this.props.current_coin_pair !== nextProps.current_coin_pair) {
            if(this.mounted) {
                this.setState({
                    stocks: nextProps.stocks
                })
            }
            if(this.state.decimal===null) {
                // let priceUnit = this.getPriceUnit(nextProps.stocks, nextProps.current_coin_pair);
                // if (priceUnit && this.mounted) {
                //     this.setState({
                //         priceUnit: priceUnit,
                //         decimal: priceUnit
                //         // decimal: this.state.priceUnit !== priceUnit ? priceUnit : this.state.decimal,
                //     })
                // }
                this.setUnit(nextProps.stocks, nextProps.current_coin_pair);
            }
        }

        // if(this.props.bbx_depth_buy !== nextProps.bbx_depth_buy) {
            this.processingData(nextProps.bbx_depth_buy, "buy");
            if(this.mounted) {
                this.setState({
                  buys_origin: nextProps.bbx_depth_buy
                });
            }
        // }

        // if (this.props.bbx_depth_sell !== nextProps.bbx_depth_sell) {
            this.processingData(nextProps.bbx_depth_sell, "sell");
            if (this.mounted) {
                this.setState({
                    sells_origin: nextProps.bbx_depth_sell
                });
            }
        // }

        if(this.props.current_coin_pair !== nextProps.current_coin_pair) {
            if(this.mounted) {
                this.setState({
                    currentCoinPair: nextProps.current_coin_pair
                })
            }

            //设置价格和数量单位
            this.setUnit(nextProps.stocks, nextProps.current_coin_pair);
            // if(nextProps.stocks) {
            //     let priceUnit = this.getPriceUnit(nextProps.stocks, nextProps.current_coin_pair);
            //     let volUnit = this.getVolUnit(nextProps.stocks, nextProps.current_coin_pair);
            //     if(priceUnit && this.mounted) {
            //         this.setState({
            //             priceUnit: priceUnit,
            //             decimal: priceUnit
            //             // decimal: this.state.priceUnit !== priceUnit ? priceUnit : this.state.decimal,
            //         })
            //     }
            //     if(volUnit && this.mounted) {
            //         this.setState({
            //             volUnit: volUnit
            //         })
            //     }
            // }else {
            //     if(this.mounted) {
            //         this.setState({
            //             priceUnit: null,
            //             volUnit: null
            //         })
            //     }
            // }
        }
    }

    setUnit(stocks, current_coin_pair) {
        if (stocks) {
            let priceUnit = this.getPriceUnit(stocks, current_coin_pair);
            let volUnit = this.getVolUnit(stocks, current_coin_pair);
            if (priceUnit && this.mounted) {
                this.setState({
                    priceUnit: priceUnit,
                    decimal: priceUnit
                    // decimal: this.state.priceUnit !== priceUnit ? priceUnit : this.state.decimal,
                })
            }
            if (volUnit && this.mounted) {
                this.setState({
                    volUnit: volUnit
                })
            }
        } else {
            if (this.mounted) {
                this.setState({
                    priceUnit: null,
                    volUnit: null
                })
            }
        }
    }


    processingData(list, way,decimal) {
        if(!decimal) {
            decimal = !this.state.decimal ? 8 : this.state.decimal;
        }
        let result =[];
        list = list ? list : [];
        list.forEach((item,index) => {
            result.push({
              vol: item.vol,
              price: item.price,
            //   decimal_price: way==="buy" ? stringCutOut(item.price, decimal) : cutOutFloor(item.price, decimal)
              decimal_price: way==="buy" ? cutOutFloor(item.price, decimal) : stringCutOut(item.price, decimal)
            });
        })

        let unionArr = this.unionVolum(result);
        let newList = [];
        let oldVol = 0, max = 0;

        if(way === "buy") {
            newList = quickSort(unionArr, "price", 2);
        }else {
            newList = quickSort(unionArr, "price", 1);
        }

        newList.forEach((item, index) => {
            //设置总量
            if(index===0) {
                item["total"] = item.vol;
            }else {
                item["total"] = Number(newList[index-1].total).add(Number( item.vol));
            }

            if (this.state.volUnit) {
                item.vol = stringCutOut(item.vol, this.state.volUnit);
                item.total = stringCutOut(item.total, this.state.volUnit);
            }
            
            //设置闪烁颜色
            if(way === "buy") {
                oldVol = this.getOldPriceVol(this.state.oldBuys, item["decimal_price"]);
            }else {
                oldVol = this.getOldPriceVol(this.state.oldSells, item["decimal_price"]);
            }
            item["old_vol"] = oldVol;
            //取最大值
            if(Number(item.vol) > max) {
                max = Number(item.vol);
            }  
        })

        if(way==="buy") {
            // newList = newList.reverse();
            if(this.mounted) {
                this.setState({
                    buys: {
                        list: newList,
                        max: max
                    },
                    oldBuys: newList
                })
            }
        } else {
            newList = newList.reverse();
            if (this.mounted) {
                this.setState({
                    sells: {
                        list: newList,
                        max: max
                    },
                    oldSells: newList
                })
            }
        }
    }

    getOldPriceVol(list, price) {
        for(let i=0; i < list.length; i++) {
            if(list[i].decimal_price === price) {
                return list[i].vol;
            }
        }
        return 0;
    }

    getPriceUnit(list, coinPair) {
        coinPair = coinPair ? coinPair : this.state.currentCoinPair;
        let p;
        for(let i=0; i<list.length; i++) {
            if (list[i].stock.name === coinPair){
                p = String(list[i].stock.price_unit).split(".")[1] ? list[i].stock.price_unit.split(".")[1].length : 0;
                return p;
            }
        }
    }

    getVolUnit(list, coinPair) {
        coinPair = coinPair ? coinPair : this.state.currentCoinPair;
        let p;
        for(let i=0;i<list.length; i++) {
            if(list[i].stock.name === coinPair) {
                p = list[i].stock.vol_unit.split(".")[1] ? list[i].stock.vol_unit.split(".")[1].length : 0;
                return p;
            }
        }
    }

    selectShowType(type) {
        if(this.mounted) {
            this.setState({
                showType: type
            })
        }
    }

    //合并数据(新)
    unionVolum(arr) {
        arr = arr || [];
        var tmp = {};
        for (let i = 0, len = arr.length; i < len; i++) {
            let obj = arr[i];
            if (obj.decimal_price in tmp) {
                tmp[obj.decimal_price].vol = Number(tmp[obj.decimal_price].vol).add(Number(obj.vol));
            } else {
                tmp[obj.decimal_price] = obj;
            }
        }

        var result = [];
        for (var key in tmp) {
            result.push(tmp[key]);
        }

        return result;
    }

    //选择小数位数
    selectDecimalPlace(e) {
        if (this.mounted) {
            this.setState({
                decimal: e.target.value
            });
        }

        this.processingData(this.state.buys_origin, "buy", e.target.value);
        this.processingData(this.state.sells_origin, "sell", e.target.value);
    }

    //选择价格
    selectPrice(price, type, list) { //price价格, type是买还是卖, list相应类型的显示列表
        this.props.changeCurrentPrice(price, type, list);
    }



    render() {
        let buys = [], sells = [];
        let buyMax, sellMax;
        if(this.state.buys && this.state.buys.list) {
            buys = this.state.buys.list;
            buyMax = this.state.buys.max;
        }
        if(this.state.sells && this.state.sells.list) {
            sells = this.state.sells.list;
            sellMax = this.state.sells.max;
        }

        let sellRectWidth = 0, sellChange = "";
        let listLI1 = sells.map((item, index) => {
            if (sellMax) {
                sellRectWidth = Number(100).mul(Number(Number(item.vol).div(Number(sellMax))));
            }
            sellChange = "";
            if (item.oldVol && Number(item.vol) > Number(item.oldVol)) {
              sellChange = "green-back";
            } else if (item.oldVol && Number(item.vol) < Number(item.oldVol)) {
              sellChange = "red-back";
            }
            return <li key = {index} className={sellChange} onClick={() => this.selectPrice(item.decimal_price,"sells",sells)}>
                <div className="list-item">
                    <span className="red">{item.decimal_price}</span>
                    <span>{item.vol}</span>
                    <span>{item.total}</span>
                </div>
                <p style={{ width: sellRectWidth + "%" }} className="red"></p>
            </li>
        })

        let buyRectWidth = 0, buyChange = "";
        let listLI2 = buys.map((item, index) => {
            if (buyMax) {
                buyRectWidth = Number(100).mul(Number(Number(item.vol).div(Number(buyMax))));
            }
            buyChange = "";
            if (item.oldVol && Number(item.vol) > Number(item.oldVol)) {
                buyChange = "green-back";
            } else if (item.oldVol && Number(item.vol) < Number(item.oldVol)) {
                buyChange = "red-back";
            }
            return <li key={index} className={buyChange} onClick={() => this.selectPrice(item.decimal_price,"buys",buys)}>
              <div className="list-item">
                <span className="green">{item.decimal_price}</span>
                <span>{item.vol}</span>
                <span>{item.total}</span>
              </div>
              <p style={{ width: buyRectWidth + "%" }} className="green" />
            </li>;
        });

        let buyList =[];
        let sellList = [];

        let decimalOption;
        if (this.state.priceUnit) {
            let arr = [];
            for (let i = this.state.priceUnit; i > 0; i--) {
                arr.push({ index: i });
            }
            decimalOption = arr.map((item, index) => {

                return (<option key={index} value={item.index}>{item.index}{intl.get("exchange_dec")}</option>)

            })
        }

        let coinArr = [];
        if (this.state.currentCoinPair) {
            coinArr = this.state.currentCoinPair.split("/");
        }
        return <div className="exchange-depth">
            <div className="title">
                <ul>
                    <li>
                        <span className={this.state.showType === "all" ? "all active":"all"} onClick={() => this.selectShowType("all")}></span>
                    </li>
                    <li>
                        <span className={this.state.showType === "buy" ? "buy active":"buy"} onClick={() => this.selectShowType("buy")}></span>
                    </li>
                    <li>
                        <span className={this.state.showType === "sell" ? "sell active":"sell"} onClick={() => this.selectShowType("sell")}></span>
                    </li>
                </ul>
                <div className="decimal-select">
                    <label name="decimal">{intl.get("exchange_consolidation_depth")}：</label>
                    <select name="decimal" onChange={this.selectDecimalPlace} value={this.state.decimal || 8}>
                        {decimalOption}
                    </select>
                </div>
            </div>
            <div className="list-head">
                <span>{intl.get("exchange_data_price")}({coinArr[1]?coinArr[1]:""})</span>
                <span>{intl.get("exchange_data_amount")}({coinArr[0]?coinArr[0]:""})</span>
                <span>总计({coinArr[0]?coinArr[0]:""})</span>
            </div>
            <MediaQuery maxWidth="1600px">
                {this.state.showType !== "buy"?<div className="list-body">
                    <div className="box-top" style={{"height": this.state.showType==="all"?"144px":"290px"}}>
                        <ul style={{ "position": "absolute" }}>
                            {listLI1}
                        </ul>
                    </div>
                </div>:null}
                <div className="current-price-box">
                    <span className={this.props.bbx_current_coin_rise_fall_rate < 0 ? "red price" : "green price"}>{this.props.bbx_current_coin_price}</span>
                    <span className="cny"> ≈ {this.props.bbx_current_coin_price_rate}</span>
                </div>
                {this.state.showType !== "sell"?<div className="list-body">
                    <div className="box-bottom" style={{"height": this.state.showType==="all"?"144px":"290px"}}>
                        <ul style={{ "position": buys.length > 6 ? "absolute" : "static" }}>
                            {listLI2}
                        </ul>
                    </div>
                </div>:null}
            </MediaQuery>

            <MediaQuery minWidth="1600px">
                {this.state.showType !== "buy" ? <div className="list-body">
                    <div className="box-top" style={{ "height": this.state.showType === "all" ? "430px" : "auto", "maxHeight": this.state.showType === "all" ? "auto" : "850px", "overflowY": this.state.showType === "all"?"hidden":"auto"}}>
                        <ul style={{ "position": this.state.showType === "all" ? "absolute" : "static" }}>
                            {listLI1}
                        </ul>
                    </div>
                </div> : null}
                <div className="current-price-box">
                    <span className={this.props.bbx_current_coin_rise_fall_rate < 0 ? "red price" : "green price"}>{this.props.bbx_current_coin_price}</span>
                    <span className="cny"> ≈ {this.props.bbx_current_coin_price_rate}</span>
                </div>
                {this.state.showType !== "sell" ? <div className="list-body">
                    <div className="box-bottom" style={{ "height": this.state.showType === "all" ? "430px" : "850px", "overflowY": this.state.showType === "all" ? "hidden" : "auto" }}>
                        <ul style={{ "position": buys.length > 19 ? "absolute" : "static" }}>
                            {listLI2}
                        </ul>
                    </div>
                </div> : null}
            </MediaQuery>
            

        </div>
    }
}

export default ExchangeDepth;