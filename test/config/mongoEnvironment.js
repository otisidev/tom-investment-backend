const NodeEnvironment = require("jest-environment-node");

module.exports = class MongoEnvironment extends NodeEnvironment {
    async setup() {
        await super.setup();
    }

    async teardown() {
        // if (client) await client.connection.close();
        await super.teardown();
    }

    runScript(script) {
        return super.runScript(script);
    }
};
