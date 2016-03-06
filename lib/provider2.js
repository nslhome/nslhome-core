var servicebus = require('servicebus');
var mongo = require('mongodb').MongoClient;
var events = require("events");
var util = require("util");
var path = require('path');
var env = require('./env');
var logger = require('./logger')

var Provider = function() {

    var me = this;
    var bus = null;
    var devices = null;

    this.providerName = "NOT REGISTERED";

    var log_verbose = function (message, data) {
        logger.verbose(providerName + ": " + message, data);
    };

    this.initialize = function (providerType, providerName, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        me.providerName = providerName;
        bus = servicebus.bus({url: env.RABBIT_URL, queuesFile: '.queues-' + path.basename(process.argv)});

        bus.listen("provider:" + providerName, function (message) {
            log_verbose(message);

            switch (message.name) {
                case "power":
                    me.emit('setDevicePower', message.id, message.state);
                    break;

                case "state":
                    me.emit('setDeviceState', message.id, message.state);
                    break;
            }

        });

        mongo.connect(env.MONGO_URL, {db: {native_parser: false}}, function(err, db) {
            if (err)
                return me.emit("error", err);

            devices = db.collection('devices');

            db.collection('providers').find({'provider': providerType, 'name': me.providerName}).limit(1).next(function(err, provider) {
                if (err)
                    return callback(err);

                if (!provider)
                    return callback(new Error("Unknown provider"));

                callback(null, provider.config);
            });
        });
    };

    this.send = function(message) {
        var ts = new Date();
        message.lastUpdated = ts;
        bus.publish('provider.message', message);

        if (message.name == "device") {
            devices.find({_id: message.body.id}).limit(1).next(function(err, device) {
                if (err)
                    me.emit("error", err);

                if (device == null)
                    device = {body: {}, provider: providerName, _id: message.body.id};

                device.lastUpdated = ts;

                for (var attr in message.body) {
                    device.body[attr] = message.body[attr];
                }

                devices.save(device);
            });
        }
    };

};

util.inherits(Provider, events.EventEmitter);
exports = module.exports = Provider;