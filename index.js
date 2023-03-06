const express = require('express');
require('dotenv').config();
const path = require("path");
const url = require('url');
const app = express();
const port = 9467;
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const sensor1 = 'http://192.168.4.229:9467';
const root = "http://192.168.4.8:9467";

app.use(express.static(path.join(__dirname, './client/build')));
if (!process.env.dev) {
    mongoose.connect('mongodb://localhost/tempHum', { useNewUrlParser: true });
    const tempLogSchema = new Schema({
        id: ObjectId,
        date: Date,
        temp: Number,
        hum: Number
    });
    const TempLog = mongoose.model("TempLog", tempLogSchema);

    TempLog.createCollection().then((Collection) => { console.log("Collection created") });
    app.get('/api/tempQuery', async (req, res) => {
        let start = req.query.start ? new Date(req.query.start) : undefined;
        let end = req.query.end ? new Date(req.query.end) : undefined;
        //res.send({ start: start, end: end })

        if (!process.env.dev) {
            try {
                TempLog.find({ date: { $gte: start, $lte: end } }, (err, data) => {
                    res.send(data)
                })
            } catch (error) {
                res.send({})
            }
        } else {
            try {
                let data = await dev.getAll();
                res.send(data);
            } catch (error) {
                res.send([])
            }
        }
    });
    app.get('/api/tempAll', async (req, res) => {
        if (!process.env.dev) {
            try {
                TempLog.find({}, (err, data) => {
                    res.send(data)
                })
            } catch (error) {
                res.send({})
            }
        } else {
            try {
                let data = await dev.getAll();
                res.send(data);
            } catch (error) {
                res.send([])
            }
        }
    });
    app.get('/api/tempLatest', (req, res) => {
        try {
            TempLog.findOne({}, {}, { sort: { 'date': -1 } }, function (err, data) {
                res.send(data)
            });

        } catch (error) {
            res.send({})
        }
    });

    setInterval(() => {
        try {
            fetch(sensor1)
                .then(resp => resp.json())
                .then(resp => {
                    let newObj = {
                        date: new Date(`${resp.date}T${resp.time}:00`),
                        temp: resp.temp,
                        hum: resp.hum
                    }

                    TempLog.create(newObj);
                })
                .catch(err => {
                    console.log(err)
                })

        } catch (error) {
            res.send({})
        }

    }, 60000)
} else {
    //Dev methods
    app.get('/api/tempAll', async (req, res) => {
        try {
            let data = await fetch(url.resolve(root, "api/tempAll"))
                .then(resp => resp.json())
                .then(resp => {
                    return resp
                })
                .catch(err => {
                    console.log(err)
                    return err
                })
            res.send(data);
        } catch (error) {
            res.send([])
        }
    });
    app.get('/api/tempLatest', async (req, res) => {
        try {
            let data = await fetch(url.resolve(root, "api/tempLatest"))
                .then(resp => resp.json())
                .then(resp => {
                    return resp
                })
                .catch(err => {
                    console.log(err)
                    return err
                })
            res.send(data);
        } catch (error) {
            res.send({})
        }
    });
}

app.use(function (req, res, next) {
    res.sendFile(path.join(__dirname, './client/build', "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}!`))