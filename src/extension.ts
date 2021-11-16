import {
  PluginConfigurations,
  PluginContext,
  PluginType,
  IChainIdeProxyImpl
} from './libs';
import NervosWalletInst from './nervosService';

export function activate(ctx: PluginContext, Impl: IChainIdeProxyImpl) {
  const registerWallet = Impl.registerWallet({
    init: NervosWalletInst.init,
    setBlocksToWait: NervosWalletInst.setBlocksToWait,
    setInterval: NervosWalletInst.setInterval,
    setMaxTimes: NervosWalletInst.setMaxTimes,
    deploy: NervosWalletInst.deployContract,
    interact: NervosWalletInst.interactContract,
    fetchNetWork: NervosWalletInst.fetchNetWork,
    fetchAccount: NervosWalletInst.fetchAccount,
    addRpcNetInWallet: NervosWalletInst.createGodwokenTestnet,
    setWeb3ConfigInWallet: NervosWalletInst.setPolyjuiceWeb3Config,
    walletProvider: NervosWalletInst.walletProvider,
    walletId: NervosWalletInst.walletId
  });

  ctx.subscriptions.push(registerWallet);
}

export function deactivate(_ctx: PluginContext) {
  console.log('deactivate NervosWallet');
}

export const config: PluginConfigurations = {
  pluginId: 'NervosWallet',
  version: '0.0.1',
  type: PluginType.server,
  active: true,
  description: {
    title: `Nervos Wallet Service${
      process.env.NODE_ENV === 'development' ? ' development' : ''
    }`,
    icon: '#CommentSolid',
    description: 'nervos wallet service'
  }
};
