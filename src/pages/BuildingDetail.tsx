import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Building } from "../types";
import AccordionSection from "../components/buildings/AccordionSection";
import BuildingFormModal from "../components/buildings/BuildingFormModal";

const Row = ({ label, value }: { label: string; value?: any }) =>
  value ? (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 text-sm font-medium text-right max-w-[60%]">
        {value}
      </span>
    </div>
  ) : null;

const EmptySection = () => (
  <p className="text-gray-400 text-sm text-center py-2">
    אין מידע עדיין – לחץ עריכה להוספה
  </p>
);

export default function BuildingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [showEdit, setShowEdit] = useState(false);

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
  const park = building.parking || {};
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

  const hasData = (obj: Record<string, any>) =>
    Object.values(obj).some((v) => v);

  return (
    <div dir="rtl" className="max-w-2xl mx-auto pb-24">
      {/* כפתור חזרה למעלה */}
      <button
        onClick={() => navigate("/buildings")}
        className="flex items-center gap-2 text-blue-600 font-semibold text-base mb-4 mt-1 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
      >
        ← חזור לרשימת בניינים
      </button>

      {/* Header כרטיס */}
      <div className="bg-white rounded-2xl shadow p-5 mb-5 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {building.address}
          </h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-500 flex-wrap">
            <span>🏠 {building.units} דירות</span>
            <span>📐 {building.floors} קומות</span>
            {building.contractStart && (
              <span>📅 תחילת הסכם: {building.contractStart}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          ✏️ עריכה
        </button>
      </div>

      {/* כללי */}
      <AccordionSection title="כללי" icon="📋" defaultOpen={true}>
        {hasData(g) || building.entryCode ? (
          <>
            <Row label="קוד כניסה" value={building.entryCode} />
            <Row label="מספר חנויות" value={g.shops} />
            <Row label="מיקום ארגז כלים" value={g.toolboxLocation} />
            <Row label="מיקום ועד תיבה" value={g.committeeBoxLocation} />
            <Row label="מיקום צקים" value={g.checksLocation} />
            <Row label="מיקום סולם" value={g.ladderLocation} />
            <Row label="שיבר מרכזי" value={g.mainShiver} />
            <Row label="לוח חשמל ראשי" value={g.mainElectricPanel} />
            <Row label="אחראי צ'קים לספקים" value={g.checksResponsible} />
            <Row label="מיקום ערכת עזרה ראשונה" value={g.firstAidLocation} />
            <Row label="דייר איש קשר טכני" value={g.techContactTenant} />
            <Row label="מנקה שיכול לעזור" value={g.helperCleaner} />
            <Row label="מנהל לקוח (בניין)" value={g.clientManager} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* אינטרקום */}
      <AccordionSection title="אינטרקום" icon="🔔">
        {hasData(ic) ? (
          <>
            <Row label="דגם אינטרקום" value={ic.model} />
            <Row label="קוד כניסה" value={ic.entryCode} />
            <Row label="מצלמת אינטרקום" value={ic.camera} />
            <Row label="סוג קודן" value={ic.coderType} />
            <Row label="מיקום המערכת" value={ic.location} />
            <Row label="קוד טכנאי" value={ic.techCode} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* חשמל */}
      <AccordionSection title="חשמל" icon="⚡">
        {hasData(elec) ? (
          <>
            <Row label="מספר לקוח בחברת חשמל" value={elec.clientNumber} />
            <Row label="מספר חשבון חוזה" value={elec.contractNumber} />
            <Row label="מספר מונה" value={elec.meterNumber} />
            <Row label="חשבון נשלח למי" value={elec.billSentTo} />
            <Row label="מיקום שעון שבת" value={elec.shabbatClockLocation} />
            <Row label="סוג לוח חשמל" value={elec.panelType} />
            <Row label="מיקום לוח חשמל ראשי" value={elec.mainPanelLocation} />
            <Row label="צורת תשלום" value={elec.paymentMethod} />
            <Row label="בדיקת פחת לבניין" value={elec.depreciationCheck} />
            <Row label="בדיקת הארקה לבניין" value={elec.groundingCheck} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* מעלית */}
      <AccordionSection title="מעלית" icon="🛗">
        {hasData(elev) ? (
          <>
            <Row label="מספר מעליות" value={elev.count} />
            <Row label="סוג מעלית" value={elev.type} />
            <Row label="חברת מעליות" value={elev.company} />
            <Row label="טלפון חברה" value={elev.companyPhone} />
            <Row label="מהנדס מעליות" value={elev.engineer} />
            <Row label="טלפון מהנדס" value={elev.engineerPhone} />
            <Row label="עלות קריאת שרות" value={elev.serviceCallCost} />
            <Row label="מספר קו הטלפון" value={elev.phoneLineNumber} />
            <Row label="מיקום חדר מעלית" value={elev.roomLocation} />
            <Row label="צורת תשלום" value={elev.paymentMethod} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* גג */}
      <AccordionSection title="גג" icon="🏠">
        {hasData(roof) ? (
          <>
            <Row label="סוג איטום" value={roof.sealType} />
            <Row label="חברה שאטמה" value={roof.sealCompany} />
            <Row label="טלפון חברה" value={roof.sealCompanyPhone} />
            <Row label="שנת איטום אחרון" value={roof.lastSealYear} />
            <Row label="שטח הגג במ״ר" value={roof.areaSqm} />
            <Row label="אחריות לאיטום עד" value={roof.warrantyUntil} />
            <Row label="מיקום מפתח לגג" value={roof.keyLocation} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* גז */}
      <AccordionSection title="גז" icon="🔥">
        {hasData(gas) ? (
          <>
            <Row label="ספק גז" value={gas.supplier} />
            <Row label="טלפון ספק" value={gas.supplierPhone} />
            <Row label="טלפון חירום" value={gas.emergencyPhone} />
            <Row label="סוג מיכלי גז" value={gas.tankType} />
            <Row label="מיקום שעוני גז" value={gas.metersLocation} />
            <Row label="מיקום בלוני גז" value={gas.cylindersLocation} />
            <Row label="עלות לקוב" value={gas.costPerCubic} />
            <Row label="מפתח לחדר גז" value={gas.roomKey} />
            <Row label="מספר מרכזיה בחב׳ הגז" value={gas.centralNumber} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* חניה */}
      <AccordionSection title="חניה" icon="🅿️">
        {hasData(park) ? (
          <>
            <Row label="חברת חניה" value={park.company} />
            <Row label="טלפון חברה" value={park.companyPhone} />
            <Row label="מיקום מפתח שער נגרר" value={park.gateKeyLocation} />
            <Row label="מיקום מפתח מחסום" value={park.barrierKeyLocation} />
            <Row label="איך פותחים שער נגרר" value={park.gateOpenMethod} />
            <Row label="מיקום שלט למחסום" value={park.remoteLocation} />
            <Row label="פתיחה סלולרית – מספר" value={park.mobileOpenNumber} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* כיבוי אש */}
      <AccordionSection title="כיבוי אש" icon="🧯">
        {hasData(fire) ? (
          <>
            <Row label="חברה" value={fire.company} />
            <Row label="טלפון חברה" value={fire.companyPhone} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* מקלט */}
      <AccordionSection title="מקלט" icon="🛡️">
        {hasData(shelter) ? (
          <>
            <Row label="מיקום מקלט" value={shelter.location} />
            <Row label="מפתח למקלט" value={shelter.key} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* מים */}
      <AccordionSection title="מים" icon="💧">
        {hasData(water) ? (
          <>
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
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* ניקיון */}
      <AccordionSection title="ניקיון" icon="🧹">
        {hasData(clean) ? (
          <>
            <Row label="שם מנקה" value={clean.name} />
            <Row label="טלפון מנקה" value={clean.phone} />
            <Row label="ז.ת מנקה" value={clean.idNumber} />
            <Row label="מספר פעמים בשבוע" value={clean.weeklyFrequency} />
            <Row label="ימי ניקיון" value={clean.days} />
            <Row label="ניקוי מסדרונות" value={clean.corridorsDays} />
            <Row label="ניקוי חדר מדרגות" value={clean.stairsDays} />
            <Row label="דגשים בניקיון" value={clean.notes} />
            <Row label="דגם לובי" value={clean.lobbyModel} />
            <Row label="צבע לובי" value={clean.lobbyColor} />
            <Row label="דגם מסדרונות" value={clean.corridorModel} />
            <Row label="צבע מסדרונות" value={clean.corridorColor} />
            <Row label="דגם חדר מדרגות" value={clean.stairsModel} />
            <Row label="צבע חדר מדרגות" value={clean.stairsColor} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* גינון */}
      <AccordionSection title="גינון" icon="🌿">
        {hasData(gard) ? (
          <>
            <Row label="שם גנן" value={gard.gardenerName} />
            <Row label="טלפון גנן" value={gard.gardenerPhone} />
            <Row label="מספר פעמים בחודש" value={gard.frequency} />
            <Row label="מערכת השקיה אוטומטית" value={gard.autoIrrigation} />
            <Row label="דגם מערכת השקייה" value={gard.irrigationModel} />
            <Row label="מיקום מערכת השקיה" value={gard.irrigationLocation} />
            <Row label="מיקום שיבר הגינה" value={gard.gardenShiverLocation} />
            <Row label="ימי הוצאת גזם" value={gard.trimmingDays} />
            <Row label="טלפון איסוף גזם" value={gard.trimmingPickupPhone} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* נורות */}
      <AccordionSection title="נורות ותאורה" icon="💡">
        {hasData(lights) ? (
          <>
            <Row label="נורות כללי" value={lights.general} />
            <Row label="מיקום ספייר נורות" value={lights.spareLocation} />
            <Row
              label="מפיצי ריח – מיקום"
              value={lights.airFreshenerLocation}
            />
            <Row
              label="מפיצי ריח – מספר סידורי"
              value={lights.airFreshenerSerial}
            />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* מצלמות אבטחה */}
      <AccordionSection title="מצלמות אבטחה" icon="📷">
        {hasData(sec) ? (
          <>
            <Row label="מערכת אבטחה" value={sec.system} />
            <Row label="מיקום מצלמות" value={sec.cameraLocations} />
            <Row label="ספק אבטחה" value={sec.provider} />
            <Row label="טלפון ספק" value={sec.providerPhone} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* מיזוג אוויר */}
      <AccordionSection title="מיזוג אוויר" icon="❄️">
        {hasData(ac) ? (
          <>
            <Row label="מערכות מיזוג" value={ac.systems} />
            <Row label="ספק תחזוקה" value={ac.maintenanceProvider} />
            <Row label="טלפון ספק" value={ac.maintenancePhone} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* בנק */}
      <AccordionSection title="בנק" icon="🏦">
        {hasData(b) ? (
          <>
            <Row label="שם סניף" value={b.bankBranchName} />
            <Row label="מספר סניף" value={b.bankBranchNumber} />
            <Row label="מספר חשבון" value={b.bankAccountNumber} />
            <Row label="מורשה חתימה" value={b.bankSignatory} />
            <Row label="מספר חתימות על צ'ק" value={b.signaturesRequired} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* ביטוח */}
      <AccordionSection title="ביטוח" icon="📄">
        {hasData(ins) ? (
          <>
            <Row label="סוג ביטוח" value={ins.type} />
            <Row label="חברת ביטוח" value={ins.company} />
            <Row label="סוכן ביטוח" value={ins.agent} />
            <Row label="טלפון סוכנות" value={ins.agencyPhone} />
            <Row label="מייל סוכנות" value={ins.agencyEmail} />
            <Row label="מספר פוליסה" value={ins.policyNumber} />
            <Row label="מספר לקוח" value={ins.clientNumber} />
            <Row label="אמצעי תשלום" value={ins.paymentMethod} />
            <Row label="ביטוח נזקי צנרת – ספק" value={ins.pipeDamageProvider} />
            <Row label="ביטוח נזקי צנרת – טלפון" value={ins.pipeDamagePhone} />
            <Row label="השתתפות עצמית" value={ins.deductible} />
            <Row label="עלות ביקור" value={ins.visitCost} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* מפתחות */}
      <AccordionSection title="מפתחות" icon="🔑">
        {hasData(keys) ? (
          <>
            <Row label="מפתח לגג" value={keys.roofKey} />
            <Row label="מפתח למקלט" value={keys.shelterKey} />
            <Row label="מפתח לחניה/מחסום" value={keys.parkingKey} />
            <Row label="מפתח לתיבת דואר" value={keys.mailboxKey} />
            <Row label="מפתח לשער נגרר" value={keys.gateKey} />
            <Row label="מפתח לחדר גז" value={keys.gasRoomKey} />
            <Row label="מפתח לחדר מעלית" value={keys.elevatorRoomKey} />
            <Row label="מפתח לתיבת ועד" value={keys.committeeBoxKey} />
            <Row label="מיקום ספייר מפתחות" value={keys.spareKeysLocation} />
            <Row label="מספר ספייר מפתחות" value={keys.spareKeysCount} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* ועד הבית */}
      <AccordionSection title="ועד הבית" icon="🏛️">
        {hasData(comm) ? (
          <>
            <Row label="מיקום תיבת ועד" value={comm.boxLocation} />
            <Row label="שיטת חלוקת דמי ועד" value={comm.feeDistribution} />
            <Row label="תהליך קבלת צ'ק" value={comm.checkProcess} />
            <Row label="מספר חתימות על צ'ק" value={comm.signaturesRequired} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* עירייה */}
      <AccordionSection title="עירייה" icon="🏙️">
        {hasData(muni) ? (
          <>
            <Row label="פרטי רשומה" value={muni.registrationDetails} />
            <Row label="מספר רשומה" value={muni.registrationNumber} />
          </>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* הערות */}
      <AccordionSection
        title="הערות כלליות"
        icon="📝"
        defaultOpen={!!building.notes}
      >
        {building.notes ? (
          <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
            {building.notes}
          </p>
        ) : (
          <EmptySection />
        )}
      </AccordionSection>

      {/* כפתורים תחתיים */}
      <div className="mt-6 flex gap-3">
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
    </div>
  );
}
