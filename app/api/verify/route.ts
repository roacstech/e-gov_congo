import { NextRequest, NextResponse } from "next/server";
import { verifyCaptchaChallenge } from "@/lib/captcha";
import { lookupApprovedDocuments } from "@/lib/officer-applications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const docNumber = String(body?.docNumber || "").trim();
    const captchaInput = String(body?.captchaInput || "").trim();
    const challengeToken = String(body?.challengeToken || "").trim();

    if (!docNumber) {
      return NextResponse.json(
        {
          errorCode: "MISSING_DOC_NUMBER",
          error: "Veuillez saisir un numéro de document officiel.",
        },
        { status: 400 }
      );
    }

    const captchaResult = verifyCaptchaChallenge(challengeToken, captchaInput);
    if (!captchaResult.valid) {
      return NextResponse.json(
        {
          errorCode:
            captchaResult.reason === "expired"
              ? "EXPIRED_CAPTCHA"
              : "INVALID_CAPTCHA",
          error:
            captchaResult.reason === "expired"
              ? "Le code de sécurité CAPTCHA a expiré. Veuillez réessayer."
              : "Code de sécurité CAPTCHA incorrect.",
        },
        { status: 400 }
      );
    }

    const result = await lookupApprovedDocuments({ docNumber });

    return NextResponse.json({
      success: true,
      applications: result.applications,
      isTrackingCode: result.isTrackingCode,
      trackingStatus: result.trackingStatus,
    });
  } catch (err) {
    console.error("Public document verification error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la vérification du document." },
      { status: 500 }
    );
  }
}
