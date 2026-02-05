"use client";

import { useState } from "react";
import StructuredAddressForm from "./StructuredAddressForm";
import AddressConfirmationModal from "./AddressConfirmationModal";
import { addressAPI } from "@/utils/api";
import toast from "react-hot-toast";

/**
 * Example: How to integrate Amazon/Flipkart-style address workflow
 * Copy this pattern into your checkout or profile address management
 */
export default function AddressWorkflowExample({ onAddressAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [pendingAddress, setPendingAddress] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  /**
   * Handle address submission from StructuredAddressForm
   * This receives validated & cleaned address from backend
   */
  const handleAddressSubmit = (validatedAddress) => {
    console.log("✅ Validated address:", validatedAddress);
    
    // Store pending address
    setPendingAddress(validatedAddress);
    
    // Show confirmation modal
    setShowForm(false);
    setShowConfirmation(true);
  };

  /**
   * User confirmed the address - save to database
   */
  const handleConfirmAddress = async () => {
    try {
      const response = await addressAPI.addAddress(pendingAddress);
      
      toast.success("Address saved successfully!");
      
      // Close modal
      setShowConfirmation(false);
      setPendingAddress(null);
      
      // Notify parent component
      if (onAddressAdded) {
        onAddressAdded(response.data.address);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.message || "Failed to save address");
    }
  };

  /**
   * User wants to edit - go back to form
   */
  const handleEditAddress = () => {
    setShowConfirmation(false);
    setShowForm(true);
  };

  /**
   * Cancel everything
   */
  const handleCancel = () => {
    setShowConfirmation(false);
    setShowForm(false);
    setPendingAddress(null);
  };

  return (
    <div>
      {/* Trigger Button */}
      {!showForm && !showConfirmation && (
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Add New Address
        </button>
      )}

      {/* Address Form */}
      {showForm && (
        <div className="max-w-2xl mx-auto mt-6">
          <StructuredAddressForm
            onSubmit={handleAddressSubmit}
            initialData={pendingAddress} // Pre-fill if editing
          />
          <button
            onClick={handleCancel}
            className="mt-4 text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && pendingAddress && (
        <AddressConfirmationModal
          address={pendingAddress}
          onConfirm={handleConfirmAddress}
          onEdit={handleEditAddress}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
