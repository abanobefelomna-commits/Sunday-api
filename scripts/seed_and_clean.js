const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'felo123',
    database: 'sunday_school',
  });

  await client.connect();
  console.log('Connected to local PostgreSQL database.');

  // 1. Clear existing users, servants, and tokens
  await client.query('DELETE FROM refresh_tokens;');
  await client.query('DELETE FROM servants_classes;');
  await client.query('DELETE FROM servants;');
  await client.query('DELETE FROM users;');
  console.log('Cleared all users, servants, and tokens from database.');

  // 2. Ensure all 6 elementary school classes exist
  const classes = [
    { name: 'فصل سنة أولى ابتدائي', grade: 'first', desc: 'خدمة وتربية أطفال سنة أولى ابتدائي' },
    { name: 'فصل سنة ثانية ابتدائي', grade: 'second', desc: 'خدمة وتربية أطفال سنة ثانية ابتدائي' },
    { name: 'فصل سنة ثالثة ابتدائي', grade: 'third', desc: 'خدمة وتربية أطفال سنة ثالثة ابتدائي' },
    { name: 'فصل سنة رابعة ابتدائي', grade: 'fourth', desc: 'خدمة وتربية أطفال سنة رابعة ابتدائي' },
    { name: 'فصل سنة خامسة ابتدائي', grade: 'fifth', desc: 'خدمة وتربية أطفال سنة خامسة ابتدائي' },
    { name: 'فصل سنة سادسة ابتدائي', grade: 'sixth', desc: 'خدمة وتربية أطفال سنة سادسة ابتدائي' },
  ];

  for (const c of classes) {
    const existing = await client.query('SELECT id FROM classes WHERE grade = $1', [c.grade]);
    if (existing.rows.length === 0) {
      await client.query(
        'INSERT INTO classes (name, grade, description, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
        [c.name, c.grade, c.desc]
      );
      console.log('Created class:', c.name);
    } else {
      console.log('Class already exists:', c.name);
    }
  }

  const all = await client.query('SELECT id, name, grade FROM classes ORDER BY grade');
  console.log('\nCurrent Classes:');
  console.table(all.rows);

  const usersCount = await client.query('SELECT COUNT(*) FROM users');
  console.log('Users count in database:', usersCount.rows[0].count);

  await client.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
