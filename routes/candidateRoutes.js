const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const Candidate = require('../models/candidate');

// Check if the user has an admin role
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        if (user && user.role === 'admin') {
            return true;
        }
    } catch (err) {
        console.error('Error checking admin role:', err);
    }
    return false;
};

// POST route to add a candidate (Only admin)
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const data = req.body; // Assuming the request body contains the candidate data

        // Create and save the new candidate
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('Candidate added successfully');

        res.status(200).json({ response });
    } catch (err) {
        console.error('Error adding candidate:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update candidate (Only admin)
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate updated successfully');
        res.status(200).json(response);
    } catch (err) {
        console.error('Error updating candidate:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete candidate (Only admin)
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate deleted successfully');
        res.status(200).json(response);
    } catch (err) {
        console.error('Error deleting candidate:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Voting Route
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const candidateID = req.params.candidateID;
        const userId = req.user.id;

        // Find the candidate
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Admins are not allowed to vote
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin is not allowed to vote' });
        }

        // Check if user has already voted
        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Update the user record
        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.error('Error recording vote:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get vote count for all candidates
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: 'desc' });

        // Return candidate names and vote counts
        const voteRecord = candidates.map((data) => ({
            party: data.party,
            count: data.voteCount,
        }));

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.error('Error fetching vote count:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all candidates (name & party only)
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party -_id');
        res.status(200).json(candidates);
    } catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
