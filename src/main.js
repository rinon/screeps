var roleUpgrader = require('./roles/role.upgrader');

module.expports = {
    loop: function() {
        roleUpgrader.run();
        console.log('hi');
    }
};