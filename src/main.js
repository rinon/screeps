const roleUpgrader = require('./roles/role.upgrader');
const respawn = require('./respawn');

module.exports = {
    loop: function() {

        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        respawn.run();

        _.forEach(Game.creeps, (creep) => {
            if(creep.memory.role === 'upgrader') {
                roleUpgrader.run(creep);
            }
        });
    }
};