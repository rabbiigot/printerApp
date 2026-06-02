const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const KIOSK_ID = Number(import.meta.env.VITE_KIOSK_ID || 1);

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Kiosk & Capabilities
export function getKioskCapabilities() {
  return request<{
    kioskId: number;
    kioskName: string;
    status: string;
    hasPrinter: boolean;
    hasPhotocopier: boolean;
    hasScanner: boolean;
    hasColor: boolean;
    printerCount: number;
    availablePrinters: Printer[];
  }>(`/kiosks/${KIOSK_ID}/capabilities`);
}

export function getKioskPrinters() {
  return request<Printer[]>(`/kiosks/${KIOSK_ID}/printers`);
}

// Sessions
export function createSession(transferMethod: string = "QR_UPLOAD") {
  return request<Session & { uploadUrl: string; qrCodeDataUrl: string }>(
    "/sessions",
    {
      method: "POST",
      body: JSON.stringify({ kioskId: KIOSK_ID, transferMethod }),
    },
  );
}

export function getSession(code: string) {
  return request<Session & { files: UploadedFile[]; printJobs: PrintJob[] }>(
    `/sessions/${code}`,
  );
}

export function updateSessionStatus(code: string, status: string) {
  return request(`/sessions/${code}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Files
export async function uploadFile(
  sessionCode: string,
  file: File,
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/sessions/${sessionCode}/files`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(body.message);
  }
  return res.json();
}

export function getSessionFiles(code: string) {
  return request<UploadedFile[]>(`/sessions/${code}/files`);
}

export function deleteFile(id: number) {
  return request(`/files/${id}`, { method: "DELETE" });
}

export function getFileDownloadUrl(id: number) {
  return `${BASE_URL}/files/${id}/download`;
}

// Print Jobs
export function createPrintJob(data: {
  sessionCode: string;
  fileId: number;
  printerId: number;
  pageFrom?: number;
  pageTo?: number;
  copies?: number;
  colorMode?: string;
  paperSize?: string;
  duplex?: boolean;
}) {
  return request<PrintJob>("/print-jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function executePrintJob(jobId: number) {
  return request(`/print-jobs/${jobId}/execute`, { method: "POST" });
}

// Payments
export function createPayment(data: {
  sessionCode: string;
  method?: string;
  amount?: number;
}) {
  return request<Payment & { qrCodeDataUrl: string }>("/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getPaymentStatus(id: number) {
  return request<{ id: number; status: string; amount: number }>(
    `/payments/${id}/status`,
  );
}

export function confirmPayment(id: number) {
  return request(`/payments/${id}/confirm`, { method: "POST" });
}

// Types
export interface Printer {
  id: number;
  kioskId: number;
  name: string;
  model: string | null;
  type: "PRINTER" | "PHOTOCOPIER" | "SCANNER" | "MULTIFUNCTION";
  status: string;
  cupsName: string | null;
  supportsColor: boolean;
  supportsDuplex: boolean;
  pricePerPageBW: number;
  pricePerPageColor: number;
  paperSizes: string[];
}

export interface Session {
  id: number;
  kioskId: number;
  sessionCode: string;
  transferMethod: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface UploadedFile {
  id: number;
  sessionId: number;
  originalName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  createdAt: string;
}

export interface PrintJob {
  id: number;
  sessionId: number;
  fileId: number;
  printerId: number;
  pageFrom: number;
  pageTo: number | null;
  copies: number;
  colorMode: string;
  paperSize: string;
  duplex: boolean;
  totalPages: number;
  pricePerPage: number;
  totalPrice: number;
  status: string;
  file?: UploadedFile;
  printer?: Printer;
}

export interface Payment {
  id: number;
  sessionId: number;
  method: string;
  amount: number;
  referenceNumber: string | null;
  qrCodeData: string | null;
  status: string;
  paidAt: string | null;
}
