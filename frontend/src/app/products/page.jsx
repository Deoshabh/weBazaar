'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productAPI, categoryAPI } from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import PriceRangeSlider from '@/components/PriceRangeSlider';
import { getColorName } from '@/components/ColorPicker';
import { Skeleton } from '@/components/ui';
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiList,
  FiCheck,
  FiSliders,
  FiSearch,
} from 'react-icons/fi';
import anime from 'animejs';

/* ─── Shared filter-section component ─── */
function FilterSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-sand/30 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-body-sm font-semibold text-ink hover:text-espresso transition-colors duration-fast"
        aria-expanded={open}
      >
        {title}
        <FiChevronDown
          className={`w-4 h-4 text-caramel transition-transform duration-fast ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-normal ${
          open ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Active-filter chip ─── */
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-linen border border-sand/40 text-espresso text-[11px] font-medium tracking-wide uppercase rounded-full group/chip">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-sand/60 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <FiX className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

/* ─── Skeleton grid while loading ─── */
function ProductGridSkeleton({ count = 9 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/5] bg-linen rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%]" />
          </div>
          <div className="space-y-2 px-1">
            <div className="h-3 bg-linen rounded w-1/3" />
            <div className="h-4 bg-linen rounded w-3/4" />
            <div className="h-3 bg-linen rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Shared filter body (used in both desktop sidebar & mobile drawer) ─── */
function FilterBody({
  categories,
  materials,
  colors,
  sizes,
  priceRange,
  selectedCategory,
  selectedMaterials,
  selectedColors,
  selectedSizes,
  selectedPriceRange,
  updateFilters,
  handleMaterialToggle,
  handleColorToggle,
  handleSizeToggle,
  handlePriceChange,
}) {
  return (
    <>
      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer group hover:bg-linen transition-colors duration-fast">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-fast ${
                !selectedCategory
                  ? 'border-espresso bg-espresso'
                  : 'border-sand group-hover:border-caramel'
              }`}
            >
              {!selectedCategory && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => updateFilters('category', '')}
              className="hidden"
            />
            <span
              className={`text-body-sm transition-colors ${
                !selectedCategory ? 'text-ink font-medium' : 'text-walnut'
              }`}
            >
              All Products
            </span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat._id}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer group hover:bg-linen transition-colors duration-fast"
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-fast ${
                  selectedCategory === cat.slug
                    ? 'border-espresso bg-espresso'
                    : 'border-sand group-hover:border-caramel'
                }`}
              >
                {selectedCategory === cat.slug && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.slug}
                onChange={() => updateFilters('category', cat.slug)}
                className="hidden"
              />
              <span
                className={`text-body-sm transition-colors ${
                  selectedCategory === cat.slug ? 'text-ink font-medium' : 'text-walnut'
                }`}
              >
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="px-1">
          <PriceRangeSlider
            min={priceRange.min}
            max={priceRange.max}
            value={selectedPriceRange}
            onChange={handlePriceChange}
          />
        </div>
      </FilterSection>

      {/* Material */}
      {materials.length > 0 && (
        <FilterSection title="Material">
          <div className="space-y-1 max-h-44 overflow-y-auto custom-scrollbar">
            {materials.map((material) => (
              <label
                key={material}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer group hover:bg-linen transition-colors duration-fast"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-fast ${
                    selectedMaterials.includes(material)
                      ? 'bg-espresso border-espresso'
                      : 'border-sand group-hover:border-caramel'
                  }`}
                >
                  {selectedMaterials.includes(material) && (
                    <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(material)}
                  onChange={() => handleMaterialToggle(material)}
                  className="hidden"
                />
                <span className="text-body-sm text-walnut group-hover:text-ink transition-colors">
                  {material}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Color */}
      {colors.length > 0 && (
        <FilterSection title="Color">
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => (
              <label key={color} className="cursor-pointer group relative" title={getColorName(color)}>
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() => handleColorToggle(color)}
                  className="hidden"
                />
                <div
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-fast ${
                    selectedColors.includes(color)
                      ? 'ring-2 ring-espresso ring-offset-2 ring-offset-cream scale-110 border-transparent'
                      : 'border-sand/60 hover:border-caramel hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
                {selectedColors.includes(color) && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FiCheck
                      className="w-3 h-3"
                      strokeWidth={3}
                      style={{
                        color:
                          color === '#FFFFFF' || color === '#ffffff' || color === '#FFF'
                            ? '#000'
                            : '#fff',
                      }}
                    />
                  </span>
                )}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Size */}
      {sizes.length > 0 && (
        <FilterSection title="Size">
          <div className="grid grid-cols-4 gap-1.5">
            {sizes.map((size) => (
              <label key={size} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => handleSizeToggle(size)}
                  className="hidden"
                />
                <div
                  className={`text-body-sm py-2 rounded-md text-center border transition-all duration-fast ${
                    selectedSizes.includes(size)
                      ? 'bg-espresso text-white border-espresso font-medium'
                      : 'bg-cream text-walnut border-sand/40 hover:border-espresso hover:text-ink'
                  }`}
                >
                  {size}
                </div>
              </label>
            ))}
          </div>
        </FilterSection>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Products Content
   ═══════════════════════════════════════════════════════ */
function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const containerRef = useRef(null);
  const headerRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3); // 3 = default grid, 2 = larger cards

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  /* ─── Data fetching ─── */
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(
        Array.isArray(response.data) ? response.data : response.data.categories || []
      );
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await productAPI.getMaterials();
      setMaterials(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    }
  };

  const fetchPriceRange = useCallback(async () => {
    try {
      const response = await productAPI.getPriceRange();
      if (response.data) {
        setPriceRange(response.data);
        setSelectedPriceRange((prev) => prev || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch price range:', error);
    }
  }, []);

  const fetchColors = async () => {
    try {
      const response = await productAPI.getColors();
      setColors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch colors:', error);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await productAPI.getSizes();
      setSizes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch sizes:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMaterials();
    fetchPriceRange();
    fetchColors();
    fetchSizes();
  }, [fetchPriceRange]);

  const fetchProducts = useCallback(
    async (category, mats, cols, szs, priceMin, priceMax, sort, search) => {
      try {
        setLoading(true);
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;
        if (mats && mats.length > 0) params.material = mats[0];
        if (cols && cols.length > 0) params.color = cols[0];
        if (szs && szs.length > 0) params.size = szs[0];
        if (priceMin !== undefined && priceMin !== null) params.minPrice = priceMin;
        if (priceMax !== undefined && priceMax !== null) params.maxPrice = priceMax;

        if (sort && sort !== 'featured') {
          const sortMap = {
            'price-asc': { sortBy: 'price', order: 'asc' },
            'price-desc': { sortBy: 'price', order: 'desc' },
            'name-asc': { sortBy: 'name', order: 'asc' },
            'name-desc': { sortBy: 'name', order: 'desc' },
          };
          if (sortMap[sort]) {
            params.sortBy = sortMap[sort].sortBy;
            params.order = sortMap[sort].order;
          }
        }

        const response = await productAPI.getAllProducts(params);
        const productsData = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const category = searchParams.get('category') || '';
    const materialsParam = searchParams.get('materials') || '';
    const colorsParam = searchParams.get('colors') || '';
    const sizesParam = searchParams.get('sizes') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'featured';
    const search = searchParams.get('search') || '';

    setSelectedCategory(category);
    setSelectedMaterials(materialsParam ? materialsParam.split(',') : []);
    setSelectedColors(colorsParam ? colorsParam.split(',') : []);
    setSelectedSizes(sizesParam ? sizesParam.split(',') : []);
    setSortBy(sort);
    setSearchQuery(search);

    if (minPrice || maxPrice) {
      setSelectedPriceRange({
        min: minPrice ? Number(minPrice) : priceRange.min,
        max: maxPrice ? Number(maxPrice) : priceRange.max,
      });
    }

    fetchProducts(
      category,
      materialsParam ? materialsParam.split(',') : [],
      colorsParam ? colorsParam.split(',') : [],
      sizesParam ? sizesParam.split(',') : [],
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
      sort,
      search
    );
  }, [searchParams, fetchProducts, priceRange.min, priceRange.max]);

  /* ─── Animations ─── */
  useEffect(() => {
    if (headerRef.current) {
      anime({
        targets: headerRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        easing: 'easeOutQuad',
        duration: 800,
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && products.length > 0) {
      anime({
        targets: '.product-card-item',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(50),
        easing: 'easeOutQuad',
        duration: 600,
      });
    }
  }, [products, loading]);

  /* ─── Filter helpers ─── */
  const updateFilters = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) params.set(key, value.join(','));
        else params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handlePriceChange = useCallback(
    (newRange) => {
      setSelectedPriceRange(newRange);
      const params = new URLSearchParams(searchParams.toString());
      params.set('minPrice', newRange.min);
      params.set('maxPrice', newRange.max);
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleMaterialToggle = useCallback(
    (material) => {
      const next = selectedMaterials.includes(material)
        ? selectedMaterials.filter((m) => m !== material)
        : [...selectedMaterials, material];
      setSelectedMaterials(next);
      updateFilters('materials', next);
    },
    [selectedMaterials, updateFilters]
  );

  const handleColorToggle = useCallback(
    (color) => {
      const next = selectedColors.includes(color)
        ? selectedColors.filter((c) => c !== color)
        : [...selectedColors, color];
      setSelectedColors(next);
      updateFilters('colors', next);
    },
    [selectedColors, updateFilters]
  );

  const handleSizeToggle = useCallback(
    (size) => {
      const next = selectedSizes.includes(size)
        ? selectedSizes.filter((s) => s !== size)
        : [...selectedSizes, size];
      setSelectedSizes(next);
      updateFilters('sizes', next);
    },
    [selectedSizes, updateFilters]
  );

  const clearFilters = () => router.push('/products');

  const activeFilterCount = [
    selectedCategory,
    searchQuery,
    selectedMaterials.length > 0,
    selectedColors.length > 0,
    selectedSizes.length > 0,
    selectedPriceRange &&
      (selectedPriceRange.min !== priceRange.min || selectedPriceRange.max !== priceRange.max),
  ].filter(Boolean).length;

  // Build chips list
  const activeChips = [];
  if (selectedCategory) {
    const cat = categories.find((c) => c.slug === selectedCategory);
    activeChips.push({
      label: cat?.name || selectedCategory,
      onRemove: () => updateFilters('category', ''),
    });
  }
  if (searchQuery) {
    activeChips.push({
      label: `"${searchQuery}"`,
      onRemove: () => updateFilters('search', ''),
    });
  }
  selectedMaterials.forEach((m) =>
    activeChips.push({ label: m, onRemove: () => handleMaterialToggle(m) })
  );
  selectedColors.forEach((c) =>
    activeChips.push({
      label: getColorName(c) || c,
      onRemove: () => handleColorToggle(c),
    })
  );
  selectedSizes.forEach((s) =>
    activeChips.push({ label: `Size ${s}`, onRemove: () => handleSizeToggle(s) })
  );
  if (
    selectedPriceRange &&
    (selectedPriceRange.min !== priceRange.min || selectedPriceRange.max !== priceRange.max)
  ) {
    activeChips.push({
      label: `₹${selectedPriceRange.min.toLocaleString('en-IN')} – ₹${selectedPriceRange.max.toLocaleString('en-IN')}`,
      onRemove: () => {
        setSelectedPriceRange(priceRange);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('minPrice');
        params.delete('maxPrice');
        router.push(`/products?${params.toString()}`);
      },
    });
  }

  // Lock body when mobile filter open
  useEffect(() => {
    if (isFilterOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterOpen]);

  /* ─── Filter props shared by desktop & mobile ─── */
  const filterProps = {
    categories,
    materials,
    colors,
    sizes,
    priceRange,
    selectedCategory,
    selectedMaterials,
    selectedColors,
    selectedSizes,
    selectedPriceRange,
    updateFilters,
    handleMaterialToggle,
    handleColorToggle,
    handleSizeToggle,
    handlePriceChange,
  };

  return (
    <div className="min-h-screen bg-cream" ref={containerRef}>
      {/* ─── Page Header ─── */}
      <div className="bg-linen border-b border-sand/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5" ref={headerRef}>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-caption text-caramel mb-3">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-ink">
              {searchQuery ? 'Search' : selectedCategory ? categories.find((c) => c.slug === selectedCategory)?.name || 'Products' : 'Products'}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink leading-tight">
                {searchQuery ? (
                  <>
                    Results for{' '}
                    <span className="text-espresso">&ldquo;{searchQuery}&rdquo;</span>
                  </>
                ) : selectedCategory ? (
                  categories.find((c) => c.slug === selectedCategory)?.name || 'Products'
                ) : (
                  'All Products'
                )}
              </h1>
            </div>
            <p className="text-body-sm text-caramel tabular-nums">
              {loading ? (
                <span className="inline-block w-20 h-4 bg-sand/40 rounded animate-pulse" />
              ) : (
                `${products.length} product${products.length !== 1 ? 's' : ''}`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Controls Bar ─── */}
      <div className="sticky top-[var(--navbar-offset,80px)] z-20 bg-cream/95 backdrop-blur-md border-b border-sand/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 gap-4">
            {/* Left: filter toggle (mobile) + active chips */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium text-ink bg-linen border border-sand/40 rounded-md hover:bg-sand/30 transition-colors duration-fast flex-shrink-0"
              >
                <FiSliders className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-espresso text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Active chips — desktop */}
              {activeChips.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
                  {activeChips.map((chip, i) => (
                    <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
                  ))}
                  {activeChips.length > 1 && (
                    <button
                      onClick={clearFilters}
                      className="text-caption text-caramel hover:text-espresso transition-colors whitespace-nowrap ml-1"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: grid toggle + sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Grid density toggle — desktop only */}
              <div className="hidden lg:flex items-center border border-sand/40 rounded-md overflow-hidden">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-1.5 transition-colors duration-fast ${
                    gridCols === 3 ? 'bg-espresso text-white' : 'text-caramel hover:bg-linen'
                  }`}
                  aria-label="3-column grid"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-1.5 transition-colors duration-fast ${
                    gridCols === 2 ? 'bg-espresso text-white' : 'text-caramel hover:bg-linen'
                  }`}
                  aria-label="2-column grid"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateFilters('sort', e.target.value);
                  }}
                  className="appearance-none pl-3 pr-8 py-1.5 text-body-sm text-ink bg-cream border border-sand/40 rounded-md focus:outline-none focus:border-espresso focus:ring-2 focus:ring-espresso/12 cursor-pointer hover:border-caramel transition-colors duration-fast"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="name-asc">Name: A → Z</option>
                  <option value="name-desc">Name: Z → A</option>
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-caramel pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-8 items-start">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[calc(var(--navbar-offset,80px)+48px+2rem)]">
            <div className="bg-white rounded-xl shadow-card border border-sand/20 overflow-hidden">
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-sand/30">
                <h3 className="flex items-center gap-2 text-body font-semibold text-ink">
                  <FiFilter className="w-4 h-4 text-caramel" />
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-caption text-caramel hover:text-espresso transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="px-5">
                <FilterBody {...filterProps} />
              </div>
            </div>
          </aside>

          {/* ── Mobile Filter Drawer ── */}
          <>
            <div
              className={`lg:hidden fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm transition-opacity duration-normal ${
                isFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setIsFilterOpen(false)}
              aria-hidden="true"
            />
            <div
              className={`lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-cream rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col transition-transform duration-slow ease-out ${
                isFilterOpen ? 'translate-y-0' : 'translate-y-full'
              }`}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 bg-sand/60 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-5 py-3 border-b border-sand/30 flex-shrink-0">
                <h3 className="text-body font-semibold text-ink flex items-center gap-2">
                  <FiSliders className="w-4 h-4 text-caramel" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-espresso text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-linen transition-colors"
                  aria-label="Close filters"
                >
                  <FiX className="w-5 h-5 text-ink" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-4">
                <FilterBody {...filterProps} />
              </div>

              {/* Bottom actions */}
              <div className="flex-shrink-0 border-t border-sand/30 px-5 py-3 flex gap-3"
                style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
              >
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2.5 text-body-sm font-medium text-espresso bg-linen border border-sand/40 rounded-lg hover:bg-sand/30 transition-colors duration-fast"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-2.5 text-body-sm font-medium text-white bg-espresso rounded-lg hover:bg-ink transition-colors duration-fast"
                >
                  View {products.length} Result{products.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </>

          {/* ── Products Grid ── */}
          <div className="flex-1 min-w-0">
            {/* Active chips — mobile only */}
            {activeChips.length > 0 && (
              <div className="sm:hidden flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar pb-1">
                {activeChips.map((chip, i) => (
                  <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
                ))}
                <button
                  onClick={clearFilters}
                  className="text-caption text-caramel hover:text-espresso transition-colors whitespace-nowrap ml-1"
                >
                  Clear
                </button>
              </div>
            )}

            {loading ? (
              <ProductGridSkeleton count={gridCols === 2 ? 6 : 9} />
            ) : products.length > 0 ? (
              <div
                className={`grid gap-x-4 gap-y-8 sm:gap-6 lg:gap-8 ${
                  gridCols === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {products.map((product, index) => (
                  <div key={product._id} className="product-card-item opacity-0">
                    <ProductCard product={product} priority={index < 4} />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 lg:py-28">
                <div className="w-20 h-20 rounded-full bg-linen flex items-center justify-center mb-5">
                  <FiSearch className="w-8 h-8 text-caramel" />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink mb-2">
                  No products found
                </h3>
                <p className="text-body-sm text-caramel mb-6 text-center max-w-sm">
                  Try adjusting your filters or search to find what you&apos;re looking for.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 text-body-sm font-medium text-white bg-espresso rounded-lg hover:bg-ink transition-colors duration-fast"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Result count footer */}
            {!loading && products.length > 0 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <div className="h-px flex-1 max-w-[60px] bg-sand/40" />
                <span className="text-caption text-caramel">
                  Showing all {products.length} product{products.length !== 1 ? 's' : ''}
                </span>
                <div className="h-px flex-1 max-w-[60px] bg-sand/40" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Page wrapper with Suspense
   ═══════════════════════════════════════════════════════ */
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream">
          {/* Header skeleton */}
          <div className="bg-linen border-b border-sand/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5">
              <div className="h-3 w-24 bg-sand/40 rounded mb-3" />
              <div className="h-8 w-48 bg-sand/40 rounded" />
            </div>
          </div>
          {/* Controls skeleton */}
          <div className="border-b border-sand/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12" />
          </div>
          {/* Grid skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="flex gap-8">
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="bg-white rounded-xl border border-sand/20 h-[500px] animate-pulse" />
              </div>
              <div className="flex-1">
                <ProductGridSkeleton />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
