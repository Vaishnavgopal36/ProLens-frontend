declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

interface ImportMetaEnv {
  /** ws(s):// base of the discussion WebSocket server. Unset => mock transport. */
  readonly VITE_API_WS_BASE?: string;
}
