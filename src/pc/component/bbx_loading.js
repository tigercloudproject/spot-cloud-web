import React, { Component } from "react";
import loadingImg from "../../assets/images/loadding.gif";
import "../../assets/scss/pc/component/bbx_loading.css";

class Loading extends Component{
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="bbx-loading">
            <img src={loadingImg} alt="loadingImg" className="bbx-loading-img" />
        </div>
    }
}

export default Loading;