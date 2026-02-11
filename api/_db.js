if (!global.db) {
global.db = {
users: {},
votes: {},
lastDay: new Date().toDateString()
};
}


export default global.db;
