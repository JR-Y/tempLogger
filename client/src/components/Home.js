import React, { Component } from 'react';
import { withRouter} from 'react-router-dom';

class Home extends Component{
  constructor(props) {
    super(props);
    this.state = {
      temp: "",
      hum:"",
      timest:"",
      interval:null
    }

  }

  componentDidMount() {
    this.getTemp();
    let interv = setInterval(this.getTemp,30000);
    this.setState({interval:interv})
  }

  componentWillUnmount(){
    clearInterval(this.state.interval);    
  }
  getTemp = () => {
    try {
      fetch('/api/tempLatest')
        .then(res => res.json())
        .then(res => {
          if (res && res.temp && res.hum) {
            this.setState({ temp: res.temp, hum:res.hum, timest:res.date })
          }
          console.log(res);
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    const {temp, hum, timest} = this.state;
    return (
      <div style={{
        textAlign: 'center',
        height: '100vh',
        display: 'table',
        width: '100%'
      }}>
        <div style={{
          display: 'table-cell',
          verticalAlign: 'middle',
          width: '100%',
        }}>
          <h1 style={{
            fontFamily: "Roboto",
            fontWeight: 'bold',
            fontSize: '10em',
            color: 'rgb(160, 160, 160)',
            margin: '0px'
          }}>JRY
          </h1>
        </div>
      </div>
    )
  }
}
export default withRouter(Home);