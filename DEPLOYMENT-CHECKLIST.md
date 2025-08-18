# Production Deployment Checklist

## Pre-Deployment

### 1. Environment Configuration
- [ ] Copy `.env.production.example` to `.env`
- [ ] Update `VITE_API_URL` to your production API endpoint
- [ ] Ensure `VITE_USE_MOCK_DATA` is set to `false`
- [ ] Verify all environment variables are properly set

### 2. Build Verification
- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors
- [ ] No console.log statements in production code
- [ ] Bundle size is optimized (currently ~1.7MB)

### 3. Security
- [ ] API endpoints use HTTPS
- [ ] Environment variables don't contain sensitive data
- [ ] Error boundaries properly handle errors without exposing sensitive information
- [ ] 2FA is enabled for admin and therapist accounts

### 4. Testing
- [ ] All critical user flows tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked (Chrome, Firefox, Safari, Edge)
- [ ] Loading states and error states display correctly
- [ ] Empty states have appropriate messages

## Deployment

### 1. Server Configuration
- [ ] Configure web server (nginx/Apache) to serve SPA correctly
- [ ] Set up proper security headers (CSP, X-Frame-Options, etc.)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure CORS if frontend and backend are on different domains

### 2. Build & Deploy
```bash
# Install dependencies
npm ci --production

# Build for production
npm run build

# Deploy dist/ folder to your web server
```

### 3. Post-Deployment
- [ ] Verify application loads correctly
- [ ] Test authentication flow
- [ ] Check API connectivity
- [ ] Monitor error logs
- [ ] Test critical user journeys

## Netlify Deployment (if using Netlify)

### 1. Create `netlify.toml` in project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 2. Environment Variables in Netlify
- Set `VITE_API_URL` to your production API
- Set `VITE_USE_MOCK_DATA` to `false`

## Performance Optimization

1. **Code Splitting**: Consider implementing lazy loading for routes
2. **Image Optimization**: Compress and optimize all images
3. **Caching**: Configure proper cache headers
4. **CDN**: Use a CDN for static assets

## Monitoring

1. **Error Tracking**: Set up error tracking (e.g., Sentry)
2. **Analytics**: Implement analytics if needed
3. **Performance Monitoring**: Monitor Core Web Vitals
4. **Uptime Monitoring**: Set up uptime monitoring for both frontend and API

## Rollback Plan

1. Keep previous build artifacts
2. Document deployment version/commit hash
3. Have a rollback procedure ready
4. Test rollback procedure in staging

## Notes

- The application uses role-based routing and authentication
- Ensure the backend API is properly configured and accessible
- The frontend expects specific API response formats as defined in the services
- All API calls go through the centralized `realApiService`