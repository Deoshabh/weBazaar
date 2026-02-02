// Setup for backend tests
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
process.env.MONGODB_URI = "mongodb://localhost:27017/radeo-test";
