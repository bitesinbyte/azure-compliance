package state

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
)

const configFileName = "config.json"

// RunState tracks the last sync run.
type RunState struct {
	LastRun               string `json:"lastRun"`
	LastComplianceVersion string `json:"last-compliance-check-version"`
}

// Load reads the run state from config.json.
func Load() RunState {
	configPath := findConfigFile()
	if configPath == "" {
		return RunState{}
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		log.Printf("[State] Warning: could not read %s: %v", configPath, err)
		return RunState{}
	}

	var s RunState
	if err := json.Unmarshal(data, &s); err != nil {
		log.Printf("[State] Warning: could not parse %s: %v", configPath, err)
		return RunState{}
	}

	return s
}

// Save writes the run state to config.json.
func Save(s RunState) {
	configPath := findConfigFile()
	if configPath == "" {
		configPath = filepath.Join(".", configFileName)
	}

	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		log.Printf("[State] Warning: could not serialize state: %v", err)
		return
	}

	if err := os.WriteFile(configPath, data, 0o644); err != nil {
		log.Printf("[State] Warning: could not write %s: %v", configPath, err)
	}
}

func findConfigFile() string {
	// Check current working directory first
	cwd, err := os.Getwd()
	if err == nil {
		candidate := filepath.Join(cwd, configFileName)
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
	}

	return ""
}
