import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const shortcuts = [
    { key: "?", description: "Show keyboard shortcuts", category: "General" },
    { key: "D", description: "Go to Dashboard", category: "Navigation" },
    { key: "T", description: "Go to Templates", category: "Navigation" },
    { key: "U", description: "Go to Upload", category: "Navigation" },
    { key: "H", description: "Go to History", category: "Navigation" },
    { key: "W", description: "Go to Wallet", category: "Navigation" },
    { key: "Esc", description: "Close dialogs", category: "General" },
    { key: "Ctrl+K", description: "Search templates", category: "Actions" },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Show shortcuts dialog
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setOpen(true);
        return;
      }

      // Close dialog
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      // Navigation shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toUpperCase()) {
          case "D":
            setLocation("/dashboard");
            break;
          case "T":
            setLocation("/templates");
            break;
          case "U":
            setLocation("/upload");
            break;
          case "H":
            setLocation("/history");
            break;
          case "W":
            setLocation("/wallet");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setLocation]);

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg hover-elevate"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <Badge variant="outline" className="font-mono">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
              </div>
              {category !== categories[categories.length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
