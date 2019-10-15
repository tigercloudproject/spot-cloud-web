import React, {Component} from 'react';
import "../../assets/scss/pc/register/tel_input.css";
import { Select } from 'antd';

class TelCode extends Component {
    constructor(props) {
        super(props);
    }

    handleChange(value) {
        console.log(`selected ${value}`);
    }

    handleBlur() {
        console.log('blur');
    }

    handleFocus() {
        console.log('focus');
    }

    render() {
        const Option = Select.Option;
        return (
            <div className="tel-intpu-box">
                <div className="tel-select">
                    <Select
                        showSearch
                        style={{ width: '100%',height: '50px' }}
                        placeholder="Select a person"
                        optionFilterProp="children"
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                        <Option value="jack">Jack</Option>
                        <Option value="lucy">Lucy</Option>
                        <Option value="tom">Tom</Option>
                    </Select>
                </div>
                <input type="text" className="tel-input" placeholder="请输入您的手机号码" />
            </div>
        )
    }
}

export default TelCode;