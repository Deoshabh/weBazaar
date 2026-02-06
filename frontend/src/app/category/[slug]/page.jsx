'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { categoryAPI, productAPI } from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import PriceRangeSlider from '@/components/PriceRangeSlider';
import { FiArrowLeft, FiFilter, FiX } from 'react-icons/fi';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter options
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  
  // Filter states
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = useCallback(async (
    materials = [], 
    colors = [], 
    sizes = [], 
    minPrice, 
    maxPrice, 
    sort = 'featured', 
    search = ''
  ) => {
    try {
      const params = { category: slug };
      
      if (materials.length > 0) params.materials = materials.join(',');
      if (colors.length > 0) params.colors = colors.join(',');
      if (sizes.length > 0) params.sizes = sizes.join(',');
      if (minPrice !== undefined) params.minPrice = minPrice;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;
      if (sort && sort !== 'featured') params.sort = sort;
      if (search) params.search = search;

      const response = await productAPI.getAllProducts(params);
      const productsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.products || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, [slug]);

  const fetchFilterOptions = async () => {
    try {
      const [materialsRes, colorsRes, sizesRes, priceRes] = await Promise.all([
        productAPI.getMaterials(),
        productAPI.getColors(),
        productAPI.getSizes(),
        productAPI.getPriceRange(),
      ]);

      setMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : []);
      setColors(Array.isArray(colorsRes.data) ? colorsRes.data : []);
      setSizes(Array.isArray(sizesRes.data) ? sizesRes.data : []);
      
      if (priceRes.data) {
        setPriceRange(priceRes.data);
        if (!selectedPriceRange) {
          setSelectedPriceRange(priceRes.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch category details
      const categoryResponse = await categoryAPI.getCategoryBySlug(slug);
      const categoryData = categoryResponse.data.category || categoryResponse.data;
      setCategory(categoryData);

      // Fetch filter options
      await fetchFilterOptions();
    } catch (error) {
      console.error('Failed to fetch category data:', error);
      router.push('/categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  useEffect(() => {
    // Get filters from URL
    const materialsParam = searchParams.get('materials') || '';
    const colorsParam = searchParams.get('colors') || '';
    const sizesParam = searchParams.get('sizes') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'featured';
    const search = searchParams.get('search') || '';

    setSelectedMaterials(materialsParam ? materialsParam.split(',') : []);
    setSelectedColors(colorsParam ? colorsParam.split(',') : []);
    setSelectedSizes(sizesParam ? sizesParam.split(',') : []);
    setSortBy(sort);
    setSearchQuery(search);

    // Update price range from URL
    if (minPrice || maxPrice) {
      setSelectedPriceRange({
        min: minPrice ? Number(minPrice) : priceRange.min,
        max: maxPrice ? Number(maxPrice) : priceRange.max,
      });
    }

    fetchProducts(
      materialsParam ? materialsParam.split(',') : [],
      colorsParam ? colorsParam.split(',') : [],
      sizesParam ? sizesParam.split(',') : [],
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
      sort, 
      search
    );
  }, [searchParams, fetchProducts, priceRange]);

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, value);
      }
    } else {
      params.delete(key);
    }
    
    router.push(`/category/${slug}?${params.toString()}`);
  };

  const handlePriceChange = (newRange) => {
    setSelectedPriceRange(newRange);
    const params = new URLSearchParams(searchParams.toString());
    params.set('minPrice', newRange.min);
    params.set('maxPrice', newRange.max);
    router.push(`/category/${slug}?${params.toString()}`);
  };

  const handleMaterialToggle = (material) => {
    const newMaterials = selectedMaterials.includes(material)
      ? selectedMaterials.filter(m => m !== material)
      : [...selectedMaterials, material];
    setSelectedMaterials(newMaterials);
    updateFilters('materials', newMaterials);
  };

  const handleColorToggle = (color) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    updateFilters('colors', newColors);
  };

  const handleSizeToggle = (size) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    updateFilters('sizes', newSizes);
  };

  const clearFilters = () => {
    router.push(`/category/${slug}`);
  };

  const activeFilterCount = [
    searchQuery,
    selectedMaterials.length > 0,
    selectedColors.length > 0,
    selectedSizes.length > 0,
    selectedPriceRange && (selectedPriceRange.min !== priceRange.min || selectedPriceRange.max !== priceRange.max)
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 pt-24">
        <div className="container-custom section-padding">
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary-50 pt-24">
      <div className="container-custom section-padding">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary-600 hover:text-brand-brown transition-colors mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Category Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-primary-900 mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-primary-600 max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>

        {/* Filter and Sort Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <p className="text-primary-600">
            {loading ? 'Loading...' : `${products.length} products found`}
          </p>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:hidden btn btn-secondary flex items-center gap-2 flex-1 sm:flex-none"
            >
              <FiFilter />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-brand-brown text-white text-xs px-2 py-1 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                updateFilters('sort', e.target.value);
              }}
              className="px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 flex-1 sm:flex-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-brand-brown hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <PriceRangeSlider
                  min={priceRange.min}
                  max={priceRange.max}
                  value={selectedPriceRange}
                  onChange={handlePriceChange}
                />
              </div>

              {/* Material Filter */}
              {materials.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Material</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {materials.map((material) => (
                      <label key={material} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMaterials.includes(material)}
                          onChange={() => handleMaterialToggle(material)}
                          className="w-4 h-4 text-brand-brown focus:ring-brand-brown rounded"
                        />
                        <span className="text-sm">{material}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Color</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {colors.map((color) => (
                      <label key={color} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => handleColorToggle(color)}
                          className="w-4 h-4 text-brand-brown focus:ring-brand-brown rounded"
                        />
                        <span className="text-sm capitalize">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Filter */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Size</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                          selectedSizes.includes(size)
                            ? 'bg-brand-brown text-white border-brand-brown'
                            : 'border-primary-200 hover:border-brand-brown'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile Filter Modal */}
          {isFilterOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-fade-in">
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto animate-slide-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button onClick={() => setIsFilterOpen(false)}>
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Same filter content as desktop */}
                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <PriceRangeSlider
                    min={priceRange.min}
                    max={priceRange.max}
                    value={selectedPriceRange}
                    onChange={(newRange) => {
                      handlePriceChange(newRange);
                      setIsFilterOpen(false);
                    }}
                  />
                </div>

                {/* Material Filter */}
                {materials.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Material</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {materials.map((material) => (
                        <label key={material} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(material)}
                            onChange={() => handleMaterialToggle(material)}
                            className="w-4 h-4 text-brand-brown focus:ring-brand-brown rounded"
                          />
                          <span className="text-sm">{material}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Filter */}
                {colors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Color</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {colors.map((color) => (
                        <label key={color} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedColors.includes(color)}
                            onChange={() => handleColorToggle(color)}
                            className="w-4 h-4 text-brand-brown focus:ring-brand-brown rounded"
                          />
                          <span className="text-sm capitalize">{color}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Filter */}
                {sizes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Size</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeToggle(size)}
                          className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                            selectedSizes.includes(size)
                              ? 'bg-brand-brown text-white border-brand-brown'
                              : 'border-primary-200 hover:border-brand-brown'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn btn-primary w-full mt-6"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-primary-600 text-lg mb-4">
                  No products found with the selected filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
