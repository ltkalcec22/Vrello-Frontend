// app.js
const express = require('express');
const initDb = require('./lib/db');
const cors = require('cors');
const UsersService = require('./routes/users');
const WorkspacesService = require('./routes/workspaces');
const ContainersService = require('./routes/container'); // "u jednini"
const TasksService = require('./routes/tasks');           // "novi servis za zadatke"
const { expressjwt: jwt } = require('express-jwt');

const secretKey = process.env.JWT_SECRET || 'mysecretkey';

const checkJwt = jwt({
  secret: secretKey,
  algorithms: ['HS256']
}).unless({ path: ['/login', '/signup'] });

async function initWeb() {
  const dbPool = await initDb();
  const app = express();
  const port = 3000;

  // Pohrani dbPool u app.locals ako ti zatreba pristup u routerima ili sl.
  app.locals.dbPool = dbPool;

  // Globalni middleware
  app.use(express.json());
  app.use(cors());
  app.use(checkJwt);

  // Inicijalizacija servisa
  const usersService = new UsersService(dbPool);
  const workspacesService = new WorkspacesService(dbPool);
  const containerService = new ContainersService(dbPool);
  const tasksService = new TasksService(dbPool);

  // ----------------------------
  // KORISNICI (Users)
  // ----------------------------
  app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const result = await usersService.signUp({ username, email, password });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await usersService.login(username, password);
    if (result.error) {
      return res.status(401).json(result);
    }
    res.json(result);
  });

  // ----------------------------
  // WORKSPACES
  // ----------------------------

  // Kreiranje workspacea (user_id dolazi iz parametra rute)
  app.post('/users/:user_id/workspaces', async (req, res) => {
    const { user_id } = req.params; // dohvat parametra iz URL-a
    const { name } = req.body;      // npr. { name: "My Workspace" }

    const result = await workspacesService.createWorkspace({ user_id, name });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Dohvaćanje workspacea po ID-u
  app.get('/workspaces/:id', async (req, res) => {
    const { id } = req.params;
    const result = await workspacesService.getWorkspaceById(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // Dohvaćanje svih workspaceova za određenog korisnika
  app.get('/users/:user_id/workspaces', async (req, res) => {
    const { user_id } = req.params;
    const result = await workspacesService.getWorkspacesByUser(user_id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // Ažuriranje workspacea
  app.put('/users/:user_id/workspaces/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const result = await workspacesService.updateWorkspace(id, { name });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Brisanje workspacea
  app.delete('/users/:user_id/workspaces/:id', async (req, res) => {
    const { id } = req.params;
    const result = await workspacesService.deleteWorkspace(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // ----------------------------
  // CONTAINERS (list_containers)
  // ----------------------------
  app.post('/containers', async (req, res) => {
    const { workspace_id, name } = req.body;
    const result = await containerService.createContainer({ workspace_id, name });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.get('/containers/:id', async (req, res) => {
    const { id } = req.params;
    const result = await containerService.getContainerById(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // Dohvaćanje svih containera za određeni workspace
  app.get('/workspaces/:workspace_id/containers', async (req, res) => {
    const { workspace_id } = req.params;
    const result = await containerService.getContainersByWorkspace(workspace_id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  app.put('/workspaces/:workspace_id/containers/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const result = await containerService.updateContainer(id, { name });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.delete('/workspaces/:workspace_id/containers/:id', async (req, res) => {
    const { id } = req.params;
    const result = await containerService.deleteContainer(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // ----------------------------
  // TASKS
  // ----------------------------

  // Kreiranje zadatka
  app.post('/tasks', async (req, res) => {
    const { list_container_id, text, description, comments } = req.body;
    const result = await tasksService.createTask({ list_container_id, text, description, comments });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Dohvaćanje zadatka po ID-u
  app.get('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const result = await tasksService.getTaskById(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // Dohvaćanje svih zadataka za određeni container
  app.get('/containers/:list_container_id/tasks', async (req, res) => {
    const { list_container_id } = req.params;
    const result = await tasksService.getTasksByContainer(list_container_id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // Ažuriranje zadatka
  app.put('/containers/:list_container_id/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { text, description, comments } = req.body;
    const result = await tasksService.updateTask(id, { text, description, comments });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Brisanje zadatka
  app.delete('/containers/:list_container_id/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const result = await tasksService.deleteTask(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // Primjer zaštićenog endpointa
  app.get('/protected', (req, res) => {
    res.json({ message: 'This is a protected endpoint', user: req.auth });
  });

  // Custom error handler za express-jwt (vraća JSON, a ne HTML)
  app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ error: 'Invalid token or unauthorized' });
    }
    next(err);
  });

  // Pokretanje servera
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

initWeb();
