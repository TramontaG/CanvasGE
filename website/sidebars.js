/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  defaultSidebar: [
    "intro",
    "getting-started",
    {
      type: "category",
      label: "Core concepts",
      items: [
        "concepts/game-loop",
        "concepts/scenes",
        "concepts/game-objects",
        "concepts/events",
        "concepts/saves",
        "concepts/rendering",
        "concepts/audio",
      ],
    },
  ],
};

module.exports = sidebars;
