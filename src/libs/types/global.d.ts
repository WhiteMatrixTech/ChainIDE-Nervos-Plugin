import { IChainIdeProxyImpl } from '..';

declare global {
  interface Window {
    chainIDE: IChainIdeProxyImpl;
  }
}
