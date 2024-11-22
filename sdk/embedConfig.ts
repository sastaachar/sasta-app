export type EmbedConfig = {
  host: string;
  authType: "TrustedAuthCookieless";
  getAuthToken?: () => Promise<string>;
};
let embedConfig: EmbedConfig | null = null;
const setEmbedConfig = (newConfig: EmbedConfig) => {
  embedConfig = newConfig;
};
const getEmbedConfig = () => embedConfig;
export { embedConfig, setEmbedConfig, getEmbedConfig };

export const AppUrl = "http://localhost:8080";
