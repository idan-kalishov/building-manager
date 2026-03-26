import * as XLSX from "xlsx";
import type { Building } from "../types";

export function exportBuildingsToExcel(buildings: Building[]) {
  const workbook = XLSX.utils.book_new();

  buildings.forEach((building) => {
    const wsData: any[] = [];

    const push = (label: string, value?: any) => {
      if (value !== undefined && value !== null && value !== "") {
        wsData.push([label, value]);
      }
    };

    // ===== כותרת =====
    wsData.push([]);
    wsData.push([`📍 בניין: ${building.address}`]);
    wsData.push([`🏢 דירות: ${building.units} | 📐 קומות: ${building.floors}`]);
    if (building.contractStart) {
      wsData.push([`📅 תחילת הסכם: ${building.contractStart}`]);
    }
    wsData.push([]);

    // ===== כללי =====
    const general = building.general || {};
    const keys = building.keys || {};
    if (
      Object.values(general).some((v) => v) ||
      Object.values(keys).some((v) => v) ||
      building.specialNotes
    ) {
      wsData.push(["📋 כללי"]);
      push("מנהל לקוח (בניין)", general.clientManager);
      push("מספר חנויות", general.shops);
      push("מיקום ארגז כלים", general.toolboxLocation);
      push("מיקום תיבת ועד", general.committeeBoxLocation);
      push("מיקום צקים", general.checksLocation);
      push("מיקום סולם", general.ladderLocation);
      push("אחראי צ'קים לספקים", general.checksResponsible);
      push("מיקום ערכת עזרה ראשונה", general.firstAidLocation);
      push("דייר איש קשר טכני", general.techContactTenant);
      push("מנקה שיכול לעזור", general.helperCleaner);
      push("מפתח לתיבת ועד", keys.mailboxKey);
      push("מיקום ספייר מפתחות", keys.spareKeysLocation);
      push("מספר ספייר מפתחות", keys.spareKeysCount);
      push("הערות מיוחדות לבניין", building.specialNotes);
      wsData.push([]);
    }

    // ===== תשתיות =====
    const electricity = building.electricity || {};
    const water = building.water || {};
    const gas = building.gas || {};
    const gates = building.gates || {};
    const shelter = building.shelter || {};

    if (
      Object.values(electricity).some((v) => v) ||
      Object.values(water).some((v) => v) ||
      Object.values(gas).some((v) => v) ||
      Object.values(gates).some((v) => v) ||
      Object.values(shelter).some((v) => v)
    ) {
      wsData.push(["⚡ תשתיות"]);

      if (Object.values(electricity).some((v) => v)) {
        wsData.push(["  ⚡ חשמל"]);
        push("    מספר לקוח בחברת חשמל", electricity.clientNumber);
        push("    מספר חשבון חוזה", electricity.contractNumber);
        push("    מספר מונה", electricity.meterNumber);
        push("    חשבון נשלח למי", electricity.billSentTo);
        push("    מיקום שעון שבת", electricity.shabbatClockLocation);
        push("    סוג לוח חשמל", electricity.panelType);
        push("    מיקום לוח חשמל ראשי", electricity.mainPanelLocation);
        push("    מיקום נקודת חשמל", electricity.powerOutletLocation);
        push("    צורת תשלום", electricity.paymentMethod);
        push("    בדיקת פחת", electricity.depreciationCheck);
        push("    בדיקת הארקה", electricity.groundingCheck);
        wsData.push([]);
      }

      if (Object.values(water).some((v) => v)) {
        wsData.push(["  💧 מים"]);
        push("    תאגיד מים", water.corporation);
        push("    שם לקוח", water.clientName);
        push("    מספר לקוח בתאגיד", water.clientNumber);
        push("    מספר מד מים", water.meterNumber);
        push("    מיקום מד מים ראשי", water.mainMeterLocation);
        push("    מיקום מוני מים פרטיים", water.privateMetersLocation);
        push("    מיקום ברז מים", water.tapLocation);
        push("    מיקום שיבר מרכזי", water.mainShiverLocation);
        wsData.push([]);
      }

      if (Object.values(gas).some((v) => v)) {
        wsData.push(["  🔥 גז"]);
        push("    ספק גז", gas.supplier);
        push("    טלפון ספק", gas.supplierPhone);
        push("    טלפון חירום", gas.emergencyPhone);
        push("    צובר גז", gas.tankExists);
        push("    מיקום צובר גז", gas.tankLocation);
        push("    מיקום שעוני גז", gas.metersLocation);
        push("    מיקום בלוני גז", gas.cylindersLocation);
        push("    מפתח לחדר גז", gas.roomKey);
        push("    מספר מרכזיה בחב׳ הגז", gas.centralNumber);
        wsData.push([]);
      }

      if (Object.values(gates).some((v) => v)) {
        wsData.push(["  🚪 שערים"]);
        push("    שם חברת שערים", gates.company);
        push("    טלפון חברה", gates.companyPhone);
        push("    שם אפליקציה לפתיחת שער", gates.appName);
        push("    מיקום מפתח שער נגרר", gates.gateKeyLocation);
        push("    מפתח לשער נגרר", gates.gateKey);
        push("    מיקום מפתח מחסום", gates.barrierKeyLocation);
        push("    מפתח למחסום", gates.barrierKey);
        push("    איך פותחים שער נגרר", gates.gateOpenMethod);
        push("    מיקום שלט מחסום", gates.remoteLocation);
        push("    פתיחה סלולרית – מספר", gates.mobileOpenNumber);
        wsData.push([]);
      }

      if (Object.values(shelter).some((v) => v)) {
        wsData.push(["  🛡️ מקלט"]);
        push("    מיקום מקלט", shelter.location);
        push("    מפתח למקלט", shelter.key);
        wsData.push([]);
      }
    }

    // ===== ציוד ומערכות =====
    const intercom = building.intercom || {};
    const elevator = building.elevator || {};
    const security = building.security || {};
    const airConditioning = building.airConditioning || {};
    const firefighting = building.firefighting || {};
    const roof = building.roof || {};

    if (
      Object.values(intercom).some((v) => v) ||
      Object.values(elevator).some((v) => v) ||
      Object.values(security).some((v) => v) ||
      Object.values(airConditioning).some((v) => v) ||
      Object.values(firefighting).some((v) => v) ||
      Object.values(roof).some((v) => v)
    ) {
      wsData.push(["🔧 ציוד ומערכות"]);

      if (Object.values(intercom).some((v) => v)) {
        wsData.push(["  🔔 אינטרקום"]);
        push("    דגם", intercom.model);
        push("    קוד כניסה", intercom.entryCode);
        push("    מצלמה", intercom.camera);
        push("    סוג קודן", intercom.coderType);
        push("    מיקום המערכת", intercom.location);
        push("    קוד טכנאי", intercom.techCode);
        wsData.push([]);
      }

      if (Object.values(elevator).some((v) => v)) {
        wsData.push(["  🛗 מעלית"]);
        push("    מספר מעליות", elevator.count);
        push("    מספר תחנות", elevator.stationsCount);
        push("    סוג מעלית", elevator.type);
        push("    חברת מעליות", elevator.company);
        push("    טלפון חברה", elevator.companyPhone);
        push("    מהנדס מעליות", elevator.engineer);
        push("    טלפון מהנדס", elevator.engineerPhone);
        push("    עלות קריאת שרות", elevator.serviceCallCost);
        push("    ביטוח חלפים", elevator.partsInsurance);
        push("    ספק הטלפון", elevator.phoneProvider);
        push("    על שם מי קו הטלפון", elevator.phoneLineOwner);
        push("    מספר קו הטלפון", elevator.phoneLineNumber);
        push("    מיקום חדר מעלית", elevator.roomLocation);
        push("    מפתח לחדר מעלית", elevator.roomKey);
        push("    צורת תשלום", elevator.paymentMethod);
        wsData.push([]);
      }

      if (Object.values(security).some((v) => v)) {
        wsData.push(["  📷 מצלמות אבטחה"]);
        push("    מערכת אבטחה", security.system);
        push("    מיקום מצלמות", security.cameraLocations);
        push("    ספק אבטחה", security.provider);
        push("    טלפון ספק", security.providerPhone);
        wsData.push([]);
      }

      if (Object.values(airConditioning).some((v) => v)) {
        wsData.push(["  ❄️ מיזוג אוויר"]);
        push("    מערכות מיזוג", airConditioning.systems);
        push("    ספק תחזוקה", airConditioning.maintenanceProvider);
        push("    טלפון ספק", airConditioning.maintenancePhone);
        wsData.push([]);
      }

      if (Object.values(firefighting).some((v) => v)) {
        wsData.push(["  🧯 כיבוי אש"]);
        push("    חברה", firefighting.company);
        push("    טלפון חברה", firefighting.companyPhone);
        wsData.push([]);
      }

      if (Object.values(roof).some((v) => v)) {
        wsData.push(["  🏠 גג"]);
        push("    סוג איטום", roof.sealType);
        push("    חברה שאטמה", roof.sealCompany);
        push("    טלפון חברה", roof.sealCompanyPhone);
        push("    שנת איטום אחרון", roof.lastSealYear);
        push("    שטח הגג במ״ר", roof.areaSqm);
        push("    אחריות עד", roof.warrantyUntil);
        push("    מיקום מפתח לגג", roof.keyLocation);
        wsData.push([]);
      }
    }

    // ===== ספקים =====
    const cleaning = building.cleaning || {};
    const gardening = building.gardening || {};
    const lights = building.lights || {};

    if (
      Object.values(cleaning).some((v) => v) ||
      Object.values(gardening).some((v) => v) ||
      Object.values(lights).some((v) => v)
    ) {
      wsData.push(["👷 ספקים"]);

      if (Object.values(cleaning).some((v) => v)) {
        wsData.push(["  🧹 ניקיון"]);
        push("    שם מנקה", cleaning.name);
        push("    טלפון מנקה", cleaning.phone);
        push("    מנקה מוציא חשבוניות", cleaning.hasInvoices);
        push("    ביטוח לאומי – פנקס", cleaning.nationalInsuranceBooklet);
        push("    מספר פעמים בשבוע", cleaning.weeklyFrequency);
        push("    ימי ניקיון", cleaning.days);
        push("    ניקוי מסדרונות", cleaning.corridorsDays);
        push("    ניקוי חדר מדרגות", cleaning.stairsDays);
        push("    מפיצי ריח", cleaning.airFreshener);
        push("    מפיצי ריח – מיקום", cleaning.airFreshenerLocation);
        push("    דגשים בניקיון", cleaning.notes);
        wsData.push([]);
      }

      if (Object.values(gardening).some((v) => v)) {
        wsData.push(["  🌿 גינון"]);
        push("    שם גנן", gardening.gardenerName);
        push("    טלפון גנן", gardening.gardenerPhone);
        push("    מספר פעמים בחודש", gardening.frequency);
        push("    מערכת השקיה אוטומטית", gardening.autoIrrigation);
        push("    דגם מערכת השקייה", gardening.irrigationModel);
        push("    מיקום מערכת השקיה", gardening.irrigationLocation);
        push("    מיקום צינור השקייה", gardening.irrigationPipeLocation);
        push("    מיקום שיבר הגינה", gardening.gardenShiverLocation);
        wsData.push([]);
      }

      if (Object.values(lights).some((v) => v)) {
        wsData.push(["  💡 נורות ותאורה"]);
        push("    נורות כללי", lights.general);
        push("    מיקום נורות ספייר", lights.spareLocation);
        push("    לובי – דגם", lights.lobbyModel);
        push("    לובי – צבע", lights.lobbyColor);
        push("    מסדרונות – דגם", lights.corridorModel);
        push("    מסדרונות – צבע", lights.corridorColor);
        push("    חדר מדרגות – דגם", lights.stairsModel);
        push("    חדר מדרגות – צבע", lights.stairsColor);
        push("    מפיצי ריח – מספר סידורי", lights.airFreshenerSerial);
        wsData.push([]);
      }
    }

    // ===== בנק וביטוח =====
    const bank = building.bank || {};
    const insurance = building.insurance || {};

    if (
      Object.values(bank).some((v) => v) ||
      Object.values(insurance).some((v) => v)
    ) {
      wsData.push(["💰 בנק וביטוח"]);

      if (Object.values(bank).some((v) => v)) {
        wsData.push(["  🏦 בנק"]);
        push("    שם סניף", bank.bankBranchName);
        push("    מספר סניף", bank.bankBranchNumber);
        push("    מספר חשבון", bank.bankAccountNumber);
        push("    מורשה חתימה", bank.bankSignatory);
        push("    מספר חתימות על צ'ק", bank.signaturesRequired);
        wsData.push([]);
      }

      if (Object.values(insurance).some((v) => v)) {
        wsData.push(["  📄 ביטוח"]);
        push("    סוג ביטוח", insurance.type);
        push("    חברת ביטוח", insurance.company);
        push("    סוכן ביטוח", insurance.agent);
        push("    טלפון סוכנות", insurance.agencyPhone);
        push("    מייל סוכנות", insurance.agencyEmail);
        push("    מספר פוליסה", insurance.policyNumber);
        push("    מספר לקוח", insurance.clientNumber);
        push("    ביטוח נזקי צנרת – ספק", insurance.pipeDamageProvider);
        push("    ביטוח נזקי צנרת – טלפון", insurance.pipeDamagePhone);
        push("    נזקי צנרת השתתפות עצמית", insurance.pipeDamageDeductible);
        push("    נזקי צנרת עלות ביקור", insurance.pipeDamageVisitCost);
        push("    ניתן אינסטלטור פרטי", insurance.privatePlumber);
        push("    השתתפות עצמית", insurance.deductible);
        push("    עלות ביקור", insurance.visitCost);
        wsData.push([]);
      }
    }

    // ===== ועד ועירייה =====
    const committee = building.committee || {};
    const municipality = building.municipality || {};
    const culturalAssociation = building.culturalAssociation || {};

    if (
      Object.values(committee).some((v) => v) ||
      Object.values(municipality).some((v) => v) ||
      Object.values(culturalAssociation).some((v) => v)
    ) {
      wsData.push(["🏛️ ועד ועירייה"]);

      if (Object.values(committee).some((v) => v)) {
        wsData.push(["  🏢 ועד הבית"]);
        push("    מיקום תיבת ועד", committee.boxLocation);
        push("    מיקום הנחת צ'קים", committee.checksPlacementLocation);
        push("    שיטת חלוקת דמי ועד", committee.feeDistribution);
        push("    תהליך קבלת צ'ק", committee.checkProcess);
        push("    מספר חתימות על צ'ק", committee.signaturesRequired);
        wsData.push([]);
      }

      if (Object.values(municipality).some((v) => v)) {
        wsData.push(["  🏙️ עירייה"]);
        push("    פרטי רשומה", municipality.registrationDetails);
        push("    מספר רשומה", municipality.registrationNumber);
        push("    ימי הוצאת חפצים", municipality.itemRemovalDays);
        push("    ימי פינוי גזם", municipality.pruningRemovalDays);
        push("    תחנת תברואה שם", municipality.sanitationStationName);
        push("    תחנת תברואה טלפון", municipality.sanitationStationPhone);
        wsData.push([]);
      }

      if (Object.values(culturalAssociation).some((v) => v)) {
        wsData.push(["  🏘️ האגודה לתרבות הדיור"]);
        push("    שם נציג", culturalAssociation.representativeName);
        push("    טלפון נציג", culturalAssociation.representativePhone);
        push("    מנוי לבניין", culturalAssociation.hasSubscription);
        wsData.push([]);
      }
    }

    // ===== הערות כלליות =====
    if (building.notes) {
      wsData.push(["📝 הערות כלליות"]);
      wsData.push([building.notes]);
      wsData.push([]);
    }

    // ===== סקשנים מותאמים =====
    if (building.customSections && building.customSections.length > 0) {
      wsData.push(["🔹 קטגוריות מותאמות"]);
      building.customSections.forEach((section) => {
        wsData.push(["  " + section.title]);
        section.fields.forEach((field) => {
          push("    " + field.label, field.value);
        });
        wsData.push([]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!cols"] = [{ wch: 35 }, { wch: 45 }];

    // כותרות עיקריות — כחול כהה עם טקסט לבן
    for (let i = 0; i < wsData.length; i++) {
      const row = wsData[i];
      if (
        row.length > 0 &&
        row[0] &&
        typeof row[0] === "string" &&
        /^[⚡📋🔧👷💰🏛️📝🔹📍🏢📅]/.test(row[0]) &&
        !row[0].startsWith("  ")
      ) {
        const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
        if (ws[cellRef]) {
          ws[cellRef].s = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { patternType: "solid", fgColor: { rgb: "366092" } },
            alignment: { horizontal: "right", vertical: "center" },
          };
        }
      }
    }

    // תת-קטגוריות — כחול בהיר
    for (let i = 0; i < wsData.length; i++) {
      const row = wsData[i];
      if (
        row.length > 0 &&
        typeof row[0] === "string" &&
        row[0].startsWith("  ") &&
        !row[0].startsWith("    ") &&
        /[⚡💧🔥🚪🛡️🔔🛗📷❄️🧯🏠🧹🌿💡🏦📄🏢🏙️🏘️]/.test(row[0])
      ) {
        for (let c = 0; c < 2; c++) {
          const cellRef = XLSX.utils.encode_cell({ r: i, c });
          if (ws[cellRef]) {
            ws[cellRef].s = {
              font: { bold: true, sz: 11 },
              fill: { patternType: "solid", fgColor: { rgb: "D9E8F5" } },
              alignment: { horizontal: "right" },
            };
          }
        }
      }
    }

    // שם הגיליון
    const sheetName = building.address.substring(0, 31);
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  });

  // שם הקובץ — שם הבניין אם בניין אחד
  const fileName =
    buildings.length === 1
      ? `${buildings[0].address}_${new Date().toLocaleDateString("he-IL")}.xlsx`
      : `בניינים_${new Date().toLocaleDateString("he-IL")}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
