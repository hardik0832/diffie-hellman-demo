# Diffie-Hellman Demo (React + MUI)

An interactive Diffie-Hellman key exchange demonstration built with React, TypeScript, and Material UI. It includes:
- Two-party key exchange (Alice & Bob)
- Optional toy encryption demo using the derived shared secret
- Simple attack simulation (Eve) to visualize security intuition

## Getting started
```bash
npm install
npm start
```
App runs at http://localhost:3000.

## Tests
```bash
npm test
```

## Tech
- React 19, CRA 5 (react-scripts)
- TypeScript
- Material UI v7

## Notes
- Numbers are intentionally small for education. Real-world use requires large safe primes and secure parameters.
- PWA scaffolding is present; enable by switching to `serviceWorkerRegistration.register()` in `src/index.tsx`.