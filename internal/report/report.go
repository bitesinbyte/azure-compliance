package report

import (
	"log"
	"sort"
	"strings"
)

// ComplianceFrameworks holds the compliance status for all 17 frameworks.
type ComplianceFrameworks struct {
	CsaStarCertification bool `json:"csaStarCertification"`
	CsaStarAttestation   bool `json:"csaStarAttestation"`
	Iso27001_27018       bool `json:"iso27001_27018"`
	Iso27017             bool `json:"iso27017"`
	Iso27701             bool `json:"iso27701"`
	Iso9001_22301_20000  bool `json:"iso9001_22301_20000"`
	Soc1_2_3             bool `json:"soc1_2_3"`
	GsmaSasSm            bool `json:"gsmaSasSm"`
	HipaaBaa             bool `json:"hipaaBaa"`
	Hitrust              bool `json:"hitrust"`
	KIsms                bool `json:"kIsms"`
	Pci3ds               bool `json:"pci3ds"`
	PciDss               bool `json:"pciDss"`
	AustraliaIrap        bool `json:"australiaIrap"`
	GermanyC5            bool `json:"germanyC5"`
	SingaporeMtcsLevel3  bool `json:"singaporeMtcsLevel3"`
	SpainEnsHigh         bool `json:"spainEnsHigh"`
}

// ServiceEntry represents a single Azure service's compliance data.
type ServiceEntry struct {
	ServiceName     string               `json:"serviceName"`
	Azure           ComplianceFrameworks `json:"azure"`
	AzureGovernment ComplianceFrameworks `json:"azureGovernment"`
}

// ComplianceInput is the raw input from the AI parser.
type ComplianceInput struct {
	SourceDocument string         `json:"sourceDocument"`
	VerifiedDate   string         `json:"verifiedDate"`
	Entries        []ServiceEntry `json:"entries"`
}

// AzureComplianceReport is the final output format.
type AzureComplianceReport struct {
	SchemaVersion     string         `json:"schemaVersion"`
	GeneratedAt       string         `json:"generatedAt"`
	LastCheck         string         `json:"lastCheck"`
	LastSync          string         `json:"lastSync"`
	SourceDescription string         `json:"sourceDescription"`
	Frameworks        []string       `json:"frameworks"`
	Clouds            []string       `json:"clouds"`
	Disclaimer        string         `json:"disclaimer"`
	Services          []ServiceEntry `json:"services"`
}

// Build creates the final compliance report from parsed input.
func Build(input *ComplianceInput, lastCheck, lastSync string) *AzureComplianceReport {
	serviceMap := make(map[string]ServiceEntry)
	orderMap := make(map[string]int)
	idx := 0

	for _, entry := range input.Entries {
		key := strings.ToLower(entry.ServiceName)
		if _, exists := serviceMap[key]; exists {
			log.Printf("[COMPLIANCE WARNING] Duplicate entry for '%s'. Keeping first occurrence.", entry.ServiceName)
			continue
		}
		serviceMap[key] = entry
		orderMap[key] = idx
		idx++
	}

	// Sort alphabetically
	services := make([]ServiceEntry, 0, len(serviceMap))
	for _, svc := range serviceMap {
		services = append(services, svc)
	}
	sort.Slice(services, func(i, j int) bool {
		return strings.ToLower(services[i].ServiceName) < strings.ToLower(services[j].ServiceName)
	})

	return &AzureComplianceReport{
		SchemaVersion:     "2.0",
		GeneratedAt:       input.VerifiedDate,
		LastCheck:         lastCheck,
		LastSync:          lastSync,
		SourceDescription: input.SourceDocument,
		Frameworks: []string{
			"CSA STAR Certification",
			"CSA STAR Attestation",
			"ISO 27001, 27018",
			"ISO 27017",
			"ISO 27701",
			"ISO 9001, 22301, 20000-1",
			"SOC 1, 2, 3",
			"GSMA SAS-SM",
			"HIPAA BAA",
			"HITRUST",
			"K-ISMS",
			"PCI 3DS",
			"PCI DSS",
			"Australia IRAP",
			"Germany C5",
			"Singapore MTCS Level 3",
			"Spain ENS High",
		},
		Clouds:     []string{"Azure", "Azure Government"},
		Disclaimer: "This data reflects Microsoft's platform-level compliance attestation scope as published in the official audit reports obtained from the Service Trust Portal. It does NOT constitute a compliance certification for any customer workload. Customers must independently assess their own control implementations.",
		Services:   services,
	}
}
