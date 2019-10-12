import React, {Component} from "react";
import "../../assets/scss/pc/component/dropdown.css";

class DropDown extends Component { 
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            currentItem: ''
        }
        this.toggleList = this.toggleList.bind(this);
        this.hideList = this.hideList.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    hideList() {
        if (this.mounted) {
            this.setState({
                show: false
            })
        }
    }

    toggleList() {
        if (this.mounted) {
            this.setState({
                show: !this.state.show
            })
        }
    }

    selectItem(item) {
        if (this.mounted) {
            this.setState({
                show: false,
                currentItem: item
            })
        }
        this.props.select(item);
        console.log(1)
        console.log(item)
    }

    render() {
        let list = this.props.list ? this.props.list: [];
        let listLi = list.map((item, index) => {
            return <li key={index} onClick={() => this.selectItem(item)}>
                {this.props.name?item[this.props.name]:item.name}
            </li>
        })


        let current;
        //无值也无默认值时显示列表第一条
        if (!this.state.currentItem && this.props.list.length > 0 && !this.props.defaultCoin) {
            current = this.props.name ? this.props.list[0][this.props.name] : this.props.list[0].name;
        }
        //无值时有默认值则显示默认值
        if (!this.state.currentItem && this.props.defaultCoin) {
            current = this.props.defaultCoin;
        }
        //有当前值，显示当前值
        if (this.state.currentItem) {
            current = this.props.name ? this.state.currentItem[this.props.name] : this.state.currentItem.name;
        }
        return <div className="bbx-dropdown">
            {this.state.show?<div className="bbx-dropdown-mask" onClick={this.hideList}></div>:null}
            <div className={this.state.show ? "bbx-dropdown-con open" :"bbx-dropdown-con close"} onClick={this.toggleList}>
                <span>{current}</span>
                <i className="iconfont icon-down"></i>
            </div>
            <ul className={this.state.show?"open":"close"}>
                {listLi}
            </ul>
        </div>
    }
}

export default DropDown;
