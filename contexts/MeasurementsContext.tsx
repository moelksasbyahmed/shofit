import React, { createContext, ReactNode, useContext, useState } from "react";

export interface Measurements {
  shoulders: string;
  bust: string;
  waist: string;
  hips: string;
}

interface MeasurementsContextType {
  measurements: Measurements;
  updateMeasurements: (measurements: Partial<Measurements>) => void;
  hasMeasurements: () => boolean;
}

const MeasurementsContext = createContext<MeasurementsContextType | undefined>(
  undefined,
);

export function MeasurementsProvider({ children }: { children: ReactNode }) {
  const [measurements, setMeasurements] = useState<Measurements>({
    shoulders: "",
    bust: "",
    waist: "",
    hips: "",
  });

  const updateMeasurements = (newMeasurements: Partial<Measurements>) => {
    setMeasurements((current) => ({ ...current, ...newMeasurements }));
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
