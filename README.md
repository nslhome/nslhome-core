NslHome Core
=========

This library contains the core plumbing for building providers & controllers for the NslHome platform.

## Installation

`npm install nslhome/nslhome-core`

MongoDB and RabbitMQ configuration should be provided via the environment variables `NSLHOME_MONGO_URL` and `NSLHOME_RABBIT_URL`.

You can optionally use the file `.nslhome.config` to store your configuration.
```
{
    "NSLHOME_MONGO_URL": "mongodb://HOST/DATABASE",
    "NSLHOME_RABBIT_URL": "amqp://USERNAME:PASSWORD@HOST"
}
```

## Basic Usage

```
var core = require('nslhome-core')

var deviceManager = core.DeviceMangager;
var provider = core.provider("PROVIDER_TYPE");
var logger = core.logger("SOURCE", {});
```

## Device Manager

The device manager is used when building a controller.  It allows you to watch devices for state changes and send commands to control them.

```
// Get array of all known devices
var devices = deviceManager.listDevices();

// Get the current state of a specific device
var device = deviceManager.getDevice(DEVICE_ID);

// Watch for changes on a specific device
deviceManager.watchDevice('DEVICE_ID', function(device) {} );

// Watch for changes on any device
deviceManager.updateHook(function(device) {} );

// Watch for named events
deviceManager.watchEvent('EVENT_NAME', function(event) {} );

// Send a control message to a device
deviceManager.sendMessage({id: 'DEVICE_ID', name: 'power', state: true});
    // -or-
deviceManager.sendMessage({id: 'DEVICE_ID', name: 'state', state: {DEVICE_SPECIFIC_MESSAGE}});
```

## Provider

```
TODO
```

## Logger

```
TODO
```


## Release History

1.0.0
* Initial Release