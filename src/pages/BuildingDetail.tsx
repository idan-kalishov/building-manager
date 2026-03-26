import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { updateBuilding } from "../lib/buildings.service";
import type { Building } from "../types";
import AccordionSection from "../components/buildings/AccordionSection";
import BuildingFormModal from "../components/buildings/BuildingFormModal";
import ConfirmModal from "../components/ConfirmModal";
import InputModal from "../components/InputModal";
import { exportBuildingsToExcel } from "../lib/exportToExcel";

const Row = ({ label, value }: { label: string; value?: any }) =>
  value ? (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 text-sm font-medium text-right max-w-[60%]">
        {value}
      </span>
    </div>
  ) : null;

export default function BuildingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddField, setShowAddField] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "section" | "field";
    sectionId: string;
    fieldId?: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "buildings", id), (snap) => {
      if (snap.exists())
        setBuilding({ id: snap.id, ...snap.data() } as Building);
    });
    return unsub;
  }, [id]);

  if (!building)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        טוען פרטי בניין...
      </div>
    );

  const g = building.general || {};
  const ic = building.intercom || {};
  const elec = building.electricity || {};
  const elev = building.elevator || {};
  const roof = building.roof || {};
  const gas = building.gas || {};
  const gates = building.gates || {};
  const fire = building.firefighting || {};
  const shelter = building.shelter || {};
  const water = building.water || {};
  const clean = building.cleaning || {};
  const gard = building.gardening || {};
  const lights = building.lights || {};
  const sec = building.security || {};
  const ac = building.airConditioning || {};
  const b = building.bank || {};
  const ins = building.insurance || {};
  const keys = building.keys || {};
  const muni = building.municipality || {};
  const comm = building.committee || {};
  const cult = building.culturalAssociation || {};

  const hasData = (obj: Record<string, any>) =>
    Object.values(obj).some((v) => v);

  const handleAddSection = (title: string) => {
    const updated = [
      ...(building.customSections || []),
      { id: crypto.randomUUID(), title, fields: [] },
    ];
    updateBuilding(building.id!, { customSections: updated });
    setShowAddSection(false);
  };

  const handleAddField = (sectionId: string, label: string) => {
    const updated = (building.customSections || []).map((s) =>
      s.id !== sectionId
        ? s
        : {
            ...s,
            fields: [
              ...s.fields,
              { id: crypto.randomUUID(), label, value: "" },
            ],
          },
    );
    updateBuilding(building.id!, { customSections: updated });
    setShowAddField(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    const updated = (building.customSections || []).filter(
      (s) => s.id !== sectionId,
    );
    updateBuilding(building.id!, { customSections: updated });
    setConfirmDelete(null);
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    const updated = (building.customSections || []).map((s) =>
      s.id !== sectionId
        ? s
        : { ...s, fields: s.fields.filter((f) => f.id !== fieldId) },
    );
    updateBuilding(building.id!, { customSections: updated });
    setConfirmDelete(null);
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto pb-24">
      <button
        onClick={() => navigate("/buildings")}
        className="flex items-center gap-2 text-blue-600 font-semibold text-base mb-4 mt-1 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
      >
        ← חזור לרשימת בניינים
      </button>

      <div className="bg-white rounded-2xl shadow p-5 mb-5 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {building.address}
          </h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-500 flex-wrap">
            <span>🏠 {building.units} דירות</span>
            <span>📐 {building.floors} קומות</span>
            {g.clientManager && <span>👤 {g.clientManager}</span>}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => exportBuildingsToExcel([building])}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm"
          >
            📊 ייצוא לאקסל
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            ✏️ עריכה
          </button>
        </div>
      </div>

      {/* כללי */}
      <AccordionSection title="כללי" icon="📋" defaultOpen={true}>
        <Row label="מנהל לקוח (בניין)" value={g.clientManager} />
        <Row label="מספר חנויות" value={g.shops} />
        <Row label="מיקום ארגז כלים" value={g.toolboxLocation} />
        <Row label="מיקום תיבת ועד" value={g.committeeBoxLocation} />
        <Row label="מפתח לתיבת ועד" value={keys.mailboxKey} />
        <Row label="מיקום צקים" value={g.checksLocation} />
        <Row label="מיקום סולם" value={g.ladderLocation} />
        <Row label="אחראי צ'קים לספקים" value={g.checksResponsible} />
        <Row label="מיקום ערכת עזרה ראשונה" value={g.firstAidLocation} />
        <Row label="דייר איש קשר טכני" value={g.techContactTenant} />
        <Row label="מנקה שיכול לעזור" value={g.helperCleaner} />
        <Row label="מיקום ספייר מפתחות" value={keys.spareKeysLocation} />
        <Row label="מספר ספייר מפתחות" value={keys.spareKeysCount} />
        {building.specialNotes && (
          <div className="pt-2">
            <p className="text-gray-500 text-sm mb-1">הערות מיוחדות לבניין</p>
            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">
              {building.specialNotes}
            </p>
          </div>
        )}
        {!hasData(g) && !building.specialNotes && (
          <p className="text-gray-400 text-sm text-center py-2">
            אין מידע עדיין – לחץ עריכה להוספה
          </p>
        )}
      </AccordionSection>

      {hasData(ic) && (
        <AccordionSection title="אינטרקום" icon="🔔">
          <Row label="דגם אינטרקום" value={ic.model} />
          <Row label="קוד כניסה" value={ic.entryCode} />
          <Row label="מצלמת אינטרקום" value={ic.camera} />
          <Row label="סוג קודן" value={ic.coderType} />
          <Row label="מיקום המערכת" value={ic.location} />
          <Row label="קוד טכנאי" value={ic.techCode} />
        </AccordionSection>
      )}

      {hasData(elec) && (
        <AccordionSection title="חשמל" icon="⚡">
          <Row label="מספר לקוח בחברת חשמל" value={elec.clientNumber} />
          <Row label="מספר חשבון חוזה" value={elec.contractNumber} />
          <Row label="מספר מונה" value={elec.meterNumber} />
          <Row label="חשבון נשלח למי" value={elec.billSentTo} />
          <Row label="מיקום שעון שבת" value={elec.shabbatClockLocation} />
          <Row label="סוג לוח חשמל" value={elec.panelType} />
          <Row label="מיקום לוח חשמל ראשי" value={elec.mainPanelLocation} />
          <Row label="מיקום נקודת חשמל" value={elec.powerOutletLocation} />
          <Row label="צורת תשלום" value={elec.paymentMethod} />
          <Row label="בדיקת פחת לבניין" value={elec.depreciationCheck} />
          <Row label="בדיקת הארקה לבניין" value={elec.groundingCheck} />
        </AccordionSection>
      )}

      {hasData(elev) && (
        <AccordionSection title="מעלית" icon="🛗">
          <Row label="מספר מעליות" value={elev.count} />
          <Row label="מספר תחנות" value={elev.stationsCount} />
          <Row label="סוג מעלית" value={elev.type} />
          <Row label="חברת מעליות" value={elev.company} />
          <Row label="טלפון חברה" value={elev.companyPhone} />
          <Row label="מהנדס מעליות" value={elev.engineer} />
          <Row label="טלפון מהנדס" value={elev.engineerPhone} />
          <Row label="עלות קריאת שרות" value={elev.serviceCallCost} />
          <Row label="ביטוח חלפים" value={elev.partsInsurance} />
          <Row label="ספק הטלפון" value={elev.phoneProvider} />
          <Row label="על שם מי קו הטלפון" value={elev.phoneLineOwner} />
          <Row label="מספר קו הטלפון" value={elev.phoneLineNumber} />
          <Row label="מיקום חדר מעלית" value={elev.roomLocation} />
          <Row label="מפתח לחדר מעלית" value={elev.roomKey} />
          <Row label="צורת תשלום לחברת המעליות" value={elev.paymentMethod} />
        </AccordionSection>
      )}

      {hasData(roof) && (
        <AccordionSection title="גג" icon="🏠">
          <Row label="סוג איטום" value={roof.sealType} />
          <Row label="חברה שאטמה" value={roof.sealCompany} />
          <Row label="טלפון חברה" value={roof.sealCompanyPhone} />
          <Row label="שנת איטום אחרון" value={roof.lastSealYear} />
          <Row label="שטח הגג במ״ר" value={roof.areaSqm} />
          <Row label="אחריות לאיטום עד" value={roof.warrantyUntil} />
          <Row label="מיקום מפתח לגג" value={roof.keyLocation} />
        </AccordionSection>
      )}

      {hasData(gas) && (
        <AccordionSection title="גז" icon="🔥">
          <Row label="ספק גז" value={gas.supplier} />
          <Row label="טלפון ספק" value={gas.supplierPhone} />
          <Row label="טלפון חירום" value={gas.emergencyPhone} />
          <Row label="צובר גז" value={gas.tankExists} />
          <Row label="מיקום צובר גז" value={gas.tankLocation} />
          <Row label="מיקום שעוני גז" value={gas.metersLocation} />
          <Row label="מיקום בלוני גז" value={gas.cylindersLocation} />
          <Row label="מפתח לחדר גז" value={gas.roomKey} />
          <Row label="מספר מרכזיה בחב׳ הגז" value={gas.centralNumber} />
        </AccordionSection>
      )}

      {hasData(gates) && (
        <AccordionSection title="שערים" icon="🚪">
          <Row label="שם חברת שערים" value={gates.company} />
          <Row label="טלפון חברה" value={gates.companyPhone} />
          <Row label="שם אפליקציה לפתיחת שער" value={gates.appName} />
          <Row label="מיקום מפתח שער נגרר" value={gates.gateKeyLocation} />
          <Row label="מפתח לשער נגרר" value={gates.gateKey} />
          <Row label="מיקום מפתח מחסום" value={gates.barrierKeyLocation} />
          <Row label="מפתח למחסום" value={gates.barrierKey} />
          <Row label="איך פותחים שער נגרר" value={gates.gateOpenMethod} />
          <Row label="מיקום שלט למחסום" value={gates.remoteLocation} />
          <Row label="פתיחה סלולרית – מספר" value={gates.mobileOpenNumber} />
        </AccordionSection>
      )}

      {hasData(fire) && (
        <AccordionSection title="כיבוי אש" icon="🧯">
          <Row label="חברה" value={fire.company} />
          <Row label="טלפון חברה" value={fire.companyPhone} />
        </AccordionSection>
      )}

      {hasData(shelter) && (
        <AccordionSection title="מקלט" icon="🛡️">
          <Row label="מיקום מקלט" value={shelter.location} />
          <Row label="מפתח למקלט" value={shelter.key} />
        </AccordionSection>
      )}

      {hasData(water) && (
        <AccordionSection title="מים" icon="💧">
          <Row label="תאגיד מים" value={water.corporation} />
          <Row label="שם לקוח" value={water.clientName} />
          <Row label="מספר לקוח בתאגיד" value={water.clientNumber} />
          <Row label="מספר מד מים" value={water.meterNumber} />
          <Row label="מיקום מד מים ראשי" value={water.mainMeterLocation} />
          <Row
            label="מיקום מוני מים פרטיים"
            value={water.privateMetersLocation}
          />
          <Row label="מיקום ברז מים" value={water.tapLocation} />
          <Row label="מיקום שיבר מרכזי" value={water.mainShiverLocation} />
        </AccordionSection>
      )}

      {hasData(clean) && (
        <AccordionSection title="ניקיון" icon="🧹">
          <Row label="שם מנקה" value={clean.name} />
          <Row label="טלפון מנקה" value={clean.phone} />
          <Row label="מנקה מוציא חשבוניות" value={clean.hasInvoices} />
          <Row
            label="מנקה ביטוח לאומי – פנקס"
            value={clean.nationalInsuranceBooklet}
          />
          <Row label="מספר פעמים בשבוע" value={clean.weeklyFrequency} />
          <Row label="ימי ניקיון" value={clean.days} />
          <Row label="ניקוי מסדרונות" value={clean.corridorsDays} />
          <Row label="ניקוי חדר מדרגות" value={clean.stairsDays} />
          <Row label="מפיצי ריח" value={clean.airFreshener} />
          <Row label="מפיצי ריח מיקום" value={clean.airFreshenerLocation} />
          <Row label="דגשים בניקיון" value={clean.notes} />
        </AccordionSection>
      )}

      {hasData(gard) && (
        <AccordionSection title="גינון" icon="🌿">
          <Row label="שם גנן" value={gard.gardenerName} />
          <Row label="טלפון גנן" value={gard.gardenerPhone} />
          <Row label="מספר פעמים בחודש" value={gard.frequency} />
          <Row label="מערכת השקיה אוטומטית" value={gard.autoIrrigation} />
          <Row label="דגם מערכת השקייה" value={gard.irrigationModel} />
          <Row label="מיקום מערכת השקיה" value={gard.irrigationLocation} />
          <Row label="מיקום צינור השקייה" value={gard.irrigationPipeLocation} />
          <Row label="מיקום שיבר הגינה" value={gard.gardenShiverLocation} />
        </AccordionSection>
      )}

      {hasData(lights) && (
        <AccordionSection title="נורות ותאורה" icon="💡">
          <Row label="נורות כללי" value={lights.general} />
          <Row label="מיקום נורות ספייר" value={lights.spareLocation} />
          <Row label="לובי – דגם" value={lights.lobbyModel} />
          <Row label="לובי – צבע" value={lights.lobbyColor} />
          <Row label="מסדרונות – דגם" value={lights.corridorModel} />
          <Row label="מסדרונות – צבע" value={lights.corridorColor} />
          <Row label="חדר מדרגות – דגם" value={lights.stairsModel} />
          <Row label="חדר מדרגות – צבע" value={lights.stairsColor} />
          <Row
            label="מפיצי ריח – מספר סידורי"
            value={lights.airFreshenerSerial}
          />
        </AccordionSection>
      )}

      {hasData(sec) && (
        <AccordionSection title="מצלמות אבטחה" icon="📷">
          <Row label="מערכת אבטחה" value={sec.system} />
          <Row label="מיקום מצלמות" value={sec.cameraLocations} />
          <Row label="ספק אבטחה" value={sec.provider} />
          <Row label="טלפון ספק" value={sec.providerPhone} />
        </AccordionSection>
      )}

      {hasData(ac) && (
        <AccordionSection title="מיזוג אוויר" icon="❄️">
          <Row label="מערכות מיזוג" value={ac.systems} />
          <Row label="ספק תחזוקה" value={ac.maintenanceProvider} />
          <Row label="טלפון ספק" value={ac.maintenancePhone} />
        </AccordionSection>
      )}

      {hasData(b) && (
        <AccordionSection title="בנק" icon="🏦">
          <Row label="שם סניף" value={b.bankBranchName} />
          <Row label="מספר סניף" value={b.bankBranchNumber} />
          <Row label="מספר חשבון" value={b.bankAccountNumber} />
          <Row label="מורשה חתימה" value={b.bankSignatory} />
          <Row label="מספר חתימות על צ'ק" value={b.signaturesRequired} />
        </AccordionSection>
      )}

      {hasData(ins) && (
        <AccordionSection title="ביטוח" icon="📄">
          <Row label="סוג ביטוח" value={ins.type} />
          <Row label="חברת ביטוח" value={ins.company} />
          <Row label="סוכן ביטוח" value={ins.agent} />
          <Row label="טלפון סוכנות" value={ins.agencyPhone} />
          <Row label="מייל סוכנות" value={ins.agencyEmail} />
          <Row label="מספר פוליסה" value={ins.policyNumber} />
          <Row label="מספר לקוח" value={ins.clientNumber} />
          <Row label="ביטוח נזקי צנרת – ספק" value={ins.pipeDamageProvider} />
          <Row label="ביטוח נזקי צנרת – טלפון" value={ins.pipeDamagePhone} />
          <Row
            label="נזקי צנרת השתתפות עצמית"
            value={ins.pipeDamageDeductible}
          />
          <Row label="נזקי צנרת עלות ביקור" value={ins.pipeDamageVisitCost} />
          <Row label="ניתן אינסטלטור פרטי" value={ins.privatePlumber} />
          <Row label="השתתפות עצמית" value={ins.deductible} />
          <Row label="עלות ביקור" value={ins.visitCost} />
        </AccordionSection>
      )}

      {hasData(comm) && (
        <AccordionSection title="ועד הבית" icon="🏛️">
          <Row label="מיקום תיבת ועד" value={comm.boxLocation} />
          <Row label="מיקום הנחת צ'קים" value={comm.checksPlacementLocation} />
          <Row label="שיטת חלוקת דמי ועד" value={comm.feeDistribution} />
          <Row label="תהליך קבלת צ'ק" value={comm.checkProcess} />
          <Row label="מספר חתימות על צ'ק" value={comm.signaturesRequired} />
        </AccordionSection>
      )}

      {hasData(muni) && (
        <AccordionSection title="עירייה" icon="🏙️">
          <Row label="פרטי רשומה" value={muni.registrationDetails} />
          <Row label="מספר רשומה" value={muni.registrationNumber} />
          <Row label="ימי הוצאת חפצים" value={muni.itemRemovalDays} />
          <Row label="ימי פינוי גזם" value={muni.pruningRemovalDays} />
          <Row label="תחנת תברואה שם" value={muni.sanitationStationName} />
          <Row label="תחנת תברואה טלפון" value={muni.sanitationStationPhone} />
        </AccordionSection>
      )}

      {hasData(cult) && (
        <AccordionSection title="האגודה לתרבות הדיור" icon="🏘️">
          <Row label="שם נציג" value={cult.representativeName} />
          <Row label="טלפון נציג" value={cult.representativePhone} />
          <Row label="מנוי לבניין" value={cult.hasSubscription} />
        </AccordionSection>
      )}

      {building.notes && (
        <AccordionSection title="הערות כלליות" icon="📝" defaultOpen>
          <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
            {building.notes}
          </p>
        </AccordionSection>
      )}

      {/* ===== סקשנים מותאמים אישית ===== */}
      {(building.customSections || []).map((section) => (
        <AccordionSection
          key={section.id}
          title={section.title}
          icon="📌"
          defaultOpen
        >
          {section.fields.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-2">
              אין שדות עדיין
            </p>
          )}
          {section.fields.map((field) => (
            <div
              key={field.id}
              className="flex justify-between items-center py-2 border-b border-gray-100 gap-2"
            >
              <span className="text-gray-500 text-sm w-1/3">{field.label}</span>
              <input
                className="text-sm text-gray-800 font-medium text-right flex-1 border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent"
                value={field.value}
                onChange={(e) => {
                  const updated = (building.customSections || []).map((s) =>
                    s.id !== section.id
                      ? s
                      : {
                          ...s,
                          fields: s.fields.map((f) =>
                            f.id !== field.id
                              ? f
                              : { ...f, value: e.target.value },
                          ),
                        },
                  );
                  updateBuilding(building.id!, { customSections: updated });
                }}
              />
              <button
                onClick={() =>
                  setConfirmDelete({
                    type: "field",
                    sectionId: section.id,
                    fieldId: field.id,
                  })
                }
                className="text-red-400 hover:text-red-600 text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowAddField(section.id)}
              className="flex-1 text-xs text-blue-500 hover:text-blue-700 border border-dashed border-blue-300 rounded-lg py-2"
            >
              + הוסף שדה
            </button>
            <button
              onClick={() =>
                setConfirmDelete({ type: "section", sectionId: section.id })
              }
              className="text-xs text-red-400 hover:text-red-600 border border-dashed border-red-200 rounded-lg px-3 py-2"
            >
              🗑️
            </button>
          </div>
        </AccordionSection>
      ))}

      <button
        onClick={() => setShowAddSection(true)}
        className="w-full border-2 border-dashed border-blue-300 text-blue-500 hover:border-blue-500 hover:text-blue-700 rounded-xl py-3 text-sm font-medium transition-colors mb-4"
      >
        + הוסף קטגוריה
      </button>

      <div className="mt-2 flex gap-3">
        <button
          onClick={() => navigate("/buildings")}
          className="flex-1 border-2 border-blue-500 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors"
        >
          ← חזור לרשימת בניינים
        </button>
        <button
          onClick={() => setShowEdit(true)}
          className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          ✏️ ערוך בניין
        </button>
      </div>

      {showEdit && (
        <BuildingFormModal
          building={building}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showAddSection && (
        <InputModal
          title="שם הקטגוריה החדשה"
          placeholder="לדוגמה: מעקב תחזוקה"
          confirmLabel="צור קטגוריה"
          onConfirm={handleAddSection}
          onCancel={() => setShowAddSection(false)}
        />
      )}

      {showAddField && (
        <InputModal
          title="שם השדה החדש"
          placeholder="לדוגמה: תאריך בדיקה אחרונה"
          confirmLabel="הוסף שדה"
          onConfirm={(label) => handleAddField(showAddField, label)}
          onCancel={() => setShowAddField(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title={
            confirmDelete.type === "section" ? "למחוק קטגוריה?" : "למחוק שדה?"
          }
          message={
            confirmDelete.type === "section"
              ? "כל השדות בקטגוריה יימחקו"
              : undefined
          }
          confirmLabel="מחק"
          onConfirm={() =>
            confirmDelete.type === "section"
              ? handleDeleteSection(confirmDelete.sectionId)
              : handleDeleteField(
                  confirmDelete.sectionId,
                  confirmDelete.fieldId!,
                )
          }
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
