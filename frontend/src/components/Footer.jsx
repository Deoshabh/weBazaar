'use client';

import Link from 'next/link';
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiMail,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const SOCIAL_ICON_MAP = {
  facebook: FiFacebook,
  twitter: FiTwitter,
  instagram: FiInstagram,
};

export default function Footer() {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  const footerContent = settings.footerContent || {};
  const footerTheme = settings.theme?.footer || {};

  const contact = settings.contactInfo || {};
  const socialLinks = (settings.socialLinks || [])
    .filter((item) => item.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const columns = (footerContent.columns || [])
    .filter((column) => column.title)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const legalLinks = (footerContent.legal?.links || [])
    .filter((link) => link.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Theme Styles
  const bgColor = footerTheme.colors?.background || '#000000'; // Default to primary-900 equivalent logic
  const textColor = footerTheme.colors?.text || '#ffffff';
  const showNewsletter = footerTheme.showNewsletter !== false;
  const showSocials = footerTheme.showSocialLinks !== false;

  return (
    <footer
      className="mt-20 transition-colors duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">{footerContent.brand?.name || 'Radeo'}</h3>
            <p className="opacity-80 mb-4">
              {footerContent.brand?.description ||
                'Premium handcrafted shoes made with timeless craftsmanship and finest materials.'}
            </p>
            {showSocials && socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = SOCIAL_ICON_MAP[social.platform] || FiInstagram;
                  return (
                    <a
                      key={`${social.platform}-${social.order || 0}`}
                      href={social.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-75 transition-opacity"
                      style={{ color: textColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {columns.map((column) => (
            <div key={column.id || column.title}>
              <h4 className="text-lg font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {(column.links || [])
                  .filter((link) => link.enabled)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((link) => (
                    <li key={`${column.title}-${link.text}`}>
                      <Link
                        href={link.url || '/'}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                        style={{ color: textColor }}
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              {contact.showAddress && contact.address && (
                <li className="flex items-start gap-2 opacity-80">
                  <FiMapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.showPhone && contact.phone && (
                <li className="flex items-center gap-2 opacity-80">
                  <FiPhone className="w-5 h-5" />
                  <a
                    href={`tel:${String(contact.phone).replace(/\s+/g, '')}`}
                    className="hover:opacity-100 transition-opacity"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.showEmail && contact.email && (
                <li className="flex items-center gap-2 opacity-80">
                  <FiMail className="w-5 h-5" />
                  <a href={`mailto:${contact.email}`} className="hover:opacity-100 transition-opacity">
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {footerTheme.showNewsletter !== false && (
          <div className="border-t mt-8 pt-8" style={{ borderColor: `${textColor}33` }}>
            <div className="max-w-md mx-auto text-center">
              <h4 className="text-lg font-semibold mb-2">{footerContent.newsletter?.title || 'Subscribe to Our Newsletter'}</h4>
              <p className="opacity-80 mb-4">{footerContent.newsletter?.description || 'Get updates on new products and exclusive offers'}</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder={footerContent.newsletter?.placeholder || 'Enter your email'}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-tan placeholder-white/50"
                  style={{ color: textColor, borderColor: `${textColor}33` }}
                />
                <button
                  type="submit"
                  className="btn px-6 font-medium"
                  style={{ backgroundColor: textColor, color: bgColor }}
                >
                  {footerContent.newsletter?.buttonText || 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: `${textColor}33` }}>
          <p className="opacity-70 text-sm">
            &copy; {currentYear} {footerContent.brand?.name || 'Radeo'}. {footerContent.legal?.copyrightText || 'All rights reserved.'}
          </p>
          <div className="flex gap-6 text-sm">
            {legalLinks.map((link) => (
              <Link key={link.text} href={link.url || '/'} className="opacity-70 hover:opacity-100 transition-opacity" style={{ color: textColor }}>
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
