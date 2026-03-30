export interface Score {
  hole: string;
  strokes: string;
  fairway?: string;
  bunkers?: string;
  gir?: string;
  putts?: string;
  drive?: string;
}

export interface Round {
  no: string;
  status: string;
  strokes?: string;
  totaltopar?: string;
  holesplayed: string;
  matchnumber?: string;
  matchnumberindex?: string;
  teetime?: string;
  course?: string;
  startingtee?: string;
  honor?: string;
  verified?: string;
  position?: string;
  tied?: string;
  scores: Score[];
}

export interface Totals {
  status: string;
  rndstatus?: string;
  strokes?: string;
  totaltopar?: string;
  beginrndtopar?: string;
  playinground?: string;
  teetime?: string;
  starthole?: string;
  matchnumber?: string;
  thru?: string;
  position?: string;
  tied?: string;
  honor?: string;
  verified?: string;
}

export interface Player {
  idint: string;
  ideu?: string;
  idus?: string;
  idau?: string;
  idot?: string;
  idota?: string;
  idotb?: string;
  iditob?: string;
  firstname: string;
  lastname: string;
  lastnameup: string;
  suffix?: string;
  city?: string;
  country: string;
  proam: string;
  nameorder?: string;
  oom?: string;
  worldrank?: string;
  namelb: string;
  nametv: string;
  totals?: Totals;
  rounds: Round[];
}

export interface Hole {
  no: string;
  par: string;
  yards: string;
  metres: string;
}

export interface Course {
  no: string;
  holes: string;
  frontpar: string;
  backpar: string;
  par: string;
  frontyards: string;
  frontmetres: string;
  backyards: string;
  backmetres: string;
  totalyards: string;
  totalmetres: string;
  name: string;
  shortname: string;
  courseHoles: Hole[];
}

export interface Tournament {
  year: string;
  tournid: string;
  name: string;
  location: string;
  country: string;
  rounds: string;
  players: string;
  cutdepth: string;
  begindate: string;
  enddate: string;
  lastroundcompleted?: string;
  currentround: string;
  status: string;
  eutourid?: string;
  ustourid?: string;
  autourid?: string;
  astourid?: string;
  courses: Course[];
  players_list: Player[];
}

export interface SimulationState {
  timestamp: string;
  tournament: Tournament;
  progress: number; // 0-100 representing completion percentage
}
