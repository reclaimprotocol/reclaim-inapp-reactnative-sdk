/**
 * Fallback types for `./.env.json`.
 *
 * That file holds real app credentials, so it is gitignored - duplicate
 * `.env.example.json` to `.env.json` to create it. It therefore does not exist
 * on a fresh checkout, and `yarn typecheck` would otherwise fail in CI with
 * TS2307 for a file that is intentionally absent.
 *
 * This wildcard declaration is only consulted when normal module resolution
 * finds nothing, so a real `.env.json` still takes precedence locally. Keep the
 * keys here in sync with `.env.example.json`.
 */
declare module '*/.env.json' {
  const config: {
    REACT_APP_RECLAIM_APP_ID: string;
    REACT_APP_RECLAIM_APP_SECRET: string;
    REACT_APP_RECLAIM_CAPABILITY_ACCESS_TOKEN: string;
  };
  export default config;
}
