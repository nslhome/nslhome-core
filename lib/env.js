/**
 * Created by Nick Largent on 2016-03-01.
 */
var nconf = require('nconf');

nconf
    .env(['NSLHOME_MONGO_URL', 'NSLHOME_RABBIT_URL'])
    .file({ file: '.nslhome.config' });

var config = {
    MONGO_URL: nconf.get('NSLHOME_MONGO_URL'),
    RABBIT_URL: nconf.get('NSLHOME_RABBIT_URL')
};

var allOk = true;
for (var i in config) {
    if (config[i] === undefined) {
        console.error("NslHome Config: " + i + " undefined");
        allOk = false;
    }
}

if (!allOk) {
    console.error("NslHome Config: Exiting due to invalid configuration.");
    process.exit(1);
}

module.exports = config;