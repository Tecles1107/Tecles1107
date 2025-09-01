import helmet from 'helmet';

export const securityHeaders = () =>
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"]
      }
    },
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'sameorigin' },
    xssFilter: true
  });
