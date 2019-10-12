import React, { Component } from "react";
import "../../assets/scss/pc/component/error_page.css";
import Icon from "../../assets/images/404.png";
import { Link, withRouter } from "react-router-dom";

@withRouter
class ErrorPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: 5
        }
        // this.time = 5;
        this.clearTime = null;
        this.canvasRef = React.createRef();
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentDidMount() {
        this.getCanvas();
        this.clearTime = setInterval(() => {
            if(this.state.time && this.mounted) {
                this.setState((preState) => ({
                    time: preState.time - 1
                }), () => {
                    if (!this.state.time) {
                        this.props.history.push("/");
                    }
                })
            } 
        }, 1000);
    }

    componentWillUnmount() {
        this.mounted = false;
        clearInterval(this.clearTime);
        this.time = 5;
    }

    getCanvas() {
        let ctx = this.canvasRef.current.getContext('2d')
        console.log("ctx###", ctx);
        ctx.canvas.width = 480
        ctx.canvas.height = 200
        let ballobj = []
        class Round {
            static init(ctx) {
                for (var i = 0; i < 20; i++) {
                    var obj = new Round(ctx)
                    let isHave = false
                    obj.isCollision(() => {
                        isHave = true
                        i--
                    })
                    if (!isHave) {
                        obj.draw()
                        obj.move()
                        ballobj.push(obj)
                    }
                }
            }
            constructor(ctx) {
                this.ctx = ctx
                let rand = (max, min = 0) => {
                    return parseInt(Math.random() * (max - min + 1) + min)
                }
                this.r = rand(8, 2)
                // 随机位置
                var x = rand(this.ctx.canvas.width - this.r) // 仿制超出右边界
                this.x = x < this.r ? this.r : x
                var y = rand(this.ctx.canvas.height - this.r)
                this.y = y < this.r ? this.r : y
                // 随机速度
                var speed = rand(1, 3)
                this.speedX = rand(4) > 2 ? speed : -speed
                this.speedY = rand(4) > 2 ? speed : -speed
            }
            draw() {
                this.ctx.fillStyle = 'rgba(200,200,200,0.5)'
                this.ctx.beginPath()
                this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true)
                this.ctx.closePath()
                this.ctx.fill()
            }
            links() {
                this.ctx.lineWidth = 0.1
                for (var i = 0; i < ballobj.length; i++) {
                    //                  var ball = ballobj[i];
                    var l = Math.sqrt((ballobj[i].x - this.x) * (ballobj[i].x - this.x) + (ballobj[i].y - this.y) * (ballobj[i].y - this.y))
                    var a = 1 / l * 100
                    if (l < 90) {
                        this.ctx.beginPath()
                        this.ctx.moveTo(this.x, this.y)
                        this.ctx.lineTo(ballobj[i].x - 0.5, ballobj[i].y - 0.5)
                        this.ctx.strokeStyle = 'rgba(200,200,200,' + a + ')'
                        this.ctx.stroke()
                        this.ctx.closePath()
                    }
                }
            }
            move() {
                this.x += this.speedX / 10
                if (this.x > this.ctx.canvas.width || this.x < 0) {
                    this.speedX *= -1
                }
                this.y += this.speedY / 10
                if (this.y > this.ctx.canvas.height || this.y < 0) {
                    this.speedY *= -1
                }
                this.isCollision(() => {
                    this.speedX *= -1
                    this.speedY *= -1
                })
            }
            isCollision(fn) {
                for (let i = ballobj.length; i--;) {
                    if (Math.abs(this.x - ballobj[i].x) <= this.r + ballobj[i].r && Math.abs(this.y - ballobj[i].y) <= this.r + ballobj[i].r && this !== ballobj[i]) {
                        fn()
                    }
                }
            }
        }
        Round.init(ctx)
        function ballmove() {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            for (var i = 0; i < ballobj.length; i++) {
                var ball = ballobj[i]
                ball.draw()
                ball.move()
                ball.links()
            }
            window.requestAnimationFrame(ballmove)
        }
        ballmove()
    }

    render() {
        return <div className="error-page">
            <div className="img">
                <canvas ref={this.canvasRef}></canvas>
                <img src={Icon} />
            </div>
            <div className="info">
                还有{this.state.time}<Link to={"/"}>返回首页</Link>
            </div>
        </div>
    }
}

export default ErrorPage;
