// eslint-disable-next-line import/no-unresolved
import { ShortAddress, AbiItems } from '@polyjuice-provider/base';

export declare namespace nervos {
  interface addRpcnetInWallet {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls?: string[];
    iconUrls?: string[];
  }
  interface RequestArguments {
    method: string;
    params?: unknown[] | object;
  }

  interface Providers {
    chainId: string;
    selectedAddress: string;
    request(args: RequestArguments): Promise<unknown>;
  }

  interface ITransactionReceipt {
    status: boolean;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    contractAddress?: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    logs: Log[];
    logsBloom: string;
    events?: {
      [eventName: string]: EventLog;
    };
  }

  interface IWalletAccount {
    address: string;
    balance: number;
  }

  interface INervosAccount {
    ethAddress: string;
    shortAddress: ShortAddress | void;
    balance: string;
    address: string;
    isValidAddress: boolean | void;
  }

  /**
   *  CompilerInput follows tha same format of solcjs
   *  https://github.com/ethereum/solc-js
   *  https://solidity.readthedocs.io/en/v0.5.0/using-the-compiler.html#compiler-input-and-output-json-description
   */
  interface ICompilerInput {
    language: 'Solidity';
    settings: any;
    sources: any;
  }

  interface IEthereumAbiInput {
    internalType: string;
    name: string;
    type: string;
    components: any;
  }

  interface ISolcSelectedContractOutput {
    abi: AbiItems;
    evm: {
      bytecode: {
        object: string;
        opcodes: string;
        sourceMap: string;
      };
      gasEstimation: {
        creation: {
          codeDepositCost: string;
          executionCost: string;
          totalCost: string;
        };
      };
    };
  }

  interface ISolcRawOutput {
    contracts: {
      [fileName: string]: {
        [contractName: string]: ISolcSelectedContractOutput;
      };
    };
    errors: any;
    sources: any;
  }

  /**
   *  CompilerOutput
   *  if code = 0 means no errros
   *    data: follows tha same format of solcjs https://github.com/ethereum/solc-js
   *    https://solidity.readthedocs.io/en/v0.5.0/using-the-compiler.html#compiler-input-and-output-json-description
   *  elif code = 1 means something is wrong
   *    data: error message
   */
  interface ICompileContractResult {
    code: number;
    data: ISolcRawOutput | any;
  }

  interface ICompileContractSuccessActionData {
    result: ICompileContractResult;
    fileId: string;
  }

  /**
   * Deploy options passed to Metamask
   * unit only support 'wei' and 'gwei'
   */
  enum unit {
    Shannons = 'Shannons',
    CKB = 'CKB'
  }
  interface IDeployOptions {
    gasLimit: number;
    value: number;
    unit: unit;
  }

  interface IDeployUiOptions {
    gasLimit: string;
    gasLimitErrorMsg: string;
    unit: string;
    value: string;
    valueErrorMsg: string;
  }

  interface IDeployContractActionData {
    contractName: string;
    solcCompiledOutput: ISolcSelectedContractOutput;
    account: IWalletAccount;
    deployOptions: IDeployOptions;
    constructorArgs: any;
    path: string;
  }

  interface IImportDeployedActionData {
    chainId: string;
    abi: AbiItems;
    contractName: string;
    contractAddress: string;
  }

  /**
   * item: according to new filesystem data structure
   *    code: raw content in string
   */
  interface IDeployedContract {
    deployedInfo: IDeployedInfo;
    path: string[];
    error?: string;
  }

  interface IDeployedInfo {
    abi: AbiItems;
    contractName: string;
    contractAddress: string;
    chainId: string;
    deployActionData?: IDeployContractActionData;
    transactionHash?: string;
    confirmed?: number;
    receipt?: ITransactionReceipt;
  }

  interface IInteractContractActionData {
    interactArgs: {
      [key: string]: any;
    };
    contractAddress: string;
    abiEntryIdx: number;
    accountAddress: string;
    abi: AbiItems;
    chainId: string;
    payableValue?: string;
    argString: string; // interact function的参数类型, 用于多态函数命中
  }

  interface IInteractContractCallSuccessActionData {
    contractAddress: string;
    abiEntryIdx: number;
    result: any;
  }
}
