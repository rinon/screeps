module.exports = {
    HARVEST: "HARVEST",
    MOVE: "MOVE",
    TRANSFER: "TRANSFER",
    UPGRADE_CONTROLLER: "UPGRADE_CONTROLLER",
    BUILD: "BUILD",
    REPAIR: "REPAIR",
    WITHDRAW: "WITHDRAW",
    CLAIM: "CLAIM",
    RESERVE: "RESERVE",
    PICKUP: "PICKUP",

    USERNAME: 'REPLACE_ME',
    checkIfInUse: function(room, find, callingCreep, action, filter) {
        let sourcesArray = [];
        if (filter) {
            sourcesArray = room.find(find, {filter: filter});
        } else {
            sourcesArray = room.find(find);
        }
        if (callingCreep != null && callingCreep.memory.currentOrder !== undefined &&
            callingCreep.memory.currentOrder !== null) {
            let currentSource = callingCreep.memory.currentOrder.split(":")[1];
            let returnSource = null;
            _.forEach(sourcesArray, (source) => {
                if (source.id === currentSource &&
                    this.findAnyCreepsUsingObject(currentSource, callingCreep,
                        this.getActionArray(callingCreep, source, action)).length === 0) {
                    returnSource = source;
                }
            });
            if (returnSource != null) {
                return returnSource;
            }
        }
        let resourceArray = [];
        _.forEach(sourcesArray, (currentResource) => {
            let creepsUsingThisResource = this.findAnyCreepsUsingObject(currentResource.id, callingCreep,
                this.getActionArray(callingCreep, currentResource, action));
            if (creepsUsingThisResource.length === 0) {
                resourceArray.push(currentResource);
            }
        });
        let returnResource = callingCreep.pos.findClosestByPath(resourceArray);
        if (returnResource === null) {
            returnResource = undefined;
        }
        return returnResource;
    },

    findAnyCreepsUsingObject: function(id, callingCreep, actionArray) {
        let creepArray = [];
        _.forEach(actionArray, (value, key) => {
            let currentCreepArray = _.filter(Game.creeps, (creep) => creep !== callingCreep &&
                Game.spawns['Spawn1'].spawning !== creep &&
                creep.memory.currentOrder === key + ":" + id);
            if (currentCreepArray.length > value) {
                _.merge(creepArray, currentCreepArray);
            }
        });
        return creepArray;
    },

    getActionArray: function(creep, target, action) {
        let actionArray = {};
        if (action === this.WITHDRAW) {
            actionArray[action] = 2;
            actionArray[this.MOVE] = 5;
        } else {
            let emptySquares = this.getEmptyAdjacentSpaces(creep.room, target.pos);
            actionArray[action] = emptySquares - 1;
            actionArray[this.MOVE] = emptySquares;
        }
        return actionArray;
    },

    getEmptyAdjacentSpaces: function(room, position) {
        let runningTotal = 0;
        _.forEach(room.lookAtArea(position.y-1, position.x-1, position.y+1, position.x+1, true), (s) => {
            if (s.type === 'terrain' && s.terrain !== 'plain') {
                runningTotal++;
            } else if (s.type === 'structure' && s.structureType !== STRUCTURE_CONTAINER) {
                runningTotal--;
            } else if (s.type === 'creep') {
                runningTotal--;
            }
        });

        return runningTotal;
    },
};