import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedOfficer } from "@/lib/officer-auth";
import {
  executeWorkflowAction,
  fetchAuditLogs,
  WorkflowError,
} from "@/lib/officer-applications";

export async function POST(request: NextRequest) {
  try {
    const officer = await getAuthenticatedOfficer();
    if (!officer) {
      return NextResponse.json(
        { error: "Session officier expirée ou non authentifiée." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      trackingId,
      action,
      signatureData,
      docsChecked,
      idProofChecked,
      checklist,
      notesFr,
      notesEn,
      rejectionReason,
    } = body;

    if (!trackingId || !action) {
      return NextResponse.json(
        { error: "trackingId et action sont obligatoires." },
        { status: 400 }
      );
    }

    const validActions = [
      "verify_and_sign",
      "check_and_approve",
      "head_issue",
      "reject",
    ];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Action workflow invalide." },
        { status: 400 }
      );
    }

    const updatedApp = await executeWorkflowAction({
      trackingId: String(trackingId),
      action,
      officer,
      signatureData: signatureData ? String(signatureData) : undefined,
      docsChecked: Boolean(docsChecked),
      idProofChecked: Boolean(idProofChecked),
      checklist: checklist && typeof checklist === "object" ? checklist : undefined,
      notesFr: notesFr ? String(notesFr) : undefined,
      notesEn: notesEn ? String(notesEn) : undefined,
      rejectionReason: rejectionReason ? String(rejectionReason) : undefined,
    });

    const auditLogs = await fetchAuditLogs(updatedApp.trackingId);

    return NextResponse.json({
      success: true,
      application: updatedApp,
      auditLogs,
    });
  } catch (err) {
    if (err instanceof WorkflowError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error("Workflow action error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors du traitement du workflow." },
      { status: 500 }
    );
  }
}
