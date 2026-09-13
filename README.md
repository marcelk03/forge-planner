# Forge planner

Open `index.html` in your browser. No installation or internet required. Keep `index.html`, `style.css`, `data.js`, and `app.js` together.

## Cash and hammer targets

Forge Level is the completed level.

- Cash reserves the next unpaid upgrade. Marking an upgrade Started treats it as paid and moves the cash target to the following upgrade.
- Hammers cover later upgrades and remaining ascensions, minus projected gold and hammer income before the final payment. The target rounds up to whole hammers, with a minimum of zero.
- Both targets are needed. Marking an upgrade Started moves costs between them.

The forecast includes income during the current and cash-reserved upgrades. The countdown reduces time remaining but leaves resource targets fixed; it does not track earned resources.

Enter a duration such as `2d 3h 15m`. Pause/resume is available. Timers survive reloads. Change Forge Level after collecting an upgrade; this clears the previous timer. Inputs and timers are saved in this browser. Restore defaults resets both.

The projection assumes continuous upgrades and average income. It includes the final upgrade payment but excludes that upgrade's duration and income. Existing resources and waiting before starting are not modeled.
