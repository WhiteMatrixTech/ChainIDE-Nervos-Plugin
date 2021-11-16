/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { cloneDeep } from 'lodash';
import { Observable, Observer } from 'rxjs';
import { nervos } from './type';
import { convertUnit, normalizeArgs, validateArgs } from './utils';
import {
  EEventType,
  EInteractEventType,
  GodwokenNetworkError,
  IEvent,
  IWeb3CallResult
} from './type/IInternal';
import { godwokenTestnet, addressTranslator } from './godwoken';
import Web3 from 'web3';
import {
  EthTransactionReceipt,
  PolyjuiceConfig
} from '@polyjuice-provider/base';
import PolyjuiceHttpProvider from '@polyjuice-provider/web3';

const DEFAULT_INTERVAL = 500; // 0.5s， 轮询查询间隔
const DEFAULT_BLOCKS_TO_WAIT = 5; // 确认次数
const DEFAULT_MAX_QUERY_WAIT_TIME = 500; // 操作后，等待确认的轮询查询次数限制

export default class NervosWallet {
  /**
   * [instance  当前实例]
   * @type {this}
   */
  static instance: NervosWallet;

  web3: Web3;
  walletProvider: Providers;
  walletId = 'NervosWallet';

  polyjuiceConfig: PolyjuiceConfig;
  polyjuiceWeb3HttpProvider: PolyjuiceHttpProvider;

  interval: number;
  blocksToWait: number;
  maxQueryWaitTimes: number;

  constructor() {
    this.walletProvider = window.ethereum;

    this.polyjuiceConfig = {
      web3Url: godwokenTestnet.rpcUrls[0]
    };
    this.polyjuiceWeb3HttpProvider = new PolyjuiceHttpProvider(
      this.polyjuiceConfig.web3Url,
      this.polyjuiceConfig
    );
    this.web3 = new Web3(this.polyjuiceWeb3HttpProvider || Web3.givenProvider);

    this.interval = DEFAULT_INTERVAL;
    this.blocksToWait = DEFAULT_BLOCKS_TO_WAIT;
    this.maxQueryWaitTimes = DEFAULT_MAX_QUERY_WAIT_TIME;
  }

  /**
   * [getInstance 获取单例]
   * @method getInstance
   * @return {[type]}    [description]
   */
  static getInstance() {
    if (this.instance instanceof this === false) {
      this.instance = new this();
    }
    return this.instance;
  }

  /**
   * [destroyInstance 销毁实例]
   * @method destroyInstance
   * @return {[type]}    [description]
   */
  static destroyInstance() {
    this.instance = null;
  }

  setPolyjuiceWeb3Config = (web3Url: string) => {
    this.polyjuiceConfig = {
      web3Url: web3Url
    };
    this.polyjuiceWeb3HttpProvider = new PolyjuiceHttpProvider(
      this.polyjuiceConfig.web3Url,
      this.polyjuiceConfig
    );
    this.web3 = new Web3(this.polyjuiceWeb3HttpProvider || Web3.givenProvider);
  };

  setInterval = (interval: number) => {
    this.interval = interval;
  };

  setBlocksToWait = (blocksToWait: number) => {
    this.blocksToWait = blocksToWait;
  };

  setMaxTimes = (maxTimes: number) => {
    this.maxQueryWaitTimes = maxTimes;
  };

  /**
   * [init 钱包初始化]
   * @method init
   * @params {onChainChange: listen并获取网络, onAccountChange: listen并获取账户 }
   * @return {[Promise]}
   */
  init = () => {
    return new Promise<void>((resolve, reject) => {
      if (!window.ethereum) {
        const error = new Error('No MetaMask Found');
        reject(error);
      } else {
        this.walletProvider = window.ethereum;
        resolve();
      }
    });
  };

  createAccount = () => {
    return new Observable((observer: Observer<string>) => {
      observer.error('请在metamask 插件中新增账户');
      observer.complete();
    });
  };

  createGodwokenTestnet = (rpcConfig = godwokenTestnet) => {
    const rpcParams = rpcConfig;
    return new Promise((resolve, reject) => {
      this.walletProvider
        .request({
          method: 'wallet_addEthereumChain',
          params: [rpcParams]
        })
        .then(() => {
          resolve(`${godwokenTestnet.chainName} was added in metamask`);
        })
        .catch((error: Error) => {
          reject(
            new Error(`Error while adding godwoken testnet: ${error.message}`)
          );
        });
    });
  };

  fetchNetWork = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      this.walletProvider
        .request({ method: 'eth_requestAccounts' })
        .then(() => {
          resolve(this.walletProvider.chainId);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  };

  fetchAccount = async (): Promise<
    nervos.INervosAccount[] | GodwokenNetworkError
  > => {
    const _accounts = [window.ethereum.selectedAddress];

    let isShortAddress = await this.validIsShortAddressOnChain(_accounts[0]);
    const _l2Balance = await this.web3.eth
      .getBalance(_accounts[0])
      .catch((err: Error) => {
        throw err;
      });
    isShortAddress = Number(_l2Balance) !== 0;

    if (!isShortAddress) {
      // const error = new Error(GodwokenNetworkError.NOT_LAYER2_GODWOKEN_ADDRESS);
      console.log(
        `ethAddress ${_accounts[0]} is't godwoken testnet account, please create on chain`
      );
    }

    const shortAddress = await this.getShortAddressByETHAddress(_accounts[0]);

    return [
      {
        shortAddress,
        isValidAddress: isShortAddress,
        ethAddress: _accounts[0],
        address: _accounts[0],
        balance: _l2Balance || '0'
      }
    ];
  };

  deployContract = (
    actionData: nervos.IDeployContractActionData
  ): Observable<IEvent<EEventType>> => {
    return new Observable((observer: Observer<IEvent<EEventType>>) => {
      const { abi } = actionData.solcCompiledOutput;
      let args: string[] = [];
      try {
        args = normalizeArgs(
          actionData.solcCompiledOutput,
          actionData.constructorArgs
        );
      } catch (err) {
        observer.error(err);
      }

      const abiItems = cloneDeep(abi);
      this.polyjuiceWeb3HttpProvider.addAbi(abiItems);
      this.web3 = new Web3(
        this.polyjuiceWeb3HttpProvider || Web3.givenProvider
      );
      const contract = new this.web3.eth.Contract(abiItems);
      contract
        .deploy({
          data: actionData.solcCompiledOutput.evm.bytecode.object,
          arguments: args
        })
        .send({
          from: actionData.account.address,
          gas: actionData.deployOptions.gasLimit,
          gasPrice: Web3.utils.toHex(
            convertUnit(
              actionData.deployOptions.value,
              actionData.deployOptions.unit
            ).toString()
          )
        })
        .on('transactionHash', (hash: string) => {
          observer.next({
            type: EEventType.TRANSACTION_HASH,
            data: { hash }
          });
          // use metamask event, no longer query interval
          // this.scheduledQueryTransAndTriggerConfirm(observer, hash).catch(
          //   (error) => {
          //     observer.error(error);
          //     observer.complete();
          //   }
          // );
        })
        .once('receipt', (receipt: TransactionReceipt) => {
          observer.next({
            type: EEventType.RECEIPT,
            data: { receipt }
          });
        })
        .on(
          'confirmation',
          (confNumber: number, receipt: TransactionReceipt) => {
            if (confNumber <= this.blocksToWait) {
              observer.next({
                type: EEventType.CONFIRMATION,
                data: { receipt, confirmationNumber: confNumber }
              });
            } else {
              observer.complete();
            }
          }
        )
        .on('error', (error: string) => {
          observer.error(error);
          observer.complete();
        })
        .catch((e) => {
          observer.error(e);
          observer.complete();
        });
    });
  };

  interactContract = (
    interactContractActionData: nervos.IInteractContractActionData
  ): Observable<IEvent<EInteractEventType>> => {
    return new Observable((observer: Observer<IEvent<EInteractEventType>>) => {
      const {
        abi,
        abiEntryIdx,
        accountAddress,
        interactArgs,
        contractAddress,
        payableValue,
        argString
      } = interactContractActionData;

      const targetAbiEntry = abi[abiEntryIdx];
      const functionKey = `${targetAbiEntry.name}${argString}`;

      const functionArguments: string[] = [];
      targetAbiEntry.inputs.forEach((input) => {
        functionArguments.push(
          validateArgs(input.type, interactArgs[input.name])
        );
      });

      const abiItems = cloneDeep(abi);
      this.polyjuiceWeb3HttpProvider.addAbi(abiItems);
      this.web3 = new Web3(
        this.polyjuiceWeb3HttpProvider || Web3.givenProvider
      );
      const contract = new this.web3.eth.Contract(abi, contractAddress);

      const contractFunction =
        functionArguments.length === 0
          ? contract.methods[functionKey]()
          : contract.methods[functionKey](...functionArguments);

      if (
        targetAbiEntry.stateMutability === 'pure' ||
        targetAbiEntry.stateMutability === 'view'
      ) {
        // use call
        contractFunction
          .call({ from: accountAddress })
          .then((result: IWeb3CallResult) => {
            observer.next({
              type: EInteractEventType.CALL_RESULT,
              data: result
            });
          })
          .catch((error: Error) => {
            observer.error(error);
            observer.complete();
          });
      } else {
        contractFunction
          .send({ from: accountAddress, value: payableValue || '0x00' })
          .on('transactionHash', (hash: string) => {
            observer.next({
              type: EInteractEventType.SEND_TRANSACTION_HASH,
              data: { hash }
            });
            this.scheduledQueryTransAndTriggerConfirm(observer, hash).catch(
              (error) => {
                observer.error(error);
                observer.complete();
              }
            );
          })
          .on('error', (error: string) => {
            observer.error(error);
            observer.complete();
          });
      }
    });
  };

  private createLayer2Address = async (addr: string) => {
    const hexAddress = await addressTranslator
      .createLayer2Address(addr)
      .catch((err: Error) => {
        console.log('Errored while createLayer2Address', err.message);
      });

    return hexAddress;
  };

  private validIsShortAddressOnChain = async (addr: string) => {
    const address = addressTranslator.ethAddressToGodwokenShortAddress(addr);
    const result = await this.polyjuiceWeb3HttpProvider.godwoker
      .isShortAddressOnChain(address)
      .catch((err: Error) => {
        console.log('current address on chain is short address', err.message);
      });

    return result;
  };

  private getShortAddressByETHAddress = async (addr: string) => {
    const result = await this.polyjuiceWeb3HttpProvider.godwoker
      .getShortAddressByAllTypeEthAddress(addr)
      .catch((err: Error) => {
        console.log('current address on chain is short address', err.message);
      });
    return result;
  };

  private queryEthAddressByShortAddress = async (addr: string) => {
    const result = await this.polyjuiceWeb3HttpProvider.godwoker
      .getEthAddressByAllTypeShortAddress(addr)
      .catch((err: Error) => {
        console.log(
          'current address on chain is short address',
          addr,
          err.message
        );
      });
    return result;
  };

  private scheduledQueryTransAndTriggerConfirm = async (
    observer: Observer<object>,
    hash: string
  ) => {
    const { receipt, queryTimes } = await this.scheduledQueryReceiptTillExist(
      hash
    );

    observer.next({
      type: EInteractEventType.SEND_RECEIPT,
      data: { receipt }
    });

    let usedTimes = queryTimes;
    let cn = 1;
    while (cn <= this.blocksToWait) {
      const { confirmNumber, queryTimes } = await this.scheduledQueryNewBlock(
        receipt,
        usedTimes,
        cn
      );
      usedTimes += queryTimes;
      for (let j = cn; j <= confirmNumber; j++) {
        observer.next({
          type: EEventType.CONFIRMATION,
          data: { receipt, confirmationNumber: j }
        });
      }
      cn = confirmNumber + 1;
    }

    observer.complete();
  };

  private scheduledQueryReceiptTillExist = async (
    hash: string,
    usedTimes = 0
  ) => {
    let queryTimes = 0; // 记录执行查询次数
    while (true) {
      if (usedTimes + queryTimes > this.maxQueryWaitTimes) {
        throw new Error('query receipt times out.');
      }
      const receipt: EthTransactionReceipt =
        await this.polyjuiceWeb3HttpProvider.godwoker.eth_getTransactionReceipt(
          hash
        );
      queryTimes++;
      if (receipt && receipt.blockNumber) {
        return { receipt, queryTimes };
      }
      await this.wait(this.interval);
    }
  };

  private scheduledQueryNewBlock = async (
    receipt: EthTransactionReceipt,
    usedTimes = 0,
    exceptNewBlockConfirmNumber: number
  ) => {
    let queryTimes = 0; // 记录执行查询次数
    while (true) {
      if (usedTimes + queryTimes > this.maxQueryWaitTimes) {
        throw new Error('query confirm blocks timeout.');
      }
      const confirmNumber = await this.queryBlockConfirmNumber(receipt);

      queryTimes++;
      if (confirmNumber >= exceptNewBlockConfirmNumber) {
        return { confirmNumber, queryTimes };
      }
      await this.wait(this.interval);
    }
  };

  private queryBlockConfirmNumber = async (receipt: EthTransactionReceipt) => {
    const currentBlockNumber = Web3.utils.hexToNumber(receipt.blockNumber);
    const latestBlock = await this.web3.eth.getBlock('latest');
    return latestBlock.number - currentBlockNumber;
  };

  private wait(duration: number) {
    return new Promise(function (resolve) {
      setTimeout(resolve, duration);
    });
  }
}
