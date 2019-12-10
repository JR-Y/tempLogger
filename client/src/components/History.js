import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ResponsiveLine } from "@nivo/line"



class History extends Component {
    constructor(props) {
        super(props);
        this.state = {
            interval: null
        }
    }

    componentDidMount() {
        console.log("component did mount");
        this.getData();
        let interv = setInterval(this.getData, 30000);
        this.setState({ interval: interv })
    }

    componentWillUnmount() {
        clearInterval(this.state.interval);
    }
    getData = ()=>{
        this.getCurrent();
        this.getAll();
    }
    getAll = () => {
        console.log("getting data");
        try {
            fetch('/api/tempAll')
                .then(res => res.json())
                .then(res => {
                    if (res) {
                        //console.log("got data");
                        //console.log("if res: ");
                        //console.log(res);
                        this.setState({ maindata: res })
                        this.genD(res);
                    }
                })
                .catch(error => console.log(error))
        } catch (error) {
            console.log(error)
        }
    }
    getCurrent = () => {
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

    genD = (maindata) => {
        /*
        let data = maindata.filter(data => {
            let now = new Date();
            let dataDate = new Date(data.date);
            if (dataDate.getFullYear() === now.getFullYear() &&
                dataDate.getMonth() === now.getMonth() &&
                dataDate.getDate() === now.getDate() &&
                dataDate.getHours() >= now.getHours()-5) {
                return true
            }
        });
        */
        let data = maindata.filter(data => {
            let now = new Date();
            let dataDate = new Date(data.date);
            if ((now - dataDate) <= 18000000) {//5 hours to milliseconds
                return true
            }
        });

        let t = data.map(d => {
            return ({
                x: d.date,
                y: d.temp
            })
        });
        let h = data.map(d => {
            return ({
                x: d.date,
                y: d.hum
            })
        });
        this.setState({ t: t, h: h });
    }

    render() {
        const { t, h, temp, hum, timest } = this.state;
        //console.log(t)
        //console.log(h)

        let propsChart = {
            xScale: {
                type: 'time',
                format: '%Y-%m-%dT%H:%M:%S.%LZ',
                precision: 'millisecond',
            },
            xFormat: "time:%Y-%m-%dT%H:%M:%S.%LZ",
            axisBottom: {
                legend: "Time",
                legendPosition: 'middle',
                legendOffset: 14,
                format: '%Y-%m-%d_%H:%M:%S.%L',
                tickRotation: -65,
                tickPadding: 17
            },
            margin: {
                top: 50,
                bottom: 140,
                right: 110,
                left: 70
            },
            curve: 'natural',
            useMesh: true,
            enablePoints: false,
            legends: [
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1
                            }
                        }
                    ]
                }
            ],
            data: [
                {
                    id: 'Temperature',
                    data: t
                },
                {
                    id: 'Humidity',
                    data: h
                }]
        }

        return (
            <div style={{
                height: "95vh",
                paddingBottom: '30px'
            }}>
                <div style={{ height: '50%' }}>
                    <div style={{
                        textAlign: 'center',
                        height: '100%',
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
                            <p style={{
                                fontFamily: "Roboto",
                                color: 'rgb(160, 160, 160)'
                            }}>
                                {`Temperature: ${temp} \u00B0C`}
                                <br />
                                {`Humidity: ${hum} %`}
                                <br />
                                {`Time: ${new Date(timest).toLocaleString()}`}
                            </p>
                        </div>
                    </div>

                </div>
                <div style={{ height: '50%' }}>
                    {t && h ?
                        <ResponsiveLine {...propsChart} /> :
                        null}
                </div>
            </div>
        )
    }
}
export default withRouter(History);