const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Create a new user
router.post('/users', async (req, res) => {
   try {
      const user = new User(req.body);
      await user.save();
      res.status(201).send(user);
   } catch (error) {
      res.status(400).send(error);
   }
});

// Fetch all users
router.get('/users', async (req, res) => {
   try {
      const users = await User.find();
      res.status(200).json(users);
   } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve users' });
   }
});
router.put('/users/:id', async (req, res) => {
   try {
     const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
     if (!updatedUser) {
       return res.status(404).json({ error: 'User not found' });
     }
     res.status(200).json(updatedUser);
   } catch (error) {
     res.status(400).json({ error: 'Failed to update user' });
   }
 });
 

module.exports = router;