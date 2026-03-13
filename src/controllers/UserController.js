const User = require('../models/User');
const jwt = require('jsonwebtoken');

class UserController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isPasswordValid = await User.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getCurrentUser(req, res) {
        try {
            const user = await User.findByUsername(req.user.username);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                id: user.id,
                username: user.username,
                role: user.role,
                created_at: user.created_at
            });
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current password and new password are required' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters long' });
            }

            const user = await User.findByUsername(req.user.username);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const isCurrentPasswordValid = await User.verifyPassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            await User.update(req.user.id, { password: newPassword });

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getAllUsers(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. Admin role required.' });
            }

            const users = await User.getAll();
            res.json(users);
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async createUser(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. Admin role required.' });
            }

            const { username, password, role } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const user = await User.create({ username, password, role });
            res.status(201).json(user);
        } catch (error) {
            console.error('Create user error:', error);
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'Username already exists' });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { username, password, role } = req.body;

            if (req.user.role !== 'admin' && req.user.id != id) {
                return res.status(403).json({ error: 'Access denied' });
            }

            const updateData = req.user.role === 'admin'
                ? { username, password, role }
                : { username, password };

            const user = await User.update(id, updateData);
            res.json(user);
        } catch (error) {
            console.error('Update user error:', error);
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'Username already exists' });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    static async deleteUser(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. Admin role required.' });
            }

            const { id } = req.params;
            const result = await User.delete(id);
            res.json(result);
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = UserController;
