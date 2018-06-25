const debug = require("debug")("main")
const config = require("../config.json")

const comms = require("./init/initComunications").init(config)
const sensors = require("./init/initSensors").init(config)
const storage = require("./init/initArchive").init(config)
const camera = require("./init/initCamera").init(config)

const MOTORS = require("./mock/motors")

const TARGETER = require("./lib/targeter")
const PILOT = require("./lib/pilot")
const ENFORCE_CLI = require("enforce-cli")

debug("Init motors")
const motors = new MOTORS()

debug("Init targeter")
const targeter = new TARGETER({
	x: 10.932707,
	y: 44.649381
})

debug("Init targeter position")
targeter.setPosition({
	x: 10.929782,
	y: 44.649649
})


debug("Init pilot")
const pilot = new PILOT(motors)

debug("Init cli")
new ENFORCE_CLI(comms, {
	sensors,
	motors,
	camera
})


camera.start()
archiver.beginMission()

// comms.on("command", (commandString) => {
// 	debug('Received command: ' + commandString)
// 	switch (commandString[0]) {
// 		case 'x':
// 			let locarr = commandString.split(",")
// 			targeter.setTarget({
// 				x: parseFloat(locarr[1]),
// 				y: parseFloat(locarr[0].slice(1))
// 			})
// 			break;
// 		case 'p':
// 			if (commandString[1] === '0') pilot.disableAutopilot()
// 			if (commandString[1] === '1') pilot.enableAutopilot()
// 			comms.send("status", Object.assign({}, sensors.status(), motors.getStatus(), pilot.status()))
// 			break;
// 		default:
// 			comms.send(`Command ${commandString} not defined.`)
// 			break;
// 	}
// })

sensors.on("quaternion", d => {
	comms.send("orientation", d)
	archiver.saveData({
		orientation: d
	})
})

sensors.on("euler", d => {
	if (d) targeter.setOrientation(d.heading)
})

sensors.on("temperature", d => {
	comms.send("temperature", d)
	archiver.saveData({
		temperature: d
	})
})

sensors.on("humidity", d => {
	comms.send("humidity", d)
	archiver.saveData({
		humidity: d
	})
})

sensors.on("pressure", d => {
	comms.send("pressure", d)
	archiver.saveData({
		pressure: d
	})
})

sensors.on("position", d => {
	archiver.saveData({
		position: d
	})
	//    targeter.setPosition({
	//        x: d.longitude,
	//        y: d.latitude
	//    })
	comms.send("position", d)
	comms.send("target", Object.assign({}, {
		target: targeter.target
	}, {
		directionD: targeter.getTargetDirectionDelta(),
		distance: targeter.getTargetDistance()
	}))
})

pilot.enableAutopilot(targeter)

process.on('SIGINT', () => {
	sensors.stopAll()
	if (process.env.DEBUG) process.exit(0)
})
