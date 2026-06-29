const bcrypt = require('bcryptjs');

async function testHash() {
    const password = 'securepassword123';
    const hash = '$2b$10$TQh2fjK1/hHDsSa/jyZj4.IbUoqAL34uCSt1Ehnv6zaaK9i5EvQT.';
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Match:', isMatch);
}

testHash();
