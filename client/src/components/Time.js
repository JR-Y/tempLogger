import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class Time extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().toLocaleString()
        }
    }

    componentDidMount() {
        let timeInterv = setInterval(this.getTime, 100);
        this.setState({ interval: [timeInterv] })
    }

    componentWillUnmount() {
        const { interval } = this.state;
        if (Array.isArray(interval)) {
            interval.forEach(val => {
                clearInterval(val);
            })
        }
    }
    getTime = () => {
        this.setState({ time: new Date().toLocaleString() })
    }

    render() {
        const { time } = this.state;
        return (<div>{time}</div>)
    }
}
export default withRouter(Time);