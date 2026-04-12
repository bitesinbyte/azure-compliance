export interface ComplianceFrameworks {
  csaStarCertification: boolean;
  csaStarAttestation: boolean;
  iso27001_27018: boolean;
  iso27017: boolean;
  iso27701: boolean;
  iso9001_22301_20000: boolean;
  soc1_2_3: boolean;
  gsmaSasSm: boolean;
  hipaaBaa: boolean;
  hitrust: boolean;
  kIsms: boolean;
  pci3ds: boolean;
  pciDss: boolean;
  australiaIrap: boolean;
  germanyC5: boolean;
  singaporeMtcsLevel3: boolean;
  spainEnsHigh: boolean;
}

export interface ServiceEntry {
  serviceName: string;
  azure: ComplianceFrameworks;
  azureGovernment: ComplianceFrameworks;
}

export interface AzureComplianceReport {
  schemaVersion: string;
  generatedAt: string;
  lastCheck: string;
  lastSync: string;
  sourceDescription: string;
  frameworks: string[];
  clouds: string[];
  disclaimer: string;
  services: ServiceEntry[];
}

export type FrameworkKey = keyof ComplianceFrameworks;

export type CloudFilter = "all" | "azure" | "gov";
export type ComplianceFilter = "all" | "compliant" | "partial" | "none";
