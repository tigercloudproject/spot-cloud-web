import React, {Component} from "react";
import { connect } from "react-redux";
import { getPriceUnit,getVolUnit } from "../../utils/gconfig/stocksModel.js";
import { webExchangeSingle } from "../../utils/exchange.js";
import { getQueryString } from "../../utils/getQueryString.js";
import { withRouter } from "react-router-dom";
import { cutOut, leastTwoDecimal, stringCutOut, cutOutFloor } from "../../utils/dataProcess.js";
import { getSortUp, getSortDown } from "../../utils/sort.js";
// import iconAll from "../../assets/images/icon-all.png";
// import iconBuy from "../../assets/images/icon-buy.png";
// import iconSell from "../../assets/images/icon-sell.png";
import intl from "react-intl-universal";
import { changeCurrentPrice} from "../../redux/exchange.redux";

@withRouter
@connect(state => ({ ...state.sdetails, ...state.gconfig , ...state.index, ...state.lang}),{
  changeCurrentPrice
})
class DynamicData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      depths: {
        buys:[],
        sells: []
      },
      decimal_place: 8,
      rateCNY: "", //转换成人民币
      rateUSD: "", //转换成美元
      firstCoin: '',
      stocks: [], //为了处理小数位数（global里的stocks）
      priceUnit: 8,
      volUint: 2,
      showType: 1, //显示类型， 1为买卖都显示，2为显示买，3为显示卖
      firstCoin:'',
      lastCoin: '',
      currentPrice: '', //当前价
    };
    this.selectDecimalPlace = this.selectDecimalPlace.bind(this);
  }

  componentWillMount() {
    this.mounted = true;
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    let coinArr = coinPair.split("/");
    this.setState({
      firstCoin: coinArr[0],
      lastCoin: coinArr[1]
    })
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.spot_details && nextProps.spot_details.depth) {
      // console.log("nextProps####", nextProps.spot_details.depth);
      if (this.mounted) {
        this.setState({
          depths: nextProps.spot_details.depth
        });
      }
      if (nextProps.spot_details.depth) {
        this.processDepthsData(nextProps.spot_details.depth);
      }
    }

    //设置当前价
    if(nextProps.spot_details && nextProps.spot_details.tickers) {
      if(this.mounted) {
        this.setState({
          currentPrice: nextProps.spot_details.tickers.lastPrice
        }); 
      }
    }

    //保存global配置里的stocks
    if (nextProps.clist && nextProps.clist.stocks && nextProps.clist.stocks.length > 0) {
      let coinPair = nextProps.exchange_current_coinpair ? nextProps.exchange_current_coinpair:getQueryString(this.props.location.search, "coinPair");
      //判断是否切换了币值对
      //if (nextProps.spot_details && this.props.spot_details && nextProps.spot_details.stock_code != this.props.spot_details.stock_code) {
      if (nextProps.exchange_current_coinpair != this.props.exchange_current_coinpair) { 
        //let coinPair = nextProps.spot_details.stock_code;
        let coinPair = nextProps.exchange_current_coinpair;
        let firstCoin = coinPair.split("/")[0];
        let lastCoin = coinPair.split("/")[1];
        if (this.mounted) {
          this.setState({
            firstCoin: firstCoin,
            lastCoin: lastCoin
          });
        }
        this.getCurrentPriceUnit(coinPair, nextProps.clist.stocks);
      }

      if(!nextProps.exchange_current_coinpair){
        this.getCurrentPriceUnit(coinPair, nextProps.clist.stocks);
      }
      
    }

    
    //当前价转换为美元或者人民币
    if (nextProps.clist && nextProps.clist.coin_prices && nextProps.clist.usd_rates && nextProps.spot_tickers && nextProps.spot_tickers.tickers) {
      if(nextProps.spot_details && nextProps.spot_details.ticker) {

        let cnyRate = nextProps.clist.usd_rates[0].rate;

        //先看根据coin_prices能不能直接转成美元，如果转换不了，则启用转换算法

        let amountCNY = 0;
        let amountUSD = this.getAmountUSD(nextProps.clist.coin_prices,this.state.lastCoin,1);
        amountUSD = Number(amountUSD).mul(Number(nextProps.spot_details.ticker.last_price));


        if(amountUSD===0) {
          amountUSD = webExchangeSingle(this.state.lastCoin, "USD", nextProps.spot_details.ticker.last_price, nextProps.clist.coin_prices, nextProps.clist.usd_rates, nextProps.spot_tickers.tickers);
          
        }

        if(isNaN(amountUSD)) {
          amountUSD = 0;
        }

        amountCNY = Number(amountUSD).mul(Number(cnyRate));
       
        //let amountCNY = webExchangeSingle(this.state.lastCoin, "CNY", nextProps.spot_details.ticker.last_price, nextProps.clist.coin_prices, nextProps.clist.usd_rates, nextProps.spot_tickers.tickers);
        //let amountUSD = webExchangeSingle(this.state.lastCoin, "USD", nextProps.spot_details.ticker.last_price, nextProps.clist.coin_prices, nextProps.clist.usd_rates, nextProps.spot_tickers.tickers);
        
        if (this.mounted) {
          this.setState({
            rateCNY: amountCNY,
            rateUSD: amountUSD,
            currentPrice: nextProps.spot_details.ticker.last_price
          });
        }
      }
    }
  }

  processDepthsData(data) {
    // console.log("data#####",data);
    // data = data?JSON.parse(JSON.stringify(data)):{};
    let buys = data.buys;
    let sells = data.sells;

    // console.log("buys#####",buys);
    // console.log("sells###",sells);
   

  }

  mergeData() {

  }

  getAmountUSD(coin_prices,coin,vol) {
    for(let i=0; i<coin_prices.length;i++) {
      if(coin_prices[i].Name==coin) {
        return Number(vol).mul(Number(coin_prices[i].price_usd));
      }
    }
    return 0;
  }


  //根据global里面的stocks 获取当前币值对的price_unit
  getCurrentPriceUnit(coinPair,list) {
    let price_unit = getPriceUnit(list,coinPair);
    let vol_unit = getVolUnit(list,coinPair);
    if(this.mounted) {
      this.setState({
        priceUnit: price_unit,
        decimal_place: this.state.priceUnit!==price_unit?price_unit:this.state.decimal_place,
        volUint: vol_unit
      })
    }
  }

  selectDecimalPlace(e) {
    if (this.mounted) {
      this.setState({
        decimal_place: e.target.value
      });
    }
  }

  //切换显示方式（全部显示，只显示买，只显示卖）
  selectShowType(index) {
    if(this.mounted) {
      this.setState({
        showType: index
      })
    }
  }

  //选择价格
  selectPrice(price,type,list) { //price价格, type是买还是卖, list相应类型的显示列表
    this.props.changeCurrentPrice(price,type,list);
  }


//合并数据
mergeDepthData(list,decimal_place,way){
  let itemArr = [];
  // for (let i=0; i< list.length; i++) {
  //  itemArr = this.getSamePriceItem(list,stringCutOut(list[i].price,decimal_place),decimal_place);
  //  list[i]["merge"] = itemArr;
  //  list[i]["decimal_price"] = stringCutOut(list[i].price,decimal_place);
  // }
  // console.log("list###", list);
  let max = 0;
  list.forEach((item) => {
    // itemArr = this.getSamePriceItem(list,stringCutOut(item.price,decimal_place),decimal_place);
    // item["merge"] = itemArr;
    if(way==="buy") {
      item["decimal_price"] = cutOutFloor(item.price, decimal_place);
    }else {
      item["decimal_price"] = cutOutFloor(item.price, decimal_place);
    }

    if(Number(item.vol) > max) {
      max = item.vol;
    }

  })

  //数组去重
  //let uniqList = _.uniqBy(list,"decimal_price");

  
  let unionArr = this.unionVolum(list);


  //return uniqList;
  // let sortingArr = getSortDown(unionArr, "vol");
  //console.log("sortingArr#####",sortingArr);
  // let max = sortingArr.length>0?sortingArr[0].vol:null;
  //return unionArr;
  return {
    list: unionArr,
    max: max
  }
}

getSamePriceItem(list,price,decimal_place) {
  let result =[];
  list.forEach((item) => {
    if (price == cutOutFloor(item.price,decimal_place)) {
      result.push(item);
    }
  })

  return result;
}

getMergePrice(list,decimal_place) {
  let result = 0;
  list.forEach((item) => {
    result = Number(result).add(Number(item.vol));
  })
  return cutOutFloor(Number(result), this.state.volUint);
}


//合并数据(新)
unionVolum(arr) {
  arr = arr || [];
  var tmp = {};
  for(let i=0,len = arr.length;i<len;i++) {
    let obj = arr[i];
    if (obj.decimal_price in tmp) {
      // tmp[obj.decimal_price].vol = Number(tmp[obj.decimal_price].vol).add(Number(obj.vol));
      tmp[obj.decimal_price].totalVol = Number(tmp[obj.decimal_price].totalVol).add(Number(obj.vol));
    }else {
      tmp[obj.decimal_price] = obj;
      tmp[obj.decimal_price]["totalVol"] = obj["vol"];
    }
  }

  var result = [];
  for(var key in tmp) {
    result.push(tmp[key]);
  }

  return result;
}


render() {
  // console.log("this.state.depths.buys###", this.state.depths.buys);
    // let origin_buys = this.state.depths.buys ? getSortDown(this.state.depths.buys,'price') : [];
    // let origin_sells = this.state.depths.sells ? getSortDown(this.state.depths.sells,'price') : [];
    let origin_buys = this.state.depths.buys;
    let origin_sells = this.state.depths.sells;

    let redColor = {
      color: "#b83a3a",
      cursor: "pointer"
    };
    let greenColor = {
      color: "#319e5c",
      cursor: "pointer"
    };
    let buys = [], sells = [],buysMaxVol,sellsMaxVol;

    if(this.state.decimal_place){
      // console.log("origin_buys###", origin_buys);
      let buysArr = this.mergeDepthData(origin_buys,this.state.decimal_place, "buy");
      let sellsArr = this.mergeDepthData(origin_sells,this.state.decimal_place, "sell");
      // console.log("buysArr####", buysArr);
      buys = getSortDown(buysArr.list,'price');
      sells = getSortDown(sellsArr.list,'price');
      buysMaxVol = buysArr.max;
      sellsMaxVol = sellsArr.max;
    }

    if(buys.length>14 && this.state.showType==1) {
      
      buys = buys.slice(0,14);
    }

    if(sells.length>14 && this.state.showType==1) {
      sells = sells.slice(sells.length-14,sells.length);
    }



    let list1 = buys.map((item, index) => {
      //if (cutOut(item.price, this.state.decimal_place)>0) {
        let rectWidth = 0;
        if(buysMaxVol){
          rectWidth = Number(100).mul(Number(Number(item.vol).div(Number(buysMaxVol))));
        }
        return (
          // <tr key={index} onClick={() => this.selectPrice(stringCutOut(item.price, this.state.decimal_place),'buys',buys)}>
          //   <td style={greenColor}>
          //     {stringCutOut(item.price,this.state.decimal_place)}
          //   </td>
          //   <td>{!item.merge?leastTwoDecimal(item.vol):this.getMergePrice(item.merge)}</td>
          //   <td className="rectangle">
          //     <div style={{width: `${rectWidth}px`,background:"rgba(49, 158, 92, 0.2)"}}></div>
          //   </td>
          // </tr>
          <div className="list-tr-box" key={index} onClick={() => this.selectPrice(cutOutFloor(item.price, this.state.decimal_place), 'buys', buys)}>
            <div className="list-tr">
              <div className="list-td" style={greenColor}>
                  {cutOutFloor(item.price,this.state.decimal_place)}
              </div>
              <div className="list-td">
                {/* {!item.merge ? cutOutFloor(item.vol,this.state.volUint) : this.getMergePrice(item.merge)} */}
                {cutOutFloor(item.totalVol, this.state.volUint)}
              </div>
            </div>
            <div className="rectangle">
              <div style={{ width: `${rectWidth}%`, background: "rgba(49, 158, 92, 0.05)" }}></div>
            </div>
          </div>
        );
      //}
    });

    let list2 = sells.map((item, index) => {
      //if (cutOut(item.price, this.state.decimal_place)>0) {
        let rectWidth = 0;
        if(sellsMaxVol){
          rectWidth = Number(100).mul(Number(Number(item.vol).div(Number(sellsMaxVol))));
        }
        return (
          // <tr key={index} onClick={() => this.selectPrice(cutOut(item.price, this.state.decimal_place),'sells',sells)}>
          //   <td style={redColor}>
          //     {stringCutOut(item.price, this.state.decimal_place)}
          //   </td>
          //   {/* <td>{leastTwoDecimal(item.vol)}</td> */}
          //   <td>{!item.merge?leastTwoDecimal(item.vol):this.getMergePrice(item.merge)}</td>
          //   <td className="rectangle">
          //     <div style={{ width: `${rectWidth}px`, background: "rgba(184, 58, 58, 0.2)" }}></div>
          //   </td>
          // </tr>
          <div className="list-tr-box" key={index} onClick={() => this.selectPrice(cutOutFloor(item.price, this.state.decimal_place), 'sells', sells)}>
            <div className="list-tr">
              <div className="list-td" style={redColor}>
                {cutOutFloor(item.price, this.state.decimal_place)}
              </div>
              <div className="list-td">
                {/* {!item.merge ? cutOutFloor(item.vol,this.state.volUint) : this.getMergePrice(item.merge)} */}
                {cutOutFloor(item.totalVol, this.state.volUint)}
              </div>
            </div>
            <div className="rectangle" style={{ width: `${rectWidth}%`, background: "rgba(184, 58, 58, 0.05)" }}>
            </div>
          </div>
        );
      //}
    });

    let state = this.state;

    let decimalOption;
    // console.log("priceUnit####",this.state.priceUnit);
    if(this.state.priceUnit){
      let arr = [];
      for(let i=this.state.priceUnit;i>0;i--) {
        arr.push({index:i});
      }
      decimalOption = arr.map((item,index) => {
       
            return (<option key={index} value={item.index}>{item.index}{intl.get("exchange_dec")}</option>)
                
      })
    }

    let heightStyle = {
      maxHeight: "680px"
    }

    //英语环境显示美元，中文环境显示cny
    let money = "";
    if(this.props.default && this.props.default.index){
      if(this.props.default.index==3 && this.state.rateUSD) {
        money = "$ " + Number(this.state.rateUSD).toFixed(2);
      }
      if(this.props.default.index!=3) {
        money = "¥ " + Number(this.state.rateCNY).toFixed(2);
      }
    }


    return (
      <div className="dynamic-data">
        <div className="top-header">
          <ul className="icon-tab">
            <li onClick={() => this.selectShowType(1)}><span className={this.state.showType==1?"type-all-icon active":"type-all-icon"}></span></li>
            <li onClick={() => this.selectShowType(2)}><span className={this.state.showType==2?"type-buy-icon active":"type-buy-icon"}></span></li>
            <li onClick={() => this.selectShowType(3)}><span className={this.state.showType==3?"type-sell-icon active":"type-sell-icon"}></span></li>
          </ul>
          <div className="decimal">
            <span>{intl.get("exchange_consolidation_depth")}：</span>
            <select onChange={this.selectDecimalPlace} value={state.decimal_place}>
              {decimalOption}
            </select>
          </div>
        </div>
        <div className="data-list-box">
          <table className="data-title">
            <tbody>
              <tr>
                <td style={{paddingLeft:"10px"}}>{intl.get("exchange_data_price")}({this.state.lastCoin})</td>
                <td style={{paddingRight:"10px"}}>{intl.get("exchange_data_amount")}({this.state.firstCoin})</td>
              </tr>
            </tbody>
          </table>
          <div className="data-list" style={this.state.showType==3?heightStyle:{}}>
            {this.state.showType == 2 ? '' :
              // <table>
              //   <tbody>{list2}</tbody>
              // </table>
              <div className="data-list-table">
                {list2}
              </div>
            }
          </div>
          {sells.length < 1 ? (
            <div className="exchange-no-data">{intl.get("assets_no_data")}</div>
          ) : (
            ""
          )}
          <p className="data-middle">
            {this.state.currentPrice} ≈ <span>{money?money:''}</span>
          </p>
          {buys.length < 1 ? (
            <div className="exchange-no-data">{intl.get("assets_no_data")}</div>
          ) : (
            ""
          )}
          <div className="data-list" style={this.state.showType==2?heightStyle:{}}>
            {this.state.showType == 3 ? '' :
            // <table>
            //   <tbody>{list1}</tbody>
            // </table>
              <div className="data-list-table">
                {list1}
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default DynamicData;