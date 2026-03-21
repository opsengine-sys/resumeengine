import { useState, useRef } from 'react';
import { useResumeStore } from '../store/resumeStore';
import ResumePreview from './preview/ResumePreview';
import { printResume } from '../utils/exportPdf';
import {
  FiX, FiPrinter, FiInfo, FiZoomIn, FiZoomOut, FiCheckCircle,
  FiMonitor, FiChevronRight,
} from 'react-icons/fi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { icon: '🖨️', label: 'Click "Print / Save PDF"',         desc: 'Opens your browser print dialog' },
  { icon: '📄', label: 'Set Destination → "Save as PDF"',  desc: 'In the Destination dropdown'     },
  { icon: '⚙️',  label: 'Disable Headers & Footers',        desc: 'Under "More settings"'           },
  { icon: '✅', label: 'Click Save',                         desc: 'Choose where to save the file'   },
];

export default function ExportModal({ isOpen, onClose }: Props) {
  const { getActiveResume } = useResumeStore();
  const resume = getActiveResume();
  const [zoom, setZoom]         = useState(0.72);
  const [printed, setPrinted]   = useState(false);
  const [showTip, setShowTip]   = useState(true);
  const previewRef              = useRef<HTMLDivElement>(null);

  if (!isOpen || !resume) return null;

  const handlePrint = () => {
    printResume('export-resume-preview', resume);
    setPrinted(true);
    setTimeout(() => setPrinted(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[96vh] flex flex-col">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <FiPrinter size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Print / Save as PDF</h2>
              <p className="text-xs text-gray-400 mt-0.5">Preview your resume then print or save as PDF</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1.5">
              <button
                onClick={() => setZoom(z => Math.max(0.35, z - 0.05))}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <FiZoomOut size={13} />
              </button>
              <span className="text-xs text-gray-600 font-medium w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(1.1, z + 0.05))}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <FiZoomIn size={13} />
              </button>
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all shadow-sm
                ${printed ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {printed
                ? <><FiCheckCircle size={14} /> Print dialog opened!</>
                : <><FiPrinter size={14} /> Print / Save PDF</>
              }
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-1"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* ── How-to Banner ───────────────────────────────────── */}
        {showTip && (
          <div className="flex items-start gap-4 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex-shrink-0">
            <FiInfo size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-800 mb-2">📋 How to save your resume as PDF</p>
              <div className="flex items-start gap-1 flex-wrap">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="flex items-start gap-1.5 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-blue-100">
                      <span className="text-sm">{step.icon}</span>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-800 leading-tight">{step.label}</p>
                        <p className="text-[10px] text-gray-400 leading-tight">{step.desc}</p>
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <FiChevronRight size={12} className="text-blue-300 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="text-blue-300 hover:text-blue-500 flex-shrink-0 mt-0.5"
            >
              <FiX size={13} />
            </button>
          </div>
        )}

        {/* ── Preview Area ────────────────────────────────────── */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center" ref={previewRef}>
          <div
            style={{
              width: `${794 * zoom}px`,
              height: `${1123 * zoom}px`,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <div
              id="export-resume-preview"
              style={{
                position:        'absolute',
                top:             0,
                left:            0,
                width:           '794px',
                transform:       `scale(${zoom})`,
                transformOrigin: 'top left',
                backgroundColor: '#ffffff',
              }}
            >
              <ResumePreview resume={resume} scale={1} forExport />
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><FiMonitor size={11} /> A4 format · 210 × 297 mm</span>
            <span>·  Print colors will be preserved</span>
            <span>·  Disable headers/footers for a clean PDF</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
