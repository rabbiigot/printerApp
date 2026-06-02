import { motion } from "framer-motion";
import { QrCode, Wifi, Usb, FolderUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { KioskLayout } from "@/components/layout/KioskLayout";
import type { Printer } from "@/lib/api";

interface Props {
  onBack: () => void;
  onSelect: (method: "QR_UPLOAD" | "SHAREIT" | "USB" | "LOCAL") => void;
  printers: Printer[];
  selectedPrinter: Printer | null;
  onSelectPrinter: (printer: Printer) => void;
}

const methods = [
  {
    id: "QR_UPLOAD" as const,
    icon: QrCode,
    title: "QR Code Upload",
    description: "Scan QR code with your phone to upload files",
    iconBg: "bg-primary/10",
    iconHoverBg: "group-hover:bg-primary/20",
    iconColor: "text-primary",
  },
  {
    id: "SHAREIT" as const,
    icon: Wifi,
    title: "SHAREit / WiFi",
    description: "Transfer files via SHAREit or WiFi Direct",
    iconBg: "bg-emerald-500/10",
    iconHoverBg: "group-hover:bg-emerald-500/20",
    iconColor: "text-emerald-600",
  },
  {
    id: "USB" as const,
    icon: Usb,
    title: "USB Flash Drive",
    description: "Insert your USB drive to load files",
    iconBg: "bg-amber-500/10",
    iconHoverBg: "group-hover:bg-amber-500/20",
    iconColor: "text-amber-600",
  },
  {
    id: "LOCAL" as const,
    icon: FolderUp,
    title: "Upload from Local",
    description: "Browse and upload files from this device",
    iconBg: "bg-violet-500/10",
    iconHoverBg: "group-hover:bg-violet-500/20",
    iconColor: "text-violet-600",
  },
];

export function TransferMethodPage({ onBack, onSelect, printers, selectedPrinter, onSelectPrinter }: Props) {
  return (
    <KioskLayout
      onBack={onBack}
      title="Select Transfer Method"
      printers={printers}
      selectedPrinter={selectedPrinter}
      onSelectPrinter={onSelectPrinter}
    >
      <div className="flex flex-col items-center justify-center h-full px-8 gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-2">
            How would you like to send your files?
          </h2>
          <p className="text-muted-foreground">
            Choose a transfer method to upload your documents
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-5">
          {methods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex"
            >
              <Card
                className="w-64 flex flex-col cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-300 group active:scale-[0.97]"
                onClick={() => onSelect(method.id)}
              >
                <CardContent className="flex flex-col items-center gap-4 py-10 px-5 flex-1 justify-center">
                  <div
                    className={`w-18 h-18 rounded-2xl ${method.iconBg} ${method.iconHoverBg} flex items-center justify-center transition-colors`}
                  >
                    <method.icon className={`w-9 h-9 ${method.iconColor}`} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-1">{method.title}</h3>
                    <p className="text-sm text-muted-foreground min-h-[40px]">
                      {method.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </KioskLayout>
  );
}
