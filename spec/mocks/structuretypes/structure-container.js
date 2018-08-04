module.exports = function(id, x, y, room, memory) {
    let returnObject = {
        store: {
            RESOURCE_ENERGY: 0
        },
        storeCapacity: 2000,
        name: id
    };
    returnObject = _.merge(returnObject, memory);
    returnObject = _.merge(returnObject, require('../structure')(id, x, y, STRUCTURE_CONTAINER, room));
    return returnObject;
};