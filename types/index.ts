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
  | "approved"
  | "ready"
  | "rejected";

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
