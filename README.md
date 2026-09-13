# Forge planner

Open `index.html` in your browser. No installation or internet required. Keep `index.html`, `style.css`, `data.js`, and `app.js` together.

## Cash and hammer targets

Forge Level is the completed level. Level 20 means the next upgrade is 20 -> 21.

- Cash for next unpaid upgrade: at level 20, Not started reserves the price of level 21. Started means level 21 is paid and reserves the price of level 22 instead. The displayed label identifies the upgrade.
- Hammers for remaining upgrades: costs after the cash-reserved level, plus remaining ascension costs, minus projected gold and hammer income only during upgrades after the cash-reserved upgrade finishes. Convert to hammers, round up, and floor at zero.
- Starting can lower the hammer target because the next unpaid upgrade moves into the cash target. Both targets must be considered. No payment cost disappears: it is either already paid, reserved as cash, or included in the hammer projection.

Not started has no running timer and includes the full next upgrade duration in the projection. Started uses the entered time remaining plus every later duration. The countdown reduces total time to max but leaves the cash and hammer targets unchanged. Income during the current and cash-reserved upgrades is excluded from the hammer forecast: it helps users accumulate those targets. It never credits earned resources. There is no Gold in Bank input; previous stored bank values and automatic earnings are ignored.

Enter a duration such as `2d 3h 15m`. Pause/resume is available. Timers survive reloads. Change Forge Level after collecting an upgrade; this clears the previous timer. Inputs and timers are saved in this browser. Restore defaults resets both.

The projection assumes continuous upgrades and the specified average income rates. Waiting before starting and existing resources are not modeled. Aggregate resources do not guarantee enough gold at each intermediate payment.

Max Level affects gold per hammer only. The lookup table runs through forge level 140. Ascension adds 3,000,000 per remaining ascension up to three. Hammer Thief Hammers is added directly to daily hammer income.

Open `test-app.html` to run regression checks. Its storage is isolated from the app.
