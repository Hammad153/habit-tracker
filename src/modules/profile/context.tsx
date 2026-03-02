import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { ToastService } from "@/src/services";
import { IProfile } from "./model";
import { ProfileService } from "./api";

interface IProps {
  children: ReactNode;
}

type TProfileContext = {
  loading: boolean;
  profile: IProfile;
  setProfile: React.Dispatch<SetStateAction<IProfile>>;
  fetchProfile: (userId?: string) => Promise<void>;
  updateProfile: (id: string, data: Partial<IProfile>) => Promise<void>;
};

export const ProfileContext = createContext<TProfileContext | undefined>(
  undefined,
);

export const useProfileState = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileState must be used within the ProfileProvider");
  }
  return context;
};

export const ProfileProvider: React.FC<IProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<IProfile>({} as IProfile);

  const fetchProfile = (userId?: string) => {
    setLoading(true);
    return ProfileService.get(userId)
      .then((data) => {
        if (data) {
          setProfile(data);
        }
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateProfile = (id: string, data: Partial<IProfile>) => {
    setLoading(true);
    return ProfileService.update(id, data)
      .then(() => {
        ToastService.Success("Profile updated successfully");
        return fetchProfile();
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <ProfileContext.Provider
      value={{
        loading,
        profile,
        setProfile,
        fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
