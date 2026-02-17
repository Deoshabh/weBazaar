'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/utils/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiRefreshCcw, FiExternalLink } from 'react-icons/fi';

export default function StorefrontBuilderPage() {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDefaults = async () => {
    const confirmed = window.confirm(
      'Reset all storefront settings to default and publish live now? This will overwrite current design and content settings.',
    );
    if (!confirmed) return;

    const typedConfirmation = window.prompt('Type RESET to confirm full storefront reset:');
    if (typedConfirmation !== 'RESET') {
      toast.error('Reset cancelled. Confirmation text did not match.');
      return;
    }

    try {
      setIsResetting(true);
      await adminAPI.resetFrontendDefaults();
      toast.success('Storefront reset to defaults');
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to reset storefront defaults');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-80px)] bg-gray-100 p-4 flex flex-col gap-3">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/visual-editor" className="btn btn-secondary text-xs flex items-center gap-2">
              <FiArrowLeft /> Back to Theme Editor
            </Link>
            <h1 className="text-sm font-semibold text-gray-800">Storefront Builder (Elementor-style)</h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/?storefrontBuilder=1"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary text-xs flex items-center gap-2"
            >
              <FiExternalLink /> Open in New Tab
            </a>
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={isResetting}
              className="btn btn-primary text-xs flex items-center gap-2"
            >
              <FiRefreshCcw /> {isResetting ? 'Resetting...' : 'Reset to Default Frontend'}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <iframe
            src="/?storefrontBuilder=1"
            title="Storefront Builder"
            className="w-full h-full"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
