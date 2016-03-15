var mongo = require('mongodb').MongoClient;
var env = require('./env');

var _initStarted = false;
var _callbacks = [];
var _db = null;

var init = function() {
    _initStarted = true;
    var i;
    mongo.connect(env.MONGO_URL, {db: {native_parser: false}}, function (err, db) {
        if (err) {
            console.error(err);
            for (i in _callbacks)
                return _callbacks[i](err);
        }
        _db = {
            mongoClient: db,
            configuration: db.collection('configuration'),
            devices: db.collection('devices'),
            logs: db.collection('logs'),
            providers: db.collection('providers')
        };

        for (i in _callbacks)
            _callbacks[i](null, _db);
    });
};

module.exports = {
    open: function(next) {
        if (_db != null) {
            next(null, _db);
        }
        else {
            _callbacks.push(next);
            if (!_initStarted) {
                init();
            }
        }
    }
}
