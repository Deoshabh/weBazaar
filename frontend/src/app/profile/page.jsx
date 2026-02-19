'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userAPI, addressAPI } from '@/utils/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiSave, FiX, FiPlus, FiTrash2, FiMapPin } from 'react-icons/fi';
import ChangePassword from '@/components/profile/ChangePassword';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });

  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      // Backend returns array directly, not wrapped
      const addressesData = Array.isArray(response.data) ? response.data : (response.data.addresses || []);
      setAddresses(addressesData);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await addressAPI.update(editingAddressId, addressForm);
        toast.success('Address updated successfully!');
      } else {
        await addressAPI.create(addressForm);
        toast.success('Address added successfully!');
      }
      fetchAddresses();
      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await addressAPI.delete(addressId);
        toast.success('Address deleted successfully!');
        fetchAddresses();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete address');
      }
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setEditingAddressId(address._id);
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-3">
        <div className="w-10 h-10 border-2 border-sand border-t-espresso rounded-full animate-spin" />
        <p className="text-body-sm text-caramel">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const inputClass =
    'w-full px-4 py-3 bg-cream border border-sand/40 rounded-lg text-body-sm text-ink placeholder:text-caramel/60 focus:outline-none focus:border-espresso focus:ring-2 focus:ring-espresso/12 transition-all duration-normal disabled:bg-linen disabled:text-caramel disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Profile Information */}
        <div className="bg-white rounded-xl border border-sand/20 shadow-card p-5 sm:p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-body-sm font-medium text-espresso hover:text-ink transition-colors"
              >
                <FiEdit2 className="w-4 h-4" /> Edit
              </button>
            )}
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-ink mb-1.5">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!isEditing} className={inputClass} required />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-ink mb-1.5">Email</label>
                <input type="email" value={formData.email} disabled className={inputClass} />
                <p className="text-caption text-caramel mt-1 normal-case tracking-normal">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-ink mb-1.5">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!isEditing} className={inputClass} />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-3">
                  <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-espresso text-white text-body-sm font-medium rounded-lg hover:bg-ink transition-colors duration-fast">
                    <FiSave className="w-4 h-4" /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '' }); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-linen text-ink text-body-sm font-medium rounded-lg border border-sand/40 hover:bg-sand/20 transition-colors duration-fast"
                  >
                    <FiX className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Change Password */}
        {['password', 'local'].includes(user?.authProvider) && (
          <div className="mb-5">
            <ChangePassword />
          </div>
        )}

        {/* Addresses */}
        <div className="bg-white rounded-xl border border-sand/20 shadow-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-ink">Saved Addresses</h2>
            <button
              onClick={() => { setShowAddressForm(true); setEditingAddressId(null); resetAddressForm(); }}
              className="flex items-center gap-1.5 text-body-sm font-medium text-espresso hover:text-ink transition-colors"
            >
              <FiPlus className="w-4 h-4" /> Add New
            </button>
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddressSubmit} className="mb-5 p-4 border border-sand/20 rounded-lg bg-linen">
              <h3 className="font-display text-base font-semibold text-ink mb-4">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Full Name" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} className={inputClass} required />
                <input type="tel" placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className={inputClass} required />
                <input type="text" placeholder="Address Line 1" value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })} className={`sm:col-span-2 ${inputClass}`} required />
                <input type="text" placeholder="Address Line 2 (Optional)" value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} className={`sm:col-span-2 ${inputClass}`} />
                <input type="text" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className={inputClass} required />
                <input type="text" placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className={inputClass} required />
                <input type="text" placeholder="PIN Code" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} className={inputClass} required maxLength="6" pattern="[0-9]{6}" title="Please enter a valid 6-digit PIN code" />
                <label className="flex items-center gap-2.5 py-3">
                  <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-4 h-4 rounded border-sand accent-espresso" />
                  <span className="text-body-sm text-walnut">Set as default address</span>
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="px-5 py-2.5 bg-espresso text-white text-body-sm font-medium rounded-lg hover:bg-ink transition-colors duration-fast">
                  {editingAddressId ? 'Update' : 'Add'} Address
                </button>
                <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); resetAddressForm(); }} className="px-5 py-2.5 bg-linen text-ink text-body-sm font-medium rounded-lg border border-sand/40 hover:bg-sand/20 transition-colors duration-fast">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Address List */}
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-center text-caramel py-8 text-body-sm">No addresses saved yet</p>
            ) : (
              addresses.map((address) => (
                <div key={address._id} className="border border-sand/30 rounded-lg p-4 hover:border-caramel transition-colors duration-fast">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FiMapPin className="w-4 h-4 text-caramel flex-shrink-0" />
                        <span className="font-display text-base font-semibold text-ink">{address.fullName}</span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gold/10 text-gold-dark rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-body-sm text-walnut">{address.addressLine1}</p>
                      {address.addressLine2 && <p className="text-body-sm text-walnut">{address.addressLine2}</p>}
                      <p className="text-body-sm text-walnut">
                        {address.city}, {address.state} — {address.postalCode}
                      </p>
                      <p className="text-caption text-caramel mt-1">Phone: {address.phone}</p>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button onClick={() => handleEditAddress(address)} className="w-10 h-10 rounded-lg flex items-center justify-center text-caramel hover:text-espresso hover:bg-linen transition-colors duration-fast" title="Edit">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteAddress(address._id)} className="w-10 h-10 rounded-lg flex items-center justify-center text-caramel hover:text-error hover:bg-error/5 transition-colors duration-fast" title="Delete">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
