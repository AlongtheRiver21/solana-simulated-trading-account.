# Solana Simulated Trading Account

Independent, mobile-friendly practice application. **No real prices, blockchain access, exchange API, private keys, wallet connection, deposits, withdrawals or actual trades.** Existing Solana Paper Trading Desk is untouched.

## Features
- £500 virtual starting account, fictional DEMO/MOON/TUCK tokens.
- Virtual cash deducted on buy; equity tracks cash plus open-position market value.
- Virtual sell, trade journal, browser-local storage.
- 40% equity cap per position; 0.5% assumed slippage per side (below 2% limit), −6% stop threshold, daily 4% realised-loss block for new buys.
- Fictional random price updates by pressing a button or every 3 seconds when activated.

## GitHub repository setup on iPhone
1. In GitHub, select + → New repository; name it `solana-simulated-trading-account` and create it (public if using free GitHub Pages).
2. Extract the supplied ZIP in the iPhone Files app, then add `index.html`, `style.css`, `app.js`, and `README.md` to your repository **root**. You may add files individually in Safari.
3. To publish in GitHub Pages, open repository Settings → Pages → Deploy from branch → main → /(root) → Save. You can then visit `https://YOUR-USERNAME.github.io/solana-simulated-trading-account/`.
4. The website works in Safari on your iPhone and uses browser-local storage; it does not sync between devices.

## Limits
Prices are imaginary, not live Solana prices. The page must stay open for automatic price changes and stop checks. Stops can fill below −6% on jumps; no guarantee of a maximum loss. Local browser data can be lost. This is a training tool, not investment advice.
