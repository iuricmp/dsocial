import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Loading } from "@gno/components/loading";
import { AccountView } from "@gno/components/view";
import { useSearch } from "@gno/hooks/use-search";
import { Following, Post, User } from "@gno/types";
import { setPostToReply, useAppSelector } from "@gno/redux";
import { selectAccount } from "redux/features/accountSlice";
import { setFollows } from "redux/features/profileSlice";
import { useFeed } from "@gno/hooks/use-feed";
import { useUserCache } from "@gno/hooks/use-user-cache";

export default function Page() {
  const { accountName } = useLocalSearchParams<{ accountName: string }>();

  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followers, setFollowers] = useState<Following[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);

  const navigation = useNavigation();
  const feed = useFeed();
  const search = useSearch();
  const userCache = useUserCache();
  const dispatch = useDispatch();

  const currentUser = useAppSelector(selectAccount);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await fetchData();
    });
    return unsubscribe;
  }, [accountName]);

  const fetchData = async () => {
    if (!accountName) return;

    try {
      setLoading("Loading account...");
      const response = await search.getJsonUserByName(accountName);
      setUser(response);

      const { followers } = await search.GetJsonFollowers(response.address);
      setFollowers(followers);

      const { following } = await search.GetJsonFollowing(response.address);
      setFollowing(following);

      const total = await feed.fetchCount(response.address);
      setTotalPosts(total);

      const enrichFollows = async (follows: Following[]) => {
        for await (const item of follows) {
          item.user = await userCache.getUser(item.address);
        }
      };

      await enrichFollows(following);
      await enrichFollows(followers);

      dispatch(setFollows({ followers, following }));
    } catch (error: unknown | Error) {
      console.log(error);
    } finally {
      setLoading(undefined);
    }
  };

  const onPressFollowing = () => {
    router.navigate({ pathname: "account/following" });
  };

  const onPressFollowers = async () => {
    router.navigate({ pathname: "account/followers" });
  };

  const onPressFollow = async (address: string) => {
    await search.Follow(address);

    fetchData();
  };

  const onPressUnfollow = async (address: string) => {
    await search.Unfollow(address as string);

    fetchData();
  };

  const onGnod = async (post: Post) => {
    console.log("gnodding post: ", post);
    setLoading("Gnoding...");
    try {
      await feed.onGnod(post);
      await fetchData();
    } catch (error) {
      console.error("Error while adding reaction: " + error);
    } finally {
      setLoading(undefined);
    }
  };

  const onPressPost = async (item: Post) => {
    await dispatch(setPostToReply({ post: item }));
    router.navigate({ pathname: "/post/[post_id]", params: { post_id: item.id, address: item.user.address } });
  };

  if (!user || loading || !currentUser) {
    return <Loading message="Profile Loading..." />;
  }

  return (
    <AccountView
      user={user}
      totalPosts={totalPosts}
      currentUser={currentUser}
      following={following}
      followers={followers}
      onGnod={onGnod}
      onPressPost={onPressPost}
      onPressFollowing={onPressFollowing}
      onPressFollowers={onPressFollowers}
      onPressFollow={onPressFollow}
      onPressUnfollow={onPressUnfollow}
    />
  );
}
