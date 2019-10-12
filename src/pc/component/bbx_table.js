import React, {Component} from "react";
import "../../assets/scss/pc/component/bbx_table.css";
import noDataImg from "../../assets/images/icon-Nocontent-white.svg";
import intl from "react-intl-universal";

class BBXTable extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted =false;
    }

    render() {
        let styleTh = {}, styleWidth={};
        let listTh = this.props.columns.map((item, index) => {
            if(item.width) {
                styleWidth = {
                    "width": item.width,
                    "flex": "none",
                }
            }else {
                styleWidth = {}
            }
            styleTh = {
                "width": item.width ? item.width: "auto",
                "flex": item.width ? "none": 1,
                "overflow": item.title ? "hidden" : "visible"
            }
            return (item.title ? 
                <th key={index} style={styleTh}>{item.title}</th>:
                <th key={index} style={styleTh}>{item.thrender()}</th>)
        })
        let listTr = this.props.data.map((row, index) => {
            return (<tr key={index}>
                 {this.props.columns.map((item, index) => {
                     if (item.width) {
                         styleWidth = {
                            "width": item.width,
                            "flex": "none",
                            "overflow": item.show ? "visible" : "hidden"
                         }
                     }else {
                         styleWidth = {}
                     }
                     return item.dataIndex ? (
                       <td key={index} style={styleWidth}>{row[item.dataIndex]}</td>
                     ) : (
                       <td key={index} style={styleWidth}>{item.render(row)}</td>
                     );
                 })}
            </tr>)
        })

        
        return <div className="bbx-table">
            <table>
                <thead>
                    <tr>
                        {listTh}
                    </tr>
                </thead>
                {this.props.data.length > 0 ? <tbody>
                    {listTr}
                </tbody>:null}
            </table>
            {/* 暂无数据 */}
            {this.props.data.length > 0 ? null : (
                <div className="no-data-img-box">
                    <img src={noDataImg} alt="noDataImg" />
                </div>
            )}
            {this.props.data.length > 0 ? null : (
                <div className="no-data-box">{intl.get("assets_no_data")}</div>
            )}
        </div>
    }

}

export default BBXTable;