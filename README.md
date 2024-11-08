EXPERIMENT IMPLEMENTING AUTO HEAP MEMORY SNAPSHOT BASED ON LIMIT MONITORING
===========================================================================

## idea
- determine acceptable heap memory limit
- setup monitoring process to watch heap memory size
- if it exeeded the limit
  - capture snapshot
  - upload snapshot into separate server
  - set minimum interval for each snapshote & the max number of snapshot to capture

## issues
- taking snapshot require significant amount of memory space. here we are capturing heap size of ~25 Mb, and the process consume up to 1,5 Gb of container memory

  ![Snapshot of Cadvisor memory history](screenshot.png?raw=true "Snapshot of Cadvisor memory history")
