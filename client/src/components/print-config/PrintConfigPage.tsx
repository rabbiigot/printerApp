import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Minus,
  Plus,
  ArrowRight,
  Palette,
  Loader2,
  Eye,
  X,
  Image as ImageIcon,
  FileSpreadsheet,
  FileType,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { KioskLayout } from "@/components/layout/KioskLayout";
import {
  createPrintJob,
  getFileDownloadUrl,
  type Session,
  type UploadedFile,
  type Printer,
  type PrintJob,
} from "@/lib/api";
import { formatCurrency, formatFileSize } from "@/lib/utils";

interface Props {
  onBack: () => void;
  onProceed: (jobs: PrintJob[], totalPrice: number) => void;
  session: Session;
  files: UploadedFile[];
  printer: Printer;
  printers: Printer[];
  selectedPrinter: Printer | null;
  onSelectPrinter: (printer: Printer) => void;
}

interface FileConfig {
  fileId: number;
  copies: number;
  colorMode: "GRAYSCALE" | "COLOR";
  pageFrom: number;
  pageTo: number | null;
  allPages: boolean;
  paperSize: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("pdf")) return FileType;
  return FileText;
}

function isOfficeMimeType(mimeType: string) {
  return (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("presentation") ||
    mimeType.includes("powerpoint") ||
    mimeType === "application/msword"
  );
}

export function PrintConfigPage({
  onBack,
  onProceed,
  session,
  files,
  printer,
  printers,
  selectedPrinter,
  onSelectPrinter,
}: Props) {
  const [configs, setConfigs] = useState<FileConfig[]>(
    files.map((f) => ({
      fileId: f.id,
      copies: 1,
      colorMode: "GRAYSCALE",
      pageFrom: 1,
      pageTo: null,
      allPages: true,
      paperSize: printer.paperSizes[0] || "A4",
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const updateConfig = (index: number, update: Partial<FileConfig>) => {
    setConfigs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...update };
      return next;
    });
  };

  const calculatePrice = (config: FileConfig, file: UploadedFile) => {
    const pricePerPage =
      config.colorMode === "COLOR"
        ? printer.pricePerPageColor
        : printer.pricePerPageBW;
    const pages = config.allPages
      ? file.pageCount || 1
      : config.pageTo
        ? config.pageTo - config.pageFrom + 1
        : 1;
    return pages * config.copies * pricePerPage;
  };

  const totalPrice = configs.reduce(
    (sum, config, i) => sum + calculatePrice(config, files[i]),
    0,
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const jobs: PrintJob[] = [];
      for (const config of configs) {
        const job = await createPrintJob({
          sessionCode: session.sessionCode,
          fileId: config.fileId,
          printerId: printer.id,
          copies: config.copies,
          colorMode: config.colorMode,
          pageFrom: config.allPages ? undefined : config.pageFrom,
          pageTo: config.allPages ? undefined : config.pageTo ?? undefined,
          paperSize: config.paperSize,
        });
        jobs.push(job);
      }
      onProceed(jobs, totalPrice);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <KioskLayout onBack={onBack} title={`Print Settings — ${printer.name}`} printers={printers} selectedPrinter={selectedPrinter} onSelectPrinter={onSelectPrinter}>
      <div className="flex h-full">
        {/* Left: File configs */}
        <div className="flex-1 overflow-auto p-8">
          <h3 className="text-2xl font-bold mb-6">Configure Print Settings</h3>

          <div className="space-y-4">
            {files.map((file, index) => {
              const config = configs[index];
              const Icon = getFileIcon(file.mimeType);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      {/* File header */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.fileSize)}
                            {file.pageCount > 0 &&
                              ` • ${file.pageCount} pages`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewFile(file)}
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                        <Badge variant="outline" className="text-sm font-bold">
                          {formatCurrency(calculatePrice(config, file))}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Copies */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Copies
                          </label>
                          <div className="flex items-center gap-3 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateConfig(index, {
                                  copies: Math.max(1, config.copies - 1),
                                })
                              }
                              disabled={config.copies <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-2xl font-bold w-10 text-center">
                              {config.copies}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateConfig(index, {
                                  copies: config.copies + 1,
                                })
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Color Mode */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Color
                          </label>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant={
                                config.colorMode === "GRAYSCALE"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateConfig(index, {
                                  colorMode: "GRAYSCALE",
                                })
                              }
                            >
                              B&W
                            </Button>
                            {printer.supportsColor && (
                              <Button
                                variant={
                                  config.colorMode === "COLOR"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  updateConfig(index, { colorMode: "COLOR" })
                                }
                              >
                                <Palette className="w-3 h-3" />
                                Color
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Pages */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Pages
                          </label>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant={
                                config.allPages ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateConfig(index, { allPages: true })
                              }
                            >
                              All
                            </Button>
                            <Button
                              variant={
                                !config.allPages ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateConfig(index, { allPages: false })
                              }
                            >
                              Custom
                            </Button>
                          </div>
                          {!config.allPages && (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="number"
                                min={1}
                                value={config.pageFrom}
                                onChange={(e) =>
                                  updateConfig(index, {
                                    pageFrom: Number(e.target.value) || 1,
                                  })
                                }
                                className="w-20 h-9 rounded-md border px-3 text-sm text-center"
                                placeholder="From"
                              />
                              <span className="text-muted-foreground">to</span>
                              <input
                                type="number"
                                min={config.pageFrom}
                                value={config.pageTo ?? ""}
                                onChange={(e) =>
                                  updateConfig(index, {
                                    pageTo: Number(e.target.value) || null,
                                  })
                                }
                                className="w-20 h-9 rounded-md border px-3 text-sm text-center"
                                placeholder="To"
                              />
                            </div>
                          )}
                        </div>

                        {/* Paper Size - Dropdown */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Paper Size
                          </label>
                          <div className="mt-2">
                            <Select
                              value={config.paperSize}
                              onValueChange={(value) =>
                                updateConfig(index, { paperSize: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {printer.paperSizes.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Summary — wider */}
        <div className="w-96 bg-white border-l flex flex-col p-8">
          <h3 className="text-xl font-bold mb-6">Order Summary</h3>

          <div className="flex-1 space-y-4 overflow-auto">
            {files.map((file, index) => {
              const config = configs[index];
              return (
                <div key={file.id} className="text-sm border-b pb-3 last:border-0">
                  <p className="font-medium truncate">{file.originalName}</p>
                  <div className="flex justify-between text-muted-foreground mt-1">
                    <span>
                      {config.copies}x {config.colorMode === "COLOR" ? "Color" : "B&W"} • {config.paperSize}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(calculatePrice(config, file))}
                    </span>
                  </div>
                  {!config.allPages && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pages {config.pageFrom}–{config.pageTo || "end"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-lg font-bold mb-1">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(totalPrice)}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {files.length} file{files.length !== 1 ? "s" : ""} • Printer: {printer.name}
            </p>

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Proceed to Payment
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-[80vw] h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3 min-w-0">
                  <Eye className="w-5 h-5 text-primary shrink-0" />
                  <p className="font-medium truncate">{previewFile.originalName}</p>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {formatFileSize(previewFile.fileSize)}
                  </Badge>
                  {previewFile.pageCount > 0 && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {previewFile.pageCount} pages
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPreviewFile(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal content */}
              <div className="flex-1 overflow-hidden">
                {(() => {
                  const url = getFileDownloadUrl(previewFile.id);
                  const isPdf = previewFile.mimeType === "application/pdf";
                  const isImage = previewFile.mimeType.startsWith("image/");
                  const isOffice = isOfficeMimeType(previewFile.mimeType);
                  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

                  if (isPdf) {
                    return (
                      <iframe
                        src={`${url}#toolbar=0&navpanes=0`}
                        className="w-full h-full border-0"
                        title={`Preview: ${previewFile.originalName}`}
                      />
                    );
                  }
                  if (isImage) {
                    return (
                      <div className="flex items-center justify-center h-full p-8 bg-muted/30">
                        <img
                          src={url}
                          alt={previewFile.originalName}
                          className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
                        />
                      </div>
                    );
                  }
                  if (isOffice) {
                    return (
                      <iframe
                        src={googleViewerUrl}
                        className="w-full h-full border-0"
                        title={`Preview: ${previewFile.originalName}`}
                      />
                    );
                  }
                  return (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                      <FileText className="w-20 h-20 opacity-30" />
                      <p>Preview not available for this file type</p>
                      <p className="text-xs">{previewFile.mimeType}</p>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </KioskLayout>
  );
}
