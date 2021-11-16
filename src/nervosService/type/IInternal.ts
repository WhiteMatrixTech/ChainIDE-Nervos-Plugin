/**
 * Interface for web3.eth event callback interface
 */
export enum GodwokenNetworkError {
  NOT_LAYER2_GODWOKEN_ADDRESS = 'NOT_LAYER2_GODWOKEN_ADDRESS'
}
export enum EEventType {
  TRANSACTION_ERROR = 'transactionError',
  TRANSACTION_HASH = 'transactionHash',
  RECEIPT = 'receipt',
  CONFIRMATION = 'confirmation'
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum EInteractEventType {
  GET_TRANSACTION_ERROR = 'get/transactionError',
  SEND_TRANSACTION_HASH = 'send/transactionHash',
  SEND_RECEIPT = 'send/receipt',
  SEND_CONFIRMATION = 'send/confirmation',
  CALL_RESULT = 'call/result'
}

export interface IEvent<T> {
  type: T;
  data?: any;
  meta?: any;
}

export interface IWeb3CallResult {
  code: number;
  data: string;
}

export const fileCompiledExt = '.ckb.compiled';
export const fileDeployedExt = '.ckb.deployed';
