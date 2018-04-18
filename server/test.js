const xbee = new (require("module-xbee").XBee)(process.env.XBEEPORT || "/dev/ttyS2", 115200)
//const imu = require('./deps/imu')()
const gps = require("node-nan")
//const motors = require('./deps/motors')()
//const pilot = require('./lib/pilot')(motors)
//const targeter = require('./lib/targeter')()
gps.Start("/dev/ttyS1")
//const sensorIMU = require('./lib/sensors')({imu})
const comms = require("./lib/comms")(xbee)

comms.onE("data", d => {
  console.log(d)
})

sensors.on('quaternion', (data) => {
  comms.send("ori", data)
})

setTimeout(() => {
  gps.GetData((err, data) => {
    console.log(data)
  })
}, 1000)
// pilot.enableAutopilot(targeter)


//setTimeout(() => imu.stopReading(), 5000)



const line = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
})

line.on("line", line => {
  comms.send(null ,line)
})