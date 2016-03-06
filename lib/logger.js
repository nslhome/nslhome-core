var chalk = require('chalk');
var env = require('./env');
var mongo = require('mongodb').MongoClient;
var os = require('os');
var path = require('path');

var _hostname = os.hostname();

var args = process.argv.slice(1);
args[0] = path.basename(args[0]);
var _script = args.join(' ');

var _logLevels = {'verbose': 4, 'info': 3, 'warning': 2, 'error': 1};


var Logger = function(source, config) {
    config = config || {};
    var me = this;

    this.consoleOutput = (config.consoleOutput === undefined) ? true : config.consoleOutput;
    this.mongoOutput = (config.mongoOutput === undefined) ? true : config.mongoOutput;
    this.logLevel = config.logLevel || 'verbose';

    var backlog = [];

    var _writeLog = function(doc) {
        backlog.push(doc);
    };

    if (this.mongoOutput) {
        mongo.connect(env.MONGO_URL, {db: {native_parser: false}}, function (err, db) {
            if (err) {
                console.error("Unable to open mongoDB for logging.");
                me.mongoOutput = false;
                return;
            }

            var logsCollection = db.collection('logs');

            _writeLog = function(doc) {
                logsCollection.insertOne(doc, function(err) {
                    if (err) {
                        console.error("Unable to write log to mongo. " + JSON.stringify(err));
                    }
                });
            };

            for (var i in backlog) {
                _writeLog(backlog[i]);
            }
        });
    }


    var _log = function(level, message, data) {
        if (_logLevels[level] <= _logLevels[me.logLevel]) {
            var ts = new Date();

            if (me.mongoOutput) {
                _writeLog({
                    timestamp: ts,
                    hostname: _hostname,
                    script: _script,
                    source: source,
                    message: message,
                    level: level,
                    data: data
                });
            }

            if (me.consoleOutput) {
                var parts = [];
                parts.push(chalk.gray(ts.toLocaleTimeString()));

                switch (level) {
                    case "verbose":
                        parts.push(chalk.magenta.bold("<" + level + ">"));
                        break;
                    case "info":
                        parts.push(chalk.cyan.bold("   <" + level + ">"));
                        break;
                    case "warning":
                        parts.push(chalk.yellow.bold("<" + level + ">"));
                        break;
                    case "error":
                        parts.push(chalk.red.bold("  <" + level + ">"));
                        break;
                }

                parts.push(chalk.gray("src=") + chalk.green(source));
                parts.push("msg=" + chalk.green(message));
                if (data)
                    parts.push("data=" + chalk.blue(JSON.stringify(data)));

                var msg = parts.join(' ');

                if (level == 'error')
                    console.error(msg);
                else
                    console.log(msg);
            }
        }
    };

    this.verbose = function(message, data) {
        _log('verbose', message, data);
    };

    this.info = function(message, data) {
        _log('info', message, data);
    };

    this.warning = function(message, data) {
        _log('warning', message, data);
    };

    this.error = function(message, data) {
        _log('error', message, data);
    };
};

exports = module.exports = Logger;


/*
var l = new Logger("testbed");
l.verbose("test message", {a : 1, b: 2});
l.info("for your information");
l.warning("something smells fishy");
l.error("wtf is happening", {err: "foo"});
*/