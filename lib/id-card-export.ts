import {
  ApplicationWorkflowData,
  CitizenApplication,
  Language,
  OfficerApplicationRecord,
} from "@/types";
import { getLocalizedServiceTitle } from "@/data/services";

type ExportableApp = OfficerApplicationRecord | CitizenApplication;

function isFullApp(app: ExportableApp): app is OfficerApplicationRecord {
  return "tableName" in app;
}

function loadImage(src?: string | null): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawGuillocheBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 1;
  for (let row = y + 20; row < y + h; row += 22) {
    ctx.beginPath();
    for (let col = x; col <= x + w; col += 16) {
      const py = row + Math.sin((col - x) * 0.04) * 9;
      if (col === x) ctx.moveTo(col, py);
      else ctx.lineTo(col, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSealOnCanvas(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  docNumber: string,
  dateLabel: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-10 * Math.PI) / 180);
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = "#1e3a8a";
  ctx.fillStyle = "#1e3a8a";

  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.58, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "bold 9px Arial, sans-serif";
  ctx.fillText("REPUBLIQUE DEM. DU CONGO", 0, -radius + 17);
  ctx.fillText("SCEAU OFFICIEL • APPROUVE", 0, radius - 10);

  ctx.font = "bold 11px Arial, sans-serif";
  ctx.fillText("R.D.C.", 0, -4);
  ctx.font = "bold 8px monospace";
  ctx.fillText(docNumber.slice(0, 16), 0, 9);
  ctx.font = "600 8px Arial, sans-serif";
  ctx.fillText(dateLabel, 0, 20);
  ctx.restore();
}

function drawFlagBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#007fff";
  ctx.fillRect(x, y, w * 0.55, h);
  ctx.fillStyle = "#fcd116";
  ctx.fillRect(x + w * 0.55, y, w * 0.25, h);
  ctx.fillStyle = "#ce1126";
  ctx.fillRect(x + w * 0.8, y, w * 0.2, h);
}

/**
 * Renders and downloads a high-resolution PNG of either the 2-sided PVC National ID Card
 * (Front + Back) or the Official Document & ID Card for all other services.
 */
export async function downloadOfficialCardOrDocumentPng(
  application: ExportableApp,
  language: Language
): Promise<void> {
  const isFr = language === "fr";
  const wf: ApplicationWorkflowData = application.workflow || {
    workflowStage: application.status,
    docsVerified: true,
    idProofVerified: true,
    verificationChecklist: {},
    approverCheckedDocs: true,
    approverCheckedIdProof: true,
    issuedDocumentNumber: application.issuedNumber || null,
  };

  const issuedNumber =
    wf.issuedDocumentNumber || application.issuedNumber || application.trackingId;
  const isNationalId =
    application.serviceId === "cni-biometrique" ||
    application.serviceId === "cni" ||
    (isFullApp(application) && application.tableName === "national_id_applications");

  const isPassport =
    application.serviceId === "passeport-ordinaire" ||
    application.serviceId === "passport" ||
    (isFullApp(application) && application.tableName === "passport_applications");

  const localizedTitle = getLocalizedServiceTitle(
    application.serviceId,
    application.serviceTitle,
    language
  );

  const [emblemImg, photoImg, verSigImg, appSigImg] = await Promise.all([
    loadImage("/logo.png"),
    loadImage(application.photoUrl),
    loadImage(wf.verificationSignature),
    loadImage(wf.approverSignature),
  ]);

  const idSummary = application.idProofSummary;
  const sealDate = application.submittedAt;
  const mrzClean = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "<");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (isNationalId) {
    // Two-sided CR80 PVC Smart National ID Card PNG (Side-by-side at high DPI)
    canvas.width = 1660;
    canvas.height = 560;
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cardW = 780;
    const cardH = 492;
    const frontX = 35;
    const backX = frontX + cardW + 30;
    const cardY = 34;

    // --- FRONT SIDE (RECTO POLYCARBONATE) ---
    ctx.save();
    drawRoundedRect(ctx, frontX, cardY, cardW, cardH, 22);
    ctx.clip();

    const gradF = ctx.createLinearGradient(frontX, cardY, frontX + cardW, cardY + cardH);
    gradF.addColorStop(0, "#dff0ff");
    gradF.addColorStop(0.55, "#f5f9ff");
    gradF.addColorStop(1, "#fef3c7");
    ctx.fillStyle = gradF;
    ctx.fillRect(frontX, cardY, cardW, cardH);
    drawGuillocheBackground(ctx, frontX, cardY, cardW, cardH);

    if (emblemImg) {
      ctx.save();
      ctx.globalAlpha = 0.09;
      ctx.drawImage(emblemImg, frontX + 320, cardY + 140, 230, 230);
      ctx.restore();
      ctx.drawImage(emblemImg, frontX + 26, cardY + 20, 56, 56);
    }

    // Printed header directly on security substrate
    ctx.fillStyle = "#0c3b7a";
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("REPUBLIQUE DEMOCRATIQUE DU CONGO", frontX + 94, cardY + 40);
    drawFlagBar(ctx, frontX + 94, cardY + 50, 48, 5);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText(
      isFr ? "CARTE NATIONALE D'IDENTITE" : "NATIONAL IDENTITY CARD",
      frontX + 150,
      cardY + 59
    );

    // Portrait frame
    const pX = frontX + 28;
    const pY = cardY + 96;
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(pX, pY, 154, 196);
    ctx.strokeStyle = "#0c3b7a";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pX, pY, 154, 196);
    if (photoImg) {
      ctx.drawImage(photoImg, pX + 1, pY + 1, 152, 194);
    }

    // EMV gold chip
    ctx.fillStyle = "#eab308";
    drawRoundedRect(ctx, pX, pY + 214, 58, 42, 6);
    ctx.fill();
    ctx.strokeStyle = "#854d0e";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Front Bio fields
    const fX = pX + 184;
    const drawField = (lbl: string, val: string, fy: number, hl = false) => {
      ctx.fillStyle = "#0c4a6e";
      ctx.font = "bold 11px Arial, sans-serif";
      ctx.fillText(lbl.toUpperCase(), fX, fy);
      ctx.fillStyle = hl ? "#0c3b7a" : "#0f172a";
      ctx.font = hl ? "bold 21px monospace" : "bold 18px Arial, sans-serif";
      ctx.fillText(val, fX, fy + 24);
    };
    drawField(isFr ? "N° Identification Nationale" : "National ID No.", issuedNumber, cardY + 114, true);
    drawField(isFr ? "Nom • Postnom • Prénom" : "Full Name", application.applicantName.toUpperCase(), cardY + 180);
    drawField(
      isFr ? "Naissance" : "Date & Place of Birth",
      [idSummary?.birthDate, idSummary?.birthPlace || application.city]
        .filter(Boolean)
        .join(" • "),
      cardY + 246
    );
    drawField(
      isFr ? "Sexe • Nationalité" : "Sex • Nationality",
      `${(isFullApp(application) ? application.details["Gender"] : null) || "M"} • ${
        idSummary?.nationality || "CONGOLAISE"
      }`,
      cardY + 312
    );
    drawField(
      isFr ? "Délivrée le • Bureau" : "Issued • Office",
      `${sealDate} • ${application.city.toUpperCase()}`,
      cardY + 378
    );

    ctx.fillStyle = "#0c3b7a";
    ctx.font = "bold 12px monospace";
    ctx.fillText("JUSTICE  •  PAIX  •  TRAVAIL", frontX + 28, cardY + cardH - 22);
    ctx.textAlign = "right";
    ctx.fillText(issuedNumber, frontX + cardW - 28, cardY + cardH - 22);
    ctx.textAlign = "left";
    ctx.restore();

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, frontX, cardY, cardW, cardH, 22);
    ctx.stroke();

    // --- BACK SIDE (VERSO POLYCARBONATE) ---
    ctx.save();
    drawRoundedRect(ctx, backX, cardY, cardW, cardH, 22);
    ctx.clip();
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(backX, cardY, cardW, cardH);
    drawGuillocheBackground(ctx, backX, cardY, cardW, cardH);

    // Pure Matte Black Magnetic Stripe
    ctx.fillStyle = "#090d14";
    ctx.fillRect(backX, cardY + 26, cardW, 48);

    const details = isFullApp(application) ? application.details : {};
    const backRows: [string, string][] = [
      [isFr ? "ADRESSE" : "ADDRESS", String(details["Address"] || idSummary?.address || application.city)],
      [isFr ? "ORIGINE" : "ORIGIN", String(details["Province / Origin"] || application.city)],
      [
        isFr ? "FILIATION" : "PARENTS",
        [details["Father Name & ID"], details["Mother Name & ID"]].filter(Boolean).join(" / ") || "—",
      ],
      [isFr ? "AUTORITÉ" : "AUTHORITY", application.collectionPoint || application.city],
    ];
    let bY = cardY + 112;
    for (const [k, v] of backRows) {
      ctx.fillStyle = "#0c4a6e";
      ctx.font = "bold 12px Arial, sans-serif";
      ctx.fillText(`${k}:`, backX + 28, bY);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 13px Arial, sans-serif";
      ctx.fillText(v.toUpperCase().slice(0, 50), backX + 135, bY);
      bY += 32;
    }

    // Tamper-evident signature panel
    const sigStripY = cardY + 250;
    ctx.fillStyle = "#fffef7";
    ctx.fillRect(backX + 26, sigStripY, cardW - 52, 108);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(backX + 26, sigStripY, cardW - 52, 108);

    if (verSigImg) ctx.drawImage(verSigImg, backX + 42, sigStripY + 10, 175, 58);
    if (appSigImg) ctx.drawImage(appSigImg, backX + 350, sigStripY + 10, 175, 58);

    ctx.fillStyle = "#334155";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText(
      `${isFr ? "Vérif." : "Verifier"}: ${wf.verificationOfficerName || "—"}`,
      backX + 42,
      sigStripY + 92
    );
    ctx.fillText(
      `${isFr ? "Approb." : "Approver"}: ${wf.approverOfficerName || "—"}`,
      backX + 350,
      sigStripY + 92
    );

    if (wf.verificationSignature && wf.approverSignature) {
      drawSealOnCanvas(ctx, backX + cardW - 92, sigStripY + 34, 58, issuedNumber, sealDate);
    }

    // 3-Line ICAO MRZ directly on card bottom
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 17px monospace";
    const mrz1 = `IDCOD${mrzClean(issuedNumber)}<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 34);
    const mrz2 = `900101M361231COD<<<<<<<<<<<<<<<<<<`.slice(0, 34);
    const mrz3 = `${mrzClean(application.applicantName)}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 34);
    ctx.fillText(mrz1, backX + 28, cardY + cardH - 68);
    ctx.fillText(mrz2, backX + 28, cardY + cardH - 44);
    ctx.fillText(mrz3, backX + 28, cardY + cardH - 20);
    ctx.restore();

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, backX, cardY, cardW, cardH, 22);
    ctx.stroke();
  } else if (isPassport) {
    // High-DPI Bilingual Biometric DRC Passport Booklet Spread (Bio-Data Page + Endorsement Page)
    canvas.width = 1740;
    canvas.height = 610;
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pageW = 815;
    const pageH = 550;
    const bioX = 35;
    const endX = bioX + pageW + 40;
    const pageY = 30;
    const details = isFullApp(application) ? application.details : {};
    const nameParts = application.applicantName.trim().split(/\s+/).filter(Boolean);
    const surname = (nameParts[0] || application.applicantName).toUpperCase();
    const givenNames = (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "—").toUpperCase();
    const sexCode = String(details["Gender"] || "M").trim().toUpperCase().startsWith("F") ? "F" : "M";
    const natStr = /congol/i.test(String(idSummary?.nationality || "Congolaise"))
      ? "CONGOLAISE / CONGOLESE"
      : String(idSummary?.nationality || "CONGOLAISE / CONGOLESE").toUpperCase();
    const dob = (idSummary?.birthDate || "900101").replace(/[^0-9]/g, "").slice(2, 8).padEnd(6, "0");
    const expDate = (() => {
      const raw = wf.approvedAt ? new Date(wf.approvedAt) : new Date();
      const d = isNaN(raw.getTime()) ? new Date() : new Date(raw.getTime());
      d.setFullYear(d.getFullYear() + 5);
      return d;
    })();
    const expLabel = expDate
      .toLocaleDateString(isFr ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
    const expMrz = `${String(expDate.getFullYear()).slice(-2)}${String(
      expDate.getMonth() + 1
    ).padStart(2, "0")}${String(expDate.getDate()).padStart(2, "0")}`;

    // --- LEFT PAGE: BIOMETRIC DATA PAGE (ICAO TD3) ---
    ctx.save();
    drawRoundedRect(ctx, bioX, pageY, pageW, pageH, 20);
    ctx.clip();

    const gradBio = ctx.createLinearGradient(bioX, pageY, bioX + pageW, pageY + pageH);
    gradBio.addColorStop(0, "#ecf5ff");
    gradBio.addColorStop(0.55, "#fefdf8");
    gradBio.addColorStop(1, "#ecfdf5");
    ctx.fillStyle = gradBio;
    ctx.fillRect(bioX, pageY, pageW, pageH);
    drawGuillocheBackground(ctx, bioX, pageY, pageW, pageH);
    drawFlagBar(ctx, bioX, pageY, pageW, 6);

    if (emblemImg) {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.drawImage(emblemImg, bioX + 350, pageY + 150, 230, 230);
      ctx.restore();
      ctx.drawImage(emblemImg, bioX + 26, pageY + 22, 54, 54);
    }

    ctx.fillStyle = "#0c3b7a";
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.fillText("REPUBLIQUE DEMOCRATIQUE DU CONGO", bioX + 94, pageY + 38);
    ctx.fillStyle = "#475569";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText("DEMOCRATIC REPUBLIC OF THE CONGO", bioX + 94, pageY + 56);
    ctx.fillStyle = "#0f295c";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText("PASSEPORT  •  PASSPORT", bioX + 94, pageY + 80);

    ctx.textAlign = "right";
    ctx.fillStyle = "#475569";
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.fillText("TYPE P  •  RDC", bioX + pageW - 26, pageY + 46);
    ctx.textAlign = "left";

    // Photo frame
    const pX = bioX + 26;
    const pY = pageY + 108;
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(pX, pY, 152, 194);
    ctx.strokeStyle = "#0f295c";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pX, pY, 152, 194);
    if (photoImg) {
      ctx.drawImage(photoImg, pX + 1, pY + 1, 150, 192);
    }
    ctx.fillStyle = "#0c3b7a";
    ctx.font = "bold 10px monospace";
    ctx.fillText("BIOMETRIQUE • ICAO", pX + 16, pY + 216);

    const bX = pX + 180;
    const drawBio = (lbl: string, val: string, yPos: number, xPos = bX, hl = false) => {
      ctx.fillStyle = "#0c4a6e";
      ctx.font = "bold 10px Arial, sans-serif";
      ctx.fillText(lbl.toUpperCase(), xPos, yPos);
      ctx.fillStyle = hl ? "#0c3b7a" : "#0f172a";
      ctx.font = hl ? "bold 19px monospace" : "bold 15px Arial, sans-serif";
      ctx.fillText(val.slice(0, 38), xPos, yPos + 20);
    };
    drawBio("N° du passeport / Passport No.", issuedNumber, pageY + 124, bX, true);
    drawBio("Nom / Surname", surname, pageY + 178, bX);
    drawBio("Post-nom & Prénoms / Given names", givenNames, pageY + 232, bX);
    drawBio("Nationalité / Nationality", natStr, pageY + 286, bX);
    drawBio("Sexe / Sex", sexCode, pageY + 286, bX + 350);
    drawBio("Naissance / Date of birth", idSummary?.birthDate || "—", pageY + 340, bX);
    drawBio("Lieu / Place of birth", (idSummary?.birthPlace || application.city).toUpperCase(), pageY + 340, bX + 220);
    drawBio("Délivré le / Date of issue", sealDate.toUpperCase(), pageY + 394, bX);
    drawBio("Expire le / Date of expiry", expLabel, pageY + 394, bX + 220);

    // Bottom MRZ Band
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bioX, pageY + pageH - 86, pageW, 86);
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(bioX, pageY + pageH - 86);
    ctx.lineTo(bioX + pageW, pageY + pageH - 86);
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 17px monospace";
    const pm1 = `P<COD${mrzClean(surname)}<<${mrzClean(givenNames)}`.padEnd(44, "<").slice(0, 44);
    const pm2 = `${mrzClean(issuedNumber).slice(0, 9).padEnd(9, "<")}0COD${dob}0${sexCode}${expMrz}<<<<<<<<<<<<<<<`.slice(0, 44);
    ctx.fillText(pm1, bioX + 26, pageY + pageH - 52);
    ctx.fillText(pm2, bioX + 26, pageY + pageH - 22);
    ctx.restore();

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, bioX, pageY, pageW, pageH, 20);
    ctx.stroke();

    // --- RIGHT PAGE: OFFICIAL ENDORSEMENTS & SIGNATURES ---
    ctx.save();
    drawRoundedRect(ctx, endX, pageY, pageW, pageH, 20);
    ctx.clip();
    ctx.fillStyle = "#fcfbf7";
    ctx.fillRect(endX, pageY, pageW, pageH);
    drawGuillocheBackground(ctx, endX, pageY, pageW, pageH);

    ctx.fillStyle = "#0f295c";
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.fillText("OBSERVATIONS & SIGNATURES OFFICIELLES", endX + 28, pageY + 42);
    ctx.fillStyle = "#475569";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText("OFFICIAL ENDORSEMENTS & CONSULAR AUTHORITY", endX + 28, pageY + 62);

    const endRows: [string, string][] = [
      ["DOMICILE / ADDRESS", String(details["Address"] || idSummary?.address || application.city)],
      ["PROFESSION / OCCUPATION", String(details["Occupation"] || "—")],
      [
        "FILIATION / PARENTS",
        [details["Father Name & ID"], details["Mother Name & ID"]].filter(Boolean).join(" / ") || "—",
      ],
      ["AUTORITÉ / AUTHORITY", application.collectionPoint || application.city],
    ];
    let ey = pageY + 115;
    for (const [lbl, val] of endRows) {
      ctx.fillStyle = "#0c4a6e";
      ctx.font = "bold 12px Arial, sans-serif";
      ctx.fillText(`${lbl}:`, endX + 28, ey);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 13px Arial, sans-serif";
      ctx.fillText(val.toUpperCase().slice(0, 42), endX + 250, ey);
      ey += 34;
    }

    const sigBoxY = pageY + 280;
    ctx.fillStyle = "#fffef7";
    ctx.fillRect(endX + 28, sigBoxY, pageW - 56, 150);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(endX + 28, sigBoxY, pageW - 56, 150);
    if (verSigImg) ctx.drawImage(verSigImg, endX + 46, sigBoxY + 16, 195, 76);
    if (appSigImg) ctx.drawImage(appSigImg, endX + 360, sigBoxY + 16, 195, 76);
    ctx.fillStyle = "#334155";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText(`Vérif. / Verifier: ${wf.verificationOfficerName || "—"}`, endX + 46, sigBoxY + 125);
    ctx.fillText(`Approb. / Approver: ${wf.approverOfficerName || "—"}`, endX + 360, sigBoxY + 125);

    if (wf.verificationSignature && wf.approverSignature) {
      drawSealOnCanvas(ctx, endX + pageW - 96, sigBoxY + 58, 62, issuedNumber, sealDate);
    }

    ctx.fillStyle = "#475569";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText(
      `Ce passeport est la propriété de la R.D. Congo • Property of DR Congo (${issuedNumber})`,
      endX + 28,
      pageY + pageH - 28
    );
    ctx.restore();

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, endX, pageY, pageW, pageH, 20);
    ctx.stroke();
  } else {
    // Official Certificate PNG for all non-CNI services (including full service-specific details)
    const detailsObj = isFullApp(application) ? application.details : {};
    const serviceEntries = Object.entries(detailsObj).filter(
      ([k, v]) => Boolean(v) && k !== "Service" && k !== "Citizen Name" && k !== "Collection Hub"
    );
    const displayEntries = serviceEntries.slice(0, 10);

    canvas.width = 1100;
    canvas.height = 800 + displayEntries.length * 40;
    ctx.fillStyle = "#fcfbf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#0f295c";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    drawFlagBar(ctx, 20, 20, canvas.width - 40, 12);

    if (emblemImg) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.drawImage(emblemImg, 390, 260, 320, 320);
      ctx.restore();
      ctx.drawImage(emblemImg, canvas.width / 2 - 44, 48, 88, 88);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#0f295c";
    ctx.font = "bold 24px Georgia, serif";
    ctx.fillText("REPUBLIQUE DEMOCRATIQUE DU CONGO", canvas.width / 2, 168);
    ctx.fillStyle = "#b45309";
    ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillText("JUSTICE  •  PAIX  •  TRAVAIL", canvas.width / 2, 194);
    ctx.fillStyle = "#334155";
    ctx.font = "bold 21px Georgia, serif";
    ctx.fillText(localizedTitle.toUpperCase(), canvas.width / 2, 240);
    ctx.fillStyle = "#0f295c";
    ctx.font = "bold 17px monospace";
    ctx.fillText(
      `${isFr ? "N° OFFICIEL" : "OFFICIAL DOCUMENT NO."}: ${issuedNumber}`,
      canvas.width / 2,
      274
    );
    ctx.textAlign = "left";

    const labelMap: Record<string, { fr: string; en: string }> = {
      "Father Name & ID": { fr: "Nom du Père & N° ID", en: "Father Name & ID" },
      "Mother Name & ID": { fr: "Nom de la Mère & N° ID", en: "Mother Name & ID" },
      Address: { fr: "Adresse", en: "Address" },
      "Province / Origin": { fr: "Province / Origine", en: "Province / Origin" },
      "Birth Date": { fr: "Date de Naissance", en: "Birth Date" },
      "Birth Place": { fr: "Lieu de Naissance", en: "Birth Place" },
      Nationality: { fr: "Nationalité", en: "Nationality" },
      Gender: { fr: "Sexe", en: "Gender" },
      "Marital Status": { fr: "État Civil", en: "Marital Status" },
      Occupation: { fr: "Profession", en: "Occupation" },
      Employer: { fr: "Employeur", en: "Employer" },
      "Job / Sector": { fr: "Poste / Secteur", en: "Job / Sector" },
      "Passport & Visa": { fr: "Passeport & Visa", en: "Passport & Visa" },
      Phone: { fr: "Téléphone", en: "Phone" },
      Email: { fr: "Courriel", en: "Email" },
    };

    const rows: [string, string][] = [
      [isFr ? "Bénéficiaire" : "Beneficiary", application.applicantName],
      [isFr ? "Date de délivrance" : "Issue Date", sealDate],
      [
        isFr ? "Bureau de délivrance" : "Issuing Office",
        application.collectionPoint || application.city,
      ],
      ...displayEntries.map(([k, v]) => [
        labelMap[k] ? (isFr ? labelMap[k].fr : labelMap[k].en) : k,
        String(v),
      ] as [string, string]),
    ];
    let ry = 330;
    for (const [k, v] of rows) {
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.fillText(k, 70, ry);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.fillText(v.slice(0, 58), 300, ry);
      ctx.strokeStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.moveTo(70, ry + 12);
      ctx.lineTo(canvas.width - 70, ry + 12);
      ctx.stroke();
      ry += 40;
    }

    if (photoImg) {
      ctx.drawImage(photoImg, canvas.width - 200, 316, 120, 148);
      ctx.strokeStyle = "#0f295c";
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width - 200, 316, 120, 148);
    }

    const sY = ry + 26;
    const drawDocSig = (
      sx: number,
      title: string,
      img: HTMLImageElement | null,
      name: string
    ) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx, sY, 360, 168);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sY, 360, 168);
      ctx.fillStyle = "#475569";
      ctx.font = "bold 14px Arial, sans-serif";
      ctx.fillText(title.toUpperCase(), sx + 16, sY + 26);
      if (img) ctx.drawImage(img, sx + 24, sY + 40, 230, 78);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.fillText(name || "—", sx + 16, sY + 148);
    };
    drawDocSig(
      70,
      isFr ? "Vérification" : "Verification",
      verSigImg,
      wf.verificationOfficerName || ""
    );
    drawDocSig(
      470,
      isFr ? "Approbation" : "Approver",
      appSigImg,
      wf.approverOfficerName || ""
    );

    if (wf.verificationSignature && wf.approverSignature) {
      drawSealOnCanvas(ctx, 935, sY + 84, 84, issuedNumber, sealDate);
    }

    ctx.fillStyle = "#0f295c";
    ctx.fillRect(20, canvas.height - 68, canvas.width - 40, 48);
    ctx.fillStyle = "#fcd116";
    ctx.font = "bold 15px monospace";
    ctx.fillText(
      `REPUBLIQUE DEMOCRATIQUE DU CONGO  •  ${issuedNumber}  •  ${sealDate}`,
      56,
      canvas.height - 38
    );
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${
    isNationalId ? "National-ID" : isPassport ? "Passport" : "Official-Document"
  }-${issuedNumber}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
