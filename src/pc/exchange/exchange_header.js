import React, {Component} from "react";
import { connect } from "react-redux";
import { getSpotDetails, getOpenOrders, getOrderHistory, getTradeRecords, changeCurrentCoinPair } from "../../redux/exchange.redux.js";
import { withRouter } from "react-router-dom";
import { getQueryString } from "../../utils/getQueryString.js";
import { decimalProcess, getObjStocksPrecision, getStocksPrecision, getRank } from "../../utils/gconfig/stocksModel.js";
import { getspotTickersData } from "../../redux/index.redux.js";
import favoritesNor from "../../assets/images/icon-Favorites_nor.png";
import favoritesSel from "../../assets/images/icon-Favorites_sel.png";
import intl from "react-intl-universal";
import { debounce } from "../../utils/debounce.js";
import { cutOut } from "../../utils/dataProcess.js";
import { webExchangeSingle } from "../../utils/exchange.js";


@withRouter
@connect(state => ({ ...state.sdetails, ...state.gconfig, ...state.index, ...state.lang }),
{
  getspotTickersData,
  getSpotDetails,
  getOpenOrders,
  getOrderHistory,
  getTradeRecords,
  changeCurrentCoinPair
})
class ExchangeHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ticker: {
        last_price: "--",
        rise_fall_value: "--",
        rise_fall_rate: "--",
        high: "--",
        low: "--",
        volume: "--",
        total_volume: "--",
        amount24: "--"
      },
      stockSelectShow: false,
      tabList: [
        {
          name: intl.get("exchange_data_favorite"),
          id: 'favorite'
        },
        {
          name: intl.get("exchange_data_all"),
          id: 'all'
        }
      ],
      currentTab: 'all',
      spotTickerList: [],
      origin_tickers: [],
      favorites: [],
      currentCoinPair: '',
      search: '',
      rateCNY: '',
      rateUSD: '',
      currentPrice: '',
      qd: localStorage.getItem("qd"),//渠道
    };

    this.selectTab = this.selectTab.bind(this);

    //搜索spot_tickers 防抖
    this.toSearch = debounce(function (data) {
      let result = [];
      this.state.origin_tickers.forEach((item) => {
        if (item.stock_code.indexOf(data.toUpperCase()) > -1) {
          result.push(item);
        }
      })
      if (this.mounted) {
        this.setState({
          spotTickerList: result
        })
      }
    }, 500);

  }

  

  async componentWillMount() {
    this.mounted = true;
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    if(this.mounted) {
      this.setState({
        currentCoinPair: coinPair
      })
    }    
  }

  componentDidMount() {
    // console.log("location###",location);
    //每2秒刷新一次数据
    // this.timer = setInterval(() => {
    //   this.props.getspotTickersData();
    //   this.props.getSpotDetails(this.state.currentCoinPair);
    // },2000);
    //let coinPair = getQueryString(this.props.location.search, "coinPair");
    //clearTimeout(this.spot_detail_timmer);
    // this.spot_detail_timmer = setTimeout(() => {
    //   this.props.getSpotDetails(coinPair);
    // }, 2000)
  }

  componentWillUnmount() {
    this.mounted = false;
    clearInterval(this.timer);
    this.timer = null;
    clearTimeout(this.spot_ticker_timmer);
    clearTimeout(this.spot_detail_timmer);
    this.spot_ticker_timmer = null;
    this.spot_detail_timmer = null;
    this.props.changeCurrentCoinPair(''); 
  }

  componentWillReceiveProps(nextProps) {
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    if(nextProps.clist.stocks && nextProps.spot_details && nextProps.spot_details.ticker) {
      let price_unit = ["last_price", "rise_fall_value", "high", "low"];
      let vol_unit = ["total_volume"];
      let ticker = getObjStocksPrecision(nextProps.clist.stocks, nextProps.spot_details.ticker, coinPair, price_unit, vol_unit);
      if(this.mounted) {
        this.setState({
          ticker: ticker,
        });
        if(!this.state.currentCoinPair) {
          this.setState({
            currentCoinPair: nextProps.spot_details.stock_code
          });
        }
      }
      
      //if(this.props.spot_details!==nextProps.spot_details) {
        clearTimeout(this.spot_detail_timmer);
        this.spot_detail_timmer = setTimeout(() => {
          this.props.getSpotDetails(coinPair);
        }, 2000)
      //}
      
    }
 
    if(nextProps.clist.stocks && nextProps.spot_tickers && nextProps.spot_tickers.tickers){
      // console.log("nextProps.clist.stocks###", nextProps.clist.stocks);
      // console.log("nextProps.spot_tickers.tickers###", nextProps.spot_tickers.tickers);
      let price_unit =["last_price","rise_fall_value","high","low"];
      let vol_unit = ["total_volume"];
      // console.log("nextProps.spot_tickers.tickers####", nextProps.spot_tickers.tickers);
      let ticker_rank = getRank(nextProps.clist.stocks, nextProps.spot_tickers.tickers, "stock_code");
      // console.log("nextProps.clist.stocks####", nextProps.clist.stocks);
      // console.log('ticker_rank###', ticker_rank);
      let spotList = getStocksPrecision(nextProps.clist.stocks, ticker_rank, "stock_code", price_unit, vol_unit);
      let rankSpot = this.rankByFavorites(spotList);
      // let rankSpot = spotList;
      // console.log("rankSpot#######", rankSpot);
      if (this.mounted) {
        this.setState({
          //spotTickerList: rankSpot,
          origin_tickers: rankSpot
        })
      }
      this.toSearch(this.state.search);

      if(this.props.spot_tickers!==nextProps.spot_tickers) {
        clearTimeout(this.spot_ticker_timmer);
        this.spot_ticker_timmer = setTimeout(() => {
          this.props.getspotTickersData();
        },2000);
      }

    }


    //当前价转换为美元或者人民币
    if (nextProps.clist && nextProps.clist.coin_prices && nextProps.clist.usd_rates && nextProps.spot_tickers && nextProps.spot_tickers.tickers) {
      if (nextProps.spot_details && nextProps.spot_details.ticker) {

        let cnyRate = nextProps.clist.usd_rates[0].rate;

        //先看根据coin_prices能不能直接转成美元，如果转换不了，则启用转换算法
        let coinArr = nextProps.spot_details.stock_code.split("/");
        let lastCoin = coinArr[1];

        let amountCNY = 0;
        let amountUSD = this.getAmountUSD(nextProps.clist.coin_prices, lastCoin, 1);
        amountUSD = Number(amountUSD).mul(Number(nextProps.spot_details.ticker.last_price));


        if (amountUSD === 0) {
          amountUSD = webExchangeSingle(lastCoin, "USD", nextProps.spot_details.ticker.last_price, nextProps.clist.coin_prices, nextProps.clist.usd_rates, nextProps.spot_tickers.tickers);
        }

        if (isNaN(amountUSD)) {
          amountUSD = 0;
        }

        amountCNY = Number(amountUSD).mul(Number(cnyRate));


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

  //current_price 转为美元
  getAmountUSD(coin_prices, coin, vol) {
    for (let i = 0; i < coin_prices.length; i++) {
      if (coin_prices[i].Name == coin) {
        return Number(vol).mul(Number(coin_prices[i].price_usd));
      }
    }
    return 0;
  }

  //显示select model层
  stockSelectModelShow(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if(this.mounted) {
      this.setState({
        stockSelectShow: !this.state.stockSelectShow
      })
    }
  }

  //隐藏select model层
  stockSelectModelHide() {
    if (this.mounted) {
      this.setState({
        stockSelectShow: false
      })
    }
  }

  getFirstCode(string) {
    if(!!string) {
      return string.split("/")[0];
    }
  }
  getLastCode(string) {
    if(!!string) {
      return string.split("/")[1];
    }
  }

  //切换tab
  selectTab(item) {
    if(this.mounted) {
      this.setState({
        currentTab: item.id
      })
    }
  }

  //获取localstorage
  getLocalFavorites() {
    let favorites = JSON.parse(localStorage.getItem("favorites"));
    if (favorites != null) {
      if (this.mounted) {
        this.setState({
          favorites: favorites
        })
      }
    }
  }

  //获取本地收藏列表
  rankByFavorites(list) {
    let localFavorites = JSON.parse(localStorage.getItem("favorites"));
    //console.log('localFavorites####',localFavorites);
    if (localFavorites == null || localFavorites.length < 1) {
      return list;
    }
    let flist = [], plist = [];
    list.forEach((item, index) => {
      item["favorite"] = false;
      localFavorites.forEach((fitem) => {
        if (item.stock_code == fitem) {
          item["favorite"] = true;
        }
      })
      if (item["favorite"]) {
        flist.push(item);
      } else {
        plist.push(item);
      }
    })
    //console.log('####', flist.concat(plist));
    return flist.concat(plist);
  }

  //获取收藏列表
  getFavoriteList() {
    let flist = [];
    this.state.spotTickerList.forEach((item, index) => {
      if (item["favorite"]) {
        flist.push(item);
      }
    });

    return flist;
  }
  //保存到localstorage
  setLocalFavorites() {
    //console.log("this.state.favorites", this.state.favorites);
    localStorage.setItem("favorites", JSON.stringify(this.state.favorites));
  }
  //收藏
  setFavorite(e,item) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    item['favorite'] = true;

    let newList = this.state.spotTickerList;
    newList.forEach(spot => {
      if (spot.stock_code == item.stock_code) {
        spot.favorite = true;
      }
    });
    if (!this.mounted) {
      this.setState({
        spot_tickers: newList
      });
    }

    let list = this.state.favorites;
    list.push(item.stock_code);
    if (this.mounted) {
      this.setState({
        favorites: list
      })
    }
    this.setLocalFavorites();
  }

  //去除收藏
  removeFavorite(e,item) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    item['favorite'] = false;
    let newList = this.state.spotTickerList;
    newList.forEach(spot => {
      if (spot.stock_code == item.stock_code) {
        spot.favorite = false;
      }
    });
    if (this.mounted) {
      this.setState({
        spot_tickers: newList
      });
    }

    let list = this.state.favorites;
    list.remove(item.stock_code);
    if (this.mounted) {
      this.setState({
        favorites: list
      })
    }
    this.setLocalFavorites();
  }

  //切换币值对
  selectCoinPair(item) {

    let search = `?coinPair=${item.stock_code}`;
    if(this.props.default && this.props.default.value) {
      search = search + `&lang=${this.props.default.value}`;
    }

    if(this.state.qd!=="null") {
      search = search + `&qd=${this.state.qd}`;
    }

    this.props.history.push(`/exchange${search}`);
    if (this.mounted) {
      this.setState({
        currentCoinPair: item.stock_code
      })
    }
    
    this.props.changeCurrentCoinPair(item.stock_code); //切换当前币值对
    this.props.getSpotDetails(item.stock_code);
    this.stockSelectModelHide();
  
  }


  //搜索框change事件
  searchChange(value) {
    this.toSearch(value);
    if(this.mounted){
      this.setState({
        search: value
      })
    }
  }


  render() {
    let stockModelStyle = {
      "display": this.state.stockSelectShow?'block':'none'
    }

    let ticker = this.state.ticker;
    let rate = ticker.rise_fall_rate!="--"?ticker.rise_fall_rate * 100:"--";
    let stock_code;
    if(this.props.spot_details && this.props.spot_details.stock_code) {
      stock_code = this.props.spot_details.stock_code;
    }

    let TabLi = this.state.tabList.map((item, index) => {
      return <li key={index} className={item.id===this.state.currentTab?'active':''} onClick={() => this.selectTab(item)}>
                {item.name}
              </li>
    })

    

    let currentPriceRate;
    if(this.props.default && this.props.default.index) {
      if(this.props.default.index==3) {
        currentPriceRate = " $" + Number(this.state.rateUSD).toFixed(2);
      }else {
        currentPriceRate = " ¥" + Number(this.state.rateCNY).toFixed(2);
      }
    }


    let srate;
    //区分收藏和全部
    let list = this.state.currentTab === 'all' ? this.state.spotTickerList : this.getFavoriteList();
    let spotList = list.map((item, index) => {
      srate = decimalProcess(item.rise_fall_rate * 100, 2);
      return (
        <tr key={index} onClick={()=>this.selectCoinPair(item)}>
          <td>{item.favorite ? <img alt="favoritesSel" src={favoritesSel} onClick={(e) => this.removeFavorite(e,item)} /> : <img alt="favoriteNor" src={favoritesNor} onClick={(e) => this.setFavorite(e,item)} />}</td>
          <td>{item.stock_code}</td>
          <td><span className={item.rise_fall_rate >= 0 ? 'green' : 'red'}>{item.last_price}</span></td>
          <td className="rise-and-fall">
            <span className={item.rise_fall_rate >= 0 ? 'green' : 'red'}>
              {srate>=0?("+"+srate):srate}%
            </span>
          </td>
          <td className="turn-over">{item.total_volume}</td>
        </tr>
      );
    })

    //console.log('render里的coinpair####',this.state.currentCoinPair);
    //console.log('ticker####',ticker);
    return <div className="exchange-header">
      {this.state.stockSelectShow ? <div className="stock-code-mask" onClick={() => this.stockSelectModelHide()}></div>:''}
        <div className="stock-code">
          <div className="stock-code-span" onClick={(e) => this.stockSelectModelShow(e)}>
            <span >{this.state.currentCoinPair}</span>
            <i className="iconfont icon-down" />
          </div>
          <div className="stock-select-model" style={stockModelStyle}>
            <div className="stock-select-header">
              <ul className="stock-select-tab">{TabLi}</ul>
              {/* <div className="stock-select-search">
                <input type="text" onChange={(e) => this.searchChange(e.target.value)}/>
              </div> */}
            </div>
            <div className="stock-select-table-box">
              <table className="stock-select-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>{intl.get("assets_order_thead_pairs")}</th>
                    <th>{intl.get("exchange_head_current")}</th>
                    <th className="rise-and-fall">{intl.get("exchange_thead_change")}</th>
                    <th className="turn-over">{intl.get("exchange_head_total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {spotList}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      
        <ul className="exchange-num-list">
          <li className="current-price">
            <h6>{intl.get("exchange_thead_current")}：{ticker.last_price}</h6>
            <h6>≈ {currentPriceRate}</h6>
          </li>
          <li className="change-rate">
            <h6>{intl.get("exchange_thead_change")}：<span className={rate >= 0 ? "green" : "red"}>{rate != "--" ? decimalProcess(rate, 2) : "--"}%</span></h6>
            <h6>{intl.get("index_thead_change_num")}：<span className={rate >= 0 ? "green" : "red"}>{ticker.rise_fall_value}</span></h6>
          </li>
          <li>
            <h6>
              {ticker.high!=="--"?ticker.high:"--"}
              {/* <span>$ 0.12</span> */}
            </h6>
            <p>{intl.get("exchange_thead_high")}</p>
          </li>
          <li>
            <h6>
              {ticker.low!=="--"?ticker.low:"--"}
              {/* <span>$ 0.12</span> */}
            </h6>
            <p>{intl.get("exchange_thead_low")}</p>
          </li>
          <li>
            <h6>
              {ticker.total_volume!=="--"?ticker.total_volume:"--"}
              {/* <span> {this.getFirstCode(stock_code)}</span> */}
            </h6>
            <p>{intl.get("exchange_thead_24volume")} ( {this.getFirstCode(stock_code)} )</p>
          </li>
          <li>
            <h6>
              {ticker.amount24!=="--"?cutOut(Number(ticker.amount24),2):"--"}
              {/* <span> {this.getLastCode(stock_code)}</span> */}
            </h6>
            <p>{intl.get("exchange_head_total")} ( {this.getLastCode(stock_code)} )</p>
          </li>
          <li>
            
          </li>
        </ul>
      </div>;
  }
}

export default ExchangeHeader;