process.env.JWT_ACCESS_SECRET = 'test-only-secret-with-more-than-32-characters';
process.env.FRONTEND_ORIGINS = 'http://localhost:3000';
process.env.JWT_ACCESS_TTL_SECONDS = '900';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:65432/ayucare_test';
