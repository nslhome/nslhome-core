/**
 * Created by Nick Largent on 7/2/14.
 */


/*
 {
 id: string [should be fully qualified]
 lastChanged: date (null == unknown/startup value)
 name: string
 type: string [light, thermostat, binarysensor]
 lightType: string [basic, dimmable, hue]
 sensorType: string [water, motion, door]

 // for lights, dimmables, hues  (additive)
 powerState: boolean
 powerLevel: int [0-100]
 hueValue: complex

 // for binary sensors
 triggerState: boolean

 // for thermostats
 currentTemperature: int
 fanMode: boolean
 systemMode: string [off, heat, cool]
 }


 lights, sensors, cameras, events

 */

var path = require('path');
var servicebus = require('servicebus');
var mongo = require('mongodb').MongoClient;
var env = require('./env');
var bus = null;

var devices = {};
var events = {};
var updateHooks = [];

var device_manager = {ready: false};

var initialize = function () {

    mongo.connect(env.MONGO_URL, {db: {native_parser: false}}, function(err, db) {
        if (err)
            console.error(err);
        db.collection('devices').find(function(err, results) {
            results.forEach(function(doc) {
                if (doc) {
                    device_manager.updateDevice(doc.body)
                }
            }, function(err) {
                device_manager.ready = true;
            });
        });
    });

    bus = servicebus.bus({url: env.RABBIT_URL, queuesFile: '.queues-' + path.basename(process.argv)});

    bus.subscribe("provider.message", function (message) {
        switch (message.name) {
            case "device":
                device_manager.updateDevice(message.body);
                break;

            case "event":
                device_manager.triggerEvent(message.body);
                break;
        }
    });
};

var _getDevice = function(id) {
    if (!devices[id]) {
        devices[id] = {
            notify: [],
            provider: id.split(':')[0],
            body: { id: id }
        };
    }
    return devices[id];
};

device_manager.getEvent = function(id) {
    if (!events[id]) {
        events[id] = {
            notify: [],
            body: { id: id }
        };
    }
    return events[id];
};

device_manager.getDevice = function(id) {
    return _getDevice(id).body;
};

device_manager.updateDevice = function(data) {
    var device = _getDevice(data.id);
    var changed = false;
    for (var attr in data) {
        if (JSON.stringify(device.body[attr]) != JSON.stringify(data[attr])) {
            changed = true;
            device.body[attr] = data[attr];
        }
    }

    if (changed) {
        //console.log("Device " + device.body.id + " changed");
        for (var i in device.notify) {
            device.notify[i](device.body);
        }
        for (i in updateHooks) {
            updateHooks[i](device.body);
        }
    }
};

device_manager.sendMessage = function(message) {
    var device = _getDevice(message.id);
    bus.send('provider:' + device.provider, message);
};

device_manager.listDevices = function() {
    var list = [];
    for (var id in devices) {
        list.push(devices[id].body);
    }
    return list;
};

device_manager.watchDevice = function(id, callback) {
    var device = _getDevice(id);
    device.notify.push(callback);
};

device_manager.updateHook = function(callback) {
    updateHooks.push(callback);
};

device_manager.triggerEvent = function(data) {
    var event = _getDevice(data.id);

    for (var attr in data) {
        if (JSON.stringify(event.body[attr]) != JSON.stringify(data[attr])) {
            event.body[attr] = data[attr];
        }
    }

    for (var i in event.notify) {
        event.notify[i](event.body);
    }
};

device_manager.watchEvent = function(id, callback) {
    var event = _getDevice(id);
    event.notify.push(callback);
};

module.exports = device_manager;

initialize();