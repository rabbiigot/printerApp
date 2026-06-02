import { useState, useEffect, useRef } from "react";
import { Clock, MapPin, Wifi, Printer as PrinterIcon, ChevronDown, CheckCircle2 } from "lucide-react";
import type { Printer } from "@/lib/api";

interface Props {
  children: React.ReactNode;
  onBack?: () => void;
  title?: string;
  printers?: Printer[];
  selectedPrinter?: Printer | null;
  onSelectPrinter?: (printer: Printer) => void;
}

export function KioskLayout({ children, onBack, title, printers, selectedPrinter, onSelectPrinter }: Props) {
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <div className="kiosk-shell bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">I</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                InkSync
              </h1>
              {title && (
                <p className="text-xs text-muted-foreground">{title}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Printer Dropdown */}
          {printers && printers.length > 0 && onSelectPrinter && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-accent transition-colors"
              >
                <PrinterIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium max-w-[180px] truncate">
                  {selectedPrinter ? selectedPrinter.name : "Select Printer"}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Available Printers
                    </p>
                  </div>
                  {printers
                    .filter((p) => p.type === "PRINTER" || p.type === "MULTIFUNCTION")
                    .map((printer) => {
                      const isOnline = printer.status === "ONLINE";
                      const isSelected = selectedPrinter?.id === printer.id;
                      return (
                        <button
                          key={printer.id}
                          onClick={() => {
                            if (isOnline) {
                              onSelectPrinter(printer);
                              setDropdownOpen(false);
                            }
                          }}
                          disabled={!isOnline}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                            isOnline
                              ? "hover:bg-accent cursor-pointer"
                              : "opacity-50 cursor-not-allowed"
                          } ${isSelected ? "bg-primary/5" : ""}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <PrinterIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{printer.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {printer.type} &bull; B&W ₱{printer.pricePerPageBW} &bull; Color ₱{printer.pricePerPageColor}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          )}
                          {!isOnline && (
                            <span className="text-[10px] text-destructive font-medium shrink-0">
                              {printer.status}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Main Lobby</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wifi className="w-4 h-4 text-success" />
            <span className="text-sm">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium tabular-nums">
              {time.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-xs text-muted-foreground">
              {time.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
