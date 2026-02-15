import { useState } from 'react';
import { FiType, FiDroplet, FiLayout, FiImage, FiChevronDown, FiChevronRight, FiGrid, FiArchive, FiZap } from 'react-icons/fi';
import BrandSection from './theme-sections/BrandSection';
import TypographySection from './theme-sections/TypographySection';
import LayoutSection from './theme-sections/LayoutSection';
import HeroSection from './theme-sections/HeroSection';
import HeaderSection from './theme-sections/HeaderSection';
import ProductGridSection from './theme-sections/ProductGridSection';
import FooterSection from './theme-sections/FooterSection';
import EffectsSection from './theme-sections/EffectsSection';

// Simple collapsible section component
const Section = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <div className="flex items-center gap-2 font-medium text-gray-700 text-sm">
                    {Icon && <Icon className="text-gray-500" />}
                    {title}
                </div>
                {isOpen ? <FiChevronDown className="text-gray-400" /> : <FiChevronRight className="text-gray-400" />}
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default function ThemeCustomizer({ theme, branding, sections, announcementBar, onUpdateSection, onChange, onBrandingChange, onAnnouncementChange }) {

    // Helper to update theme settings
    const handleThemeChange = (key, value) => {
        onChange({ ...theme, [key]: value });
    };

    return (
        <div className="p-4 space-y-4">
            <Section title="Brand Identity" icon={FiDroplet} defaultOpen={true}>
                <BrandSection
                    branding={branding}
                    theme={theme}
                    onBrandingChange={onBrandingChange}
                    onThemeChange={handleThemeChange}
                />
            </Section>

            <Section title="Typography" icon={FiType}>
                <TypographySection
                    theme={theme}
                    onThemeChange={handleThemeChange}
                />
            </Section>

            <Section title="Layout & Spacing" icon={FiLayout}>
                <LayoutSection
                    theme={theme}
                    onThemeChange={handleThemeChange}
                />
            </Section>

            <Section title="Hero Customization" icon={FiImage}>
                <HeroSection
                    theme={theme}
                    sectionData={sections?.hero}
                    onUpdateSection={(data) => onUpdateSection('hero', data)}
                    onThemeChange={handleThemeChange}
                />
            </Section>

            <Section title="Header & Navigation" icon={FiLayout}>
                <HeaderSection
                    theme={theme}
                    announcementBar={announcementBar}
                    onAnnouncementChange={onAnnouncementChange}
                    onThemeChange={handleThemeChange}
                />
            </Section>

            <Section title="Products & Grid" icon={FiGrid}>
                <ProductGridSection
                    theme={theme}
                    onThemeChange={handleThemeChange}
                />
            </Section>

            <Section title="Footer Design" icon={FiArchive}>
                <FooterSection
                    theme={theme}
                    onThemeChange={handleThemeChange}
                />
            </Section>

            <Section title="Global Effects" icon={FiZap}>
                <EffectsSection
                    theme={theme}
                    onThemeChange={handleThemeChange}
                />
            </Section>
        </div>
    );
}

