import React, {Component} from 'react';

import Header from './pc_header';
import "./layout.css";

class Layout extends Component{
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div className="layout-container">
                <Header></Header>
                {this.props.children}
            </div>
        );
    }
}

export default Layout;
