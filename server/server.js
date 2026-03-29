require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { initDB } = require('./db');

// Configure passport
require('./passport');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'rapidcare_session',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/emergency.routes'));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🏥 Rapid Care Ghana`);
    console.log(`✅ http://localhost:${PORT}\n`);
    console.log(`Test accounts:`);
    console.log(`  patient@test.com / test123`);
    console.log(`  doctor@test.com  / test123\n`);
  });
}).catch(err => {
  console.error('❌ DB connection failed:', err.message);
  console.error('   Make sure PostgreSQL is running and DATABASE_URL is set in server/.env');
  process.exit(1);
});
