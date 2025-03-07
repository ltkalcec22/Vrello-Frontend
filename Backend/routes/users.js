// routes/users.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Koristimo environment varijablu ili hardkodirani secret key (za demonstraciju)
const secretKey = process.env.JWT_SECRET || 'mysecretkey';

class UsersService {
  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * signUp: Validira obavezna polja, hashira lozinku, sprema korisnika u bazu
   * i generira JWT token na uspjehu.
   * Vraća objekt: { error: boolean, message: string, token?: string, user?: object }
   */
  async signUp({ username, email, password }) {
    if (!username || !email || !password) {
      return { error: true, message: 'Missing required fields (username, email, password)' };
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await this.dbPool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      // Kreiramo objekt s podacima novog korisnika
      const newUser = { id: result.insertId, username, email };

      // Generiramo token koristeći userData
      const token = jwt.sign(newUser, secretKey, { expiresIn: '100y' });

      return {
        error: false,
        message: 'User successfully created',
        token,
        user: newUser
      };
    } catch (err) {
      console.error('Error creating user:', err);
      return { error: true, message: 'Failed to create user' };
    }
  }

  /**
   * login: Provjerava postoji li korisnik i validira lozinku.
   * Na uspjehu, generira i vraća JWT token te korisničke podatke.
   * Vraća objekt: { error: boolean, message: string, token?: string, user?: object }
   */
  async login(username, password) {
    console.log('UsersService.login -> username:', username, 'password:', password);
    if (!username || !password) {
      console.error('Missing username or password in request body');
      return { error: true, message: 'Missing credentials (username and password)' };
    }
    try {
      const [rows] = await this.dbPool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      console.log('Rows from DB for user:', rows);

      if (rows.length === 0) {
        return { error: true, message: 'Invalid credentials (user does not exist)' };
      }

      const user = rows[0];
      console.log('User from DB:', user);

      const match = await bcrypt.compare(password, user.password);
      console.log('Password match result:', match);

      if (!match) {
        return { error: true, message: 'Invalid credentials (wrong password)' };
      }

      // Kreiramo objekt s podacima korisnika koje šaljemo u tokenu i front
      const userData = { id: user.id, username: user.username, email: user.email };

      const token = jwt.sign(userData, secretKey, { expiresIn: '100y' });

      return {
        error: false,
        message: 'Login successful',
        token,
        user: userData
      };
    } catch (err) {
      console.error('Error during login:', err);
      return { error: true, message: 'Server error during login' };
    }
  }
}

module.exports = UsersService;
