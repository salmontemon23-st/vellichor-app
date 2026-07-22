export type DocsNavItem = { href: string; label: string };
export type DocsNavGroup = { title: string; items: DocsNavItem[] };

export const DOCS_NAV: DocsNavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/docs", label: "What is Vellichor?" },
      { href: "/docs/quickstart", label: "Quickstart" },
    ],
  },
  {
    title: "Product",
    items: [
      { href: "/docs/vault-units", label: "How Vault Units work" },
      { href: "/docs/vault", label: "The Vault" },
      { href: "/docs/market", label: "The Market" },
      { href: "/docs/redemption", label: "Redemption" },
    ],
  },
  {
    title: "Token",
    items: [
      { href: "/docs/vell-token", label: "$VELL token" },
      { href: "/docs/revenue-flywheel", label: "Revenue Flywheel" },
    ],
  },
  {
    title: "Reference",
    items: [
      { href: "/docs/contracts", label: "Contract addresses" },
      { href: "/docs/architecture", label: "Architecture" },
      { href: "/docs/security", label: "Security & audits" },
      { href: "/docs/faq", label: "FAQ" },
      { href: "/docs/glossary", label: "Glossary" },
    ],
  },
];

export const DOCS_NAV_FLAT: DocsNavItem[] = DOCS_NAV.flatMap((group) => group.items);
