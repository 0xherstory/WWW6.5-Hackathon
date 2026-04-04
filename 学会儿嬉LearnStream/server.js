const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./api/userRoutes');
const learningRoutes = require('./api/learningRoutes');
const authRoutes = require('./api/authRoutes');
const communityRoutes = require('./api/communityRoutes');
const { initApp } = require('./config');
const cronJobs = require('./cronJobs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);

app.use(express.static('public'));

initApp();

cronJobs();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
