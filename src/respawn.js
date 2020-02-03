let creepUtil = require('./creep.util');

module.exports = {
    spawnACreep: function(spawn, key, energy, memory) {
        let newName = key.charAt(0).toUpperCase() + key.slice(1) + Game.time;
        let creepData = creepUtil.buildBestCreep(key, energy, memory);
        spawn.spawnCreep(creepData.bodyArray, newName,
            creepData.memory);
    },

    run: function() {
        let creepCount = {};

        _.forEach(Game.spawns, (spawn) => {
            creepCount[spawn.id] = {};
            creepCount[spawn.id]['energyAvailable'] = spawn.room.energyAvailable;
            creepCount[spawn.id]['energyCapacity'] = spawn.room.energyCapacityAvailable;
            _.forEach(creepUtil.roles, (role) => {
                creepCount[spawn.id][role] =
                    spawn.room.find(FIND_CREEPS, {filter: (creep) => {return creep.memory && creep.memory.role &&
                            creep.memory.role === role;}}).length;
            });
        });

        _.forEach(creepCount, (count, spawnId) => {
            if (spawnId == null) {
                return;
            }

            let spawning = "none";
            if (count[creepUtil.roles.UPGRADER] < 1) {
                spawning = creepUtil.roles.UPGRADER;
                this.saySomething(spawnId, spawning + 1);
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.UPGRADER, Math.min(600, count['energyAvailable']));
            }
        });

        _.forEach(Game.spawns, (spawn) => {
            if(spawn.spawning) {
                var spawningCreep = Game.creeps[spawn.spawning.name];
                spawn.room.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    spawn.pos.x + 1,
                    spawn.pos.y,
                    {align: 'left', opacity: 0.8});
            }
        });
    },

    saySomething: function(spawnId, message) {
        let spawn = Game.getObjectById(spawnId);
        if (!spawn || spawn.spawning || !spawn.room.visual) {
            return;
        }
        spawn.room.visual.text(
            message,
            spawn.pos.x + 1,
            spawn.pos.y,
            {align: 'left', opacity: 0.8});
    }
};