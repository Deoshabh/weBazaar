'use client';

import { FiTruck, FiPackage, FiMapPin, FiCheck, FiAlertCircle } from 'react-icons/fi';

/**
 * Order Timeline Panel
 * Shows shipment tracking timeline in expandable row
 */
export default function OrderTimelinePanel({ order }) {
  const trackingHistory = order.shipping?.trackingHistory || [];

  // Sort by timestamp (newest first)
  const sortedHistory = [...trackingHistory].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Get icon for status
  const getStatusIcon = (status) => {
    const statusUpper = status?.toUpperCase() || '';

    if (statusUpper.includes('DELIVERED')) return <FiCheck className="text-green-600" />;
    if (statusUpper.includes('OUT FOR DELIVERY')) return <FiTruck className="text-orange-600" />;
    if (statusUpper.includes('IN TRANSIT') || statusUpper.includes('SHIPPED'))
      return <FiTruck className="text-blue-600" />;
    if (statusUpper.includes('PICKED')) return <FiPackage className="text-purple-600" />;
    if (statusUpper.includes('FAILED') || statusUpper.includes('RTO'))
      return <FiAlertCircle className="text-red-600" />;

    return <FiMapPin className="text-gray-600" />;
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase() || '';

    if (statusUpper.includes('DELIVERED')) return 'bg-green-100 text-green-800';
    if (statusUpper.includes('OUT FOR DELIVERY')) return 'bg-orange-100 text-orange-800';
    if (statusUpper.includes('IN TRANSIT') || statusUpper.includes('SHIPPED'))
      return 'bg-blue-100 text-blue-800';
    if (statusUpper.includes('PICKED')) return 'bg-purple-100 text-purple-800';
    if (statusUpper.includes('FAILED') || statusUpper.includes('RTO'))
      return 'bg-red-100 text-red-800';

    return 'bg-gray-100 text-gray-800';
  };

  if (sortedHistory.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <FiPackage className="mx-auto text-4xl mb-2 text-gray-400" />
        <p>No tracking history available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FiTruck />
        Shipment Timeline
      </h3>

      {/* Order Info */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg border">
        <div>
          <div className="text-xs text-gray-500">AWB Code</div>
          <div className="font-semibold text-gray-900 font-mono">
            {order.shipping?.awb_code || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Courier</div>
          <div className="font-semibold text-gray-900">
            {order.shipping?.courier_name || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Current Status</div>
          <div className="font-semibold text-gray-900">
            {order.shipping?.current_status || 'N/A'}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-4">
          {sortedHistory.map((entry, idx) => (
            <div key={idx} className="relative flex gap-4">
              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex-shrink-0">
                {getStatusIcon(entry.status)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                          entry.status
                        )}`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {entry.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                      <FiMapPin className="text-gray-400" />
                      {entry.location}
                    </div>
                  )}

                  {entry.description && (
                    <div className="text-sm text-gray-600 mt-2">
                      {entry.description}
                    </div>
                  )}

                  {entry.scanType && (
                    <div className="text-xs text-gray-500 mt-2">
                      Scan Type: {entry.scanType}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking URL */}
      {order.shipping?.tracking_url && (
        <div className="mt-6 pt-4 border-t">
          <a
            href={order.shipping.tracking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <FiTruck />
            Track on Courier Website →
          </a>
        </div>
      )}
    </div>
  );
}
