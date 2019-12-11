import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ResponsiveLine } from "@nivo/line";
import noUiSlider from 'nouislider';
import 'nouislider/distribute/nouislider.css';
import { ClipLoader } from 'react-spinners';

const API_HOME = "/api/";
const TABLE = "tempQuery";

class Temp {
    constructor(id, date, temp, hum) {
        this._id = id;
        this.date = date;
        this.temp = temp;
        this.hum = hum;
    }
}

class History extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maindata: [
                new Temp("", undefined, null, null)
            ],
            interval: null,
            filterMin: new Date(Date.now() - 604800000),
            filterMax: new Date(),
            dynamicFiltering: true
        }
        this.sliderRef = React.createRef();
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
    getData = () => {
        this.getCurrent();
        this.getRange();
    }
    getRange = () => {
        console.log("getting data");
        const params = {
            start: new Date(Date.now() - 604800000),
            end: new Date()
        };
        let path = `${window.location.protocol}//${window.location.hostname}:${window.location.port}${API_HOME}${TABLE}`
        //let path = `https://intra.jry.fi${API_HOME}${TABLE}`
        console.log(path)
        let url = new URL(path);
        if (params) {
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            })
        }
        try {
            fetch(url)
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
                        this.setState({ temp: res.temp, hum: res.hum, timest: res.date })
                    }
                    console.log(res);
                })
                .catch(error => console.log(error))
        } catch (error) {
            console.log(error)
        }
    }

    genD(maindata) {
        let t = maindata.map(d => {
            return ({
                x: d.date,
                y: d.temp
            })
        });
        let h = maindata.map(d => {
            return ({
                x: d.date,
                y: d.hum
            })
        });
        this.setState({ t: t, h: h });
    }

    setSlider(maindata) {
        if (maindata && Array.isArray(maindata)) {
            let min = new Date(maindata[0].date).getTime();
            let max = new Date(maindata[maindata.length - 1].date).getTime();
            console.log(`min:${min}_max:${max}`)
            let sliderRange = this.sliderRef.current;
            let slider = noUiSlider.create(sliderRange, {
                start: [min, max],
                behaviour: 'drag',
                connect: true,
                range: {
                    'min': [min],
                    'max': [max]
                }
            });
            slider.on('slide', (values, handle, unencoded, tap, positions) => {
                //console.log(`SLIDE___Lower: ${values[0]}, Upper:${values[1]}`)
                //this.setState({filterValues:values})
                //localStorage.setItem("values",JSON.stringify(values))
            });
            slider.on('set', (values, handle, unencoded, tap, positions) => {
                //console.log(`SET___Lower: ${values[0]}, Upper:${values[1]}`)
                this.setState({ filterMin: new Date(Math.round(values[0])), filterMax: new Date(Math.round(values[1])) })
                //localStorage.setItem("values",JSON.stringify(values))
            });
            slider.on('end', (values, handle, unencoded, tap, positions) => {
                //console.log(`END___Lower: ${values[0]}, Upper:${values[1]}`)
                //this.setState({filterValues:values})
                //localStorage.setItem("values",JSON.stringify(values))
            });

        }
    }
    filterDataSet(ds) {
        const { filterMin, filterMax, dynamicFiltering } = this.state;
        if (filterMin && ds && Array.isArray(ds)) {
            ds = ds.filter(item => new Date(item.x).getTime() > filterMin.getTime())
        }
        if (filterMax && ds && Array.isArray(ds)) {
            ds = ds.filter(item => new Date(item.x).getTime() < filterMax.getTime())
        }

        if (ds && Array.isArray(ds)) {
            //console.log(ds.length)
            //console.log(ds.length / 2000)
            let minimizeRounds = Math.round(ds.length / 2000);

            if (minimizeRounds > 1 && dynamicFiltering) {
                let newSet = [];
                let count = 0;
                ds.forEach(val => {
                    count++;
                    if (count === minimizeRounds) {
                        newSet.push(val);
                        count = 0;
                    }
                })
                ds = newSet;
            }
            //console.log("after")
            //console.log(ds.length)
            //console.log(ds.length / 2000)
        }

        return ds;
    }

    render() {
        const { temp, hum, timest, dynamicFiltering } = this.state;
        let { t, h } = this.state;
        //console.log(t)
        //console.log(h)
        let propsChart = {};

        if (t && h) {
            t = this.filterDataSet(t);
            h = this.filterDataSet(h);
            propsChart = {
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
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => this.setState(state => ({ dynamicFiltering: !state.dynamicFiltering }))}>
                    {dynamicFiltering ? `Dynamic filtering on` : `Dynamic filtering off`}
                </button>
                <div style={{ height: '50%' }}>
                    {t && h ?
                        <div style={{ height: '100%', width: '100%' }}>
                            <ResponsiveLine {...propsChart} />
                            <div style={{ width: "100%" }} ref={this.sliderRef} />
                        </div>
                        :
                        <ClipLoader
                            loading={true}
                            size={30}
                        />}
                </div>
            </div>
        )
    }
}
export default withRouter(History);