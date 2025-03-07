// routes/container.js
class ContainersService {
    constructor(dbPool) {
      this.dbPool = dbPool;
    }
  
    /**
     * createContainer: Kreira novi list container.
     * Očekuje objekt: { workspace_id, name }
     */
    async createContainer({ workspace_id, name }) {
      if (!workspace_id || !name) {
        return { error: true, message: 'Missing required fields (workspace_id, name)' };
      }
      try {
        const [result] = await this.dbPool.query(
          'INSERT INTO list_containers (workspace_id, name) VALUES (?, ?)',
          [workspace_id, name]
        );
        return {
          error: false,
          message: 'Container successfully created',
          containerId: result.insertId
        };
      } catch (err) {
        console.error('Error creating container:', err);
        return { error: true, message: 'Failed to create container' };
      }
    }
  
    /**
     * getContainerById: Dohvaća container prema ID-u.
     */
    async getContainerById(id) {
      try {
        const [rows] = await this.dbPool.query(
          'SELECT * FROM list_containers WHERE id = ?',
          [id]
        );
        if (rows.length === 0) {
          return { error: true, message: 'Container not found' };
        }
        return { error: false, container: rows[0] };
      } catch (err) {
        console.error('Error fetching container:', err);
        return { error: true, message: 'Failed to fetch container' };
      }
    }
  
    /**
     * getContainersByWorkspace: Dohvaća sve containere za određeni workspace.
     */
    async getContainersByWorkspace(workspace_id) {
      try {
        const [rows] = await this.dbPool.query(
          'SELECT * FROM list_containers WHERE workspace_id = ?',
          [workspace_id]
        );
        return { error: false, containers: rows };
      } catch (err) {
        console.error('Error fetching containers for workspace:', err);
        return { error: true, message: 'Failed to fetch containers for workspace' };
      }
    }
  
    /**
     * updateContainer: Ažurira container prema ID-u.
     * Očekuje objekt s novim podacima (trenutno samo name).
     */
    async updateContainer(id, { name }) {
      if (!name) {
        return { error: true, message: 'Missing required field (name)' };
      }
      try {
        const [result] = await this.dbPool.query(
          'UPDATE list_containers SET name = ? WHERE id = ?',
          [name, id]
        );
        if (result.affectedRows === 0) {
          return { error: true, message: 'Container not found or no change made' };
        }
        return { error: false, message: 'Container successfully updated' };
      } catch (err) {
        console.error('Error updating container:', err);
        return { error: true, message: 'Failed to update container' };
      }
    }
  
    /**
     * deleteContainer: Briše container prema ID-u.
     */
    async deleteContainer(id) {
      try {
        const [result] = await this.dbPool.query(
          'DELETE FROM list_containers WHERE id = ?',
          [id]
        );
        if (result.affectedRows === 0) {
          return { error: true, message: 'Container not found' };
        }
        return { error: false, message: 'Container successfully deleted' };
      } catch (err) {
        console.error('Error deleting container:', err);
        return { error: true, message: 'Failed to delete container' };
      }
    }
  }
  
 
  
  module.exports = ContainersService;
    