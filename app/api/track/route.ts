import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import {
  findApplicationByTrackingOrDocNumber,
  fetchAllOfficerApplications,
  fetchAuditLogs,
} from "@/lib/officer-applications";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get("id") || searchParams.get("trackingId");
    const getRecent = searchParams.get("recent") === "1" || searchParams.get("recent") === "true";

    // 1. If a specific Tracking ID or Document Number is provided
    if (trackingId && trackingId.trim()) {
      const app = await findApplicationByTrackingOrDocNumber(trackingId.trim());
      if (!app) {
        return NextResponse.json(
          {
            success: false,
            error: "Aucun dossier trouvé pour cette référence ou numéro de document.",
            errorEn: "No application found for this reference code or document number.",
          },
          { status: 404 }
        );
      }

      let auditLogs: unknown[] = [];
      try {
        auditLogs = await fetchAuditLogs(app.trackingId);
      } catch {
        auditLogs = [];
      }

      return NextResponse.json({
        success: true,
        application: app,
        auditLogs,
      });
    }

    // 2. If recent is requested or no ID given: return recent real applications from database
    const allApps = await fetchAllOfficerApplications();
    const recent = allApps.slice(0, 8).map((a) => ({
      trackingId: a.trackingId,
      serviceId: a.serviceId,
      serviceCode: a.serviceCode,
      serviceTitle: a.serviceTitle,
      applicantName: a.applicantName,
      status: a.status,
      submittedAt: a.submittedAt,
      city: a.city,
      collectionPoint: a.collectionPoint,
      issuedNumber: a.issuedNumber,
    }));

    return NextResponse.json({
      success: true,
      recent,
      totalCount: allApps.length,
    });
  } catch (err) {
    unstable_rethrow(err);
    console.error("Error in /api/track:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la consultation du dossier.",
        errorEn: "Internal server error while tracking application.",
      },
      { status: 500 }
    );
  }
}
