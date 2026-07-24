"use client";
// src/app/scout/membership/membership-registration/WizardContext.tsx
// Shared client-side state for the Personal Info step, so it survives
// navigation between /personal-info and /register without localStorage.
// Data is only persisted to the DB at final submit (register/page.tsx's
// onNext -> submitApplicationAction).

import { createContext, useContext, useState, ReactNode } from "react";

type PersonalInfoState = {
  bloodType: string;
  address: string;
  region: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  streetAddress: string;
  telephone: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;
};

type WizardContextValue = PersonalInfoState & {
  setBloodType: (value: string) => void;
  setAddress: (value: string) => void;
  setRegion: (value: string) => void;
  setProvince: (value: string) => void;
  setCityMunicipality: (value: string) => void;
  setBarangay: (value: string) => void;
  setStreetAddress: (value: string) => void;
  setTelephone: (value: string) => void;
  setEmergencyContactName: (value: string) => void;
  setEmergencyContactRelationship: (value: string) => void;
  setEmergencyContactNumber: (value: string) => void;
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [bloodType, setBloodType] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [cityMunicipality, setCityMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [telephone, setTelephone] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");

  return (
    <WizardContext.Provider
      value={{
        bloodType,
        address,
        region,
        province,
        cityMunicipality,
        barangay,
        streetAddress,
        telephone,
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactNumber,
        setBloodType,
        setAddress,
        setRegion,
        setProvince,
        setCityMunicipality,
        setBarangay,
        setStreetAddress,
        setTelephone,
        setEmergencyContactName,
        setEmergencyContactRelationship,
        setEmergencyContactNumber,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}