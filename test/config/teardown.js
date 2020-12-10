module.exports = async function () {
    console.log("Teardown Mongo Connection");
    delete global.botClient;
    delete global.botDB;
};
