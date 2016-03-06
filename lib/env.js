/**
 * Created by Nick Largent on 2016-03-01.
 */

var config = {
    MONGO_URL: process.env.NSLHOME_MONGO_URL,
    RABBIT_URL: process.env.NSLHOME_RABBIT_URL
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