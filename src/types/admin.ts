// src/types/admin.ts

export interface DashboardStats {
  totalScouts: number;
  totalAdministrators: number;
  totalCouncils: number;
  pendingPayments: number;
  activeMembers: number;
}

export interface AdministratorRecord {
  id: string;

  userId: string;

  fullName: string;

  email: string;

  roleId: string;

  role: string;

  position: string | null;

  office: string | null;

  createdAt: Date;

  lastUpdated: Date;
}

export interface AdminScoutRecord {
  id: string;

  userId: string;

  scoutIdNumber: string | null;

  fullName: string;

  email: string;

  councilId: string;

  council: string;

  verificationStatus: string;

  createdAt: Date;

  lastUpdated: Date;
}

