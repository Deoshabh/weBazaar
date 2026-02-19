const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const { log } = require('../utils/logger');

class CouponService {
    /**
     * Validate a coupon code for a given cart total and user
     * @param {string} code - The coupon code to validate
     * @param {number} cartTotal - The total amount of the cart
     * @param {string} userId - The ID of the user attempting to use the coupon
     * @returns {Promise<object>} - Validation result { valid: boolean, discount: number, message: string, coupon: object }
     */
    async validateCoupon(code, cartTotal, userId) {
        try {
            if (!code) {
                return { valid: false, message: 'Coupon code is required' };
            }

            const coupon = await Coupon.findOne({ code: code.toUpperCase() });

            if (!coupon) {
                return { valid: false, message: 'Invalid coupon code' };
            }

            if (!coupon.isActive) {
                return { valid: false, message: 'Coupon is inactive' };
            }

            const now = new Date();
            if (coupon.validFrom && now < coupon.validFrom) {
                return { valid: false, message: 'Coupon is not yet valid' };
            }

            if (now > coupon.expiry) {
                return { valid: false, message: 'Coupon has expired' };
            }

            if (coupon.minOrder && cartTotal < coupon.minOrder) {
                return { 
                    valid: false, 
                    message: `Minimum order value of ₹${coupon.minOrder} required` 
                };
            }

            if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
                return { valid: false, message: 'Coupon usage limit reached' };
            }

            // Check if user has already used this coupon
            if (userId) {
                const userUsageCount = await Order.countDocuments({
                    user: userId,
                    'coupon.code': coupon.code,
                    status: { $ne: 'cancelled' },
                });
                if (userUsageCount > 0) {
                    return { valid: false, message: 'You have already used this coupon' };
                }
            }
            
            let discountAmount = 0;
            if (coupon.type === 'percent') {
                discountAmount = (cartTotal * coupon.value) / 100;
            } else if (coupon.type === 'flat') {
                discountAmount = coupon.value;
            }

            // Ensure discount doesn't exceed total
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal;
            }

            return {
                valid: true,
                message: 'Coupon applied successfully',
                discount: Math.round(discountAmount), // Round to nearest integer standard
                coupon: {
                    _id: coupon._id,
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value
                }
            };

        } catch (error) {
            log.error('Coupon validation error', error);
            throw new Error('Error validating coupon');
        }
    }

    /**
     * Increment coupon usage count
     * @param {string} couponId 
     */
    async incrementUsage(couponId) {
        await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
    }
}

module.exports = new CouponService();
