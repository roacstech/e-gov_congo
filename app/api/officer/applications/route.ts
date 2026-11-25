import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { getAuthenticatedOfficer } from "@/lib/officer-auth";
import {
  fetchAllOfficerApplications,
  fetchAuditLogs,
  findApplicationByTrackingOrDocNumber,
} from "@/lib/officer-applications";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get("trackingId");
  const publicLookup = searchParams.get("publicLookup") === "1";

  try {

    // Public single tracking/document lookup for citizen TrackingSection & VerificationSection
    if (trackingId && publicLookup) {
      const found = await findApplicationByTrackingOrDocNumber(trackingId);
      if (!found) {
        return NextResponse.json(
          { error: "Dossier ou document introuvable dans le registre national." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        application: found,
      });
    }

    const officer = await getAuthenticatedOfficer();
    if (!officer) {
      return NextResponse.json(
        { error: "Authentification officier requise." },
        { status: 401 }
      );
    }

    if (trackingId) {
      const app = await findApplicationByTrackingOrDocNumber(trackingId);
      if (!app) {
        return NextResponse.json(
          { error: "Dossier introuvable." },
          { status: 404 }
        );
      }
      const auditLogs = await fetchAuditLogs(app.trackingId);
      return NextResponse.json({
        success: true,
        officer,
        application: app,
        auditLogs,
      });
    }

    const applications = await fetchAllOfficerApplications({
      serviceId: officer.serviceId,
    });
    const auditLogs = await fetchAuditLogs();

    const stats = {
      total: applications.length,
      pendingVerification: applications.filter(
        (a) => a.status === "submitted" || a.status === "in_review"
      ).length,
      pendingApproval: applications.filter((a) => a.status === "verified").length,
      pendingHeadIssuance: applications.filter((a) => a.status === "approved").length,
      ready: applications.filter((a) => a.status === "ready").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    };

    return NextResponse.json({
      success: true,
      officer,
      stats,
      applications,
      auditLogs,
    });
  } catch (err) {
    unstable_rethrow(err);
    console.error("Error fetching officer applications:", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des dossiers." },
      { status: 500 }
    );
  }
}
