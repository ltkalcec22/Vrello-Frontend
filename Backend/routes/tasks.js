// services/tasksService.js
class TasksService {
  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Kreira novi zadatak.
   * Očekuje objekt: { list_container_id, text, description, comments }
   */
  async createTask({ list_container_id, text, description, comments }) {
    if (!list_container_id || !text) {
      return { error: true, message: 'Missing required fields (list_container_id, text)' };
    }
    try {
      const [result] = await this.dbPool.query(
        'INSERT INTO tasks (list_container_id, text, description, comments) VALUES (?, ?, ?, ?)',
        [list_container_id, text, description, comments]
      );
      return {
        error: false,
        message: 'Task successfully created',
        taskId: result.insertId
      };
    } catch (err) {
      console.error('Error creating task:', err);
      return { error: true, message: 'Failed to create task' };
    }
  }

  /**
   * Dohvaća zadatak prema ID-u.
   */
  async getTaskById(id) {
    try {
      const [rows] = await this.dbPool.query(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );
      if (rows.length === 0) {
        return { error: true, message: 'Task not found' };
      }
      return { error: false, task: rows[0] };
    } catch (err) {
      console.error('Error fetching task:', err);
      return { error: true, message: 'Failed to fetch task' };
    }
  }

  /**
   * Dohvaća sve zadatke za određeni container.
   */
  async getTasksByContainer(list_container_id) {
    try {
      const [rows] = await this.dbPool.query(
        'SELECT * FROM tasks WHERE list_container_id = ?',
        [list_container_id]
      );
      return { error: false, tasks: rows };
    } catch (err) {
      console.error('Error fetching tasks for container:', err);
      return { error: true, message: 'Failed to fetch tasks for container' };
    }
  }

  /**
   * Ažurira postojeći zadatak prema ID-u.
   * Očekuje objekt s podacima: { id, text, description, comments }
   */
  async updateTask(id, { text, description, comments }) {
    if (!text) {
      return { error: true, message: 'Missing required field (text)' };
    }
    try {
      const [result] = await this.dbPool.query(
        'UPDATE tasks SET text = ?, description = ?, comments = ? WHERE id = ?',
        [text, description, comments, id]
      );
      if (result.affectedRows === 0) {
        return { error: true, message: 'Task not found or no change made' };
      }
      return { error: false, message: 'Task successfully updated' };
    } catch (err) {
      console.error('Error updating task:', err);
      return { error: true, message: 'Failed to update task' };
    }
  }

  /**
   * Briše zadatak prema ID-u.
   */
  async deleteTask(id) {
    try {
      const [result] = await this.dbPool.query(
        'DELETE FROM tasks WHERE id = ?',
        [id]
      );
      if (result.affectedRows === 0) {
        return { error: true, message: 'Task not found' };
      }
      return { error: false, message: 'Task successfully deleted' };
    } catch (err) {
      console.error('Error deleting task:', err);
      return { error: true, message: 'Failed to delete task' };
    }
  }
}

module.exports = TasksService;
