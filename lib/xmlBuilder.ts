import { Tournament, Player, Round, Score, Course } from './types';

export function buildXML(tournament: Tournament, timestamp: string): string {
  const lines: string[] = [];
  
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<!--  MenMac XML Fmt=4 Ver=2  -->');
  lines.push(`<event updatetimestamp="${timestamp}">`);
  
  // Tournament element
  const tournamentAttrs = [
    `year="${tournament.year}"`,
    `tournid="${tournament.tournid}"`,
    `name="${tournament.name}"`,
    `location="${tournament.location}"`,
    `country="${tournament.country}"`,
    `rounds="${tournament.rounds}"`,
    `players="${tournament.players}"`,
    `cutdepth="${tournament.cutdepth}"`,
    `begindate="${tournament.begindate}"`,
    `enddate="${tournament.enddate}"`,
    tournament.lastroundcompleted ? `lastroundcompleted="${tournament.lastroundcompleted}"` : null,
    `currentround="${tournament.currentround}"`,
    `status="${tournament.status}"`,
    tournament.eutourid ? `eutourid="${tournament.eutourid}"` : null,
    tournament.ustourid ? `ustourid="${tournament.ustourid}"` : null,
    tournament.autourid ? `autourid="${tournament.autourid}"` : null,
    tournament.astourid ? `astourid="${tournament.astourid}"` : null
  ].filter(Boolean).join(' ');
  
  lines.push(`<tournament ${tournamentAttrs}>`);
  
  // Courses
  lines.push('<courses>');
  tournament.courses.forEach(course => {
    lines.push(buildCourseXML(course));
  });
  lines.push('</courses>');
  
  // Players
  lines.push('<players>');
  tournament.players_list.forEach(player => {
    lines.push(buildPlayerXML(player));
  });
  lines.push('</players>');
  
  lines.push('</tournament>');
  lines.push('</event>');
  
  return lines.join('\n');
}

function buildCourseXML(course: Course): string {
  const lines: string[] = [];
  
  const courseAttrs = [
    `no="${course.no}"`,
    `holes="${course.holes}"`,
    `frontpar="${course.frontpar}"`,
    `backpar="${course.backpar}"`,
    `par="${course.par}"`,
    `frontyards="${course.frontyards}"`,
    `frontmetres="${course.frontmetres}"`,
    `backyards="${course.backyards}"`,
    `backmetres="${course.backmetres}"`,
    `totalyards="${course.totalyards}"`,
    `totalmetres="${course.totalmetres}"`,
    `name="${course.name}"`,
    `shortname="${course.shortname}"`
  ].join(' ');
  
  lines.push(`<course ${courseAttrs}>`);
  
  course.courseHoles.forEach(hole => {
    lines.push(`<hole no="${hole.no}" par="${hole.par}" yards="${hole.yards}" metres="${hole.metres}"/>`);
  });
  
  lines.push('</course>');
  
  return lines.join('\n');
}

function buildPlayerXML(player: Player): string {
  const lines: string[] = [];
  
  const playerAttrs = [
    `idint="${player.idint}"`,
    player.ideu !== undefined ? `ideu="${player.ideu}"` : null,
    player.idus !== undefined ? `idus="${player.idus}"` : null,
    player.idau !== undefined ? `idau="${player.idau}"` : null,
    player.idot ? `idot="${player.idot}"` : null,
    player.idota !== undefined ? `idota="${player.idota}"` : null,
    player.idotb !== undefined ? `idotb="${player.idotb}"` : null,
    player.iditob !== undefined ? `iditob="${player.iditob}"` : null,
    `firstname="${player.firstname}"`,
    `lastname="${player.lastname}"`,
    `lastnameup="${player.lastnameup}"`,
    player.suffix !== undefined ? `suffix="${player.suffix}"` : null,
    player.city !== undefined ? `city="${player.city}"` : null,
    `country="${player.country}"`,
    `proam="${player.proam}"`,
    player.nameorder !== undefined ? `nameorder="${player.nameorder}"` : null,
    player.oom !== undefined ? `oom="${player.oom}"` : null,
    player.worldrank !== undefined ? `worldrank="${player.worldrank}"` : null,
    `namelb="${player.namelb}"`,
    `nametv="${player.nametv}"`
  ].filter(Boolean).join(' ');
  
  lines.push(`<player ${playerAttrs}>`);
  
  // Totals
  if (player.totals) {
    const totalsAttrs = [
      `status="${player.totals.status}"`,
      player.totals.rndstatus ? `rndstatus="${player.totals.rndstatus}"` : null,
      player.totals.strokes ? `strokes="${player.totals.strokes}"` : null,
      player.totals.totaltopar ? `totaltopar="${player.totals.totaltopar}"` : null,
      player.totals.beginrndtopar ? `beginrndtopar="${player.totals.beginrndtopar}"` : null,
      player.totals.playinground ? `playinground="${player.totals.playinground}"` : null,
      player.totals.teetime ? `teetime="${player.totals.teetime}"` : null,
      player.totals.starthole ? `starthole="${player.totals.starthole}"` : null,
      player.totals.matchnumber ? `matchnumber="${player.totals.matchnumber}"` : null,
      player.totals.thru ? `thru="${player.totals.thru}"` : null,
      player.totals.position ? `position="${player.totals.position}"` : null,
      player.totals.tied ? `tied="${player.totals.tied}"` : null,
      player.totals.honor ? `honor="${player.totals.honor}"` : null,
      player.totals.verified ? `verified="${player.totals.verified}"` : null
    ].filter(Boolean).join(' ');
    
    lines.push(`<totals ${totalsAttrs}/>`);
  }
  
  // Rounds
  player.rounds.forEach(round => {
    lines.push(buildRoundXML(round));
  });
  
  lines.push('</player>');
  
  return lines.join('\n');
}

function buildRoundXML(round: Round): string {
  const lines: string[] = [];
  
  const roundAttrs = [
    `no="${round.no}"`,
    `status="${round.status}"`,
    round.strokes ? `strokes="${round.strokes}"` : null,
    round.totaltopar ? `totaltopar="${round.totaltopar}"` : null,
    `holesplayed="${round.holesplayed}"`,
    round.matchnumber ? `matchnumber="${round.matchnumber}"` : null,
    round.matchnumberindex ? `matchnumberindex="${round.matchnumberindex}"` : null,
    round.teetime ? `teetime="${round.teetime}"` : null,
    round.course ? `course="${round.course}"` : null,
    round.startingtee ? `startingtee="${round.startingtee}"` : null,
    round.honor ? `honor="${round.honor}"` : null,
    round.verified ? `verified="${round.verified}"` : null,
    round.position ? `position="${round.position}"` : null,
    round.tied ? `tied="${round.tied}"` : null
  ].filter(Boolean).join(' ');
  
  if (round.scores && round.scores.length > 0) {
    lines.push(`<round ${roundAttrs}>`);
    
    // Scores
    round.scores.forEach(score => {
      lines.push(buildScoreXML(score));
    });
    
    lines.push('</round>');
  } else {
    lines.push(`<round ${roundAttrs}/>`);
  }
  
  return lines.join('\n');
}

function buildScoreXML(score: Score): string {
  const scoreAttrs = [
    `hole="${score.hole}"`,
    `strokes="${score.strokes}"`,
    score.drive ? `drive="${score.drive}"` : null,
    score.fairway ? `fairway="${score.fairway}"` : null,
    score.bunkers ? `bunkers="${score.bunkers}"` : null,
    score.gir ? `gir="${score.gir}"` : null,
    score.putts ? `putts="${score.putts}"` : null
  ].filter(Boolean).join(' ');
  
  return `<score ${scoreAttrs}/>`;
}
