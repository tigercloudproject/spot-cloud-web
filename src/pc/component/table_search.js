import React, {Component} from "react";
import "../../assets/scss/pc/component/table_search.css";

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFocus: false
        }
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    onFocus() {
        if(this.mounted) {
            this.setState({
                isFocus: true
            })
        }
    }

    onBlur() {
        if(this.mounted) {
            this.setState({
                isFocus: false
            })
        }
    }

    searchChange(value) {
        this.props.search(value);
    }

    render() {
        return (
            <div className="table-search" className={this.state.isFocus?"table-search focus": "table-search"}>
                <input type="text" 
                    onChange={(e) => this.searchChange(e.target.value)}
                    onFocus = {() => this.onFocus()}
                    onBlur = {() => this.onBlur()}
                />
            </div>
        )
    }
}

export default Search;;