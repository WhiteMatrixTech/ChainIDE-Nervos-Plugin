/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { nervos } from '../type';

const web3 = new (window as any).Web3((window as any).ethereum);

export function generateUniqueId() {
  return Math.random().toString(36).substr(2, 16);
}

export function convertUnit(value: number, unit: nervos.unit): number {
  const unitOptions = { Shannons: 1, CKB: 100000000 };
  return value * unitOptions[unit];
}

export function validateArgs(argType: string, arg: any) {
  let finalArgs = arg;
  const initMes = `Error encoding arguments: Error: invalid ${argType} value`;
  if (!arg) {
    throw initMes;
  }
  switch (true) {
    case argType.includes('tuple'):
    case argType.includes('[]'): {
      try {
        finalArgs = JSON.parse(arg);
        if (!Array.isArray(finalArgs)) {
          throw initMes;
        }
      } catch (err) {
        console.log('Error encoding arguments:', err);
        throw initMes;
      }
      break;
    }

    case argType.includes('bool'): {
      if (!['true', 'false', true, false].includes(arg)) {
        throw initMes;
      }
      break;
    }

    // TODO ethAddress or shortAddress ?
    case argType.includes('address'): {
      if (!web3.utils.isAddress(arg)) {
        throw initMes;
      }
      break;
    }

    default:
      break;
  }
  return finalArgs;
}

export function normalizeArgs(
  compiledInfo: nervos.ISolcSelectedContractOutput,
  deployArgs: Record<string, any>
): string[] {
  const ret: string[] = [];
  compiledInfo.abi.forEach((entry) => {
    if (entry.type === 'constructor') {
      entry.inputs.forEach((arg: nervos.IEthereumAbiInput) => {
        const finalArg = validateArgs(arg.type, deployArgs[arg.name]);
        ret.push(finalArg);
      });
    }
  });
  return ret;
}
