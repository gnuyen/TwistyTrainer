export type CfopStep = 'cross' | 'F2L' | 'OLL' | 'PLL' | 'unknown';

export type TimerSolve = {
    id: string;
    time: number; // centiseconds
    scramble: string;
    timestamp: number;
    penalty: '' | '+2' | 'DNF';
    cfopStep?: CfopStep; // detected CFOP step
    sessionId?: string;
};
