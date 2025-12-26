require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT;
app.get('/', (req, res) => {
    res.send('Influencer API is up and running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});