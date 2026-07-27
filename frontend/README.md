<div align="center">

# 🗺️ GeoDraw

**Draw, save, and manage geospatial shapes on an interactive map — right in your browser.**

[![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![OpenLayers](https://img.shields.io/badge/OpenLayers-10-1F6B75?logo=openlayers&logoColor=white)](https://openlayers.org)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io)

</div>

---

## 📖 About

**GeoDraw** is a full-stack web application that lets signed-in users draw **points, lines, and polygons** directly on an interactive OpenStreetMap-powered map, then **save, rename, recolor, inspect, and delete** them. Every shape is stored per-user as real **GeoJSON** in MongoDB, and can be viewed either on the map or in a searchable table — complete with automatically calculated **length, area, and perimeter**.

Think of it as a lightweight, self-hosted alternative to tools like geojson.io — but with accounts, persistence, and a proper backend.

---

## ✨ Features

- 🔐 **Authentication** — Register/login with hashed passwords (bcrypt) and JWT-based sessions
- ✏️ **Drawing tools** — Draw `Point`, `LineString`, and `Polygon` geometries straight on the map
- 🎨 **Custom styling** — Pick a color for every shape as you draw it
- 🏷️ **Naming prompt** — Confirm a name (and color) right after drawing, before it's saved
- 💾 **Persistent storage** — Shapes are saved as GeoJSON documents in MongoDB, scoped to the logged-in user
- 📋 **Sidebar manager** — View, rename, recolor, zoom-to, or delete any saved shape from a dropdown menu
- 📊 **Auto measurements** — Live length (m/km), area (m²/ha/km²), and perimeter calculations for lines and polygons
- 🗺️ **Map view & 📑 Table view** — Toggle between an interactive map and a tabular list of all your geometries
- 📥 **GeoJSON import** — Upload an existing `.geojson` file to add its features to your account
- 🔍 **Zoom-to-feature** — Click a saved shape to fly the map straight to it
- 🛡️ **Route guarding** — Dashboard is protected behind an Angular route guard + HTTP auth interceptor

---

## 🧰 Tech Stack

| Layer          | Technology                                                                 |
|----------------|-----------------------------------------------------------------------------|
| **Frontend**   | Angular 22 (standalone components), TypeScript, OpenLayers (`ol`), RxJS     |
| **Backend**    | Node.js, Express 5                                                          |
| **Database**   | MongoDB with Mongoose ODM                                                   |
| **Auth**       | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` password hashing              |
| **Map tiles**  | OpenStreetMap (via OpenLayers `OSM` source)                                 |
| **Tooling**    | Angular CLI, Vitest, Prettier                                               |

---

## 📁 Project / File Structure

```
GeoDraw/
├── backend/                         # Express + MongoDB REST API
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── geometry.js              # Geometry schema (GeoJSON, color, type, owner)
│   │   └── user.js                  # User schema (name, email, hashed password)
│   ├── routes/
│   │   ├── auth.routes.js           # POST /register, /login
│   │   └── geometry.routes.js       # GET/POST/PUT/DELETE /api/geometries
│   ├── package.json
│   └── server.js                    # App entry point — connects DB & starts server
│
├── frontend/                        # Angular single-page application
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                        # Shared, app-wide services
│   │   │   │   ├── auth.ts                  # Login/register/logout + token storage
│   │   │   │   ├── auth-guard-guard.ts      # Route guard for protected pages
│   │   │   │   ├── auth-interceptor.ts      # Attaches JWT to outgoing requests
│   │   │   │   ├── geometry.ts              # CRUD service for saved shapes
│   │   │   │   └── geo-utils.ts             # Length/area/perimeter helpers
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── login/                   # Login & registration screen
│   │   │   │   └── dashboard/                # Main authenticated workspace
│   │   │   │       ├── header/               # Toolbar: draw tools, view toggle, logout
│   │   │   │       ├── sidebar/               # List, edit, delete, view details
│   │   │   │       ├── map-view/              # OpenLayers map + drawing interactions
│   │   │   │       └── table-view/            # Tabular view of all geometries
│   │   │   │
│   │   │   ├── app.config.ts        # App-level providers (router, HTTP client, etc.)
│   │   │   ├── app.routes.ts        # Route definitions
│   │   │   └── app.ts               # Root component
│   │   │
│   │   ├── assets/                  # Static assets
│   │   ├── index.html
│   │   ├── main.ts                  # Bootstraps the Angular app
│   │   └── styles.scss              # Global styles
│   │
│   ├── angular.json
│   ├── package.json
│   └── tsconfig*.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [MongoDB](https://www.mongodb.com) instance (local or Atlas)
- npm (bundled with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/vickbhor/GeoDraw.git
cd GeoDraw
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/geodraw
JWT_SECRET=your_super_secret_key
```

Run the API:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API will be available at `http://localhost:5000/api`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:4200`.

> ⚠️ The frontend currently points to `http://localhost:5000/api` for both auth and geometry requests (see `src/app/core/auth.ts` and `src/app/core/geometry.ts`). Update these if your backend runs elsewhere.

---

## 🔌 API Reference

**Base URL:** `/api`

### Auth — `/api/auth`

| Method | Endpoint    | Description                  | Body                              |
|--------|-------------|-------------------------------|------------------------------------|
| POST   | `/register` | Create a new user account      | `{ name, email, password }`        |
| POST   | `/login`    | Authenticate and receive a JWT | `{ email, password }`              |

### Geometries — `/api/geometries` 🔒 *(requires `Authorization: Bearer <token>`)*

| Method | Endpoint | Description                          | Body                                        |
|--------|----------|----------------------------------------|----------------------------------------------|
| GET    | `/`      | List all geometries for the current user | —                                          |
| POST   | `/`      | Create a new geometry                   | `{ name, type, color, geojson }`             |
| PUT    | `/:id`   | Update a geometry (name/color/shape)    | Partial fields to update                     |
| DELETE | `/:id`   | Delete a geometry                       | —                                            |

---

## 🖱️ How to Use

1. **Register** an account or **log in**.
2. Pick a tool from the header — **📍 Point**, **📏 Line**, or **🔺 Polygon**.
3. Click on the map to draw your shape (double-click / click the last point to finish a line or polygon).
4. Choose a **name** and **color**, then confirm to save it.
5. Switch to **Table** view for a spreadsheet-style list, or click any shape in the **sidebar** to zoom to it and see its length/area details.
6. Use the import option on the map to bring in existing `.geojson` files.

---

## 🗺️ Roadmap Ideas

- [ ] Export saved shapes back to GeoJSON / Shapefile
- [ ] Shape editing (drag vertices) after creation
- [ ] Sharing / collaboration between users
- [ ] Additional basemap options
- [ ] Search/filter in the sidebar and table view

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

No license has been specified for this project yet. Consider adding one (e.g. [MIT](https://choosealicense.com/licenses/mit/)) so others know how they can use your code.

---

## 👤 Author

**Vickbhor**
GitHub: [@vickbhor](https://github.com/vickbhor)