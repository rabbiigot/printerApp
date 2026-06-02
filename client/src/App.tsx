import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { HomePage } from "@/components/home/HomePage";
import { TransferMethodPage } from "@/components/transfer/TransferMethodPage";
import { UploadPage } from "@/components/upload/UploadPage";
import { PrintConfigPage } from "@/components/print-config/PrintConfigPage";
import { PaymentPage } from "@/components/payment/PaymentPage";
import { CopyPage } from "@/components/copy/CopyPage";
import { getKioskPrinters } from "@/lib/api";
import type { Printer, Session, UploadedFile, PrintJob } from "@/lib/api";

type Page =
  | "home"
  | "transfer"
  | "upload"
  | "print-config"
  | "payment"
  | "copy";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [transferMethod, setTransferMethod] = useState<
    "QR_UPLOAD" | "SHAREIT" | "USB" | "LOCAL"
  >("QR_UPLOAD");
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load printers on mount and auto-select first online one
  useEffect(() => {
    getKioskPrinters().then((list) => {
      setPrinters(list);
      const firstOnline = list.find(
        (p) =>
          p.status === "ONLINE" &&
          (p.type === "PRINTER" || p.type === "MULTIFUNCTION"),
      );
      if (firstOnline) setSelectedPrinter(firstOnline);
    });
  }, []);

  const resetAll = () => {
    setPage("home");
    setTransferMethod("QR_UPLOAD");
    setSession(null);
    setFiles([]);
    setPrintJobs([]);
    setTotalPrice(0);
  };

  return (
    <>
      <Toaster position="top-center" richColors />

      {page === "home" && (
        <HomePage
          onSelectPrint={() => setPage("transfer")}
          onSelectCopy={() => setPage("copy")}
        />
      )}

      {page === "transfer" && (
        <TransferMethodPage
          onBack={() => setPage("home")}
          onSelect={(method) => {
            setTransferMethod(method);
            setPage("upload");
          }}
          printers={printers}
          selectedPrinter={selectedPrinter}
          onSelectPrinter={setSelectedPrinter}
        />
      )}

      {page === "upload" && (
        <UploadPage
          onBack={() => setPage("transfer")}
          onProceed={(s, f) => {
            setSession(s);
            setFiles(f);
            setPage("print-config");
          }}
          transferMethod={transferMethod}
          printers={printers}
          selectedPrinter={selectedPrinter}
          onSelectPrinter={setSelectedPrinter}
        />
      )}

      {page === "print-config" && session && selectedPrinter && (
        <PrintConfigPage
          onBack={() => setPage("upload")}
          onProceed={(jobs, price) => {
            setPrintJobs(jobs);
            setTotalPrice(price);
            setPage("payment");
          }}
          session={session}
          files={files}
          printer={selectedPrinter}
          printers={printers}
          selectedPrinter={selectedPrinter}
          onSelectPrinter={setSelectedPrinter}
        />
      )}

      {page === "payment" && session && (
        <PaymentPage
          onBack={() => setPage("print-config")}
          onComplete={resetAll}
          session={session}
          jobs={printJobs}
          totalPrice={totalPrice}
          printers={printers}
          selectedPrinter={selectedPrinter}
          onSelectPrinter={setSelectedPrinter}
        />
      )}

      {page === "copy" && (
        <CopyPage onBack={() => setPage("home")} onComplete={resetAll} />
      )}
    </>
  );
}
