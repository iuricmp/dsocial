import { GetJsonFollowersResult, GetJsonFollowingResult, User } from "@/types";
import { useGnoNativeContext } from "@gnolang/gnonative";

const MAX_RESULT = 10;

export const useSearch = () => {
  const { gnonative } = useGnoNativeContext();

  async function Follow(address: string) {
    checkActiveAccount();

    try {
      const gasFee = "1000000ugnot";
      const gasWanted = BigInt(10000000);
      const args: Array<string> = [address];
      for await (const response of await gnonative.call("gno.land/r/berty/social", "Follow", args, gasFee, gasWanted)) {
        console.log("response: ", JSON.stringify(response));
      }
    } catch (error) {
      console.error("error registering account", error);
    }
  }

  async function Unfollow(address: string) {
    checkActiveAccount();

    try {
      const gasFee = "1000000ugnot";
      const gasWanted = BigInt(10000000);
      const args: Array<string> = [address];
      for await (const response of await gnonative.call("gno.land/r/berty/social", "Unfollow", args, gasFee, gasWanted)) {
        console.log("response: ", JSON.stringify(response));
      }
    } catch (error) {
      console.error("error registering account", error);
    }
  }

  async function GetJsonFollowersCount(address: string | Uint8Array) {
    checkActiveAccount();

    const { n_followers } = await GetJsonFollowers(address);
    const { n_following } = await GetJsonFollowing(address);

    return { n_followers, n_following };
  }

  async function GetJsonFollowers(address: string | Uint8Array) {
    checkActiveAccount();

    const result = await gnonative.qEval("gno.land/r/berty/social", `GetJsonFollowers("${address}", 0, 1000)`);
    const json = (await convertToJson(result)) as GetJsonFollowersResult;

    return json;
  }

  async function GetJsonFollowing(address: string | Uint8Array) {
    checkActiveAccount();

    const result = await gnonative.qEval("gno.land/r/berty/social", `GetJsonFollowing("${address}", 0, 1000)`);
    const json = (await convertToJson(result)) as GetJsonFollowingResult;

    return json;
  }

  async function getJsonUserByName(username: string) {
    checkActiveAccount();

    const result = await gnonative.qEval("gno.land/r/berty/social", `GetJsonUserByName("${username}")`);
    const json = (await convertToJson(result)) as User;

    return json;
  }

  async function searchUser(q: string, excludeActiveAccount?: boolean) {
    checkActiveAccount();

    const result = await gnonative.qEval("gno.land/r/berty/social", `ListJsonUsersByPrefix("${q}", ${MAX_RESULT})`);
    const usernames = await convertToJson(result);
    if (excludeActiveAccount) {
      // Remove the active account's own username.
      const currentAccount = await gnonative.getActiveAccount();
      const i = usernames.indexOf(currentAccount.key?.name, 0);
      if (i >= 0) {
        usernames.splice(i, 1);
      }
    }

    return usernames;
  }

  async function convertToJson(result: string | undefined) {
    if (result === '("" string)') return undefined;

    if (!result || !(result.startsWith("(") && result.endsWith(" string)"))) throw new Error("Malformed GetThreadPosts response");
    const quoted = result.substring(1, result.length - " string)".length);
    const json = JSON.parse(quoted);
    const jsonPosts = JSON.parse(json);

    return jsonPosts;
  }

  async function checkActiveAccount() {
    const currentAccount = await gnonative.getActiveAccount();
    if (!currentAccount.key) throw new Error("No active account");
  }

  return {
    searchUser,
    getJsonUserByName,
    GetJsonFollowersCount,
    GetJsonFollowing,
    GetJsonFollowers,
    Follow,
    Unfollow,
  };
};

export type UseSearchReturnType = ReturnType<typeof useSearch>;
