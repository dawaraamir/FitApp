# FitApp

FitApp is an Angular front-end paired with a lightweight FastAPI backend that manages users and exercises. The application lets members create an account, browse exercises, and maintain workout details.

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
npm run start            # Serves the Angular client on http://localhost:4200
npm run backend          # Boots the FastAPI server on http://localhost:8080
```

The front-end expects the backend at `http://localhost:8080/fit/...`. The FastAPI server ships with seed data so that the client has something to display immediately.

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

| Method | Endpoint                    | Description                     |
| ------ | --------------------------- | ------------------------------- |
| GET    | `/fit/exercise`             | List exercises                  |
| POST   | `/fit/exercise`             | Create a new exercise           |
| GET    | `/fit/exercise/{id}`        | Retrieve a specific exercise    |
| PUT    | `/fit/exercise/{id}`        | Update an exercise              |
| DELETE | `/fit/exercise/{id}`        | Delete an exercise              |
| GET    | `/fit/user`                 | List users                      |
| POST   | `/fit/user`                 | Create a new user               |
| GET    | `/fit/user/{userId}`        | Retrieve a specific user        |
| PUT    | `/fit/user/{userId}`        | Update a user                   |
| DELETE | `/fit/user/{userId}`        | Delete a user                   |

The FastAPI application seeds a sample member and exercises to make the UI functional right after launching both services.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for steps to fast-forward and push the `main` branch after your changes are reviewed.
