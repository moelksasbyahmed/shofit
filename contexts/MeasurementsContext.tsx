import { dbService } from "@/services/database";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useAuth } from "./AuthContext";

export interface Measurements {
  shoulders: string;
  bust: string;
  waist: string;
  hips: string;
}

interface MeasurementsContextType {
  measurements: Measurements;
  updateMeasurements: (measurements: Partial<Measurements>) => Promise<void>;
  hasMeasurements: () => boolean;
  loadMeasurements: () => Promise<void>;
}

const MeasurementsContext = createContext<MeasurementsContextType | undefined>(
  undefined,
);

export function MeasurementsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<Measurements>({
    shoulders: "",
    bust: "",
    waist: "",
    hips: "",
  });

  const loadMeasurements = useCallback(async () => {
    if (!user) return;

    try {
      const saved = await dbService.getMeasurements(user.id);
      if (saved) {
        setMeasurements({
          shoulders: saved.shoulders.toString(),
          bust: saved.bust.toString(),
          waist: saved.waist.toString(),
          hips: saved.hips.toString(),
        });
      }
    } catch (error) {
      console.error("Error loading measurements:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMeasurements();
    } else {
      // Clear measurements when logged out
      setMeasurements({
        shoulders: "",
        bust: "",
        waist: "",
        hips: "",
      });
    }
  }, [user, loadMeasurements]);

  const updateMeasurements = async (newMeasurements: Partial<Measurements>) => {
    if (!user) return;

    const updated = { ...measurements, ...newMeasurements };
    setMeasurements(updated);

    // Save to database if all fields are filled
    if (updated.shoulders && updated.bust && updated.waist && updated.hips) {
      try {
        await dbService.saveMeasurements(user.id, {
          shoulders: parseFloat(updated.shoulders),
          bust: parseFloat(updated.bust),
          waist: parseFloat(updated.waist),
          hips: parseFloat(updated.hips),
        });
      } catch (error) {
        console.error("Error saving measurements:", error);
      }
    }
  };

  const hasMeasurements = () => {
    return !!(
      measurements.shoulders &&
      measurements.bust &&
      measurements.waist &&
      measurements.hips
    );
  };

  return (
    <MeasurementsContext.Provider
      value={{
        measurements,
        updateMeasurements,
        hasMeasurements,
        loadMeasurements,
      }}
    >
      {children}
    </MeasurementsContext.Provider>
  );
}

export function useMeasurements() {
  const context = useContext(MeasurementsContext);
  if (!context) {
    throw new Error(
      "useMeasurements must be used within a MeasurementsProvider",
    );
  }
  return context;
}
