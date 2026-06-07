import * as migration_20260607_050503 from './20260607_050503';

export const migrations = [
  {
    up: migration_20260607_050503.up,
    down: migration_20260607_050503.down,
    name: '20260607_050503'
  },
];
