import { Tournament, Player, Round, SimulationState } from './types';
import { sampleData } from './sampleData';

export class TournamentSimulator {
  private fullTournament: Tournament;
  
  constructor() {
    this.fullTournament = sampleData;
  }

  /**
   * Generate a simulated state at a given progress percentage
   * @param progress 0-100, where 0 = just tee times, 100 = full results
   */
  getSimulatedState(progress: number): SimulationState {
    const timestamp = new Date().toISOString();
    
    // Clone the tournament data
    const tournament: Tournament = JSON.parse(JSON.stringify(this.fullTournament));
    
    // Determine what to show based on progress
    if (progress === 0) {
      // Just tee times and player info, no scores
      tournament.status = 'scheduled';
      tournament.currentround = '1';
      tournament.lastroundcompleted = undefined;
      
      tournament.players_list = tournament.players_list.map(player => ({
        ...player,
        totals: undefined,
        rounds: player.rounds.map(round => ({
          ...round,
          status: 'scheduled',
          strokes: undefined,
          totaltopar: undefined,
          holesplayed: '0',
          scores: []
        }))
      }));
    } else if (progress < 25) {
      // Round 1 in progress
      tournament.status = 'inprogress';
      tournament.currentround = '1';
      tournament.lastroundcompleted = undefined;
      
      const round1Progress = (progress / 25) * 100;
      tournament.players_list = this.simulateRoundProgress(tournament.players_list, 0, round1Progress);
    } else if (progress < 50) {
      // Round 1 complete, Round 2 in progress
      tournament.status = 'inprogress';
      tournament.currentround = '2';
      tournament.lastroundcompleted = '1';
      
      const round2Progress = ((progress - 25) / 25) * 100;
      tournament.players_list = this.simulateRoundProgress(tournament.players_list, 1, round2Progress);
    } else if (progress < 75) {
      // Round 2 complete, Round 3 in progress
      tournament.status = 'inprogress';
      tournament.currentround = '3';
      tournament.lastroundcompleted = '2';
      
      const round3Progress = ((progress - 50) / 25) * 100;
      tournament.players_list = this.simulateRoundProgress(tournament.players_list, 2, round3Progress);
    } else {
      // Round 3 complete, Round 4 in progress or complete
      tournament.currentround = '4';
      tournament.lastroundcompleted = '3';
      
      if (progress < 100) {
        tournament.status = 'inprogress';
        const round4Progress = ((progress - 75) / 25) * 100;
        tournament.players_list = this.simulateRoundProgress(tournament.players_list, 3, round4Progress);
      } else {
        // Tournament complete
        tournament.status = 'completed';
        tournament.lastroundcompleted = '4';
      }
    }
    
    return {
      timestamp,
      tournament,
      progress
    };
  }

  private simulateRoundProgress(players: Player[], roundIndex: number, roundProgress: number): Player[] {
    return players.map(player => {
      const newPlayer = { ...player };
      const rounds = [...player.rounds];
      
      // Set all previous rounds to completed
      for (let i = 0; i < roundIndex; i++) {
        if (rounds[i]) {
          rounds[i] = { ...rounds[i], status: 'completed' };
        }
      }
      
      // Handle current round
      if (rounds[roundIndex]) {
        const currentRound = { ...rounds[roundIndex] };
        const totalHoles = 18;
        const holesCompleted = Math.floor((roundProgress / 100) * totalHoles);
        
        if (roundProgress === 0) {
          // Not started yet
          currentRound.status = 'scheduled';
          currentRound.holesplayed = '0';
          currentRound.strokes = undefined;
          currentRound.totaltopar = undefined;
          currentRound.scores = [];
        } else if (roundProgress < 100) {
          // In progress
          currentRound.status = 'inprogress';
          currentRound.holesplayed = holesCompleted.toString();
          currentRound.scores = currentRound.scores.slice(0, holesCompleted);
          
          // Calculate partial round stats
          if (currentRound.scores.length > 0) {
            const strokesPlayed = currentRound.scores.reduce((sum, score) => sum + parseInt(score.strokes), 0);
            currentRound.strokes = strokesPlayed.toString();
            
            // Estimate to par based on holes played
            const parPerHole = 71 / 18; // Average par
            const estimatedPar = Math.round(parPerHole * holesCompleted);
            const topar = strokesPlayed - estimatedPar;
            currentRound.totaltopar = topar >= 0 ? `+${topar}` : topar.toString();
          }
        } else {
          // Round complete
          currentRound.status = 'completed';
        }
        
        rounds[roundIndex] = currentRound;
      }
      
      // Set future rounds as not started
      for (let i = roundIndex + 1; i < rounds.length; i++) {
        if (rounds[i]) {
          rounds[i] = {
            ...rounds[i],
            status: 'scheduled',
            strokes: undefined,
            totaltopar: undefined,
            holesplayed: '0',
            scores: []
          };
        }
      }
      
      newPlayer.rounds = rounds;
      
      // Update totals based on completed rounds
      if (roundProgress > 0) {
        const completedRounds = rounds.slice(0, roundIndex).filter(r => r.status === 'completed');
        const currentRoundData = rounds[roundIndex];
        
        let totalStrokes = 0;
        completedRounds.forEach(round => {
          if (round.strokes) totalStrokes += parseInt(round.strokes);
        });
        
        if (currentRoundData?.strokes) {
          totalStrokes += parseInt(currentRoundData.strokes);
        }
        
        newPlayer.totals = {
          status: roundProgress < 100 ? 'inprogress' : 'ok',
          rndstatus: currentRoundData?.status,
          strokes: totalStrokes > 0 ? totalStrokes.toString() : undefined,
          playinground: (roundIndex + 1).toString(),
          thru: currentRoundData?.holesplayed,
          teetime: currentRoundData?.teetime,
          starthole: currentRoundData?.startingtee,
          matchnumber: currentRoundData?.matchnumber
        };
      }
      
      return newPlayer;
    });
  }
}
