"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchProfileByUserId } from "@/lib/profiles/repository";
import type { Profile } from "@/lib/profiles/types";
import { createClient } from "@/lib/supabase/client";

type AuthStatus = "loading" | "authenticated" | "anonymous";
type ProfileStatus = "idle" | "loading" | "ready" | "error";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  signOut(): Promise<void>;
};

type ProfileContextValue = {
  status: ProfileStatus;
  profile: Profile | null;
  error: string | null;
  refreshProfile(): Promise<Profile | null>;
  updateProfile(profile: Profile | null): void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(createClient);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("idle");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const userId = user?.id;
  const currentUserIdRef = useRef<string | undefined>(undefined);
  const profileRequestRef = useRef(0);

  const applyUser = useCallback((nextUser: User | null) => {
    const nextUserId = nextUser?.id;
    if (currentUserIdRef.current !== nextUserId) {
      currentUserIdRef.current = nextUserId;
      profileRequestRef.current += 1;
      setProfile(null);
      setProfileStatus(nextUser ? "loading" : "idle");
      setProfileError(null);
    }

    setUser(nextUser);
    setStatus(nextUser ? "authenticated" : "anonymous");
  }, []);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      const nextUser = error ? null : (data.session?.user ?? null);
      applyUser(nextUser);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const nextUser = session?.user ?? null;
      applyUser(nextUser);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applyUser, supabase]);

  const loadProfile = useCallback(async (): Promise<Profile | null> => {
    if (!userId) return null;
    const requestId = profileRequestRef.current + 1;
    profileRequestRef.current = requestId;

    setProfileStatus("loading");
    setProfileError(null);

    try {
      const nextProfile = await fetchProfileByUserId(supabase, userId);
      if (
        profileRequestRef.current !== requestId ||
        currentUserIdRef.current !== userId
      ) {
        return null;
      }
      setProfile(nextProfile);
      setProfileStatus("ready");
      return nextProfile;
    } catch (error) {
      if (
        profileRequestRef.current !== requestId ||
        currentUserIdRef.current !== userId
      ) {
        return null;
      }
      setProfileStatus("error");
      setProfileError(
        error instanceof Error
          ? error.message
          : "プロフィールの取得に失敗しました。",
      );
      return null;
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    const timer = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProfile, status, userId]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error("ログアウトに失敗しました。");
    }

    applyUser(null);
  }, [applyUser, supabase]);

  const updateProfile = useCallback((nextProfile: Profile | null) => {
    setProfile(nextProfile);
    setProfileStatus("ready");
    setProfileError(null);
  }, []);

  const authValue = useMemo<AuthContextValue>(
    () => ({ status, user, signOut }),
    [signOut, status, user],
  );
  const profileValue = useMemo<ProfileContextValue>(
    () => ({
      status: profileStatus,
      profile,
      error: profileError,
      refreshProfile: loadProfile,
      updateProfile,
    }),
    [loadProfile, profile, profileError, profileStatus, updateProfile],
  );

  return (
    <AuthContext value={authValue}>
      <ProfileContext value={profileValue}>{children}</ProfileContext>
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}

export function useProfile(): ProfileContextValue {
  const value = useContext(ProfileContext);
  if (!value) {
    throw new Error("useProfile must be used within AuthProvider");
  }
  return value;
}
