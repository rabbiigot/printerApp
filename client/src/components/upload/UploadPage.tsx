import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Trash2,
  Loader2,
  RefreshCw,
  ArrowRight,
  Upload,
  CloudUpload,
  FolderUp,
  Eye,
  X,
  Image as ImageIcon,
  FileSpreadsheet,
  FileType,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KioskLayout } from "@/components/layout/KioskLayout";
import {
  createSession,
  getSessionFiles,
  deleteFile,
  uploadFile,
  getFileDownloadUrl,
  type Session,
  type UploadedFile,
  type Printer,
} from "@/lib/api";
import { formatFileSize } from "@/lib/utils";

interface Props {
  onBack: () => void;
  onProceed: (session: Session, files: UploadedFile[]) => void;
  transferMethod: "QR_UPLOAD" | "SHAREIT" | "USB" | "LOCAL";
  printers: Printer[];
  selectedPrinter: Printer | null;
  onSelectPrinter: (printer: Printer) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("pdf")) return FileType;
  return FileText;
}

function isPreviewable(_mimeType: string) {
  // All uploaded file types are previewable: PDFs/images natively, office docs via Google Docs Viewer
  return true;
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

export function UploadPage({
  onBack,
  onProceed,
  transferMethod,
  printers,
  selectedPrinter,
  onSelectPrinter,
}: Props) {
  const [session, setSession] = useState<
    (Session & { uploadUrl?: string; qrCodeDataUrl?: string }) | null
  >(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    createSession(transferMethod === "LOCAL" ? "QR_UPLOAD" : transferMethod)
      .then((s) => {
        setSession(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [transferMethod]);

  const refreshFiles = useCallback(async () => {
    if (!session) return;
    setRefreshing(true);
    try {
      const updated = await getSessionFiles(session.sessionCode);
      setFiles(updated);
    } finally {
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session || transferMethod === "LOCAL") return;
    const interval = setInterval(refreshFiles, 3000);
    return () => clearInterval(interval);
  }, [session, refreshFiles, transferMethod]);

  const handleDelete = async (id: number) => {
    await deleteFile(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const handleLocalUpload = async (fileList: FileList | null) => {
    if (!fileList || !session) return;
    setUploading(true);
    for (const file of Array.from(fileList)) {
      try {
        const uploaded = await uploadFile(session.sessionCode, file);
        setFiles((prev) => [...prev, uploaded]);
      } catch {
        // ignore individual file errors
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <KioskLayout onBack={onBack} title="Upload Files" printers={printers} selectedPrinter={selectedPrinter} onSelectPrinter={onSelectPrinter}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </KioskLayout>
    );
  }

  // Left panel content
  const renderLeftPanel = () => {
    // If previewing a file, show preview
    if (previewFile) {
      const url = getFileDownloadUrl(previewFile.id);
      const isPdf = previewFile.mimeType === "application/pdf";
      const isImage = previewFile.mimeType.startsWith("image/");
      const isOffice = isOfficeMimeType(previewFile.mimeType);
      // Google Docs Viewer can preview office docs via a public URL
      const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

      return (
        <motion.div
          key="preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col h-full"
        >
          {/* Preview header */}
          <div className="flex items-center justify-between px-6 py-3 border-b bg-white/50">
            <div className="flex items-center gap-3 min-w-0">
              <Eye className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm font-medium truncate">{previewFile.originalName}</p>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {formatFileSize(previewFile.fileSize)}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Preview content */}
          <div className="flex-1 overflow-hidden">
            {isPdf && (
              <iframe
                src={`${url}#toolbar=0&navpanes=0`}
                className="w-full h-full border-0"
                title={`Preview: ${previewFile.originalName}`}
              />
            )}
            {isImage && (
              <div className="flex items-center justify-center h-full p-6 bg-muted/30">
                <img
                  src={url}
                  alt={previewFile.originalName}
                  className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
                />
              </div>
            )}
            {isOffice && (
              <iframe
                src={googleViewerUrl}
                className="w-full h-full border-0"
                title={`Preview: ${previewFile.originalName}`}
              />
            )}
            {!isPdf && !isImage && !isOffice && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <FileText className="w-20 h-20 opacity-30" />
                <p className="text-sm">Preview not available for this file type</p>
                <p className="text-xs">{previewFile.mimeType}</p>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // Otherwise show transfer instructions
    if (transferMethod === "QR_UPLOAD" && session?.qrCodeDataUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <h3 className="text-2xl font-bold">Scan to Upload</h3>
            <div className="p-4 bg-white rounded-2xl shadow-lg border">
              <img src={session.qrCodeDataUrl} alt="Upload QR Code" className="w-64 h-64" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Session Code</p>
              <p className="text-3xl font-mono font-bold tracking-widest text-primary">
                {session.sessionCode}
              </p>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Scan the QR code with your phone camera to open the upload page.
              Files will appear here automatically.
            </p>
          </motion.div>
        </div>
      );
    }

    if (transferMethod === "SHAREIT") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center">
            <div className="w-24 h-24 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Upload className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold">SHAREit Transfer</h3>
            <p className="text-muted-foreground max-w-xs">
              Open SHAREit on your phone and send your files to this kiosk. The kiosk name is:
            </p>
            <p className="text-2xl font-mono font-bold text-primary">INKSYNC-KIOSK</p>
            <p className="text-sm text-muted-foreground">Session: {session?.sessionCode}</p>
          </motion.div>
        </div>
      );
    }

    if (transferMethod === "USB") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 flex items-center justify-center animate-pulse">
              <Upload className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold">Insert USB Drive</h3>
            <p className="text-muted-foreground max-w-xs">
              Please insert your USB flash drive into the USB port on the kiosk. Your files will be detected automatically.
            </p>
            <p className="text-sm text-muted-foreground">Session: {session?.sessionCode}</p>
          </motion.div>
        </div>
      );
    }

    if (transferMethod === "LOCAL") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 w-full max-w-md">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => handleLocalUpload(e.target.files)}
            />
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-muted hover:border-primary/50 p-10 text-center cursor-pointer transition-colors"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                  ) : (
                    <FolderUp className="w-10 h-10 text-violet-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">
                    {uploading ? "Uploading..." : "Browse Files"}
                  </h3>
                  <p className="text-sm text-muted-foreground">PDF, Word, Excel, PowerPoint, Images</p>
                  <p className="text-xs text-muted-foreground mt-1">Tap to select files from this device</p>
                </div>
                {!uploading && (
                  <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm">
                    <CloudUpload className="w-4 h-4" />
                    Choose Files
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Session: {session?.sessionCode}</p>
          </motion.div>
        </div>
      );
    }

    return null;
  };

  return (
    <KioskLayout
      onBack={onBack}
      title={`Upload Files${selectedPrinter ? ` — ${selectedPrinter.name}` : ""}`}
      printers={printers}
      selectedPrinter={selectedPrinter}
      onSelectPrinter={onSelectPrinter}
    >
      <div className="flex h-full">
        {/* Left: Preview or Transfer instructions */}
        <div className="w-1/2 flex flex-col border-r overflow-hidden">
          <AnimatePresence mode="wait">
            {renderLeftPanel()}
          </AnimatePresence>
        </div>

        {/* Right: File List */}
        <div className="w-1/2 flex flex-col p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Uploaded Files</h3>
              <p className="text-sm text-muted-foreground">
                {files.length} file{files.length !== 1 ? "s" : ""} uploaded
                {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFiles}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Select All */}
          {files.length > 0 && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <button
                onClick={() => {
                  if (selectedIds.size === files.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(files.map((f) => f.id)));
                  }
                }}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedIds.size === files.length && files.length > 0
                      ? "bg-primary border-primary"
                      : selectedIds.size > 0
                        ? "bg-primary/30 border-primary"
                        : "border-muted-foreground/40"
                  }`}
                >
                  {selectedIds.size > 0 && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {selectedIds.size === files.length ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
                      )}
                    </svg>
                  )}
                </div>
                {selectedIds.size === files.length && files.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <span className="text-xs text-muted-foreground">
                Select files to print
              </span>
            </div>
          )}

          <div className="flex-1 overflow-auto space-y-3">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                <FileText className="w-16 h-16 opacity-30" />
                <p>Waiting for files...</p>
                <p className="text-xs">Files will appear here once uploaded</p>
              </div>
            ) : (
              <AnimatePresence>
                {files.map((file, index) => {
                  const Icon = getFileIcon(file.mimeType);
                  const canPreview = isPreviewable(file.mimeType);
                  const isActive = previewFile?.id === file.id;
                  const isChecked = selectedIds.has(file.id);

                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`transition-colors ${isActive ? "border-primary bg-primary/5" : isChecked ? "border-primary/40 bg-primary/[0.02]" : ""}`}>
                        <CardContent className="flex items-center gap-4 py-4 px-5">
                          {/* Checkbox */}
                          <button
                            onClick={() => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(file.id)) next.delete(file.id);
                                else next.add(file.id);
                                return next;
                              });
                            }}
                            className="shrink-0"
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isChecked
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground/40 hover:border-primary/60"
                              }`}
                            >
                              {isChecked && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>

                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive ? "bg-primary/20" : "bg-primary/10"
                            }`}
                          >
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div
                            className={`flex-1 min-w-0 ${canPreview ? "cursor-pointer" : ""}`}
                            onClick={() => canPreview && setPreviewFile(isActive ? null : file)}
                          >
                            <p className="font-medium truncate text-sm">
                              {file.originalName}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.fileSize)}
                              </span>
                              {file.pageCount > 0 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {file.pageCount} pages
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {canPreview && (
                              <Button
                                variant={isActive ? "default" : "ghost"}
                                size="icon"
                                onClick={() => setPreviewFile(isActive ? null : file)}
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(file.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Bottom action */}
          <div className="mt-6">
            {files.length > 0 && selectedIds.size === 0 ? (
              <div className="text-center py-3 text-muted-foreground text-sm">
                Select files to print
              </div>
            ) : selectedIds.size > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <Button
                  size="lg"
                  onClick={() => {
                    const selected = files.filter((f) => selectedIds.has(f.id));
                    onProceed(session!, selected);
                  }}
                >
                  Continue to Print Settings ({selectedIds.size} file{selectedIds.size !== 1 ? "s" : ""})
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
