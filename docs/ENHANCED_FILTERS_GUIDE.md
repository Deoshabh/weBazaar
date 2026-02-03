# Enhanced Product Filtering System

## Overview

Implemented dynamic, user-friendly filtering system with:

- **Adjustable Price Range Slider** - Drag to set min/max price
- **Brand Filters** - Auto-populated from product data
- **Material Filters** - Auto-populated from product descriptions
- All filters update in real-time as products are added/edited

## New Features

### 1. Price Range Slider

- **Interactive dual-handle slider** for precise price selection
- Shows min/max prices dynamically based on available products
- Input boxes for direct number entry
- Visual feedback with colored range indicator

### 2. Brand Filter (Checkbox)

- Automatically populated from products' `brand` field
- Multiple brands can be selected
- Sorted alphabetically
- Only shows brands that exist in active products

### 3. Material Filter (Checkbox)

- Automatically extracted from products' `materialAndCare` field
- Detects common materials: Leather, Suede, Canvas, Mesh, Synthetic, Rubber, Textile, Cotton, Polyester, Nylon
- Multiple materials can be selected
- Sorted alphabetically

## API Endpoints

### Get Brands

```http
GET /api/v1/products/brands
```

**Response:**

```json
["Nike", "Adidas", "Puma", "Reebok"]
```

### Get Materials

```http
GET /api/v1/products/materials
```

**Response:**

```json
["Canvas", "Leather", "Mesh", "Rubber", "Suede"]
```

### Get Price Range

```http
GET /api/v1/products/price-range
```

**Response:**

```json
{
  "min": 1500,
  "max": 25000
}
```

### Filter Products

```http
GET /api/v1/products?brand=Nike&material=Leather&minPrice=5000&maxPrice=15000&category=sneakers&sortBy=price&order=asc
```

**Query Parameters:**

- `brand` - Filter by brand name (case-insensitive)
- `material` - Filter by material (case-insensitive, partial match)
- `minPrice` - Minimum price (number)
- `maxPrice` - Maximum price (number)
- `category` - Category slug
- `search` - Search term
- `sortBy` - Field to sort by (price, name, createdAt)
- `order` - Sort order (asc, desc)

## Frontend Components

### PriceRangeSlider Component

**Location:** `frontend/src/components/PriceRangeSlider.jsx`

**Props:**

- `min` (number) - Minimum price value
- `max` (number) - Maximum price value
- `value` (object) - Current selected range `{ min, max }`
- `onChange` (function) - Callback when range changes

**Features:**

- Dual-handle range slider
- Number input boxes for precise control
- Visual progress bar showing selected range
- Touch-friendly on mobile devices
- Auto-validates (min < max with 1000 minimum gap)

**Usage:**

```jsx
<PriceRangeSlider
  min={0}
  max={100000}
  value={{ min: 5000, max: 15000 }}
  onChange={(newRange) => console.log(newRange)}
/>
```

## How It Works

### 1. Data Flow

```
Product Upload → Extract Brand/Material → Store in DB → API Endpoints → Frontend Filters
```

### 2. Filter Logic

**Brands:**

```javascript
// Backend extracts distinct brand values
const brands = await Product.distinct("brand", {
  isActive: true,
  brand: { $exists: true, $ne: "" },
});
```

**Materials:**

```javascript
// Backend searches materialAndCare field for common materials
const commonMaterials = ['leather', 'suede', 'canvas', 'mesh', ...];
products.forEach(product => {
  const text = product.materialAndCare.toLowerCase();
  commonMaterials.forEach(material => {
    if (text.includes(material)) {
      materials.add(material);
    }
  });
});
```

**Price Range:**

```javascript
// Backend aggregates min/max from all active products
const result = await Product.aggregate([
  { $match: { isActive: true } },
  {
    $group: {
      _id: null,
      minPrice: { $min: "$price" },
      maxPrice: { $max: "$price" },
    },
  },
]);
```

### 3. URL State Management

Filters are stored in URL parameters for:

- Shareable links
- Browser back/forward navigation
- Bookmark support

**Example URLs:**

```
/products?brands=Nike,Adidas&materials=Leather&minPrice=5000&maxPrice=15000
/products?category=sneakers&brands=Puma&sortBy=price&order=asc
```

## Testing Guide

### Test 1: Price Slider

1. Go to `/products`
2. Drag the price slider handles
3. Products should filter in real-time
4. Try entering values in the number inputs
5. Min/Max should be validated (min < max - 1000)

### Test 2: Brand Filter

1. Upload products with different brands via admin panel
2. Go to `/products`
3. Brand filter should show all unique brands
4. Select multiple brands (checkboxes)
5. Products should show items from ANY selected brand

### Test 3: Material Filter

1. Upload products with materialAndCare containing keywords like "Leather", "Canvas", etc.
2. Go to `/products`
3. Material filter should show detected materials
4. Select multiple materials
5. Products should show items containing ANY selected material

### Test 4: Combined Filters

1. Apply: Brand + Material + Price Range + Category
2. Products should match ALL criteria
3. Clear filters button should reset everything
4. URL should update with all parameters

### Test 5: Mobile Experience

1. Open `/products` on mobile
2. Click "Filters" button
3. Slide-in panel should appear
4. All filters should work (slider, checkboxes)
5. "Apply Filters" button should close panel and apply changes

## Admin Workflow

### Adding Products with Filterable Data

1. **Brand Field:**
   - Enter brand name in the "Brand" field
   - Examples: "Nike", "Adidas", "Puma"
   - Brand will automatically appear in filters

2. **Material Field:**
   - Add material info in "Material & Care" field
   - Use keywords: Leather, Suede, Canvas, Mesh, Synthetic, Rubber, etc.
   - Example: "Upper: Premium Leather, Sole: Rubber, Care: Wipe with damp cloth"
   - Materials will be automatically detected and added to filters

3. **Price:**
   - Set appropriate price
   - Price range slider will auto-adjust to include all product prices

## Implementation Details

### Backend Changes

#### `productController.js`

- Added `getBrands()` - Returns distinct brands
- Added `getMaterials()` - Extracts and returns materials
- Added `getPriceRange()` - Returns min/max prices
- Updated `getAllProducts()` - Added brand & material filtering

#### `productRoutes.js`

- `GET /products/brands` - Get all brands
- `GET /products/materials` - Get all materials
- `GET /products/price-range` - Get price range

### Frontend Changes

#### `products/page.jsx`

- Added `PriceRangeSlider` component
- Added brand/material state management
- Added handlers: `handleBrandToggle`, `handleMaterialToggle`, `handlePriceChange`
- Updated URL parameter handling
- Replaced radio buttons with interactive slider

#### `utils/api.js`

- Added `getBrands()` API call
- Added `getMaterials()` API call
- Added `getPriceRange()` API call

## Benefits

### For Users:

- **Intuitive**: Drag slider instead of clicking preset ranges
- **Precise**: Set exact price range needed
- **Visual**: See price range and selected values clearly
- **Flexible**: Multiple brands/materials can be selected
- **Dynamic**: Filters update based on available products

### For Admins:

- **Automatic**: No manual filter creation needed
- **Maintenance-free**: Filters update when products are added/edited
- **Accurate**: Always shows current available options
- **Scalable**: Handles any number of brands/materials

## Troubleshooting

### Brands Not Showing

- Ensure products have `brand` field filled
- Check products are `isActive: true`
- Verify backend endpoint: `GET /api/v1/products/brands`

### Materials Not Showing

- Add keywords to `materialAndCare` field
- Use common material names (Leather, Canvas, etc.)
- Check backend endpoint: `GET /api/v1/products/materials`

### Price Slider Not Working

- Verify price range endpoint returns valid data
- Check console for errors
- Ensure products have numeric price values

### Filters Not Applying

- Check URL parameters are being set
- Verify backend query is receiving parameters
- Check browser console for API errors

## Future Enhancements

1. **Multi-select improvements:**
   - Show selected count badges
   - Add "Select All" / "Clear All" for each filter group

2. **Advanced features:**
   - Size filter (from product sizes array)
   - Color filter (from product colors array)
   - Rating filter
   - Availability filter (in stock / out of stock)

3. **UX improvements:**
   - Filter preset saving
   - Recent filters history
   - Popular filter combinations
   - Filter suggestions based on search

4. **Performance:**
   - Debounce slider changes
   - Virtual scrolling for long filter lists
   - Filter results count preview before applying

## Summary

✅ **Price Range Slider** - Adjustable, intuitive, real-time
✅ **Brand Filter** - Auto-populated, multi-select
✅ **Material Filter** - Auto-detected, multi-select
✅ **Dynamic Updates** - Filters reflect current products
✅ **Mobile Responsive** - Works on all devices
✅ **URL State** - Shareable, bookmark-able filter states

All filters work together seamlessly and update automatically as products are managed through the admin panel!
