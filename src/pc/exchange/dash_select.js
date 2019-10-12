import React, {Component} from "react";

class DashSelect extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="dash-select-box">
                <div className="dash-select-name">
                    <span>15分钟</span>
                    <i className="iconfont icon-down"></i>
                </div>
                <ul className="dash-select-list">
                    <li>1分钟</li>
                    <li>5分钟</li>
                    <li>15分钟</li>
                    <li>30分钟</li>
                </ul>
            </div>
        )
    }
}

export default DashSelect;