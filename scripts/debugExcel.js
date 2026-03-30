const XLSX = require('xlsx');

const workbook = XLSX.readFile('../IS Japan - entry list as of 30 Mar.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const players = rawData.filter(row => {
  if (!row || row.length < 3) return false;
  if (typeof row[0] !== 'number') return false;
  if (!row[1] || typeof row[1] !== 'string') return false;
  return true;
});

console.log('Players found:', players.length);
console.log('\nFirst 5:');
players.slice(0, 5).forEach(p => console.log(`  ${p[0]}. ${p[1]} (${p[2]})`));
console.log('\nLast 5:');
players.slice(-5).forEach(p => console.log(`  ${p[0]}. ${p[1]} (${p[2]})`));

const maxNum = Math.max(...players.map(p => p[0]));
console.log(`\nHighest player number: ${maxNum}`);
console.log(`Total unique players: ${players.length}`);

// Check for gaps in numbering
const numbers = players.map(p => p[0]).sort((a, b) => a - b);
console.log('\nChecking for numbering gaps...');
for (let i = 1; i <= maxNum; i++) {
  if (!numbers.includes(i)) {
    console.log(`  Missing number: ${i}`);
  }
}
