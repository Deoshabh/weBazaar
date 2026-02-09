/**
 * Example usage of reCAPTCHA Enterprise API
 * This demonstrates how to use the createAssessment function directly
 * Following Google's official implementation pattern
 */

const { createAssessment } = require("./middleware/recaptcha");

/**
 * Example 1: Basic usage with all parameters
 */
async function exampleBasicUsage() {
  const score = await createAssessment({
    projectID: "radeo-2026",
    recaptchaKey: "6LcbjmUsAAAAAHVeGta063p2ii-OlYGQqOBPfmQl",
    token: "token-received-from-client",
    recaptchaAction: "LOGIN",
  });

  if (score !== null) {
    console.log(`Assessment successful! Score: ${score}`);

    // Decision logic based on score
    if (score >= 0.7) {
      console.log("✅ High confidence - allow action");
    } else if (score >= 0.5) {
      console.log("⚠️  Medium confidence - proceed with caution");
    } else {
      console.log("❌ Low confidence - block or challenge user");
    }
  } else {
    console.log("❌ Assessment failed");
  }
}

/**
 * Example 2: Using environment variables (recommended)
 */
async function exampleWithEnvVars(token, action) {
  // Uses GOOGLE_CLOUD_PROJECT_ID and RECAPTCHA_SITE_KEY from .env
  const score = await createAssessment({
    token: token,
    recaptchaAction: action,
  });

  return score;
}

/**
 * Example 3: Integration in an Express route
 */
async function exampleExpressRoute(req, res) {
  const { recaptchaToken } = req.body;

  const score = await createAssessment({
    token: recaptchaToken,
    recaptchaAction: "CHECKOUT",
  });

  if (score === null) {
    return res.status(400).json({
      success: false,
      message: "reCAPTCHA verification failed",
    });
  }

  if (score < 0.5) {
    return res.status(403).json({
      success: false,
      message: "Security check failed",
      score: score,
    });
  }

  // Proceed with the actual business logic
  return res.json({
    success: true,
    message: "Verification passed",
    score: score,
  });
}

/**
 * Example 4: Different actions with different thresholds
 */
async function exampleActionBasedThresholds(token, action) {
  const score = await createAssessment({
    token: token,
    recaptchaAction: action,
  });

  if (score === null) {
    return { allowed: false, reason: "Verification failed" };
  }

  // Define thresholds per action
  const thresholds = {
    LOGIN: 0.5, // Balanced
    REGISTER: 0.6, // Stricter for new accounts
    CHECKOUT: 0.7, // Very strict for payments
    ADD_TO_CART: 0.3, // Lenient for browsing
    CONTACT_FORM: 0.5, // Balanced
  };

  const threshold = thresholds[action] || 0.5;

  if (score >= threshold) {
    return {
      allowed: true,
      score: score,
      threshold: threshold,
    };
  } else {
    return {
      allowed: false,
      reason: "Score below threshold",
      score: score,
      threshold: threshold,
    };
  }
}

/**
 * Example 5: Async/await with try-catch
 */
async function exampleWithErrorHandling(token, action) {
  try {
    const score = await createAssessment({
      token: token,
      recaptchaAction: action,
    });

    if (score === null) {
      throw new Error("Assessment returned null");
    }

    return {
      success: true,
      score: score,
    };
  } catch (error) {
    console.error("reCAPTCHA assessment error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Example 6: Using account identifiers for better bot detection
 * Sends unique user identifier to improve assessment accuracy
 */
async function exampleWithAccountId(token, action, userEmail) {
  const score = await createAssessment({
    token: token,
    recaptchaAction: action,
    userInfo: {
      accountId: userEmail, // Can be email, username, or user ID
    },
  });

  return score;
}

/**
 * Example 7: Using phone number for enhanced verification
 * Phone number must be in E.164 format (e.g., +1234567890)
 */
async function exampleWithPhoneNumber(token, action, phoneNumber) {
  const score = await createAssessment({
    token: token,
    recaptchaAction: action,
    userInfo: {
      accountId: "user@example.com",
      phoneNumber: phoneNumber, // Must be E.164 format: +<country><number>
    },
  });

  return score;
}

/**
 * Example 8: Complete user assessment with all available data
 * Provides maximum context for accurate bot detection
 */
async function exampleWithCompleteUserInfo(token, action, user) {
  const score = await createAssessment({
    token: token,
    recaptchaAction: action,
    userInfo: {
      // Unique account identifier - use most stable identifier
      accountId: user.email || user.username || user.id,
      // Phone number in E.164 format (optional but recommended)
      phoneNumber: user.phoneNumber, // e.g., "+11234567890"
    },
  });

  return score;
}

/**
 * Example 9: Login flow with user information
 * Typical authentication endpoint with reCAPTCHA and user data
 */
async function exampleLoginWithReCAPTCHA(req, res) {
  const { email, password, recaptchaToken } = req.body;

  try {
    // Verify user exists (pseudo code)
    const user = await User.findOne({ email });
    if (!user) {
      // Still verify reCAPTCHA even for non-existent accounts to detect patterns
      await createAssessment({
        token: recaptchaToken,
        recaptchaAction: "LOGIN",
        userInfo: {
          accountId: email,
        },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify reCAPTCHA with account information
    const score = await createAssessment({
      token: recaptchaToken,
      recaptchaAction: "LOGIN",
      userInfo: {
        accountId: user.email,
        phoneNumber: user.phoneNumber, // If available
      },
    });

    if (score === null || score < 0.5) {
      return res.status(403).json({
        message: "Security check failed. Please try again later.",
        score: score,
      });
    }

    // Verify password and continue with login
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Login successful
    const token = generateToken(user);
    return res.json({
      success: true,
      user,
      token,
      score, // For analytics
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Example 10: Registration flow with phone verification
 * New account creation with enhanced fraud detection
 */
async function exampleRegistrationWithPhoneNumber(req, res) {
  const { email, password, phoneNumber, recaptchaToken } = req.body;

  try {
    // Verify reCAPTCHA with account information
    const score = await createAssessment({
      token: recaptchaToken,
      recaptchaAction: "REGISTER",
      userInfo: {
        accountId: email,
        phoneNumber: phoneNumber, // E.164 format: +11234567890
      },
    });

    if (score === null || score < 0.6) {
      return res.status(403).json({
        message: "Account creation blocked by security checks",
        score: score,
      });
    }

    // Create user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash: hashedPassword,
      phoneNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
      score, // For analytics
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Export examples for testing
module.exports = {
  exampleBasicUsage,
  exampleWithEnvVars,
  exampleExpressRoute,
  exampleActionBasedThresholds,
  exampleWithErrorHandling,
  exampleWithAccountId,
  exampleWithPhoneNumber,
  exampleWithCompleteUserInfo,
  exampleLoginWithReCAPTCHA,
  exampleRegistrationWithPhoneNumber,
};

/**
 * USAGE IN YOUR CODE:
 *
 * Option 1: Use createAssessment directly (Google's pattern)
 * const { createAssessment } = require('./middleware/recaptcha');
 * const score = await createAssessment({ token, recaptchaAction: 'LOGIN' });
 *
 * Option 2: Use createAssessment with user information
 * const score = await createAssessment({
 *   token,
 *   recaptchaAction: 'LOGIN',
 *   userInfo: {
 *     accountId: user.email,        // Unique identifier (email, username, ID, etc.)
 *     phoneNumber: user.phoneNumber // Optional: E.164 format (+1234567890)
 *   }
 * });
 *
 * Option 3: Use verifyRecaptcha middleware (our wrapper)
 * const { verifyRecaptcha } = require('./middleware/recaptcha');
 * router.post('/login', verifyRecaptcha('LOGIN', 0.5), loginController);
 * // Automatically extracts userInfo from req.user or req.body.userInfo
 *
 * Option 4: Use verifyRecaptchaToken for custom logic
 * const { verifyRecaptchaToken } = require('./middleware/recaptcha');
 * const result = await verifyRecaptchaToken(
 *   token,
 *   'LOGIN',
 *   0.5,
 *   {
 *     accountId: user.email,
 *     phoneNumber: user.phoneNumber
 *   }
 * );
 * if (result.success) { ... }
 *
 * Phone Number Format:
 * - Must be in E.164 format: +<country_code><number>
 * - Examples:
 *   - US: +11234567890
 *   - UK: +441234567890
 *   - India: +919876543210
 *   - Canada: +14165551234
 *
 * Account ID Guidelines:
 * - Use most stable identifier (email, username, or user ID)
 * - Must be consistent across requests for same user
 * - Used to detect patterns of abuse
 *
 * reCAPTCHA Scores & Actions:
 * - LOGIN: 0.5 (balanced)
 * - REGISTER: 0.6 (stricter - prevent account farming)
 * - CHECKOUT: 0.7 (very strict - prevent payment fraud)
 * - ADD_TO_CART: 0.3 (lenient - browsing action)
 * - FORGOT_PASSWORD: 0.5 (balanced security)
 * - CONTACT_FORM: 0.5 (balanced)
 */
