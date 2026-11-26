import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { getAuthenticatedOfficer } from "@/lib/officer-auth";
import {
  fetchAuditLogs,
  fetchPaginatedOfficerApplications,
  findApplicationByTrackingOrDocNumber,
} from "@/lib/officer-applications";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get("trackingId");
  const publicLookup = searchParams.get("publicLookup") === "1";

  try {
    // Public single tracking lookup for citizen TrackingSection
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

    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");
    const serviceId = searchParams.get("serviceId") || "all";
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const result = await fetchPaginatedOfficerApplications({
      officerServiceId: officer.serviceId,
      serviceId,
      status,
      search,
      page,
      limit,
    });
    const auditLogs = await fetchAuditLogs();

    return NextResponse.json({
      success: true,
      officer,
      stats: result.stats,
      pagination: result.pagination,
      serviceCounts: result.serviceCounts,
      statusCounts: result.statusCounts,
      applications: result.applications,
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
