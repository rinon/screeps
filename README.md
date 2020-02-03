# ScreepsTSSkeleton

A Typescript setup for compiling and testing a Screeps bot. Uses Jest for testing.
Runs integration tests on a mock server using screeps-server-mockup.
Compiles down to a single folder of JS files in ES6.

* `/spec/unit_tests` contains all tests that don't require a server to run
* `/spec/integ_tests` contains all tests that run inside the mock server

##Compilation

Run `npm run start` to start the gulp watcher for *.ts file changes.
The watcher does not check TS compile errors or lint, so use your IDE to check those.