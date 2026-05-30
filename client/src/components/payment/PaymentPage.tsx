import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/layout/KioskLayout";
import {
  createPayment,
  getPaymentStatus,
  confirmPayment,
  executePrintJob,
  type Session,
  type PrintJob,
  type Payment,
  type Printer,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface Props {
  onBack: () => void;
  onComplete: () => void;
  session: Session;
  jobs: PrintJob[];
  totalPrice: number;
  printers: Printer[];
  selectedPrinter: Printer | null;
  onSelectPrinter: (printer: Printer) => void;
}

type PaymentState = "select" | "qr" | "polling" | "confirmed" | "printing" | "done" | "error";

export function PaymentPage({
  onBack,
  onComplete,
  session,
  jobs,
  totalPrice,
  printers,
  selectedPrinter,
  onSelectPrinter,
}: Props) {
  const [state, setState] = useState<PaymentState>("select");
  const [payment, setPayment] = useState<
    (Payment & { qrCodeDataUrl?: string }) | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleGcash = async () => {
    try {
      const p = await createPayment({
        sessionCode: session.sessionCode,
        method: "GCASH",
        amount: totalPrice,
      });
      setPayment(p);
      setState("qr");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment creation failed");
      setState("error");
    }
  };

  const handleCash = async () => {
    try {
      const p = await createPayment({
        sessionCode: session.sessionCode,
        method: "CASH",
        amount: totalPrice,
      });
      setPayment(p);
      // Cash: auto-confirm (operator confirms in person)
      await confirmPayment(p.id);
      setState("confirmed");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setState("error");
    }
  };

  // Poll GCash payment status
  const pollPayment = useCallback(async () => {
    if (!payment) return;
    try {
      const status = await getPaymentStatus(payment.id);
      if (status.status === "COMPLETED") {
        setState("confirmed");
      }
    } catch {
      // Ignore polling errors
    }
  }, [payment]);

  useEffect(() => {
    if (state !== "qr") return;
    setState("polling");
    const interval = setInterval(pollPayment, 3000);
    return () => clearInterval(interval);
  }, [state, pollPayment]);

  // Once confirmed, execute print jobs
  useEffect(() => {
    if (state !== "confirmed") return;
    setState("printing");

    const executePrints = async () => {
      try {
        for (const job of jobs) {
          await executePrintJob(job.id);
        }
        setState("done");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Print execution failed");
        setState("error");
      }
    };

    executePrints();
  }, [state, jobs]);

  return (
    <KioskLayout onBack={state === "select" ? onBack : undefined} title="Payment" printers={printers} selectedPrinter={selectedPrinter} onSelectPrinter={onSelectPrinter}>
      <div className="flex items-center justify-center h-full p-8">
        {/* Payment Method Selection */}
        {state === "select" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Pay {formatCurrency(totalPrice)}</h2>
              <p className="text-muted-foreground">
                {jobs.length} print job{jobs.length !== 1 ? "s" : ""} •{" "}
                {session.sessionCode}
              </p>
            </div>

            <div className="flex gap-6">
              <Card
                className="w-64 cursor-pointer hover:shadow-xl hover:border-blue-400 transition-all active:scale-[0.97]"
                onClick={handleGcash}
              >
                <CardContent className="flex flex-col items-center gap-4 py-10">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <CreditCard className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold">GCash QR</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan QR code to pay via GCash
                  </p>
                </CardContent>
              </Card>

              <Card
                className="w-64 cursor-pointer hover:shadow-xl hover:border-green-400 transition-all active:scale-[0.97]"
                onClick={handleCash}
              >
                <CardContent className="flex flex-col items-center gap-4 py-10">
                  <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center">
                    <Banknote className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold">Cash</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Pay with cash at the counter
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* GCash QR Display */}
        {(state === "qr" || state === "polling") && payment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="text-3xl font-bold">Scan to Pay</h2>
            <p className="text-lg text-muted-foreground">
              {formatCurrency(totalPrice)} via GCash
            </p>

            <div className="p-6 bg-white rounded-3xl shadow-xl border-2 border-blue-100">
              {payment.qrCodeDataUrl ? (
                <img
                  src={payment.qrCodeDataUrl}
                  alt="GCash Payment QR"
                  className="w-72 h-72"
                />
              ) : (
                <div className="w-72 h-72 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Waiting for payment confirmation...</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Ref: {payment.referenceNumber}
            </p>

            {/* Dev: Manual confirm button */}
            {import.meta.env.DEV && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await confirmPayment(payment.id);
                  setState("confirmed");
                }}
              >
                [DEV] Simulate Payment
              </Button>
            )}
          </motion.div>
        )}

        {/* Printing */}
        {state === "printing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <Loader2 className="w-20 h-20 animate-spin text-primary" />
            <h2 className="text-3xl font-bold">Printing...</h2>
            <p className="text-muted-foreground">
              Your documents are being sent to the printer
            </p>
          </motion.div>
        )}

        {/* Done */}
        {state === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle2 className="w-24 h-24 text-success" />
            </motion.div>
            <h2 className="text-3xl font-bold">Print Complete!</h2>
            <p className="text-muted-foreground">
              Please collect your documents from the printer.
            </p>
            <p className="text-sm text-muted-foreground">
              Amount paid: {formatCurrency(totalPrice)}
            </p>
            <Button size="lg" className="mt-4" onClick={onComplete}>
              Return to Home
            </Button>
          </motion.div>
        )}

        {/* Error */}
        {state === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <XCircle className="w-24 h-24 text-destructive" />
            <h2 className="text-3xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={onBack}>
                Go Back
              </Button>
              <Button onClick={() => setState("select")}>Try Again</Button>
            </div>
          </motion.div>
        )}
      </div>
    </KioskLayout>
  );
}
