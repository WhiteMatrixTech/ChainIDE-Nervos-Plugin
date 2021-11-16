import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { PolyjuiceConfig } from '@polyjuice-provider/base';
import { AddressTranslator } from 'nervos-godwoken-integration';
import Web3 from 'web3';
import { nervos } from './type';

export const godwokenTestnet: nervos.addRpcnetInWallet = {
  chainId: '0x116e1',
  chainName: 'Godwoken Testnet',
  rpcUrls: ['https://godwoken-testnet-web3-rpc.ckbapp.dev'],
  nativeCurrency: {
    name: 'Godwoken Testnet CKB',
    symbol: 'ckb',
    decimals: 18
  },
  blockExplorerUrls: ['https://aggron.layerview.io']
};

// web3.js default config
export const polyjuiceConfig: PolyjuiceConfig = {
  web3Url: godwokenTestnet.rpcUrls[0]
};
export const polyjuiceWeb3HttpProvider = new PolyjuiceHttpProvider(
  polyjuiceConfig.web3Url,
  polyjuiceConfig
);
export const polyjuiceWeb3 = new Web3(
  polyjuiceWeb3HttpProvider || Web3.givenProvider
);

export const addressTranslator = new AddressTranslator();
