import React, {Component} from "react";
import { NavLink, withRouter } from "react-router-dom";
import "../../../assets/scss/pc/assets/assets_header_tab.css";

class HeaderTab extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let ItemA = this.props.list.map((item, index) => {
            return <NavLink key={index}
                    activeClassName="active"
                    to={{
                        pathname: item.url,
                        search: location.search
                    }}
                >
                {item.name}
            </NavLink>
        })
        return <div className="assets-header-tab">
            {ItemA}
        </div>
    }
}
export default HeaderTab;
