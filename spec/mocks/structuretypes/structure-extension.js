module.exports = function(id, x, y, room, memory) {
    let returnObject = {
        energy: 300,
        energyCapacity: 300,
        name: id,
    };
    returnObject = _.merge(returnObject, memory);
    returnObject = _.merge(returnObject, require('../structure')(id, x, y, STRUCTURE_EXTENSION, room));
    return returnObject;
};