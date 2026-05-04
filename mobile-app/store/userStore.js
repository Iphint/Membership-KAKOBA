import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      login: (userData) => set({ user: userData }),
      register: (userData) => set({ user: userData }),
      setUser: (user) => set({ user }),
      updatePoints: (points) =>
        set((state) => ({
          user: state.user ? { ...state.user, points } : null,
        })),
      updateMembershipLevel: (membershipLevel) =>
        set((state) => ({
          user: state.user ? { ...state.user, membershipLevel } : null,
        })),
      updateAvatar: (profile_picture) =>
        set((state) => ({
          user: state.user ? { ...state.user, profile_picture } : null,
        })),
      logout: async () => {
        set({ user: null });
        await AsyncStorage.removeItem("token");
      }
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
