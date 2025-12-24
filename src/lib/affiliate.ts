export type AffiliateNetwork = "amazon" | "awin" | "impact" | "clickbank" | "jvzoo" | "ebay" | "other";

export function getAffiliateAttrs() {
  return {
    target: "_blank",
    rel: "nofollow sponsored noopener noreferrer"
  };
}

export function buildAffiliateUrl({ network, url, campaign, label }:{ network: AffiliateNetwork, url: string, campaign?: string, label?: string }) {
  // For now, just return the url unchanged. Extend for tracking later.
  return url;
}
