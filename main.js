const HeapMonitor = require('./heap-monitor');

const monitor = new HeapMonitor({
    heapLimit: 20,           // Start capturing when heap reaches 200MB
    snapshotInterval: 300000, // Minimum 5 minutes between snapshots
    maxSnapshots: 10,         // Maximum 10 snapshots
    uploadEndpoint: 'http://upload:8080/upload',
    tempDir: './temp_snapshots'
});

// Example of how to test it
let leakyArray = [];
function simulateMemoryLeak() {
  var looper = setInterval(() => {
    if (monitor.isMemoryLimitExceeded()) clearInterval(looper);
    // Create some objects that won't be garbage collected
    leakyArray.push(new Array(1000000).fill('leaky'));
    // const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB
    // console.log(`heapUser: ${heapUsed}`)
    // if (heapUsed > 60) clearInterval(looper);
  }, 3000);
}

// Uncomment to test:
simulateMemoryLeak();

