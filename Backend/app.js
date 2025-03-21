const express = require('express');
const initDb = require('./lib/db');
const cors = require('cors');
const UsersService = require('./routes/users');
const WorkspacesService = require('./routes/workspaces');
const ContainersService = require('./routes/container'); // "u jednini"
const TasksService = require('./routes/tasks');           // "novi servis za zadatke"
const authMiddleware = require('./middlewares'); // Ovaj middleware postavlja req.userId

const secretKey = process.env.JWT_SECRET || 'mysecretkey';

async function initWeb() {
  const dbPool = await initDb();
  const app = express();
  const port = 3000;

  // Pohrani dbPool u app.locals za pristup u routerima i middlewareu
  app.locals.dbPool = dbPool;

  // Globalni middleware
  app.use(express.json());
  app.use(cors());
  app.use(authMiddleware); // Svi zahtjevi prolaze kroz authMiddleware, koji postavlja req.userId

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
  app.post('/workspaces', async (req, res) => {
    const { name } = req.body; // primjer: { name: "My Workspace" }
    const result = await workspacesService.createWorkspace({ user_id: req.userId, name });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.get('/workspaces/:id', async (req, res) => {
    const { id } = req.params;
    const result = await workspacesService.getWorkspaceById(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  app.get('/workspaces', async (req, res) => {
    const result = await workspacesService.getWorkspacesByUser(req.userId);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  app.put('/workspaces/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const workspace = await workspacesService.getWorkspaceById(id);
    if (workspace.error || workspace.workspace.user_id != req.userId) {
      return res.status(403).json({ error: 'Unauthorized, workspace does not belong to user' });
    }
    const result = await workspacesService.updateWorkspace(id, { name });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.delete('/workspaces/:id', async (req, res) => {
    const { id } = req.params;
    const workspace = await workspacesService.getWorkspaceById(id);
    if (workspace.error || workspace.workspace.user_id != req.userId) {
      return res.status(403).json({ error: 'Unauthorized, workspace does not belong to user' });
    }
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
    const workspace = await workspacesService.getWorkspaceById(workspace_id);
    if (workspace.error || workspace.workspace.user_id != req.userId) {
      return res.status(403).json({ error: 'Unauthorized, workspace does not belong to user' });
    }
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

  app.get('/workspaces/:workspace_id/containers', async (req, res) => {
    const { workspace_id } = req.params;
    const workspace = await workspacesService.getWorkspaceById(workspace_id);
    if (workspace.error || workspace.workspace.user_id != req.userId) {
      return res.status(403).json({ error: 'Unauthorized, workspace does not belong to user' });
    }
    const result = await containerService.getContainersByWorkspace(workspace_id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  app.put('/workspaces/:workspace_id/containers/:id', async (req, res) => {
    const { workspace_id, id } = req.params;
    const { name } = req.body;
    const workspace = await workspacesService.getWorkspaceById(workspace_id);
    if (workspace.error || workspace.workspace.user_id != req.userId) {
      return res.status(403).json({ error: 'Unauthorized, workspace does not belong to user' });
    }
    const result = await containerService.updateContainer(id, { name });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.delete('/workspaces/:workspace_id/containers/:id', async (req, res) => {
    const { workspace_id, id } = req.params;
    const workspace = await workspacesService.getWorkspaceById(workspace_id);
    if (workspace.error || workspace.workspace.user_id != req.userId) {
      return res.status(403).json({ error: 'Unauthorized, workspace does not belong to user' });
    }
    const result = await containerService.deleteContainer(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // ----------------------------
  // TASKS
  // ----------------------------
  app.post('/tasks', async (req, res) => {
    const { list_container_id, text, description, comments } = req.body;
    const result = await tasksService.createTask({ list_container_id, text, description, comments });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.get('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const result = await tasksService.getTaskById(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  app.get('/containers/:list_container_id/tasks', async (req, res) => {
    const { list_container_id } = req.params;
    const result = await tasksService.getTasksByContainer(list_container_id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  app.put('/containers/:list_container_id/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { text, description, comments, list_container_id } = req.body;
    const result = await tasksService.updateTask(id, { text, description, comments, list_container_id });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.delete('/containers/:list_container_id/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const result = await tasksService.deleteTask(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // ----------------------------
  // KOMENTARI
  // ----------------------------
  app.post('/comments', async (req, res) => {
    const { task_id, text } = req.body;
    // Možete dodati dodatnu provjeru da li task pripada trenutačnom korisniku ako je potrebno
    const result = await TasksService.createComment({ task_id, text, user_id: req.userId });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.get('/tasks/:task_id/comments', async (req, res) => {
    const { task_id } = req.params;
    const result = await tasksService.getComments(task_id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  app.put('/comments/:id', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    // Opcionalna provjera: provjerite pripada li komentar trenutačnom korisniku
    const result = await tasksService.updateComment(id, { text });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.delete('/comments/:id', async (req, res) => {
    const { id } = req.params;
    // Opcionalna provjera: provjerite pripada li komentar trenutačnom korisniku
    const result = await tasksService.deleteComment(id);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // Primjer zaštićenog endpointa
  app.get('/protected', (req, res) => {
    res.json({ message: 'This is a protected endpoint', user: req.userId });
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
