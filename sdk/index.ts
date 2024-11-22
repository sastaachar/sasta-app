import { EmbedConfig, setEmbedConfig } from "./embedConfig";

export const init = (config: EmbedConfig) => {
  setEmbedConfig(config);
};

export { LiveboardEmbed } from "./LiveboardEmbed";
