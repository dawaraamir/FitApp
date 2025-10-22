# Dawar Power

Dawar Power is an intelligent fitness and nutrition companion built for busy professionals. The Angular front-end pairs with a lightweight FastAPI backend to capture personal routines, generate adaptive workout schedules, and surface dynamic meal ideas that flex with shifting calendars. The latest update rebrands the experience, introduces a smart profile intake, wires insights through the workout planner and meal generator, and reframes the product narrative around “fitness that fits your calendar.”

## Product positioning

- **Target audience:** Busy professionals (25–45) juggling hybrid work, travel, and family commitments who need sustainable structure.
- **Core problem:** Generic plans don’t adapt to real-world schedules, creating motivation dips and inconsistency.
- **Solution:** Dawar Power learns your routine, preferred training windows, equipment, and dietary preferences to schedule workouts and deliver fresh meals automatically—even when you miss a session.
- **Customer voice:** “Dawar Power has actually changed my life… Having a virtual coach that can find time for a lift anytime truly holds you accountable!”

## Prerequisites

- [Node.js](https://nodejs.org/) 16+ (includes `npm`)
- [Python](https://www.python.org/) 3.9 or newer

> If you are using Visual Studio Code, install the recommended extensions when prompted to enable Angular and Python tooling.

## Project structure

```
.
├── backend/             # FastAPI application exposing /fit APIs
├── src/                 # Angular client
└── .vscode/             # Tasks and launch configurations for VS Code
```

## Installing dependencies

From the repository root:

```bash
npm install
npm run backend:install
```

The backend install script checks that `backend/requirements.txt` is present before invoking `pip`. If it reports that the file is missing, sync your checkout (e.g., `git pull --rebase`) so the new backend folder and its dependencies are available. Prefer to run the `python3 -m pip install -r backend/requirements.txt` command directly? You still can once the file exists.

## Running the apps manually

In two terminals:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run start  # Serves the Angular client on http://localhost:4200
npm run backend          # Boots the FastAPI server on http://localhost:8080
```

The front-end expects the backend at `http://localhost:8080/fit/...`. The FastAPI server ships with seed data so that the client has something to display immediately.

> **Why the `NODE_OPTIONS` flag?** Angular 12 relies on Webpack 4, which requires the legacy OpenSSL provider when running on Node 18+. You can export the variable once (`export NODE_OPTIONS=--openssl-legacy-provider`) or switch to Node 18 LTS via a version manager.

## Using Visual Studio Code

The repository contains ready-made tasks and launch configurations:

- **Tasks** (`Terminal → Run Task…`)
  - `Frontend: install dependencies`
  - `Frontend: ng serve`
  - `Backend: install dependencies`
  - `Backend: uvicorn`
- **Launch configurations** (`Run and Debug` side bar)
  - `Backend: FastAPI` — starts the Python server with hot reload
  - `Frontend: Angular` — launches Chrome against the Angular dev server
  - `Full Stack: Angular + FastAPI` — runs both configurations together

Running the compound launch will install dependencies (if needed), start the backend, start the Angular dev server, and attach the Chrome debugger.
The Angular tasks automatically set `NODE_OPTIONS=--openssl-legacy-provider`, so you do not need to export it manually when using VS Code.

## Developing with IntelliJ IDEA (optional)

If you prefer IntelliJ IDEA for backend work, install the Python plugin and use the `backend/main.py` module as a run configuration. The backend has no additional IDE requirements beyond creating a standard Python run/debug configuration that executes:

```
uvicorn backend.main:app --host 0.0.0.0 --port 8080 --reload
```

## Testing

- Run `ng test` for Angular unit tests.
- Add Python tests as the backend evolves (none are bundled yet).

## API overview

All endpoints are namespaced under `/fit`:

| Method | Endpoint                    | Description                                   |
| ------ | --------------------------- | --------------------------------------------- |
| GET    | `/fit/exercise`             | List exercises                                |
| POST   | `/fit/exercise`             | Create a new exercise                         |
| GET    | `/fit/exercise/{id}`        | Retrieve a specific exercise                  |
| PUT    | `/fit/exercise/{id}`        | Update an exercise                            |
| DELETE | `/fit/exercise/{id}`        | Delete an exercise                            |
| GET    | `/fit/user`                 | List users                                    |
| POST   | `/fit/user`                 | Create a new user                             |
| GET    | `/fit/user/{userId}`        | Retrieve a specific user                      |
| PUT    | `/fit/user/{userId}`        | Update a user                                 |
| DELETE | `/fit/user/{userId}`        | Delete a user                                 |
| GET    | `/fit/meal-plan`            | Fetch a default 3-day meal plan suggestion    |
| POST   | `/fit/meal-plan`            | Generate a tailored meal plan (goal/diet/days)|
| POST   | `/fit/schedule`             | Generate a smart workout schedule from a profile |
| POST   | `/fit/schedule/fetch`       | Retrieve a stored schedule for a given profile |
| POST   | `/fit/wellness-sync`        | Record the latest wearable / wellness stats   |
| GET    | `/fit/wellness-sync`        | Retrieve recent wellness sync entries         |
| GET    | `/fit/wellness-sync/provider/{provider}` | Pull sample data for Apple Health / Fitbit / Whoop |
| POST   | `/fit/wellness-sync/import` | Bulk import wellness entries from a provider  |

The FastAPI application seeds a sample member and exercises to make the UI functional right after launching both services.

## Meal plan generator

- Open `Signed-in Landing Page` from the navigation (`Planner` tab) to access the revamped dashboard.
- Use the **Workout planner** tab to drag exercises into a weekly schedule, now wrapped with Material cards and quick tips.
- Switch to **Meal planning** to generate 3–5 day meal ideas tailored to your calorie target, dietary preference, and fitness goal. Plans pair balanced breakfasts, lunches, dinners, and snacks with hydration and coaching cues sourced from the new `/fit/meal-plan` API.

## Smart schedule + wellness sync

- Capture your routine in **My Profile** so Dawar Power knows your work style, preferred training windows, equipment, and stress levels.
- The profile intake now includes the full pre-assessment: age, gender, current activity level, injuries/conditions, dietary restrictions/allergies/preferences, supplements, and weight goals (short + long term). These inputs feed the coach so workouts and meals respect limitations and preferences.
- The backend now stores schedules in `backend/storage.json`. When you revisit the planner, Dawar Power fetches the existing plan before generating a new one, so quick-start presets reload instantly.
- The dashboard calls `/fit/schedule` (and `/fit/schedule/fetch`) to surface ready-made sessions, which can be dropped straight into the planner.
- Track steps, sleep, readiness, and energy inside the new **Wellness check-in** card; entries are posted to `/fit/wellness-sync` and inform future plan tweaks.
- Pull real-world data with `tools/pull_wellness.py`:

```bash
# fetch sample Apple Health metrics
python tools/pull_wellness.py apple_health

# import Fitbit sample payload into the backend store
python tools/pull_wellness.py fitbit import

# verify that schedules persist for a profile
python tools/check_schedule.py
```

To plug in real provider feeds, set an environment variable such as `DAWAR_POWER_APPLE_HEALTH_URL`, `DAWAR_POWER_FITBIT_URL`, or `DAWAR_POWER_WHOOP_URL` to point at your service. The backend will prefer live data when these URLs are present and fall back to the bundled samples otherwise.

## Smart coach profile

- Navigate to **My Profile** (or visit `/coach-profile`) to capture work style, available training windows, equipment access, dietary preferences, and personal notes.
- Profile data is stored locally and feeds both the workout planner (guidance card + focus messaging) and meal plan defaults (goal, dietary lane, suggested calorie targets).
- Update the profile anytime; Dawar Power rebalances recommendations immediately.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for steps to fast-forward and push the `main` branch after your changes are reviewed.
