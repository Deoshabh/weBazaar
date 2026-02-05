"use client";

import { useState, useEffect } from "react";
import { FiMapPin, FiAlertCircle, FiCheckCircle, FiLoader } from "react-icons/fi";

/**
 * Structured Address Form (Amazon/Flipkart style)
 * With live validation and serviceability check
 */
export default function StructuredAddressForm({ onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.fullName || "",
    phone: initialData?.phone || "",
    pincode: initialData?.postalCode || "",
    house: initialData?.addressLine1 || "",
    street: initialData?.addressLine2 || "",
    landmark: initialData?.landmark || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
  });

  const [validation, setValidation] = useState({
    checking: false,
    valid: null,
    errors: [],
    warnings: [],
    serviceable: null,
    codAvailable: null,
  });

  const [pincodeCheck, setPincodeCheck] = useState({
    checking: false,
    serviceable: null,
    message: "",
  });

  // Debounced PIN code check
  useEffect(() => {
    if (formData.pincode.length === 6) {
      const timer = setTimeout(() => {
        checkPincode(formData.pincode);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPincodeCheck({ checking: false, serviceable: null, message: "" });
    }
  }, [formData.pincode]);

  const checkPincode = async (pincode) => {
    try {
      setPincodeCheck({ checking: true, serviceable: null, message: "" });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses/check-pincode/${pincode}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setPincodeCheck({
          checking: false,
          serviceable: data.serviceable,
          message: data.serviceable
            ? `✓ Delivery available${data.codAvailable ? " (COD available)" : ""}`
            : "⚠ Delivery may not be available",
        });
      } else {
        setPincodeCheck({
          checking: false,
          serviceable: false,
          message: "⚠ Unable to check serviceability",
        });
      }
    } catch (error) {
      console.error("PIN code check error:", error);
      setPincodeCheck({
        checking: false,
        serviceable: false,
        message: "⚠ Unable to check serviceability",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = async () => {
    try {
      setValidation((prev) => ({ ...prev, checking: true }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      setValidation({
        checking: false,
        valid: data.success,
        errors: data.errors || [],
        warnings: data.warnings || [],
        serviceable: data.serviceable,
        codAvailable: data.codAvailable,
      });

      if (data.success && data.cleanedAddress) {
        // Auto-fill cleaned address
        setFormData((prev) => ({ ...prev, ...data.cleanedAddress }));
      }

      return data;
    } catch (error) {
      console.error("Validation error:", error);
      setValidation({
        checking: false,
        valid: false,
        errors: ["Validation failed. Please try again."],
        warnings: [],
      });
      return { success: false };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await validateForm();

    if (result.success) {
      if (!result.cleanedAddress) {
        console.error("Validation succeeded but cleanedAddress is missing");
        setValidation({
          valid: false,
          errors: ["Address validation incomplete. Please try again."],
          warnings: [],
        });
        return;
      }

      onSubmit({
        fullName: result.cleanedAddress.name,
        phone: result.cleanedAddress.phone,
        addressLine1: result.cleanedAddress.house,
        addressLine2: result.cleanedAddress.street,
        landmark: result.cleanedAddress.landmark || "",
        city: result.cleanedAddress.city,
        state: result.cleanedAddress.state,
        postalCode: result.cleanedAddress.pincode,
        country: "India",
        verifiedDelivery: result.serviceable,
        codAvailable: result.codAvailable,
        lastVerified: new Date(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Number *
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="10-digit mobile number"
          maxLength="10"
          pattern="[6-9][0-9]{9}"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* PIN Code with live check */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PIN Code *
        </label>
        <div className="relative">
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="6-digit PIN code"
            maxLength="6"
            pattern="[0-9]{6}"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {pincodeCheck.checking && (
            <FiLoader className="absolute right-3 top-3 text-blue-500 animate-spin" />
          )}
        </div>
        {pincodeCheck.message && (
          <p
            className={`mt-1 text-sm flex items-center gap-1 ${
              pincodeCheck.serviceable ? "text-green-600" : "text-orange-600"
            }`}
          >
            {pincodeCheck.serviceable ? <FiCheckCircle /> : <FiAlertCircle />}
            {pincodeCheck.message}
          </p>
        )}
      </div>

      {/* House/Flat */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Flat, House No., Building, Company, Apartment *
        </label>
        <input
          type="text"
          name="house"
          value={formData.house}
          onChange={handleChange}
          placeholder="e.g., C-104, Maxblis White House"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Street/Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Area, Street, Sector, Village *
        </label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="e.g., Sector 137, Greater Noida"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Landmark (Optional)
        </label>
        <input
          type="text"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
          placeholder="e.g., Near Metro Station"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* City & State (auto-filled after validation) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <FiAlertCircle /> Please fix the following:
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {validation.errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <FiAlertCircle /> Suggestions:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {validation.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={validation.checking}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {validation.checking ? (
          <>
            <FiLoader className="animate-spin" />
            Validating...
          </>
        ) : (
          <>
            <FiMapPin />
            Save & Continue
          </>
        )}
      </button>
    </form>
  );
}
