export type Language = "fr" | "en";

export type ServiceCategory =
  | "all"
  | "identity"
  | "civil_status"
  | "transport"
  | "justice"
  | "business";

export interface ServiceItem {
  id: string;
  code: string;
  titleFr: string;
  titleEn: string;
  category: "identity" | "civil_status" | "transport" | "justice" | "business";
  ministryFr: string;
  ministryEn: string;
  descriptionFr: string;
  descriptionEn: string;
  slaFr: string;
  slaEn: string;
  costFr: string;
  costEn: string;
  requirementsFr: string[];
  requirementsEn: string[];
  isOnlineAvailable: boolean;
  popular?: boolean;
}

export type ApplicationStatus =
  | "submitted"
  | "in_review"
  | "verified"
  | "approved"
  | "ready"
  | "rejected";

export type OfficerRoleTier =
  | "verification_officer"
  | "approver_officer"
  | "head_of_service";

export interface OfficerProfile {
  id: number;
  officerId: string;
  fullName: string;
  username: string;
  serviceId: string;
  serviceTitle: string;
  ministry: string;
  rawRole: string;
  roleTier: OfficerRoleTier;
  roleLabelFr: string;
  roleLabelEn: string;
  phone?: string | null;
  email?: string | null;
  signatureData?: string | null;
}

export interface SupportingDocumentItem {
  id?: string;
  type?: string;
  name: string;
  fileName: string;
  mimeType?: string | null;
  size?: number | null;
  dataUrl?: string | null;
  isIdProof?: boolean;
}

export interface WorkflowSignatureRecord {
  officerId: string;
  officerName: string;
  roleTier: OfficerRoleTier;
  signatureData: string;
  signatureHash: string;
  signedAt: string;
  notesFr?: string | null;
  notesEn?: string | null;
}

export interface ApplicationWorkflowData {
  workflowStage: ApplicationStatus;
  docsVerified: boolean;
  idProofVerified: boolean;
  verificationChecklist: Record<string, boolean>;
  verificationOfficerId?: string | null;
  verificationOfficerName?: string | null;
  verificationNotesFr?: string | null;
  verificationNotesEn?: string | null;
  verificationSignature?: string | null;
  verificationSignatureHash?: string | null;
  verifiedAt?: string | null;
  approverCheckedDocs: boolean;
  approverCheckedIdProof: boolean;
  approverOfficerId?: string | null;
  approverOfficerName?: string | null;
  approvalNotesFr?: string | null;
  approvalNotesEn?: string | null;
  approverSignature?: string | null;
  approverSignatureHash?: string | null;
  approvedAt?: string | null;
  headOfficerId?: string | null;
  headOfficerName?: string | null;
  headNotesFr?: string | null;
  headNotesEn?: string | null;
  headSignature?: string | null;
  headSignatureHash?: string | null;
  issuedDocumentNumber?: string | null;
  issuedAt?: string | null;
  rejectedByRole?: string | null;
  rejectedByName?: string | null;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
}

export interface OfficerAuditEntry {
  id: number;
  trackingId: string;
  serviceId: string;
  officerId: string;
  officerName: string;
  officerRole: string;
  action: string;
  notes?: string | null;
  signatureHash?: string | null;
  createdAt: string;
}

export interface OfficerApplicationRecord {
  id: number;
  tableName: string;
  trackingId: string;
  serviceId: string;
  serviceCode: string;
  serviceTitle: string;
  ministryFr: string;
  ministryEn: string;
  applicantName: string;
  email: string;
  phone: string;
  city: string;
  collectionPoint: string;
  submittedAt: string;
  createdAtIso: string;
  updatedAtIso: string;
  status: ApplicationStatus;
  statusNotesFr: string;
  statusNotesEn: string;
  issuedNumber: string | null;
  photoUrl: string | null;
  idProofSummary: {
    labelFr: string;
    labelEn: string;
    primaryIdNumber: string;
    secondaryIdNumber?: string | null;
    holderName: string;
    birthDate?: string | null;
    birthPlace?: string | null;
    nationality?: string | null;
    address?: string | null;
  };
  supportingDocuments: SupportingDocumentItem[];
  details: Record<string, string | null | undefined>;
  workflow: ApplicationWorkflowData;
}

export interface CitizenApplication {
  trackingId: string;
  serviceId: string;
  serviceTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  city: string;
  submittedAt: string;
  status: ApplicationStatus;
  statusNotesFr: string;
  statusNotesEn: string;
  collectionPoint?: string;
  issuedNumber?: string | null;
  workflow?: ApplicationWorkflowData;
  idProofSummary?: OfficerApplicationRecord["idProofSummary"];
  photoUrl?: string | null;
  supportingDocuments?: SupportingDocumentItem[];
  details?: Record<string, string | null | undefined>;
}

export interface VerifiedDocument {
  id: string;
  documentNumber: string;
  documentTypeFr: string;
  documentTypeEn: string;
  beneficiaryName: string;
  nationalIdNumber: string;
  issueDate: string;
  expiryDate?: string;
  issuingAuthorityFr: string;
  issuingAuthorityEn: string;
  status: "valid" | "expired" | "revoked";
  qrCodeUrl: string;
}

export interface ServiceOfficer {
  id?: number;
  officerId: string;
  fullName: string;
  username: string;
  password?: string;
  serviceId: string;
  serviceTitle: string;
  ministry: string;
  role: "service_officer" | "senior_officer" | "registrar" | "legal_officer" | "super_admin";
  isActive: boolean;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SuperAdminSession {
  username: string;
  role: "super_admin";
  fullName: string;
  loginTime: string;
}
