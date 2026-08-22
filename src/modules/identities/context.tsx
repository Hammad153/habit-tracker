import { ToastService } from "@/src/services";
import { useAuthState } from "@/src/modules/auth/context";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { IdentityService } from "./api";
import { IIdentity } from "./model";

interface IProps {
  children: ReactNode;
}

type TIdentitiesContext = {
  identities: IIdentity[];
  loading: boolean;
  /** Active (non-archived) identities, newest first. */
  activeIdentities: IIdentity[];
  fetchIdentities: (options?: { silent?: boolean }) => Promise<void>;
  createIdentity: (
    input: Partial<IIdentity>,
  ) => Promise<IIdentity | void>;
  updateIdentity: (
    id: string,
    input: Partial<IIdentity>,
  ) => Promise<void>;
  deleteIdentity: (id: string) => Promise<{ archived?: boolean } | void>;
  linkHabit: (identityId: string, habitId: string) => Promise<boolean>;
  unlinkHabit: (identityId: string, habitId: string) => Promise<boolean>;
};

const IdentitiesContext = createContext<TIdentitiesContext | undefined>(
  undefined,
);

export const useIdentitiesState = () => {
  const context = useContext(IdentitiesContext);
  if (!context) {
    throw new Error(
      "useIdentitiesState must be used within the IdentitiesProvider",
    );
  }
  return context;
};

export const IdentitiesProvider: React.FC<IProps> = ({ children }) => {
  const { user } = useAuthState();
  const [identities, setIdentities] = useState<IIdentity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIdentities = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user?.id) {
        setIdentities([]);
        return;
      }
      if (!options?.silent) setLoading(true);
      try {
        // Client-local day key so "evidence today" matches the user's clock.
        const today = new Date();
        const dateKey = [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, "0"),
          String(today.getDate()).padStart(2, "0"),
        ].join("-");
        const data = await IdentityService.list(dateKey);
        setIdentities(Array.isArray(data) ? data : []);
      } catch (err) {
        ToastService.ApiError(err);
      } finally {
        if (!options?.silent) setLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    fetchIdentities();
  }, [fetchIdentities]);

  const createIdentity = async (input: Partial<IIdentity>) => {
    try {
      const created = await IdentityService.create(input);
      await fetchIdentities({ silent: true });
      return created;
    } catch (err) {
      ToastService.ApiError(err);
    }
  };

  const updateIdentity = async (id: string, input: Partial<IIdentity>) => {
    try {
      await IdentityService.update(id, input);
      await fetchIdentities({ silent: true });
    } catch (err) {
      ToastService.ApiError(err);
    }
  };

  /**
   * The server archives identities that already carry evidence and hard
   * deletes unused ones; the flag tells the UI which happened.
   */
  const deleteIdentity = async (id: string) => {
    try {
      const result = await IdentityService.remove(id);
      await fetchIdentities({ silent: true });
      return result;
    } catch (err) {
      ToastService.ApiError(err);
    }
  };

  /** Returns true when the mutation changed anything. */
  const linkHabit = async (identityId: string, habitId: string) => {
    try {
      await IdentityService.linkHabit(identityId, habitId);
      await fetchIdentities({ silent: true });
      return true;
    } catch (err) {
      ToastService.ApiError(err);
      return false;
    }
  };

  const unlinkHabit = async (identityId: string, habitId: string) => {
    try {
      await IdentityService.unlinkHabit(identityId, habitId);
      await fetchIdentities({ silent: true });
      return true;
    } catch (err) {
      ToastService.ApiError(err);
      return false;
    }
  };

  const activeIdentities = identities.filter((identity) =>
    identity.status === "ARCHIVED" ? false : true,
  );

  return (
    <IdentitiesContext.Provider
      value={{
        identities,
        loading,
        activeIdentities,
        fetchIdentities,
        createIdentity,
        updateIdentity,
        deleteIdentity,
        linkHabit,
        unlinkHabit,
      }}
    >
      {children}
    </IdentitiesContext.Provider>
  );
};
