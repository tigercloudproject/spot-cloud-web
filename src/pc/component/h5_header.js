import React, {Component} from "react";
import { NavLink, Link, withRouter } from "react-router-dom";

class H5Header extends Component {
    constructor(props) {
        super(props);
    }

    back() {
        history.go(-1);
    }
    render() {
        let headerStyle = {
            width: "100%",
            heihgt: "50px",
            lineHeight: "50px",
            textAlign: "center",
            color: "#fff",
            fontSize: "1rem",
            borderBottom: "1px solid #313a56",
            padding: "0px 10px",
            background: "#1f2636"
        }

        let iconStyle = {
            float: "left"
        }
        return <div style={headerStyle}>
            <Link to="/usercenter"><i className="iconfont icon-left" style={iconStyle}></i></Link>
            {this.props.title}
        </div>
    }
}

export default H5Header;