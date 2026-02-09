# reCAPTCHA User Information Guide

## Overview

Google reCAPTCHA Enterprise allows sending account identifiers and phone numbers with assessments for more accurate bot detection. This guide shows how to implement this feature.

## Data You Can Send

### Account Identifier (accountId)

- **Required**: No, but highly recommended
- **Format**: String uniquely identifying the user
- **Best Practices**:
  - Use email (most common and stable)
  - Use username (if more stable than email)
  - Use user ID (if it's stable and not regenerated)
  - Must be consistent for same user across requests
- **Example**: `user@example.com`, `john_doe`, `user_12345`

### Phone Number (phoneNumber)

- **Required**: No, but recommended for sensitive actions
- **Format**: E.164 international format
- **Pattern**: `+<country_code><number>`
- **Examples**:
  - US: `+11234567890`
  - UK: `+441234567890`
  - India: `+919876543210`
  - Canada: `+14165551234`
  - Germany: `+491234567890`

## Implementation

### Basic Setup

```javascript
const { createAssessment } = require("./middleware/recaptcha");

// Send assessment with user information
const score = await createAssessment({
  token: recaptchaToken,
  recaptchaAction: "LOGIN",
  userInfo: {
    accountId: user.email,
    phoneNumber: user.phoneNumber, // E.164 format
  },
});
```

### Using the Middleware

The `verifyRecaptcha` middleware automatically extracts user information:

```javascript
const { verifyRecaptcha } = require("./middleware/recaptcha");

// Middleware automatically gets user from req.user or req.body.userInfo
router.post("/login", verifyRecaptcha("LOGIN", 0.5), loginController);
```

The middleware looks for user information in this order:

1. `req.body.userInfo` (explicitly sent by frontend)
2. `req.user` (from authentication middleware)

### Frontend Integration

Send user information from the frontend when available:

```javascript
const response = await api.post("/auth/login", {
  email,
  password,
  recaptchaToken,
  userInfo: {
    accountId: email,
    phoneNumber: phoneNumber, // if collected
  },
});
```

## Real-World Examples

### Example 1: Login with Email

```javascript
async function login(req, res) {
  const { email, password, recaptchaToken } = req.body;

  const score = await createAssessment({
    token: recaptchaToken,
    recaptchaAction: "LOGIN",
    userInfo: {
      accountId: email,
    },
  });

  if (score < 0.5) {
    return res.status(403).json({ message: "Security check failed" });
  }

  // Process login...
}
```

### Example 2: Registration with Phone

```javascript
async function register(req, res) {
  const { email, password, phoneNumber, recaptchaToken } = req.body;

  // Validate phone number format
  if (!isValidE164(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  const score = await createAssessment({
    token: recaptchaToken,
    recaptchaAction: "REGISTER",
    userInfo: {
      accountId: email,
      phoneNumber: phoneNumber, // E.164 format
    },
  });

  if (score < 0.6) {
    return res.status(403).json({ message: "Cannot create account" });
  }

  // Create account...
}
```

### Example 3: Checkout with Complete Info

```javascript
async function checkout(req, res) {
  const { recaptchaToken } = req.body;
  const user = req.user; // From auth middleware

  const score = await createAssessment({
    token: recaptchaToken,
    recaptchaAction: "CHECKOUT",
    userInfo: {
      accountId: user.email,
      phoneNumber: user.phoneNumber,
    },
  });

  if (score < 0.7) {
    // Require additional verification
    return res
      .status(403)
      .json({ message: "Additional verification required" });
  }

  // Process checkout...
}
```

## Phone Number Validation

### Helper Function

```javascript
/**
 * Validate phone number in E.164 format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid E.164 format
 */
function isValidE164(phoneNumber) {
  // E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

// Usage
if (isValidE164("+11234567890")) {
  console.log("Valid E.164 format");
}
```

### Formatting Phone Numbers

When receiving phone numbers from users, convert to E.164 format:

```javascript
/**
 * Format phone number to E.164
 * Note: This is a simple example. In production, use a library like libphonenumber-js
 */
function formatToE164(phoneNumber, countryCode = "US") {
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, "");

  // Add country code if missing
  if (!phoneNumber.startsWith("+")) {
    const countryDialCode = {
      US: "1",
      UK: "44",
      IN: "91",
      CA: "1",
      DE: "49",
    };
    return "+" + countryDialCode[countryCode] + digits;
  }

  return "+" + digits;
}

// Usage
const formatted = formatToE164("(123) 456-7890", "US"); // +11234567890
```

### Recommended Library: libphonenumber-js

For production applications, use a proper library:

```javascript
import { parsePhoneNumber } from "libphonenumber-js";

function getE164PhoneNumber(phoneNumber, defaultRegion = "US") {
  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultRegion);
    return parsed?.format("E.164");
  } catch (error) {
    console.error("Invalid phone number:", error);
    return null;
  }
}

// Usage
const e164 = getE164PhoneNumber("(123) 456-7890", "US");
// Returns: +11234567890
```

## Best Practices

### 1. Always Validate Phone Numbers

```javascript
if (userInfo.phoneNumber && !isValidE164(userInfo.phoneNumber)) {
  // Don't send invalid phone numbers
  delete userInfo.phoneNumber;
}
```

### 2. Use Consistent Account IDs

```javascript
// ✅ GOOD: Same ID for every request from same user
accountId: user.email;

// ❌ BAD: Changes between requests
accountId: Math.random().toString();

// ❌ BAD: Different for same user
accountId: user.id; // different from user.email used elsewhere
```

### 3. Handle Missing Information Gracefully

```javascript
const userInfo = {};

if (user.email) {
  userInfo.accountId = user.email;
}

if (user.phoneNumber && isValidE164(user.phoneNumber)) {
  userInfo.phoneNumber = user.phoneNumber;
}

// Send even with partial information
const score = await createAssessment({
  token,
  recaptchaAction: "LOGIN",
  userInfo: Object.keys(userInfo).length > 0 ? userInfo : undefined,
});
```

### 4. Collect Phone Information

- Ask for phone during registration
- Verify via SMS/call
- Store in E.164 format
- Make it optional but encouraged

### 5. Privacy & GDPR

- Only send information user has provided
- Never collect phone without consent
- Include reCAPTCHA in privacy policy
- Allow users to opt-out if possible

## Scoring Recommendations with User Info

When sending user information, consider stricter thresholds:

| Action          | Without User Info | With User Info | Notes                          |
| --------------- | ----------------- | -------------- | ------------------------------ |
| LOGIN           | 0.5               | 0.4            | More accurate with account ID  |
| REGISTER        | 0.6               | 0.5            | Phone helps prevent fraud      |
| CHECKOUT        | 0.7               | 0.6            | Phone is key for payment fraud |
| FORGOT_PASSWORD | 0.5               | 0.4            | Account ID helps recovery      |
| CONTACT_FORM    | 0.5               | 0.5            | Phone helps identify abusers   |

## Monitoring & Analytics

### Track Score Distribution

```javascript
async function logAssessment(action, score, userInfo) {
  await AssessmentLog.create({
    action,
    score,
    hasAccountId: !!userInfo?.accountId,
    hasPhoneNumber: !!userInfo?.phoneNumber,
    timestamp: new Date(),
  });
}

// Usage
logAssessment("LOGIN", score, userInfo);
```

### Analyze Patterns

```javascript
// Query: Phone numbers with low scores
const suspiciousPhoneNumbers = await AssessmentLog.find({
  hasPhoneNumber: true,
  score: { $lt: 0.5 },
}).distinct("phoneNumber");

// Query: Most common fraudulent patterns
const patterns = await AssessmentLog.find({ score: { $lt: 0.3 } }).groupBy(
  "action",
);
```

## Troubleshooting

### Issue: Phone number rejected

**Solution**: Verify E.164 format is correct

```
✅ +11234567890
❌ 1-123-456-7890
❌ 123-456-7890
❌ +1 (123) 456-7890
```

### Issue: Score still low despite user info

**Solution**:

1. Check account ID consistency
2. Verify phone number is real (Google validates it)
3. Lower threshold may be appropriate

### Issue: User info not being sent

**Solution**: Check middleware configuration

```javascript
// Option 1: Explicitly send in request body
{ recaptchaToken, userInfo: { accountId, phoneNumber } }

// Option 2: Ensure auth middleware runs first
router.post('/login', authenticate, verifyRecaptcha('LOGIN'), loginController);

// Option 3: Check req.user has necessary fields
console.log(req.user); // Should have email and phoneNumber
```

## Security Considerations

1. **Never hash or encrypt** phone numbers before sending
2. **HTTPS only** - Always use secure connections
3. **Rate limit** - Implement rate limiting per account
4. **Monitor** - Watch for patterns of abuse
5. **Validate** - Server-side validation of phone format
6. **Privacy** - Encrypt phone in database separately

## Resources

- [Google reCAPTCHA Enterprise API Docs](https://cloud.google.com/recaptcha-enterprise/docs)
- [libphonenumber-js Documentation](https://github.com/catamphetamine/libphonenumber-js)
- [E.164 Standard](https://en.wikipedia.org/wiki/E.164)
- [OWASP Phone Number Validation Guide](https://owasp.org/www-community/attacks/OWASP_Validation_Regex_Repository)
