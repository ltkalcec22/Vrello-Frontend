// routes/workspaces.js
class WorkspacesService {
  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Kreira novi workspace.
   * Očekuje objekt: { user_id, name }
   */
  async createWorkspace({ user_id, name }) {
    if (!user_id || !name) {
      return { error: true, message: 'Missing required fields (user_id, name)' };
    }
    try {
      const [result] = await this.dbPool.query(
        'INSERT INTO workspaces (user_id, name) VALUES (?, ?)',
        [user_id, name]
      );
      return {
        error: false,
        message: 'Workspace successfully created',
        workspaceId: result.insertId
      };
    } catch (err) {
      console.error('Error creating workspace:', err);
      return { error: true, message: 'Failed to create workspace' };
    }
  }

  /**
   * Dohvaća workspace prema ID-u.
   */
  async getWorkspaceById(id) {
    try {
      const [rows] = await this.dbPool.query(
        'SELECT * FROM workspaces WHERE id = ?',
        [id]
      );
      if (rows.length === 0) {
        return { error: true, message: 'Workspace not found' };
      }
      return { error: false, workspace: rows[0] };
    } catch (err) {
      console.error('Error fetching workspace:', err);
      return { error: true, message: 'Failed to fetch workspace' };
    }
  }

  /**
   * Dohvaća sve workspaceove za određenog korisnika.
   */
  async getWorkspacesByUser(user_id) {
    try {
      const [rows] = await this.dbPool.query(
        'SELECT * FROM workspaces WHERE user_id = ?',
        [user_id]
      );
      return { error: false, workspaces: rows };
    } catch (err) {
      console.error('Error fetching workspaces for user:', err);
      return { error: true, message: 'Failed to fetch workspaces for user' };
    }
  }

  /**
   * Ažurira workspace prema ID-u. Očekuje objekt s novim podacima (trenutno samo name).
   */
  async updateWorkspace(id, { name }) {
    if (!name) {
      return { error: true, message: 'Missing required field (name)' };
    }
    try {
      const [result] = await this.dbPool.query(
        'UPDATE workspaces SET name = ? WHERE id = ?',
        [name, id]
      );
      if (result.affectedRows === 0) {
        return { error: true, message: 'Workspace not found or no change made' };
      }
      return { error: false, message: 'Workspace successfully updated' };
    } catch (err) {
      console.error('Error updating workspace:', err);
      return { error: true, message: 'Failed to update workspace' };
    }
  }

  /**
   * Briše workspace prema ID-u.
   */
  async deleteWorkspace(id) {
    try {
      const [result] = await this.dbPool.query(
        'DELETE FROM workspaces WHERE id = ?',
        [id]
      );
      if (result.affectedRows === 0) {
        return { error: true, message: 'Workspace not found' };
      }
      return { error: false, message: 'Workspace successfully deleted' };
    } catch (err) {
      console.error('Error deleting workspace:', err);
      return { error: true, message: 'Failed to delete workspace' };
    }
  }
}

module.exports = WorkspacesService;
