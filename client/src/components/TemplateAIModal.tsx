import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TemplateAIUpload from './TemplateAIUpload';

interface TemplateAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
}

export default function TemplateAIModal({ 
  isOpen, 
  onClose, 
  templateId, 
  templateName 
}: TemplateAIModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">✨</span>
            <span>AI Enhancement - {templateName}</span>
          </DialogTitle>
        </DialogHeader>
        <TemplateAIUpload
          templateId={templateId}
          templateName={templateName}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
