# My Shopping List

A phone-friendly shopping list with quantities in kg, litre or pcs.
No login. The list is saved on the server in `data/list.json`.

## Run it on your computer
1. Install Node.js (18 or newer) from https://nodejs.org
2. In this folder run:
   ```
   npm install
   npm start
   ```
3. Open http://localhost:3000
   (On a phone on the same Wi-Fi: `http://<computer-IP>:3000`)

## Put it online
Use a Node host such as Render.com or Railway.app:
- Build command: `npm install`   Start command: `npm start`
- Add a persistent disk (e.g. mounted at `/data`) and set `DATA_DIR=/data`,
  otherwise free hosts erase the list when they restart.
- Open the URL on the phone and choose "Add to Home Screen".

Anyone with the URL can edit the list, so keep the link private.
