import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Printer, Copy, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KioskLayout } from "@/components/layout/KioskLayout";
import { getKioskCapabilities } from "@/lib/api";

interface Props {
  onSelectPrint: () => void;
  onSelectCopy: () => void;
}

export function HomePage({ onSelectPrint, onSelectCopy }: Props) {
  const [capabilities, setCapabilities] = useState<{
    hasPrinter: boolean;
    hasPhotocopier: boolean;
    hasScanner: boolean;
    hasColor: boolean;
    printerCount: number;
    kioskName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getKioskCapabilities()
      .then(setCapabilities)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <KioskLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </KioskLayout>
    );
  }

  if (error) {
    return (
      <KioskLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <AlertCircle className="w-16 h-16 text-destructive" />
          <p className="text-lg text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary underline"
          >
            Retry
          </button>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout>
      <div className="flex flex-col items-center justify-center h-full px-8 gap-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Welcome to InkSync
          </h2>
          <p className="text-lg text-muted-foreground">
            Self-service printing & copying. Select a service to get started.
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="flex gap-8">
          {/* Print */}
          {capabilities?.hasPrinter && (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                className="w-80 cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-300 group active:scale-[0.97]"
                onClick={onSelectPrint}
              >
                <CardContent className="flex flex-col items-center gap-5 py-12 px-8">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Printer className="w-12 h-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-1">Print</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your files and print documents
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {capabilities.hasColor && (
                      <Badge variant="secondary">Color</Badge>
                    )}
                    <Badge variant="secondary">B&W</Badge>
                    <Badge variant="secondary">
                      {capabilities.printerCount} printer
                      {capabilities.printerCount > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Photocopy - ONLY shows if hasPhotocopier */}
          {capabilities?.hasPhotocopier && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                className="w-80 cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-300 group active:scale-[0.97]"
                onClick={onSelectCopy}
              >
                <CardContent className="flex flex-col items-center gap-5 py-12 px-8">
                  <div className="w-24 h-24 rounded-2xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                    <Copy className="w-12 h-12 text-success" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-1">Photocopy</h3>
                    <p className="text-sm text-muted-foreground">
                      Copy documents using the scanner
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Grayscale</Badge>
                    {capabilities.hasColor && (
                      <Badge variant="secondary">Color</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          Tap a service to begin &bull; Payment via GCash QR or Cash
        </p>
      </div>
    </KioskLayout>
  );
}
