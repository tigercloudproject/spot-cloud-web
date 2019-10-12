import React, {Component} from "react";
import "../../assets/scss/pc/component/bbx_select.css";

class BBXSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            currentItem: '',
        }
        this.toggleList = this.toggleList.bind(this);

    }
    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    toggleList() {
        if(this.mounted) {
            this.setState({
                show: !this.state.show
            })
        } 
    }

    hideList(){
        if(this.mounted) {
            this.setState({
                show: false
            })
        }
    }

    selectItem(item){
        if(this.mounted) {
            this.setState({
                show: false,
                currentItem: item
            })
        }
        this.props.select(item);
    }


    render() {
        let boxStyle = {
            width: this.props.width ? this.props.width:"240px",
            height: this.props.height ? this.props.height :"50px"
        };
        let iconStyle = {
            lineHeight: this.props.height ? this.props.height :"50px"
        };
        let listStyle = {
            display: this.state.show ? "block" : "none",
            minWidth: this.props.width ? this.props.width : "240px"
        };

        let propsList = this.props.list?this.props.list:[];
        let listLi = propsList.map((item,index) => {
            return <li key={index} onClick={() => this.selectItem(item)}>
                        {this.props.name?item[this.props.name]:item.name}
                    </li>
        });

        let current ;
        //无值也无默认值时显示列表第一条
        if(!this.state.currentItem && this.props.list.length>0 && !this.props.defaultCoin) {
            current = this.props.name?this.props.list[0][this.props.name]:this.props.list[0].name;
        }
        //无值时有默认值则显示默认值
        if(!this.state.currentItem && this.props.defaultCoin) {
            current = this.props.defaultCoin;
        }
        //有当前值，显示当前值
        if(this.state.currentItem) {
            current =this.props.name?this.state.currentItem[this.props.name]:this.state.currentItem.name;
        }

        return (
            <div className={this.state.show?"bbx-select focus":"bbx-select"} style={boxStyle}>
                {this.state.show?<div className="bbx-mask" onClick={() => {this.hideList()}}></div>:''}
                <div className="bbx-select-con" onClick={this.toggleList}>
                    <span className="con" style={iconStyle}>{current}</span>
                    <span className="icon" style={iconStyle}><i className="iconfont icon-down"></i></span>
                </div>
                <ul className="bbx-select-list" style={listStyle}>
                   {listLi}
                </ul>
            </div>
        )
    }
}

export default BBXSelect;;

