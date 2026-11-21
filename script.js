/* ===================================================
   CampusHub script.js
   One file shared by all pages. Each page has a
   data-page attribute on <body>, so we only run the
   code that page needs.
   =================================================== */

// ----- Campus location (used for weather and the map) -----
// Placeholder coordinates near Belmont, NC. Change to your campus.
const CAMPUS_LAT = 35.2606;
const CAMPUS_LON = -81.0420;

// ----- Sample data (MVP placeholders; will move to JSON files later) -----
const events = [
  { id: 1, title: "Club Fair", category: "Clubs", date: "2026-12-01", time: "11:00 AM", place: "Student Center" },
  { id: 2, title: "Basketball Home Game", category: "Sports", date: "2026-12-03", time: "7:00 PM", place: "Gym" },
  { id: 3, title: "Finals Study Night", category: "Academic", date: "2026-12-05", time: "6:00 PM", place: "Library" },
  { id: 4, title: "Holiday Movie Night", category: "Social", date: "2026-12-08", time: "8:00 PM", place: "Student Center" },
  { id: 5, title: "Coding Club Meetup", category: "Clubs", date: "2026-12-10", time: "5:30 PM", place: "Library" },
  { id: 6, title: "Career Workshop", category: "Academic", date: "2026-12-12", time: "2:00 PM", place: "Student Center" }
];

// Dining halls with opening hours (24-hour clock)
const halls = [
  { name: "Main Dining Hall", open: 7, close: 20 },
  { name: "Campus Cafe", open: 8, close: 15 },
  { name: "Late Night Grill", open: 18, close: 23 }
];

// Menu items by meal. Tags: V = vegetarian, GF = gluten-free, H = halal
const menu = {
  breakfast: [
    { item: "Scrambled eggs", tags: ["V", "GF"] },
    { item: "Pancakes", tags: ["V"] },
    { item: "Turkey sausage", tags: ["GF", "H"] }
  ],
  lunch: [
    { item: "Grilled chicken wrap", tags: ["H"] },
    { item: "Veggie pasta", tags: ["V"] },
    { item: "Garden salad", tags: ["V", "GF"] }
  ],
  dinner: [
    { item: "Beef stir fry", tags: ["GF", "H"] },
    { item: "Cheese pizza", tags: ["V"] },
    { item: "Rice and lentils", tags: ["V", "GF", "H"] }
  ]
};

// Campus map locations (placeholder positions near the campus center)
const locations = [
  { name: "Main Dining Hall", category: "Dining", lat: 35.2612, lon: -81.0428 },
  { name: "Campus Cafe", category: "Dining", lat: 35.2600, lon: -81.0411 },
  { name: "Library", category: "Study", lat: 35.2604, lon: -81.0433 },
  { name: "Student Center", category: "Events", lat: 35.2598, lon: -81.0425 },
  { name: "Gym", category: "Events", lat: 35.2616, lon: -81.0410 }
];

/* ===================================================
   SHARED: dark mode toggle (runs on every page)
   The choice is saved in localStorage.
   =================================================== */
function setupThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    btn.textContent = "Light mode";
  }
  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    btn.textContent = isDark ? "Light mode" : "Dark mode";
  });
}

/* ===================================================
   HOME PAGE
   =================================================== */

// Live clock and greeting, updated every second
function startClock() {
  const clock = document.getElementById("clock");
  const greeting = document.getElementById("greeting");
  function tick() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
    const h = now.getHours();
    const part = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
    greeting.textContent = `Good ${part}, student!`;
  }
  tick();
  setInterval(tick, 1000);
}

// API #1: Open-Meteo weather (free, no API key needed)
async function loadWeather() {
  const box = document.getElementById("weather");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${CAMPUS_LAT}&longitude=${CAMPUS_LON}&current=temperature_2m,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather request failed");
    const data = await res.json();
    const c = data.current;
    box.innerHTML = `<p class="display-6 mb-1">${Math.round(c.temperature_2m)}°F</p>
                     <p class="mb-0">Wind: ${Math.round(c.wind_speed_10m)} mph</p>`;
  } catch (err) {
    box.textContent = "Weather is unavailable right now.";
    console.error(err);
  }
}

// Countdown to the next dining hall opening (uses the halls array)
function showMealCountdown() {
  const el = document.getElementById("mealCountdown");
  const hour = new Date().getHours();
  const openNow = halls.filter(h => hour >= h.open && hour < h.close);
  if (openNow.length > 0) {
    el.textContent = `${openNow.length} dining location(s) open right now, including ${openNow[0].name}.`;
  } else {
    const next = halls.find(h => h.open > hour) || halls[0];
    el.textContent = `All halls are closed. ${next.name} opens at ${next.open}:00.`;
  }
}

// Show the next 3 events in the "Upcoming events" list
function showUpcoming() {
  const list = document.getElementById("upcomingList");
  events.slice(0, 3).forEach(ev => {
    const li = document.createElement("li");
    li.className = "list-group-item bg-transparent";
    li.innerHTML = `<a href="events.html">${ev.title}</a> · ${ev.date} at ${ev.time} · ${ev.place}`;
    list.appendChild(li);
  });
}

/* ===================================================
   EVENTS PAGE
   =================================================== */

// Saved event ids live in localStorage
function getSaved() {
  return JSON.parse(localStorage.getItem("savedEvents") || "[]");
}

function renderEvents() {
  const grid = document.getElementById("eventGrid");
  const search = document.getElementById("eventSearch").value.toLowerCase();
  const cat = document.getElementById("categoryFilter").value;
  const saved = getSaved();

  // Filter by search text and category
  const shown = events.filter(ev =>
    ev.title.toLowerCase().includes(search) && (cat === "all" || ev.category === cat)
  );

  grid.innerHTML = "";
  shown.forEach(ev => {
    const isSaved = saved.includes(ev.id);
    grid.innerHTML += `
      <div class="col-sm-6 col-xl-4">
        <div class="card h-100 event-card">
          <div class="card-body">
            <span class="badge bg-secondary mb-2">${ev.category}</span>
            <h2 class="h6">${ev.title}</h2>
            <p class="small mb-2">${ev.date} · ${ev.time}<br>${ev.place}</p>
            <button class="btn btn-sm btn-outline-dark save-btn ${isSaved ? "saved" : ""}" data-id="${ev.id}"
                    aria-label="Save ${ev.title}">${isSaved ? "★ Saved" : "☆ Save"}</button>
            <a class="btn btn-sm btn-campus" href="map.html">View on Map</a>
          </div>
        </div>
      </div>`;
  });

  document.getElementById("noResults").classList.toggle("d-none", shown.length > 0);
  renderSaved();
}

function renderSaved() {
  const list = document.getElementById("savedList");
  const saved = getSaved();
  list.innerHTML = saved.length
    ? events.filter(ev => saved.includes(ev.id)).map(ev => `<li>${ev.title}</li>`).join("")
    : "<li>No saved events yet.</li>";
}

function setupEventsPage() {
  renderEvents();
  // Re-filter as the user types or picks a category
  document.getElementById("eventSearch").addEventListener("input", renderEvents);
  document.getElementById("categoryFilter").addEventListener("change", renderEvents);

  // One click listener on the grid handles every Save button
  document.getElementById("eventGrid").addEventListener("click", e => {
    if (!e.target.classList.contains("save-btn")) return;
    const id = Number(e.target.dataset.id);
    let saved = getSaved();
    saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    localStorage.setItem("savedEvents", JSON.stringify(saved));
    renderEvents();
  });
}

/* ===================================================
   DINING PAGE
   =================================================== */

// Open/closed status cards for each hall
function renderHalls() {
  const box = document.getElementById("hallCards");
  const hour = new Date().getHours();
  box.innerHTML = halls.map(h => {
    const open = hour >= h.open && hour < h.close;
    return `
      <div class="col-md-4">
        <div class="card p-3 h-100">
          <h2 class="h6">${h.name}</h2>
          <p class="${open ? "status-open" : "status-closed"} mb-1">${open ? "OPEN" : "CLOSED"}</p>
          <p class="small mb-2">Hours: ${h.open}:00 to ${h.close}:00</p>
          <a class="btn btn-sm btn-outline-dark" href="map.html">Directions</a>
        </div>
      </div>`;
  }).join("");
}

let currentMeal = "lunch";

// Show the menu for the chosen meal, hiding items that don't match the checked filters
function renderMenu() {
  const checked = [...document.querySelectorAll(".diet:checked")].map(c => c.value);
  const items = menu[currentMeal].filter(m => checked.every(tag => m.tags.includes(tag)));
  document.getElementById("menuTitle").textContent =
    `${currentMeal[0].toUpperCase() + currentMeal.slice(1)} menu`;
  document.getElementById("menuList").innerHTML = items.length
    ? items.map(m => `<li class="list-group-item bg-transparent">${m.item} <small class="text-muted">${m.tags.join(", ")}</small></li>`).join("")
    : `<li class="list-group-item bg-transparent">No items match your filters.</li>`;

  // Highlight the active tab
  document.querySelectorAll(".meal-tab").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.meal === currentMeal)
  );
}

// API #2: TheMealDB random meal (free test key "1")
async function loadMealIdea() {
  const box = document.getElementById("mealIdea");
  box.textContent = "Loading...";
  try {
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    if (!res.ok) throw new Error("Meal request failed");
    const data = await res.json();
    const meal = data.meals[0];
    box.innerHTML = `<img class="meal-img mb-2" src="${meal.strMealThumb}" alt="Photo of ${meal.strMeal}">
                     <p class="fw-bold mb-0">${meal.strMeal}</p>
                     <p class="small mb-0">${meal.strCategory} · ${meal.strArea}</p>`;
  } catch (err) {
    box.textContent = "Couldn't load a meal idea.";
    console.error(err);
  }
}

function setupDiningPage() {
  // Pick the meal based on the time of day
  const hour = new Date().getHours();
  currentMeal = hour < 11 ? "breakfast" : hour < 16 ? "lunch" : "dinner";

  renderHalls();
  renderMenu();
  loadMealIdea();

  document.querySelectorAll(".meal-tab").forEach(btn =>
    btn.addEventListener("click", () => { currentMeal = btn.dataset.meal; renderMenu(); })
  );
  document.querySelectorAll(".diet").forEach(box => box.addEventListener("change", renderMenu));
  document.getElementById("newIdea").addEventListener("click", loadMealIdea);
}

/* ===================================================
   MAP PAGE
   API #3: Leaflet library + OpenStreetMap map tiles
   =================================================== */
function setupMapPage() {
  // If the Leaflet library didn't load, show a message instead of crashing
  if (typeof L === "undefined") {
    document.getElementById("map").textContent = "The map couldn't load. Check your internet connection.";
    return;
  }
  const map = L.map("map").setView([CAMPUS_LAT, CAMPUS_LON], 17);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // Make a marker for every location and remember it
  const markers = locations.map(loc => ({
    loc,
    marker: L.marker([loc.lat, loc.lon]).bindPopup(`<strong>${loc.name}</strong><br>${loc.category}`)
  }));

  const list = document.getElementById("locationList");

  // Show only the locations in the chosen category
  function show(cat) {
    list.innerHTML = "";
    markers.forEach(({ loc, marker }) => {
      const visible = cat === "all" || loc.category === cat;
      if (visible) {
        marker.addTo(map);
        const li = document.createElement("li");
        li.innerHTML = `<button class="list-group-item list-group-item-action">${loc.name} <small class="text-muted">(${loc.category})</small></button>`;
        // Clicking a list item flies the map to that pin
        li.querySelector("button").addEventListener("click", () => {
          map.flyTo([loc.lat, loc.lon], 18);
          marker.openPopup();
        });
        list.appendChild(li);
      } else {
        map.removeLayer(marker);
      }
    });
  }

  document.querySelectorAll(".map-filter").forEach(btn =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".map-filter").forEach(b => b.classList.replace("btn-dark", "btn-outline-dark"));
      btn.classList.replace("btn-outline-dark", "btn-dark");
      show(btn.dataset.cat);
    })
  );

  show("all");
}

/* ===================================================
   START: run the shared code, then the code for this page
   =================================================== */
document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  const page = document.body.dataset.page;

  if (page === "home") {
    startClock();
    loadWeather();
    showMealCountdown();
    showUpcoming();
  } else if (page === "events") {
    setupEventsPage();
  } else if (page === "dining") {
    setupDiningPage();
  } else if (page === "map") {
    setupMapPage();
  }
});
