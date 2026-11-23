// Where OmniSearch is shown: the popup it opens as, a pane beside the terminals, or a tab of its own.

export const PLACEMENTS = [
  { key: "popup", label: "Popup", about: "Float over the window" },
  { key: "pane", label: "Pane", about: "Keep it beside the terminals" },
  { key: "tab", label: "Tab", about: "Give it a tab of its own" },
];

/**
 * This copy's placement, from its props ({overlay, pane}), Herdr's panes and the tab it was opened over.
 * A pane outside that tab, or alone in its tab, is a tab.
 */
export function placementOf(p, panes, origin) {
  if (p?.overlay) return "popup";
  const mine = panes.find((x) => x.pane === p?.pane);
  if (!mine) return "pane";
  return mine.tab !== origin || panes.filter((x) => x.tab === mine.tab).length === 1 ? "tab" : "pane";
}
