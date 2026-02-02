# 🔧 How to Make Products Available

## Issue Identified

The product shows **"Unavailable"** badge because `inStock: false` in the database.

### Previous Behavior (Bug)

- ❌ Buy Now and Wishlist buttons were completely hidden for out-of-stock products
- ❌ Users couldn't add unavailable items to wishlist

### Fixed Behavior (Now)

- ✅ Buy Now button shows as **"Out of Stock"** (disabled, gray)
- ✅ Wishlist button **always visible** (users can save for later)
- ✅ Clicking "Out of Stock" shows error toast
- ✅ Better user experience

---

## 📋 How to Make Product Available

### Method 1: Through Admin Dashboard

#### Step 1: Open Admin Panel

1. Go to **`/admin`**
2. Login with admin credentials
3. Click **"Products"** in sidebar

#### Step 2: Find the Product

1. Locate the "oxford" product (or any unavailable product)
2. Click **"Edit"** button (pencil icon)

#### Step 3: Enable Product

1. Scroll to **"Additional Details"** section
2. Find checkbox: **"Active Product"**
3. ✅ **Check the box** to enable
4. Click **"Update Product"**

### Method 2: Direct Database Update (Quick Fix)

If you have MongoDB access:

```javascript
// In MongoDB shell or using quick-db-check.js
db.products.updateOne(
  { slug: "oxford" },
  { $set: { isActive: true, inStock: true } },
);
```

Or update the quick-db-check.js script:

```javascript
// Add this function to backend/quick-db-check.js
async function fixUnavailableProducts() {
  const result = await Product.updateMany(
    { isActive: false },
    { $set: { isActive: true, inStock: true } },
  );
  console.log(`✅ Updated ${result.modifiedCount} products`);
}
```

---

## 🔍 Understanding Product Availability

### Two Flags Control Visibility

**1. `isActive` (Boolean)**

- Controls if product shows in frontend
- Set in admin panel: "Active Product" checkbox
- `false` → Product hidden completely
- `true` → Product visible

**2. `inStock` (Boolean)**

- Controls if product can be purchased
- Set in admin panel based on stock quantity
- `false` → Shows "Unavailable" badge + "Out of Stock" button
- `true` → Shows "Buy Now" button

### Combined Behavior

| isActive | inStock | Result                           |
| -------- | ------- | -------------------------------- |
| `false`  | `false` | ❌ Hidden (not in products list) |
| `false`  | `true`  | ❌ Hidden (not in products list) |
| `true`   | `false` | ⚠️ Visible but "Out of Stock"    |
| `true`   | `true`  | ✅ Fully available               |

---

## 🎯 Current Product Status

Based on screenshot:

- **Product**: Oxford Shoes
- **Status**: `isActive: true`, `inStock: false`
- **Price**: ₹2,500
- **Sizes**: 3 sizes available

### To Fix This Product:

```bash
# Option 1: Admin Panel (Recommended)
1. Go to /admin/products
2. Find "oxford" product
3. Edit → Check "Active Product"
4. Set stock quantity > 0
5. Save

# Option 2: Database (Quick)
# Run in MongoDB:
db.products.updateOne(
  { slug: "oxford" },
  { $set: { inStock: true, stock: 100 } }
)
```

---

## 🚀 New Features (Just Added)

### 1. **Wishlist Always Available**

- Users can add out-of-stock items to wishlist
- Get notified when back in stock (future feature)

### 2. **Clear "Out of Stock" Button**

- Replaces hidden button with visible disabled button
- Shows clear message: "Out of Stock"
- Better than just hiding the button

### 3. **Error Toast on Click**

- Clicking "Out of Stock" shows: "Product currently unavailable"
- Provides feedback to user

---

## 🧪 Testing

### Test Out-of-Stock Products

1. Open any product page
2. If product has `inStock: false`:
   - ✅ Should show "Unavailable" badge
   - ✅ Should show "Out of Stock" button (disabled, gray)
   - ✅ Should show wishlist button (working)
   - ✅ Clicking "Out of Stock" shows error

### Test Available Products

1. Make product available (isActive: true, inStock: true)
2. Verify:
   - ✅ No "Unavailable" badge
   - ✅ "Buy Now" button (blue, clickable)
   - ✅ Wishlist button (working)
   - ✅ Can add to cart

---

## 📝 Admin Dashboard vs Products Page

### Why "Unavailable" Badge Only Shows in Products Page?

**Products Page** (Public):

- Shows visual badges for users
- "Unavailable" badge for out-of-stock
- Focus: User shopping experience

**Admin Dashboard** (Private):

- Shows data in table format
- `isActive` column: "Yes" / "No"
- `inStock` shown in details
- Focus: Product management

### Admin Panel Improvements (Optional)

You could add these features:

1. **Stock Status Column**

   ```jsx
   // In admin products table
   <td>
     {product.inStock ? (
       <span className="text-green-600">In Stock</span>
     ) : (
       <span className="text-red-600">Out of Stock</span>
     )}
   </td>
   ```

2. **Quick Toggle Buttons**
   ```jsx
   <button onClick={() => toggleStock(product._id)}>
     {product.inStock ? "✅ Available" : "❌ Unavailable"}
   </button>
   ```

---

## 🎨 Visual Changes

### Before Fix

```
[Product Card]
┌─────────────┐
│   [IMAGE]   │
│ Unavailable │
│    [♡]      │
├─────────────┤
│ Oxford      │
│ ₹2,500      │
│             │  ← No buttons!
└─────────────┘
```

### After Fix

```
[Product Card]
┌─────────────┐
│   [IMAGE]   │
│ Unavailable │
│    [♡]      │
├─────────────┤
│ Oxford      │
│ ₹2,500      │
├─────────────┤
│[Out of Stock][♥]│ ← Always visible!
└─────────────┘
```

---

## 🔧 Quick Fix Script

Create this file to bulk-fix all products:

```javascript
// backend/fix-availability.js
const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

async function fixAllProducts() {
  await mongoose.connect(process.env.MONGO_URI);

  // Make all products active and in stock
  const result = await Product.updateMany(
    {},
    {
      $set: {
        isActive: true,
        inStock: true,
        stock: 100, // Set default stock
      },
    },
  );

  console.log(`✅ Updated ${result.modifiedCount} products`);
  await mongoose.disconnect();
}

fixAllProducts();
```

Run:

```bash
cd backend
node fix-availability.js
```

---

## ✅ Summary

**Problem**: Buttons hidden for out-of-stock products  
**Solution**: Always show buttons, disable Buy Now for unavailable items  
**Benefit**: Better UX, users can still wishlist unavailable products

**To fix your current product**:

1. Go to `/admin/products`
2. Edit "oxford" product
3. Check "Active Product" ✅
4. Set stock > 0
5. Save

**Done!** Your product will now show "Buy Now" instead of "Out of Stock" 🎉
