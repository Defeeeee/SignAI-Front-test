# SignAI - Sign Language Translator

This is a React application built with Vite, TypeScript, and TailwindCSS that provides sign language translation using AI.

## Prerequisites

Before running the application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14.x or higher recommended)
- npm (comes with Node.js) or [Yarn](https://yarnpkg.com/)

## Installation

Follow these steps to set up the project:

1. Clone the repository (if you haven't already):
   ```bash
   git clone <repository-url>
   cd project
   ```

2. Install dependencies:
   ```bash
   npm install
   # or if you use yarn
   yarn
   ```

## Running the Website

### Development Mode

To run the website in development mode with hot-reload:

```bash
npm run dev
# or if you use yarn
yarn dev
```

This will start the development server, and you can access the website at [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

To create a production build:

```bash
npm run build
# or if you use yarn
yarn build
```

This will generate optimized files in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
# or if you use yarn
yarn preview
```

This will serve the production build at [http://localhost:4173](http://localhost:4173) (or another port if 4173 is in use).

## Features

### Core Features
- Real-time sign language translation using AI
- Upload video files for translation
- Camera capture for live translation
- Responsive design for all devices

### Modern Enhancements
- **Performance Optimizations**:
  - Code splitting and lazy loading for better initial load times
  - Optimized component rendering
  - Efficient error handling with ErrorBoundary

- **Accessibility Features**:
  - High contrast mode for visually impaired users
  - Font size adjustment controls
  - Keyboard shortcuts for accessibility features (Alt+C, Alt++, Alt+-, Alt+0)
  - ARIA attributes for screen readers
  - Focus management for keyboard navigation

- **Production-Ready Features**:
  - Comprehensive SEO optimizations with meta tags
  - Social media sharing optimizations (Open Graph, Twitter Cards)
  - Analytics integration capability (Google Analytics, Plausible, Matomo)
  - Progressive Web App (PWA) support with manifest.json
  - Proper error boundaries for graceful error handling
  - API proxy configuration for CORS handling

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed correctly:
   ```bash
   npm install
   # or
   yarn
   ```

2. Clear your browser cache or try in incognito/private mode

3. Check browser console for any JavaScript errors

4. Ensure your camera permissions are enabled for the camera capture feature

5. If you see a white screen, check that the Cloudinary configuration is correct in both `src/components/VideoUpload.tsx` and `src/components/CameraCapture.tsx`

6. If you encounter CORS errors in production, make sure your proxy configuration is correctly set up as described in the "API Proxy Configuration" section

## Production Deployment

When deploying this application to production, consider the following:

### API Proxy Configuration

This application uses a proxy configuration to bypass CORS restrictions when making requests to the SignAI API. The proxy is configured in `vite.config.ts` and routes requests from `/api/*` to `https://signai.fdiaznem.com.ar/*`.

For production deployment, you have two options:

1. **Configure a server-side proxy**: Set up a proxy on your hosting server (e.g., Nginx, Apache) to forward requests from `/api/*` to the SignAI API.

2. **Use a CORS proxy service**: If you can't configure a server-side proxy, you can use a CORS proxy service like [cors-anywhere](https://github.com/Rob--W/cors-anywhere) or [CORS Proxy](https://cors-proxy.htmldriven.com/).

### Analytics Integration

The application includes an Analytics component that supports multiple analytics providers:

1. To enable Google Analytics, uncomment the Analytics component in `src/App.tsx` and add your Google Analytics measurement ID.
2. For Plausible or Matomo analytics, uncomment the respective configuration lines and add your domain or site ID.

### PWA Configuration

To fully enable PWA features:

1. Replace the placeholder icons in the `public` directory with your actual icons
2. Update the `manifest.json` file with your application's information
3. Consider implementing a service worker for offline support (not included by default)

### SEO Optimization

The application includes comprehensive SEO meta tags in `index.html`. Before deploying to production:

1. Update the canonical URL to your actual domain
2. Replace the placeholder Open Graph and Twitter Card image URLs with your actual images
3. Verify the structured data (JSON-LD) matches your application's purpose

### Security Considerations

The application includes several security enhancements:

1. **API Proxy**: The API proxy configuration helps protect your API keys and prevents direct access to the backend API.

2. **Content Security Policy**: Consider adding a Content Security Policy (CSP) to your server or in a meta tag in `index.html` to prevent XSS attacks.

3. **HTTPS**: Always deploy your production application with HTTPS to ensure secure data transmission.

4. **Environment Variables**: For additional API keys or sensitive configuration, use environment variables with `.env` files (requires additional setup with Vite).

5. **Input Validation**: The application includes basic input validation for file uploads, but consider adding more robust validation for production.

Example CSP meta tag to add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' https://signai.fdiaznem.com.ar https://api.cloudinary.com;">
```
