const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, '../../IS Japan - entry list as of 30 Mar.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON as array of arrays
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Filter out header rows and empty rows, and rows with section headers
const data = rawData.filter(row => {
  // Must have at least 3 columns (No, Name, Nat)
  if (!row || row.length < 3) return false;
  // First column should be a number (player number)
  if (typeof row[0] !== 'number') return false;
  // Must have a name
  if (!row[1] || typeof row[1] !== 'string') return false;
  return true;
}).map(row => ({
  no: row[0],
  name: row[1],
  country: row[2] || 'XXX'
}));

// Get highest player number for tournament metadata
const maxPlayerNumber = Math.max(...data.map(p => p.no));

console.log('Found', data.length, 'player entries in the Excel file');
console.log('Highest player number:', maxPlayerNumber);
console.log('Sample players:', data.slice(0, 5).map(p => `${p.no}. ${p.name} (${p.country})`).join(', '));

// Generate player data with realistic scores
function generatePlayerScores(playerIndex, totalPlayers) {
  // Generate varied but realistic golf scores
  const rounds = [];
  
  for (let roundNum = 1; roundNum <= 4; roundNum++) {
    const holes = [];
    let roundTotal = 0;
    
    for (let holeNum = 1; holeNum <= 18; holeNum++) {
      // Par for each hole (matching the course layout)
      const pars = [4, 5, 3, 4, 3, 5, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 3, 5];
      const par = pars[holeNum - 1];
      
      // Generate realistic score (mostly par, some birdies/bogeys)
      const rand = Math.random();
      let strokes;
      if (rand < 0.15) strokes = par - 1; // 15% birdie
      else if (rand < 0.70) strokes = par; // 55% par
      else if (rand < 0.92) strokes = par + 1; // 22% bogey
      else strokes = par + 2; // 8% double bogey or worse
      
      roundTotal += strokes;
      
      holes.push({
        hole: holeNum.toString(),
        strokes: strokes.toString(),
        fairway: holeNum !== 3 && holeNum !== 5 && holeNum !== 12 && holeNum !== 17 ? (Math.random() > 0.3 ? '1' : '0') : undefined,
        bunkers: Math.random() > 0.8 ? '1' : '0',
        gir: Math.random() > 0.35 ? '1' : '0',
        putts: Math.floor(Math.random() * 2 + 1).toString()
      });
    }
    
    const totalTopar = roundTotal - 71;
    
    rounds.push({
      no: roundNum.toString(),
      status: 'completed',
      strokes: roundTotal.toString(),
      totaltopar: totalTopar >= 0 ? `+${totalTopar}` : totalTopar.toString(),
      holesplayed: '18',
      teetime: `${7 + Math.floor(roundNum / 2)}:${10 + (playerIndex % 6) * 10}`,
      course: '1',
      startingtee: roundNum % 2 === 1 ? '1' : '10',
      scores: holes
    });
  }
  
  return rounds;
}

// Map Excel data to player objects
const players = data.map((row, index) => {
  // Extract first and last name
  const fullName = row.name || '';
  const nameParts = fullName.trim().split(/\s+/);
  const lastname = nameParts[nameParts.length - 1] || 'Unknown';
  const firstname = nameParts.slice(0, -1).join(' ') || 'Unknown';
  
  const country = row.country || 'XXX';
  
  const rounds = generatePlayerScores(index, data.length);
  const totalStrokes = rounds.reduce((sum, r) => sum + parseInt(r.strokes), 0);
  const totalTopar = totalStrokes - (71 * 4);
  
  return {
    idint: (index + 1).toString(),
    ideu: '',
    idus: '',
    idau: '',
    idot: (100000 + index).toString(),
    idota: '',
    idotb: '',
    iditob: '',
    firstname: firstname,
    lastname: lastname,
    lastnameup: lastname.toUpperCase(),
    suffix: '',
    city: '',
    country: country.substring(0, 3).toUpperCase(),
    proam: 'pro',
    nameorder: '0',
    oom: '0',
    worldrank: '0',
    namelb: lastname.toUpperCase(),
    nametv: `${firstname} ${lastname}`,
    totals: {
      status: 'ok',
      rndstatus: 'completed',
      strokes: totalStrokes.toString(),
      totaltopar: totalTopar >= 0 ? `+${totalTopar}` : totalTopar.toString(),
      playinground: '4',
      teetime: rounds[3].teetime,
      starthole: '1',
      thru: '18',
      position: (index + 1).toString(),
      tied: '0',
      verified: '2'
    },
    rounds: rounds
  };
});

// Sort by total score
players.sort((a, b) => parseInt(a.totals.strokes) - parseInt(b.totals.strokes));

// Update positions after sorting
players.forEach((player, index) => {
  player.totals.position = (index + 1).toString();
});

console.log(`\nGenerated ${players.length} players with scores`);
console.log('Top 3 players:');
players.slice(0, 3).forEach(p => {
  console.log(`  ${p.totals.position}. ${p.nametv} (${p.country}) - ${p.totals.totaltopar}`);
});

// Generate TypeScript file
const tsContent = `import { Tournament } from './types';

// This file was auto-generated from the Excel player list
// Generated on: ${new Date().toISOString()}

export const sampleData: Tournament = {
  year: '2025',
  tournid: '191',
  name: 'International Series Japan',
  location: 'Caledonian Golf Club',
  country: 'Japan',
  rounds: '4',
  players: '${maxPlayerNumber}',
  cutdepth: '65',
  begindate: '2025-05-08T00:00:00',
  enddate: '2025-05-11T00:00:00',
  lastroundcompleted: '4',
  currentround: '4',
  status: 'completed',
  eutourid: '2025191',
  ustourid: '2025ISJP',
  autourid: '2025ISJP',
  astourid: '2025ISJP',
  courses: [
    {
      no: '1',
      holes: '18',
      frontpar: '36',
      backpar: '35',
      par: '71',
      frontyards: '3680',
      frontmetres: '3364',
      backyards: '3436',
      backmetres: '3141',
      totalyards: '7116',
      totalmetres: '6506',
      name: 'Caledonian Golf Club',
      shortname: 'CG',
      courseHoles: [
        { no: '1', par: '4', yards: '427', metres: '390' },
        { no: '2', par: '5', yards: '570', metres: '521' },
        { no: '3', par: '3', yards: '204', metres: '186' },
        { no: '4', par: '4', yards: '405', metres: '370' },
        { no: '5', par: '3', yards: '175', metres: '160' },
        { no: '6', par: '5', yards: '560', metres: '512' },
        { no: '7', par: '4', yards: '410', metres: '374' },
        { no: '8', par: '4', yards: '474', metres: '433' },
        { no: '9', par: '4', yards: '455', metres: '416' },
        { no: '10', par: '4', yards: '435', metres: '397' },
        { no: '11', par: '4', yards: '429', metres: '392' },
        { no: '12', par: '3', yards: '220', metres: '201' },
        { no: '13', par: '4', yards: '407', metres: '372' },
        { no: '14', par: '4', yards: '392', metres: '358' },
        { no: '15', par: '4', yards: '470', metres: '429' },
        { no: '16', par: '4', yards: '343', metres: '313' },
        { no: '17', par: '3', yards: '195', metres: '178' },
        { no: '18', par: '5', yards: '545', metres: '498' }
      ]
    }
  ],
  players_list: ${JSON.stringify(players, null, 2)}
};
`;

// Write to file
const outputPath = path.join(__dirname, '../lib/sampleData.ts');
fs.writeFileSync(outputPath, tsContent);

console.log(`\n✅ Successfully generated ${outputPath}`);
console.log(`   Total players: ${players.length}`);
