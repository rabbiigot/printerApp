import { KioskLayout } from "@/components/layout/KioskLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  confirmPayment,
  createPayment,
  createSession,
  getPaymentStatus,
  type Payment,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  Minus,
  Palette,
  Plus,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

type Step =
  | "configure"
  | "payment-select"
  | "payment-qr"
  | "payment-confirmed"
  | "scanning"
  | "done"
  | "error";

export function CopyPage({ onBack, onComplete }: Props) {
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState<"GRAYSCALE" | "COLOR">(
    "GRAYSCALE",
  );
  const [step, setStep] = useState<Step>("configure");
  const [payment, setPayment] = useState<
    (Payment & { qrCodeDataUrl?: string }) | null
  >(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  //testing yow test
  //another test
  //testing checking hash included
  const pricePerPage = colorMode === "COLOR" ? 5.0 : 2.0;
  const totalPrice = copies * pricePerPage;

  const handleProceedToPayment = async () => {
    try {
      // Create a session for the photocopy transaction
      const session = await createSession("QR_UPLOAD");
      setSessionCode(session.sessionCode);
      setStep("payment-select");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create session");
      setStep("error");
    }
  };

  const handleGcash = async () => {
    if (!sessionCode) return;
    try {
      const p = await createPayment({
        sessionCode,
        method: "GCASH",
        amount: totalPrice,
      });
      setPayment(p);
      setStep("payment-qr");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment creation failed");
      setStep("error");
    }
  };

  const handleCash = async () => {
    if (!sessionCode) return;
    try {
      const p = await createPayment({
        sessionCode,
        method: "CASH",
        amount: totalPrice,
      });
      setPayment(p);
      await confirmPayment(p.id);
      setStep("payment-confirmed");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setStep("error");
    }
  };

  // Poll GCash payment status
  const pollPayment = useCallback(async () => {
    if (!payment) return;
    try {
      const status = await getPaymentStatus(payment.id);
      if (status.status === "COMPLETED") {
        setStep("payment-confirmed");
      }
    } catch {
      // ignore polling errors
    }
  }, [payment]);

  useEffect(() => {
    if (step !== "payment-qr") return;
    const interval = setInterval(pollPayment, 3000);
    return () => clearInterval(interval);
  }, [step, pollPayment]);

  // Once payment confirmed, start copying
  useEffect(() => {
    if (step !== "payment-confirmed") return;
    setStep("scanning");
    const timer = setTimeout(() => setStep("done"), 3000);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <KioskLayout
      onBack={
        step === "configure"
          ? onBack
          : step === "payment-select"
            ? () => setStep("configure")
            : undefined
      }
      title="Photocopy"
    >
      <div className="flex items-center justify-center h-full p-8">
        {/* Step 1: Configure */}
        {step === "configure" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Photocopy Settings</h2>
              <p className="text-muted-foreground">
                Place your document on the scanner glass
              </p>
            </div>

            <Card className="w-[480px]">
              <CardContent className="p-8 space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                  <Copy className="w-10 h-10 text-success" />
                </div>

                {/* Copies */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Number of Copies
                  </label>
                  <div className="flex items-center justify-center gap-6 mt-3">
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      disabled={copies <= 1}
                    >
                      <Minus className="w-6 h-6" />
                    </Button>
                    <span className="text-5xl font-bold w-16 text-center">
                      {copies}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={() => setCopies(copies + 1)}
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Color Mode
                  </label>
                  <div className="flex gap-3 mt-3">
                    <Button
                      variant={
                        colorMode === "GRAYSCALE" ? "default" : "outline"
                      }
                      className="flex-1"
                      onClick={() => setColorMode("GRAYSCALE")}
                    >
                      B&W ({formatCurrency(2.0)}/page)
                    </Button>
                    <Button
                      variant={colorMode === "COLOR" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setColorMode("COLOR")}
                    >
                      <Palette className="w-4 h-4" />
                      Color ({formatCurrency(5.0)}/page)
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                <Button size="lg" onClick={handleProceedToPayment}>
                  Proceed to Payment
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Payment method selection */}
        {step === "payment-select" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">
                Pay {formatCurrency(totalPrice)}
              </h2>
              <p className="text-muted-foreground">
                {copies} cop{copies !== 1 ? "ies" : "y"} &bull;{" "}
                {colorMode === "COLOR" ? "Color" : "B&W"}
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

        {/* Step 3: GCash QR code */}
        {step === "payment-qr" && payment && (
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
              <span className="text-sm">
                Waiting for payment confirmation...
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Ref: {payment.referenceNumber}
            </p>

            {import.meta.env.DEV && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await confirmPayment(payment.id);
                  setStep("payment-confirmed");
                }}
              >
                [DEV] Simulate Payment
              </Button>
            )}
          </motion.div>
        )}

        {/* Step 4: Scanning / Copying */}
        {step === "scanning" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-32 h-32 rounded-3xl bg-success/10 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Copy className="w-16 h-16 text-success" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold">Copying...</h2>
            <p className="text-muted-foreground">
              {copies} cop{copies !== 1 ? "ies" : "y"},{" "}
              {colorMode === "COLOR" ? "Color" : "B&W"}
            </p>
            <p className="text-sm text-muted-foreground">
              Payment of {formatCurrency(totalPrice)} confirmed
            </p>
          </motion.div>
        )}

        {/* Step 5: Done */}
        {step === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-success" />
            </motion.div>
            <h2 className="text-3xl font-bold">Copy Complete!</h2>
            <p className="text-muted-foreground">Please collect your copies.</p>
            <p className="text-sm text-muted-foreground">
              Paid: {formatCurrency(totalPrice)}
            </p>
            <Button size="lg" className="mt-4" onClick={onComplete}>
              Return to Home
            </Button>
          </motion.div>
        )}

        {/* Error */}
        {step === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <XCircle className="w-24 h-24 text-destructive" />
            <h2 className="text-3xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep("configure")}>
                Go Back
              </Button>
              <Button onClick={() => setStep("payment-select")}>
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </KioskLayout>
  );
}
