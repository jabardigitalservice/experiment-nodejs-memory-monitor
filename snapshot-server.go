// main.go
package main

import (
    "fmt"
    "io"
    "log"
    "net/http"
    "os"
    "path/filepath"
    "time"
)

const (
    uploadDir = "./snapshots"
    port      = 8080
)

func main() {
    // Create snapshots directory if it doesn't exist
    if err := os.MkdirAll(uploadDir, 0755); err != nil {
        log.Fatalf("Failed to create upload directory: %v", err)
    }

    http.HandleFunc("/upload", handleSnapshotUpload)
    
    log.Printf("Server starting on port %d...", port)
    if err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil); err != nil {
        log.Fatalf("Server failed to start: %v", err)
    }
}

func handleSnapshotUpload(w http.ResponseWriter, r *http.Request) {
    log.Println("processing upload")
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Get filename from header or generate one
    filename := r.Header.Get("X-Filename")
    if filename == "" {
        filename = fmt.Sprintf("heap_%d.heapsnapshot", time.Now().Unix())
    }

    // Ensure the filename is safe
    filename = filepath.Clean(filename)
    filepath := filepath.Join(uploadDir, filename)

    // Create the file
    file, err := os.Create(filepath)
    if err != nil {
        log.Printf("Error creating file: %v", err)
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }
    defer file.Close()

    // Copy the request body to the file
    _, err = io.Copy(file, r.Body)
    if err != nil {
        log.Printf("Error saving file: %v", err)
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }

    log.Printf("Successfully saved snapshot: %s", filename)
    w.WriteHeader(http.StatusOK)
}
