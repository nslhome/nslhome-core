var provider = require('./index').provider("test-provider");
var deviceManager = require('./index').DeviceMangager;
var logger = require('./index').logger('test-provider', {mongoOutput: false});


// controller

deviceManager.watchDevice('test:1', function(update) {
    logger.info("device update", update);
});



// provider

provider.initialize("test1", function(err, config) {
    if (err) {
        logger.error(err);
        process.exit(1);
    }

    logger.info("provider ready");
    logger.info("config", config);

    var triggerState = false;
    var body = {
        'id': 'test:1',
        'name': 'Test Device 1',
        'type': "binarysensor",
        'sensortype': "virtual",
        'triggerState': triggerState
    };
    provider.send({name: 'device', body: body});

    setInterval(function() {
        triggerState = !triggerState;
        var update = {
            id: 'test:1',
            triggerState: triggerState
        };
        provider.send({name: 'device', body: update});
    }, 2000);

});

provider.on("error", function(err) {
    logger.error("onError", err);
});
