"use client";

import { FiMapPin, FiEdit2, FiCheckCircle } from "react-icons/fi";

/**
 * Address Confirmation Modal
 * Show cleaned/normalized address before order placement
 */
export default function AddressConfirmationModal({
  address,
  onConfirm,
  onEdit,
  onCancel,
}) {
  const { name, phone, house, street, landmark, city, state, pincode } = address;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <FiMapPin className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Confirm Delivery Address</h2>
        </div>

        {/* Address Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="space-y-2">
            {/* Name & Phone */}
            <div>
              <p className="font-semibold text-gray-800">{name}</p>
              <p className="text-gray-600">{phone}</p>
            </div>

            {/* Address Lines */}
            <div className="text-gray-700 leading-relaxed">
              <p>{house}</p>
              <p>{street}</p>
              {landmark && <p className="text-sm text-gray-600">Near: {landmark}</p>}
              <p className="mt-2">
                {city}, {state} - <span className="font-medium">{pincode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Serviceability Info */}
        {address.verifiedDelivery !== undefined && (
          <div
            className={`p-3 rounded-lg mb-4 flex items-start gap-2 ${
              address.verifiedDelivery
                ? "bg-green-50 border border-green-200"
                : "bg-orange-50 border border-orange-200"
            }`}
          >
            <FiCheckCircle
              className={`mt-0.5 ${
                address.verifiedDelivery ? "text-green-600" : "text-orange-600"
              }`}
            />
            <div className="text-sm">
              <p
                className={`font-semibold ${
                  address.verifiedDelivery ? "text-green-800" : "text-orange-800"
                }`}
              >
                {address.verifiedDelivery
                  ? "✓ Delivery Available"
                  : "⚠ Limited Serviceability"}
              </p>
              {address.codAvailable && (
                <p className="text-gray-700 mt-1">Cash on Delivery available</p>
              )}
              {!address.verifiedDelivery && (
                <p className="text-orange-700 mt-1">
                  Courier services may be limited at this location. Please ensure the
                  address is correct.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FiEdit2 />
            Edit Address
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiCheckCircle />
            Confirm & Proceed
          </button>
        </div>

        {/* Cancel Link */}
        <button
          onClick={onCancel}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
