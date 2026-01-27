const bcrypt = require('bcrypt');

const password = 'squashA1!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed password:', hash);
    // Output the hash so you can update the database
});
