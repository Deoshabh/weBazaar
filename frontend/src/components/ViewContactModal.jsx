'use client';

import { FiX, FiUser, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

/**
 * View Contact Info Modal
 * Displays customer contact information (read-only)
 */
export default function ViewContactModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Customer Contact Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              Customer Details
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {order.shippingAddress?.fullName || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FiPhone className="text-green-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.shippingAddress?.phone ? `+91 ${order.shippingAddress.phone}` : 'N/A'}
                  </p>
                  {order.shippingAddress?.phone && (
                    <a
                      href={`tel:+91${order.shippingAddress.phone}`}
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      Click to call
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="text-purple-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.user?.email || 'N/A'}
                  </p>
                  {order.user?.email && (
                    <a
                      href={`mailto:${order.user.email}`}
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      Send email
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiMapPin className="text-red-600" />
              Shipping Address
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              {order.shippingAddress?.addressLine1 && (
                <p>{order.shippingAddress.addressLine1}</p>
              )}
              {order.shippingAddress?.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              {(order.shippingAddress?.city || order.shippingAddress?.state) && (
                <p>
                  {[order.shippingAddress?.city, order.shippingAddress?.state]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {order.shippingAddress?.postalCode && (
                <p>PIN: {order.shippingAddress.postalCode}</p>
              )}
              <p className="font-medium">
                {order.shippingAddress?.country || 'India'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
