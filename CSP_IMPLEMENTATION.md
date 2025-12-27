# Content Security Policy (CSP) Implementation

**Date**: December 27, 2024
**Version**: v0.1.1-beta.1+

## Overview

Implemented Content Security Policy headers to enhance security in production builds while maintaining development flexibility.

## Implementation Details

### Location
[src/main.ts:564-586](src/main.ts#L564)

### Strategy
- **Development Mode**: CSP is **disabled** to allow Vite's Hot Module Replacement (HMR) which requires `unsafe-eval`
- **Production Mode**: Strict CSP is **enforced** when app is packaged

### CSP Directives

```javascript
"default-src 'self'"; // Only load resources from app's origin
"script-src 'self'"; // Only execute scripts from app's origin
"style-src 'self' 'unsafe-inline'"; // Ant Design requires inline styles
"img-src 'self' data: https:"; // Allow images from app, data URIs, and HTTPS
"font-src 'self' data:"; // Allow fonts from app and data URIs
"connect-src 'self' ws: wss: http: https:"; // Allow Home Assistant WebSocket connections
"worker-src 'self' blob:"; // Monaco Editor web workers
"child-src 'self' blob:"; // Monaco Editor web workers
```

## Directive Explanations

### `default-src 'self'`
**Why**: Sets the default policy - only load resources from the app's origin
**Security**: Prevents loading resources from external domains unless explicitly allowed

### `script-src 'self'`
**Why**: Only execute JavaScript from the app bundle
**Security**: Prevents XSS attacks by blocking inline scripts and external script sources
**No `unsafe-eval`**: Production build doesn't need dynamic code evaluation

### `style-src 'self' 'unsafe-inline'`
**Why**: Ant Design generates inline styles dynamically
**Security Trade-off**:
- ✅ Required for Ant Design's theming system
- ⚠️ Allows inline `<style>` tags
- ✅ Still blocks external stylesheets

### `img-src 'self' data: https:`
**Why**:
- `self` - App's bundled images
- `data:` - Base64-encoded images (used by some cards)
- `https:` - External images from Home Assistant entities (e.g., camera feeds, person avatars)

**Security**: Blocks `http:` images, requires HTTPS for external sources

### `font-src 'self' data:`
**Why**:
- `self` - Bundled fonts (Ant Design icons)
- `data:` - Base64-encoded fonts

### `connect-src 'self' ws: wss: http: https:`
**Why**: Home Assistant WebSocket connections
- `ws:` / `wss:` - WebSocket protocols for HA connection
- `http:` / `https:` - REST API calls to Home Assistant
- `self` - App's own API calls

**Security Note**: This is permissive to allow connection to any Home Assistant instance (local or remote)

**Future Improvement**: Could be restricted if user's HA URL is known:
```javascript
`connect-src 'self' ws://${haHost} wss://${haHost} http://${haHost} https://${haHost}`
```

### `worker-src 'self' blob:`
**Why**: Monaco Editor uses Web Workers for syntax highlighting and language services
- `self` - Worker scripts from app bundle
- `blob:` - Dynamically created workers (Monaco requirement)

### `child-src 'self' blob:`
**Why**: Legacy directive for worker support (some browsers)
**Note**: Modern browsers use `worker-src`, but `child-src` provides fallback

## Development vs Production

### Development (`npm start`)
```javascript
if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  // CSP is NOT set
  // Vite's HMR requires 'unsafe-eval'
}
```

**Console Warning**:
```
Electron Security Warning (Insecure Content-Security-Policy)
This warning will not show up once the app is packaged.
```

### Production (`npm run make`)
```javascript
if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  // CSP is enforced via webRequest.onHeadersReceived
}
```

**Result**: No CSP warning, strict security policy enforced

## Testing CSP

### Test Production Build
```bash
npm run package
# or
npm run make
```

### Verify CSP in DevTools
1. Open packaged app
2. Open DevTools (if enabled)
3. Go to Console
4. Look for CSP violations (should be none)
5. Check Network tab → Headers → Response Headers → `Content-Security-Policy`

### Expected Behavior

#### ✅ Should Work:
- Ant Design components with inline styles
- Monaco Editor with web workers
- Home Assistant WebSocket connections
- Images from HA (cameras, avatars)
- App's bundled resources

#### ❌ Should Be Blocked:
- External JavaScript files
- Inline `<script>` tags
- `eval()` and `Function()` calls
- Connections to unauthorized domains (except HA)

## Security Benefits

1. **XSS Protection**: Blocks inline scripts and external JavaScript
2. **Data Injection**: Prevents unauthorized data sources
3. **Clickjacking**: Restricts iframe embedding
4. **Resource Loading**: Controls what resources can be loaded

## Known Limitations

### `style-src 'unsafe-inline'`
- **Why Needed**: Ant Design's dynamic theming
- **Risk**: Allows inline styles (low risk)
- **Mitigation**: Still blocks external stylesheets

### `connect-src` Wildcards
- **Why Needed**: Users connect to any HA instance
- **Risk**: App can connect to any server
- **Mitigation**: Connection requires user-provided credentials
- **Future**: Could restrict to user's configured HA URL

## Future Enhancements

### 1. Dynamic CSP Based on HA URL
```javascript
const haUrl = settingsService.getHAUrl();
if (haUrl) {
  const { protocol, host } = new URL(haUrl);
  connectSrc = `'self' ${protocol}//${host} ws://${host} wss://${host}`;
}
```

### 2. Nonce-based Styles (Replace `unsafe-inline`)
```javascript
const nonce = crypto.randomBytes(16).toString('base64');
"style-src 'self' 'nonce-${nonce}'"
```
Then inject nonce into Ant Design's config.

### 3. Report-Only Mode
```javascript
'Content-Security-Policy-Report-Only': [...]
```
Test CSP without breaking functionality.

### 4. CSP Reporting Endpoint
```javascript
"report-uri /csp-report"
```
Log CSP violations for debugging.

## References

- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

## Changelog

**v0.1.1-beta.1+** (December 27, 2024)
- ✅ Initial CSP implementation
- ✅ Development mode exempt (Vite HMR compatibility)
- ✅ Production mode enforced
- ✅ Tested with Ant Design, Monaco Editor, and HA WebSocket
- ✅ Removed CDN stylesheet for Material Design Icons
- ✅ Bundled @mdi/font locally for CSP compliance

**Material Design Icons Migration**:
- **Before**: Loaded from `cdn.jsdelivr.net` (blocked by CSP)
- **After**: Bundled locally via `@mdi/font` npm package
- **Files Changed**:
  - [index.html](index.html) - Removed CDN link
  - [src/renderer.tsx](src/renderer.tsx#L12) - Added local import
  - [package.json](package.json) - Added `@mdi/font` dependency

---

**Status**: ✅ Implemented and tested
**Security Level**: High (with documented trade-offs)
**Maintenance**: Review CSP after major dependency updates
