import React, {createRef} from 'react';

class App extends React.Component {
    state = {
        colors:[
            'black',
            'blue',
            'green',
        ],
    selectedColor: 'black',
        circles: []
    };

    componentDidMount() {
        this.websocket = new WebSocket('ws://localhost:8080/canvas');

        this.websocket.onmessage = (circle) => {
            try {
                const data = JSON.parse(circle.data);

                if (data.type === 'NEW_CANVAS_CIRCLES') {
                    const newCircle= {
                        circle: data.circle
                    };

                    this.setState({circles: [...this.state.circles, newCircle]});
                    this.renderCanvas();
                } else if (data.type === 'LAST_CANVAS_CIRCLES') {
                    this.setState({circles: data.circles});
                    this.renderCanvas();
                }
            } catch (e) {
                console.log('Something went wrong', e);
            }
        };
    };

    renderCanvas = () => {
        const canvas = this.canvas.current;

        const ctx = canvas.getContext('2d');

        this.state.circles.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.circle.x, circle.circle.y, 30, 0, 2 * Math.PI);
            ctx.fillStyle = circle.circle.color;
            ctx.fill();
            ctx.stroke();
        })
    };



    onCanvasClick = e => {
        e.persist();

        const canvas = this.canvas.current;

        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, 30, 2, 2 * Math.PI);
        ctx.fillStyle = this.state.selectedColor;
        ctx.fill();
        ctx.stroke();

        const obj = {
            x: e.clientX,
            y: e.clientY,
            color: this.state.selectedColor
        };

        const newCircle = {
            type: 'NEW_CANVAS_CIRCLE',
            circle: obj
        };

        this.websocket.send(JSON.stringify(newCircle));

    };

    canvas = createRef();

    changeField = e => this.setState({[e.target.name]: e.target.value});

    render() {
        return (
            <>
                <select name="selectedColor" id="color" onChange={this.changeField}>
                    {this.state.colors.map(color => (
                        <option key={color} value={color}>{color}</option>
                    ))}
                </select>
                <div style={{border: '1px solid black', width: '50%', height: 'auto'}}>
                    <canvas width='720' height='500' ref={this.canvas} onClick={this.onCanvasClick}/>
                </div>
            </>
        );
    }
}

export default App;