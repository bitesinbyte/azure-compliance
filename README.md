# Azure Services Compliance Matrix

Auto-synced compliance coverage matrix for Azure services, sourced from Microsoft's [Service Trust Portal](https://servicetrust.microsoft.com).

**Live site:** [azure-compliance.bitesinbyte.com](https://azure-compliance.bitesinbyte.com)

## What is this?

This project tracks which Azure services hold which compliance certifications (ISO 27001, SOC, HIPAA, PCI DSS, etc.) across both Azure and Azure Government clouds. Data is extracted from Microsoft's official compliance offerings PDF and published as structured JSON + an interactive web table.

## How it works

1. A Go CLI (`cmd/sync`) downloads the compliance PDF from the Service Trust Portal
2. Text is extracted locally using a PDF parser
3. Azure OpenAI parses the compliance matrix into structured JSON
4. The JSON is committed to `data/azure-compliance.json` and the GitHub Gist is updated for backward compatibility
5. GitHub Pages serves an interactive, searchable compliance table from `web/`

## Data

The compliance data covers **17 frameworks** across **2 clouds**:

| Framework | Key |
|---|---|
| CSA STAR Certification | `csaStarCertification` |
| CSA STAR Attestation | `csaStarAttestation` |
| ISO 27001, 27018 | `iso27001_27018` |
| ISO 27017 | `iso27017` |
| ISO 27701 | `iso27701` |
| ISO 9001, 22301, 20000-1 | `iso9001_22301_20000` |
| SOC 1, 2, 3 | `soc1_2_3` |
| GSMA SAS-SM | `gsmaSasSm` |
| HIPAA BAA | `hipaaBaa` |
| HITRUST | `hitrust` |
| K-ISMS | `kIsms` |
| PCI 3DS | `pci3ds` |
| PCI DSS | `pciDss` |
| Australia IRAP | `australiaIrap` |
| Germany C5 | `germanyC5` |
| Singapore MTCS Level 3 | `singaporeMtcsLevel3` |
| Spain ENS High | `spainEnsHigh` |

## Sync schedule

Data is synced on the **1st of every month** via GitHub Actions. You can also trigger a manual sync.

## Required secrets

| Secret | Description |
|---|---|
| `GIT_PERSONAL_TOKEN` | GitHub PAT for Gist updates |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | Azure OpenAI deployment name |

## Project structure

```
azure-compliance/
├── cmd/sync/main.go          # CLI entry point
├── internal/
│   ├── stp/                  # Service Trust Portal PDF downloader
│   ├── parser/               # Azure OpenAI PDF parser
│   ├── normalizer/           # Service name canonicalization
│   ├── report/               # Report builder and data types
│   ├── gist/                 # GitHub Gist updater
│   └── state/                # Run state manager
├── data/
│   └── azure-compliance.json # Generated compliance data
├── web/
│   ├── index.html            # Interactive compliance table
│   └── CNAME                 # Custom domain
├── config.json               # Sync state tracking
└── .github/workflows/
    ├── sync.yml              # Monthly data sync
    └── deploy.yml            # GitHub Pages deployment
```

## License

MIT

---

Built by [bitesinbyte](https://bitesinbyte.com)
