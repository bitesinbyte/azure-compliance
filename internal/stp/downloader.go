package stp

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const liveDocBaseURL = "https://api.servicetrust.microsoft.com/api/v2/GetLiveDocumentIncludingOldSeriesDoc"

// DownloadResult holds the downloaded PDF bytes and the document version.
type DownloadResult struct {
	PDFBytes         []byte
	WhenLastModified string
}

// metadataResponse represents the relevant fields from the STP metadata API.
type metadataResponse struct {
	ID               string `json:"id"`
	WhenLastModified string `json:"whenLastModified"`
}

// DownloadPDF fetches the compliance PDF from Microsoft's Service Trust Portal.
func DownloadPDF(documentGUID string) (*DownloadResult, error) {
	client := &http.Client{Timeout: 5 * time.Minute}

	// Step 1: Fetch metadata to get document ID and version
	metadataURL := fmt.Sprintf("%s/%s/", liveDocBaseURL, documentGUID)

	resp, err := client.Get(metadataURL)
	if err != nil {
		return nil, fmt.Errorf("metadata request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("metadata request returned status %d: %s", resp.StatusCode, string(body))
	}

	var meta metadataResponse
	if err := json.NewDecoder(resp.Body).Decode(&meta); err != nil {
		return nil, fmt.Errorf("failed to parse metadata: %w", err)
	}

	if meta.ID == "" {
		return nil, fmt.Errorf("metadata response missing 'id' field")
	}

	// Step 2: Download the PDF
	downloadURL := fmt.Sprintf("https://api.servicetrust.microsoft.com/api/v2/downloadDocuments/%s/%s", documentGUID, meta.ID)

	req, err := http.NewRequest("GET", downloadURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create download request: %w", err)
	}
	req.Header.Set("Accept", "application/pdf")

	dlResp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("download request failed: %w", err)
	}
	defer dlResp.Body.Close()

	if dlResp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(dlResp.Body)
		return nil, fmt.Errorf("download returned status %d: %s", dlResp.StatusCode, string(body))
	}

	pdfBytes, err := io.ReadAll(dlResp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read PDF body: %w", err)
	}

	return &DownloadResult{
		PDFBytes:         pdfBytes,
		WhenLastModified: meta.WhenLastModified,
	}, nil
}
