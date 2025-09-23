"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
  downloadFile,
  generateFilename,
} from "@/lib/export-utils";

interface ExportControlsProps {
  analysisResults: any;
  comments: Array<{ id: string; text: string; source?: string }>;
}

export function ExportControls({
  analysisResults,
  comments,
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "json" | "markdown") => {
    if (!analysisResults) return;

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString();
      const exportData = {
        analysisResults,
        comments,
        timestamp,
      };

      let content: string;
      let mimeType: string;
      let filename: string;

      switch (format) {
        case "csv":
          content = exportToCSV(exportData);
          mimeType = "text/csv";
          filename = generateFilename("csv");
          break;
        case "json":
          content = exportToJSON(exportData);
          mimeType = "application/json";
          filename = generateFilename("json");
          break;
        case "markdown":
          content = exportToMarkdown(exportData);
          mimeType = "text/markdown";
          filename = generateFilename("md");
          break;
        default:
          throw new Error("Unsupported format");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      downloadFile(content, filename, mimeType);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!analysisResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>
            Download analysis results in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-2 opacity-50">📥</div>
            <p>Complete analysis to enable exports</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Reports</CardTitle>
        <CardDescription>
          Download comprehensive analysis results in your preferred format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CSV Export */}
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <div className="text-2xl text-green-600">📊</div>
            <div className="text-center">
              <div className="font-medium">CSV Export</div>
              <div className="text-xs text-muted-foreground">
                Detailed data for analysis
              </div>
            </div>
          </Button>

          {/* JSON Export */}
          <Button
            variant="outline"
            onClick={() => handleExport("json")}
            disabled={isExporting}
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <div className="text-2xl text-blue-600">💻</div>
            <div className="text-center">
              <div className="font-medium">JSON Export</div>
              <div className="text-xs text-muted-foreground">
                Structured data format
              </div>
            </div>
          </Button>

          {/* Markdown Export */}
          <Button
            variant="outline"
            onClick={() => handleExport("markdown")}
            disabled={isExporting}
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <div className="text-2xl text-purple-600">📄</div>
            <div className="text-center">
              <div className="font-medium">Report (MD)</div>
              <div className="text-xs text-muted-foreground">
                Formatted summary report
              </div>
            </div>
          </Button>
        </div>

        {/* Quick Export Dropdown */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Quick export options
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isExporting}>
                {isExporting ? (
                  <span className="mr-2">⏳</span>
                ) : (
                  <span className="mr-2">📥</span>
                )}
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <span className="mr-2">📊</span>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <span className="mr-2">💻</span>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("markdown")}>
                <span className="mr-2">📄</span>
                Export as Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Export Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <strong>Export includes:</strong> Complete sentiment analysis results,
          summary statistics, keyword analysis, individual comment scores, and
          executive summary with recommendations.
        </div>
      </CardContent>
    </Card>
  );
}
