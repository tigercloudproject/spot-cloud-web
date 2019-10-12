import React, {Component} from "react";
import "../../assets/scss/pc/component/bbx_page.css";

class Page extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ul className="paging">
                <li>{'<'}</li>
                <li className="active">1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
                <li>5</li>
                <li>{'>'}</li>
            </ul>
        )
    }
}

export default Page;