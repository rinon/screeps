import {InitPlanner} from "./planners/init-planner";

const findNextEnergySource = function() {
};

const getPlanner = function() {
    // TODO write ways to determine what planner to send
    return new InitPlanner(this);
};

declare global {
    interface Room {
        findNextEnergySource();
        getPlanner();
    }
}

export class RoomPrototype {
    static init() {
        Room.prototype.findNextEnergySource = findNextEnergySource;
        Room.prototype.getPlanner = getPlanner;
    }
}
