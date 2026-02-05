'use client';

import { FiPackage, FiPrinter, FiCheck, FiX } from 'react-icons/fi';

/**
 * Bulk Actions Bar
 * Sticky bar for performing actions on selected orders
 */
export default function BulkActionsBar({
  selectedCount,
  onCreateShipments,
  onPrintLabels,
  onMarkProcessing,
  onCancel,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 shadow-2xl z-50 border-t border-blue-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Selection Count */}
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">
              {selectedCount} order{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onCancel}
              className="text-blue-100 hover:text-white flex items-center gap-1"
            >
              <FiX /> Clear
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCreateShipments}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <FiPackage />
              Create Shipments
            </button>

            <button
              onClick={onPrintLabels}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors"
            >
              <FiPrinter />
              Print Labels
            </button>

            <button
              onClick={onMarkProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors"
            >
              <FiCheck />
              Mark Processing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
