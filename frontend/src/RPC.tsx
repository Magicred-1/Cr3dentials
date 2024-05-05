import { IProvider } from "@web3auth/base";
import { convertStringToHex, DIDSet, Payment, xrpToDrops } from "xrpl";

export default class XrplRPC {
  private provider: IProvider;

  constructor(provider: IProvider) {
    this.provider = provider;
  }

  getAccounts = async (): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });
      if (accounts) {
        console.log("🚀 ~ XrplRPC ~ getAccounts= ~ accounts:", accounts)
        const accInfo = await this.provider.request({
          method: "account_info",
          params: [
            {
              account: accounts[0],
              strict: true,
              ledger_index: "current",
              queue: true,
            },
          ],
        });
        return accInfo;
      } else {
        return "No accounts found, please report this issue.";
      }
    } catch (error) {
      console.error("Error", error);
      return error;
    }
  };

  getBalance = async (): Promise<any> => {
    try {
      const accounts = await this.provider.request<string[], never>({
        method: "xrpl_getAccounts",
      });

      if (accounts) {
        const accInfo = (await this.provider.request({
          method: "account_info",
          params: [
            {
              account: accounts[0],
              strict: true,
              ledger_index: "current",
              queue: true,
            },
          ],
        })) as Record<string, Record<string, string>>;
        return accInfo.account_data?.Balance;
      } else {
        return "No accounts found, please report this issue.";
      }
    } catch (error) {
      console.error("Error", error);
      return error;
    }
  };

  signMessage = async (): Promise<any> => {
    try {
      const msg = "Hello world";
      const hexMsg = convertStringToHex(msg);
      const txSign = await this.provider.request< { signature: string }, never>({
        method: "xrpl_signMessage",
        params: {
          signature: hexMsg,
        },
      });
      return txSign;
    } catch (error) {
      console.log("error", error);
      return error;
    }
  };

  signAndSetDid = async (didIPFSHash: string): Promise<any> => {
    console.log("🚀 ~ XrplRPC ~ signAndSetDid= ~ didIPFSHash:", didIPFSHash)
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });

      if (accounts && accounts.length > 0) {
        const tx: DIDSet = {
          TransactionType: "DIDSet",
          Account: accounts[0] as string,
          URI: "697066733A2F2F62616679626569676479727A74357366703775646D37687537367568377932366E6634646675796C71616266336F636C67747179353566627A6469",
        };
        console.log("🚀 ~ XrplRPC ~ signAndSetDid= ~ tx:", tx)
        const txSign = await this.provider.request({
          method: "xrpl_submitTransaction",
          params: {
            transaction: tx,
          },
        });
        console.log("🚀 ~ XrplRPC ~ signAndSetDid= ~ txSign:", txSign)
        return txSign;
      } else {
        return "failed to fetch accounts";
      }
    } catch (error) {
      console.log("error", error);
      return error;
    }
  };

  signAndSendTransaction = async (): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });

      if (accounts && accounts.length > 0) {
        const tx: Payment = {
          TransactionType: "Payment",
          Account: accounts[0] as string,
          Amount: xrpToDrops(0.0001),
          Destination: "rM9uB4xzDadhBTNG17KHmn3DLdenZmJwTy",
        };
        const txSign = await this.provider.request({
          method: "xrpl_submitTransaction",
          params: {
            transaction: tx,
          },
        });
        return txSign;
      } else {
        return "failed to fetch accounts";
      }
    } catch (error) {
      console.log("error", error);
      return error;
    }
  };
}