# CampusHub: Campus Life Super App

CampusHub puts everyday student needs in one place: campus events, dining hall hours and menus, and an interactive campus map.

**Status:** MVP (Unit 12). Some data is placeholder sample data.

## Live site
https://YOUR-USERNAME.github.io/campus-life-super-app/

## Features
- **Home:** live clock and greeting, campus weather (API), dining countdown, upcoming events
- **Events:** search, category filter, save events with ★ (saved in localStorage)
- **Dining:** open/closed status for each hall, meal tabs, dietary filters, random meal idea (API)
- **Map:** interactive map with pins, category filters, and a clickable location list
- Dark mode toggle that remembers your choice

## Technologies
- HTML5 (semantic), CSS3, Bootstrap 5
- JavaScript (event listeners, fetch, localStorage)
- APIs: [Open-Meteo](https://open-meteo.com/) (weather), [TheMealDB](https://www.themealdb.com/api.php) (meals), [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) (map)
- Deployed with GitHub Pages

## Setup
1. Clone the repo: `git clone https://github.com/kalhel96/campus-life-super-app.git'
2. Open `index.html` in a browser (or use the VS Code Live Server extension).

No API keys are needed.

## Future improvements
- Move events, menus, and locations into JSON files
- Monthly calendar view on the Events page
- Real campus building coordinates and dining menus
- "View on Map" buttons that open the map on the exact building
