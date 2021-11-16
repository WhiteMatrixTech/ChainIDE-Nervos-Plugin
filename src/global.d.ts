declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}

type BlockNumber =
  | string
  | number
  | 'latest'
  | 'pending'
  | 'earliest'
  | 'genesis';

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

interface Providers {
  chainId: string;
  selectedAddress: string;
  request(args: RequestArguments): Promise<unknown>;
}
interface DeployOptions {
  data: string;
  arguments?: any[];
}

declare class Contract {
  methods: any;
  constructor(jsonInterface: any, address?: string);

  deploy(options: DeployOptions): ContractSendMethod;
}

interface BlockHeader {
  number: number;
  hash: string;
  parentHash: string;
  nonce: string;
  sha3Uncles: string;
  logsBloom: string;
  transactionRoot: string;
  stateRoot: string;
  receiptRoot: string;
  miner: string;
  extraData: string;
  gasLimit: number;
  gasUsed: number;
  timestamp: number | string;
}

interface BlockTransactionBase extends BlockHeader {
  size: number;
  difficulty: number;
  totalDifficulty: number;
  uncles: string[];
}

interface BlockTransactionString extends BlockTransactionBase {
  transactions: string[];
}
interface Transaction {
  hash: string;
  nonce: number;
  blockHash: string | null;
  blockNumber: number | null;
  transactionIndex: number | null;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  gas: number;
  input: string;
}
declare class Eth {
  Contract: new (
    jsonInterface: any,
    address?: string,
    options?: ContractOptions
  ) => Contract;

  constructor(provider: Providers);

  getBalance(address: string): Promise<string>;

  getTransaction(
    transactionHash: string,
    callback?: (error: Error, transaction: Transaction) => void
  ): Promise<Transaction>;

  getTransactionCount(
    address: string,
    defaultBlock: BlockNumber
  ): Promise<number>;

  getTransactionReceipt(
    hash: string,
    callback?: (error: Error, transactionReceipt: TransactionReceipt) => void
  ): Promise<TransactionReceipt>;

  getBlock(
    blockHashOrBlockNumber: BlockNumber | string
  ): Promise<BlockTransactionString>;
}

declare class Web3 {
  static givenProvider: any;
  static utils: {
    toHex: (str: string) => string;
  };

  eth: Eth;
  constructor(provider: Providers);
}

interface Log {
  address: string;
  data: string;
  topics: string[];
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
}

interface EventLog {
  event: string;
  address: string;
  returnValues: any;
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  raw?: { data: string; topics: any[] };
}
interface TransactionReceipt {
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

// ====
interface SendOptions {
  from: string;
  gasPrice?: string;
  gas?: number;
  value?: number | string;
  nonce?: number;
}
interface CallOptions {
  from?: string;
  gasPrice?: string;
  gas?: number;
}

interface EstimateGasOptions {
  from?: string;
  gas?: number;
  value?: number | string;
}

interface ContractOptions {
  // Sender to use for contract calls
  from?: string;
  // Gas price to use for contract calls
  gasPrice?: string;
  // Gas to use for contract calls
  gas?: number;
  // Contract code
  data?: string;
}
interface Filter {
  [key: string]: number | string | string[] | number[];
}

interface EventData {
  returnValues: {
    [key: string]: any;
  };
  raw: {
    data: string;
    topics: string[];
  };
  event: string;
  signature: string;
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  address: string;
}

interface PromiEvent<T> extends Promise<T> {
  once(
    type: 'receipt',
    handler: (receipt: TransactionReceipt) => void
  ): PromiEvent<T>;

  on(
    type: 'transactionHash',
    handler: (receipt: string) => void
  ): PromiEvent<T>;

  on(
    type: 'receipt',
    handler: (receipt: TransactionReceipt) => void
  ): PromiEvent<T>;

  on(
    type: 'confirmation',
    handler: (
      confNumber: number,
      receipt: TransactionReceipt,
      latestBlockHash?: string
    ) => void
  ): PromiEvent<T>;

  on(type: 'error', handler: (error: Error) => void): PromiEvent<T>;

  on(
    type:
      | 'error'
      | 'confirmation'
      | 'receipt'
      | 'transactionHash'
      | 'allEvents',
    handler: (error: Error | TransactionReceipt | string) => void
  ): PromiEvent<T>;
}

interface ContractSendMethod {
  send(
    options: SendOptions,
    callback?: (err: Error, transactionHash: string) => void
  ): PromiEvent<Contract>;

  call(
    options?: CallOptions,
    callback?: (err: Error, result: any) => void
  ): Promise<any>;

  estimateGas(): Promise<number>;

  encodeABI(): string;
}

interface Window {
  ethereum: Providers;
}
