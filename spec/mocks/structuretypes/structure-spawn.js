module.exports = function(id, x, y, room, memory) {
    let returnObject = {
        energy: 300,
        energyCapacity: 300,
        name: id,
        spawning: null,
        my: true,
        spawnCreep: function(partArray, name, memory) {
            if (this.spawning != null) {
                return;
            }
            let newCreep = require('../creep')(partArray, name, memory, this.room);
            this.spawning = newCreep;
            Game.creeps[name] = newCreep;
            Memory.creeps[name] = newCreep;
        },
        renewCreep: function(target) {

        }
    };
    returnObject = _.merge(returnObject, memory);
    returnObject = _.merge(returnObject, require('../structure')(id, x, y, STRUCTURE_SPAWN, room));
    return returnObject;
};