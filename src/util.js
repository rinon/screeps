module.exports = {

    checkIfInUse: function(room, find, callingCreep) {
        let returnResource = callingCreep.pos.findClosestByPath(room.find(find));
        if (returnResource === null) {
            returnResource = undefined;
        }
        return returnResource;
    }
};