exports = module.exports = nslhome_core = {};

nslhome_core.Logger = require('./lib/logger');
nslhome_core.DeviceMangager = require('./lib/device-manager');
nslhome_core.Provider = require('./lib/provider');
nslhome_core.Mongo = require('./lib/mongo');

nslhome_core.provider = function(providerType) {
    return new nslhome_core.Provider(providerType);
};

nslhome_core.logger = function(source, config) {
    return new nslhome_core.Logger(source, config);
}
