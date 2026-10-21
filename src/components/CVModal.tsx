import React, { useEffect } from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { FERRIS_PROFILE } from '../data/ferrisData.ts';

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CVModal: React.FC<CVModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pdfUrl = FERRIS_PROFILE.cvPath;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C1A17]/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FAF7F2] border border-[#E7E2D6] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D6] bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FAF7F2] border border-[#E7E2D6] rounded-lg text-[#8C6D3F]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#1C1A17]">
                Ferris Rahu — Curriculum Vitae (2026)
              </h3>
              <p className="text-[11px] text-[#575249]">
                Verified document · Estonian Business School
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download="Ferris_Rahu_CV_2026.pdf"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#E7E2D6] rounded-md text-xs font-medium text-[#1C1A17] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#8C6D3F]" />
              <span>Download PDF</span>
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#575249] hover:text-[#1C1A17] transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-[#575249] hover:text-[#1C1A17] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body: Embedded PDF viewer with document fallback */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F3EFE6]">
          <div className="w-full h-[65vh] bg-[#FFFFFF] rounded-xl shadow-xs border border-[#E7E2D6] overflow-hidden flex flex-col">
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <div className="p-8 text-center flex flex-col items-center justify-center h-full text-xs text-[#575249]">
                <FileText className="w-12 h-12 text-[#8C6D3F] mb-3 opacity-60" />
                <p className="font-serif text-lg text-[#1C1A17] mb-2">
                  Ferris Rahu CV (2026)
                </p>
                <p className="max-w-md mb-4 text-[#575249]">
                  PDF preview is not supported directly by your browser environment. You can download the file or open it in a new window.
                </p>
                <a
                  href={pdfUrl}
                  download="Ferris_Rahu_CV_2026.pdf"
                  className="px-4 py-2 bg-[#1C1A17] text-[#FAF7F2] rounded-md text-xs font-medium hover:bg-[#2F2C27] transition-colors"
                >
                  Download Ferris_Rahu_CV_Updated_2026.pdf
                </a>
              </div>
            </object>
          </div>
        </div>

      </div>
    </div>
  );
};
