// heapMonitor.js
const v8 = require('v8');
const http = require('http');
const fs = require('fs');
const path = require('path');

class HeapMonitor {
    constructor(config = {}) {
        this.config = {
            heapLimit: config.heapLimit || 100, // MB
            snapshotInterval: config.snapshotInterval || 60000, // ms
            maxSnapshots: config.maxSnapshots || 5,
            uploadEndpoint: config.uploadEndpoint || 'http://localhost:8080/upload',
            tempDir: config.tempDir || './temp_snapshots'
        };

        this.lastSnapshotTime = 0;
        this.snapshotCount = 0;
        this.isCapturing = false;

        // Ensure temp directory exists
        if (!fs.existsSync(this.config.tempDir)) {
            fs.mkdirSync(this.config.tempDir, { recursive: true });
        }

        // Start monitoring
        this.startMonitoring();
    }

    startMonitoring() {
        setInterval(() => {
            this.checkMemoryUsage();
        }, 1000);
    }

    isMemoryLimitExceeded() {
        const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB
	console.log(`Heap used: ${heapUsed}`)

        return (heapUsed >= this.config.heapLimit) 
    }

    checkMemoryUsage() {
        if (this.isMemoryLimitExceeded()) {
            this.captureSnapshot();
        }
    }

    async captureSnapshot() {
        // Check if we're already capturing or if we need to respect the interval
        if (this.isCapturing || 
            Date.now() - this.lastSnapshotTime < this.config.snapshotInterval ||
            this.snapshotCount >= this.config.maxSnapshots) {
            return;
        }

        this.isCapturing = true;

        try {
	    console.log('capturing snapshot...')
            const fileName = path.join(this.config.tempDir, `heap_${Date.now()}.heapsnapshot`);
            
            // Use v8.writeHeapSnapshot() instead of manual serialization
            v8.writeHeapSnapshot(fileName);
            
            // Upload the snapshot
            this.uploadSnapshot(fileName);

            this.lastSnapshotTime = Date.now();
            this.snapshotCount++;
        } catch (error) {
            console.error('Error capturing heap snapshot:', error);
        } finally {
            this.isCapturing = false;
        }
    }

    uploadSnapshot(filePath) {
	console.log('uploading snapshot...') 
        const fileStream = fs.createReadStream(filePath);
        
        const req = http.request(this.config.uploadEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Filename': path.basename(filePath)
            }
        });

        fileStream.pipe(req);

        req.on('error', (error) => {
            console.error('Error uploading snapshot:', error);
        });

        req.on('response', (res) => {
            if (res.statusCode === 200) {
                // Clean up the temporary file after successful upload
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting temporary file:', err);
                });
            }
        });
    }
}

module.exports = HeapMonitor;
