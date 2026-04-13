"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Check, Minus, Link2, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AzureComplianceReport,
  type CloudFilter,
  type ComplianceFilter,
  type FrameworkKey,
  type ServiceEntry,
} from "@/types/compliance";
import {
  DATA_URL,
  FRAMEWORK_KEYS,
  FRAMEWORK_LABELS,
  FRAMEWORK_FULL_NAMES,
} from "@/lib/constants";

function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr || dateStr === "N/A") return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return (
      d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    );
  } catch {
    return dateStr;
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Read initial filter values from URL query parameters (works on GitHub Pages). */
function getInitialFilters() {
  if (typeof window === "undefined") {
    return { search: "", cloud: "all" as CloudFilter, framework: "all", compliance: "all" as ComplianceFilter };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("q") || params.get("search") || "",
    cloud: (params.get("cloud") as CloudFilter) || "all",
    framework: params.get("framework") || "all",
    compliance: (params.get("compliance") as ComplianceFilter) || "all",
  };
}

/** Update URL query parameters without reloading the page. */
function updateQueryParams(filters: { search: string; cloud: string; framework: string; compliance: string }) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.cloud !== "all") params.set("cloud", filters.cloud);
  if (filters.framework !== "all") params.set("framework", filters.framework);
  if (filters.compliance !== "all") params.set("compliance", filters.compliance);

  const qs = params.toString();
  const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", newUrl);
}

export function ComplianceMatrix() {
  const [data, setData] = useState<AzureComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const initial = useMemo(() => getInitialFilters(), []);
  const [search, setSearch] = useState(initial.search);
  const [cloudFilter, setCloudFilter] = useState<CloudFilter>(initial.cloud);
  const [frameworkFilter, setFrameworkFilter] = useState<string>(initial.framework);
  const [complianceFilter, setComplianceFilter] =
    useState<ComplianceFilter>(initial.compliance);

  const debouncedSearch = useDebounce(search, 200);

  // Sync filters to URL query params
  useEffect(() => {
    updateQueryParams({
      search: debouncedSearch,
      cloud: cloudFilter,
      framework: frameworkFilter,
      compliance: complianceFilter,
    });
  }, [debouncedSearch, cloudFilter, frameworkFilter, complianceFilter]);

  // Auto-scroll to matrix section if query params are present
  useEffect(() => {
    if (initial.search || initial.cloud !== "all" || initial.framework !== "all" || initial.compliance !== "all") {
      setTimeout(() => {
        document.getElementById("compliance-matrix")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [initial]);

  const copyShareLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const resp = await fetch(DATA_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json: AzureComplianceReport = await resp.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredServices = useMemo(() => {
    if (!data) return [];

    return data.services.filter((svc) => {
      // Search filter
      if (
        debouncedSearch &&
        !svc.serviceName.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
        return false;

      // Framework filter
      if (frameworkFilter !== "all") {
        const key = frameworkFilter as FrameworkKey;
        const azureHas = svc.azure[key];
        const govHas = svc.azureGovernment[key];
        if (cloudFilter === "azure" && !azureHas) return false;
        if (cloudFilter === "gov" && !govHas) return false;
        if (cloudFilter === "all" && !azureHas && !govHas) return false;
      }

      // Compliance level filter
      if (complianceFilter !== "all") {
        const azureCount = FRAMEWORK_KEYS.filter(
          (k) => svc.azure[k]
        ).length;
        const govCount = FRAMEWORK_KEYS.filter(
          (k) => svc.azureGovernment[k]
        ).length;
        const total =
          cloudFilter === "azure"
            ? azureCount
            : cloudFilter === "gov"
              ? govCount
              : azureCount + govCount;
        const max =
          cloudFilter === "all"
            ? FRAMEWORK_KEYS.length * 2
            : FRAMEWORK_KEYS.length;

        if (complianceFilter === "compliant" && total < max) return false;
        if (
          complianceFilter === "partial" &&
          (total === 0 || total === max)
        )
          return false;
        if (complianceFilter === "none" && total > 0) return false;
      }

      return true;
    });
  }, [data, debouncedSearch, cloudFilter, frameworkFilter, complianceFilter]);

  const showAzure = cloudFilter === "all" || cloudFilter === "azure";
  const showGov = cloudFilter === "all" || cloudFilter === "gov";

  const lastCheck = data?.lastCheck || data?.generatedAt || "N/A";
  const lastSync = data?.lastSync || data?.generatedAt || "N/A";
  const disclaimer =
    data?.disclaimer ||
    "This data reflects Microsoft's platform-level compliance attestation scope as published in the official audit reports obtained from the Service Trust Portal. It does NOT constitute a compliance certification for any customer workload. Customers must independently assess their own control implementations.";

  return (
    <div id="compliance-matrix" className="flex flex-1 flex-col scroll-mt-14">
      {/* Page Title */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Compliance Matrix
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Interactive compliance coverage matrix for Azure services across 17
              frameworks.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={copyShareLink}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>
        {data && (
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span>Last check: {formatDateTime(lastCheck)}</span>
            <span>Last sync: {formatDateTime(lastSync)}</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="mx-auto mt-4 flex w-full max-w-7xl flex-wrap items-center gap-3 px-4">
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Azure services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={cloudFilter}
          onValueChange={(v) => { if (v) setCloudFilter(v as CloudFilter); }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Clouds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clouds</SelectItem>
            <SelectItem value="azure">Azure Only</SelectItem>
            <SelectItem value="gov">Azure Government Only</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={frameworkFilter}
          onValueChange={(v) => { if (v !== null) setFrameworkFilter(v); }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Frameworks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frameworks</SelectItem>
            {FRAMEWORK_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {FRAMEWORK_FULL_NAMES[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={complianceFilter}
          onValueChange={(v) => { if (v) setComplianceFilter(v as ComplianceFilter); }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="compliant">Fully Compliant</SelectItem>
            <SelectItem value="partial">Partially Compliant</SelectItem>
            <SelectItem value="none">No Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      {data && (
        <div className="mx-auto mt-3 flex w-full max-w-7xl gap-6 px-4 text-sm text-muted-foreground">
          <span>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredServices.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {data.services.length}
            </span>{" "}
            services
          </span>
          <span>
            Frameworks:{" "}
            <span className="font-semibold text-foreground">
              {FRAMEWORK_KEYS.length}
            </span>
          </span>
          <span>
            Clouds:{" "}
            <span className="font-semibold text-foreground">2</span> (Azure,
            Azure Government)
          </span>
        </div>
      )}

      {/* Table */}
      <div className="mx-auto mt-4 w-full max-w-7xl overflow-x-auto px-4 pb-6">
        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
            Loading compliance data...
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-muted-foreground">
            Failed to load data.
            <br />
            <small>{error}</small>
          </div>
        )}

        {!loading && !error && filteredServices.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No services match your filters.
          </div>
        )}

        {!loading && !error && filteredServices.length > 0 && (
          <div className="rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                {/* Cloud header row */}
                <TableRow>
                  <TableHead
                    rowSpan={2}
                    className="sticky left-0 z-20 min-w-[220px] border-b-2 bg-background"
                  >
                    Service
                  </TableHead>
                  {showAzure && (
                    <TableHead
                      colSpan={FRAMEWORK_KEYS.length}
                      className="border-b text-center text-xs uppercase tracking-wider"
                    >
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/15 text-blue-400 dark:text-blue-300"
                      >
                        Azure
                      </Badge>
                    </TableHead>
                  )}
                  {showGov && (
                    <TableHead
                      colSpan={FRAMEWORK_KEYS.length}
                      className={`border-b text-center text-xs uppercase tracking-wider ${
                        showAzure ? "border-l-[3px] border-l-muted-foreground" : ""
                      }`}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-purple-500/15 text-purple-400 dark:text-purple-300"
                      >
                        Azure Government
                      </Badge>
                    </TableHead>
                  )}
                </TableRow>

                {/* Framework header row */}
                <TableRow>
                  {showAzure &&
                    FRAMEWORK_KEYS.map((key) => (
                      <TableHead
                        key={`az-${key}`}
                        className="whitespace-nowrap text-center text-[0.65rem] font-semibold text-muted-foreground"
                        title={FRAMEWORK_FULL_NAMES[key]}
                      >
                        {FRAMEWORK_LABELS[key]}
                      </TableHead>
                    ))}
                  {showGov &&
                    FRAMEWORK_KEYS.map((key, i) => (
                      <TableHead
                        key={`gov-${key}`}
                        className={`whitespace-nowrap text-center text-[0.65rem] font-semibold text-muted-foreground ${
                          i === 0 && showAzure
                            ? "border-l-[3px] border-l-muted-foreground"
                            : ""
                        }`}
                        title={FRAMEWORK_FULL_NAMES[key]}
                      >
                        {FRAMEWORK_LABELS[key]}
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredServices.map((svc) => (
                  <TableRow key={svc.serviceName} className="hover:bg-muted/50">
                    <TableCell className="sticky left-0 z-10 border-r-2 bg-background font-medium">
                      {svc.serviceName}
                    </TableCell>
                    {showAzure &&
                      FRAMEWORK_KEYS.map((key) => (
                        <ComplianceCell
                          key={`az-${key}`}
                          value={svc.azure[key]}
                        />
                      ))}
                    {showGov &&
                      FRAMEWORK_KEYS.map((key, i) => (
                        <ComplianceCell
                          key={`gov-${key}`}
                          value={svc.azureGovernment[key]}
                          className={
                            i === 0 && showAzure
                              ? "border-l-[3px] border-l-muted-foreground"
                              : undefined
                          }
                        />
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-8">
        <div className="rounded-lg border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Disclaimer:</strong> {disclaimer}
        </div>
      </div>
    </div>
  );
}

function ComplianceCell({
  value,
  className,
}: {
  value: boolean;
  className?: string;
}) {
  return (
    <TableCell className={`text-center ${className || ""}`}>
      {value ? (
        <Check className="mx-auto h-4 w-4 text-green-500" />
      ) : (
        <Minus className="mx-auto h-3 w-3 text-muted-foreground/30" />
      )}
    </TableCell>
  );
}
