import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export const TRANSLATIONS = {
  en: {
    campusHub: 'Campus Hub',
    verifiedIdentity: 'Verified Identity',
    studentRoster: 'Student Roster',
    smartForms: 'Smart Forms',
    digitalCertificates: 'Digital Certificates',
    campusNotices: 'Campus Notices',
    grievanceDesk: 'Grievance Desk',
    examinationCell: 'Examination Cell',
    gatepassSecurity: 'Hostel Leave & Gatepass',
    messDining: 'Smart Mess & Dining',
    academicsAttendance: 'Academics & Attendance',
    featurePhoneUssd: 'Feature Phone (USSD)',
    adoptionMigration: 'College Migration',
    statutoryRule: '75% Statutory Attendance Rule',
    compliant: 'Compliant',
    debarmentRisk: 'Debarment Risk',
    punchExit: 'Punch Exit',
    punchEntry: 'Punch Entry',
    fillOnceUseEverywhere: 'Fill Once, Use Everywhere',
    lowBandwidthActive: '2G Low-Bandwidth Mode Active',
    normalBandwidth: 'Standard Bandwidth',
    dataSavedNote: 'Data Saved: 99.2% (14.2 KB Payload)'
  },
  hi: {
    campusHub: 'परिसर केंद्र (Hub)',
    verifiedIdentity: 'सत्यापित पहचान',
    studentRoster: 'छात्र नामावली',
    smartForms: 'स्मार्ट फॉर्म्स',
    digitalCertificates: 'डिजिटल प्रमाणपत्र',
    campusNotices: 'परिसर सूचनाएं',
    grievanceDesk: 'शिकायत निवारण',
    examinationCell: 'परीक्षा प्रकोष्ठ',
    gatepassSecurity: 'हॉस्टल अवकाश एवं गेट पास',
    messDining: 'स्मार्ट मेस एवं भोजन',
    academicsAttendance: 'शैक्षणिक एवं उपस्थिति',
    featurePhoneUssd: 'फीचर फोन (USSD)',
    adoptionMigration: 'संस्थान डेटा माइग्रेशन',
    statutoryRule: '75% अनिवार्य उपस्थिति नियम',
    compliant: 'पात्र (Compliant)',
    debarmentRisk: 'परीक्षा बहिष्कार जोखिम',
    punchExit: 'प्रस्थान दर्ज करें (Exit)',
    punchEntry: 'प्रवेश दर्ज करें (Entry)',
    fillOnceUseEverywhere: 'एक बार भरें, हर जगह उपयोग करें',
    lowBandwidthActive: '2G डेटा सेवर मोड सक्रिय',
    normalBandwidth: 'मानक बैंडविड्थ',
    dataSavedNote: 'डेटा बचत: 99.2% (14.2 KB पेलोड)'
  },
  or: {
    campusHub: 'କ୍ୟାମ୍ପସ୍ କେନ୍ଦ୍ର (Hub)',
    verifiedIdentity: 'ପ୍ରମାଣିତ ପରିଚୟ',
    studentRoster: 'ଛାତ୍ରଛାତ୍ରୀ ତାଲିକା',
    smartForms: 'ସ୍ମାର୍ଟ ଫର୍ମ',
    digitalCertificates: 'ଡିଜିଟାଲ୍ ପ୍ରମାଣପତ୍ର',
    campusNotices: 'ବିଶ୍ୱବିଦ୍ୟାଳୟ ବିଜ୍ଞପ୍ତି',
    grievanceDesk: 'ଅଭିଯୋଗ ନିବାରଣ',
    examinationCell: 'ପରୀକ୍ଷା ନିୟନ୍ତ୍ରଣ',
    gatepassSecurity: 'ହଷ୍ଟେଲ ଛୁଟି ଏବଂ ଗେଟ୍ ପାସ୍',
    messDining: 'ମେସ୍ ଓ ଭୋଜନାଳୟ',
    academicsAttendance: 'ଶିକ୍ଷା ଓ ଉପସ୍ଥିତି',
    featurePhoneUssd: 'ଫିଚର ଫୋନ୍ ସେବା (USSD)',
    adoptionMigration: 'ତଥ୍ୟ ସ୍ଥାନାନ୍ତରଣ (Migration)',
    statutoryRule: '୭୫% ବାଧ୍ୟତାମୂଳକ ଉପସ୍ଥିତି ନିୟମ',
    compliant: 'ଯୋଗ୍ୟ (Compliant)',
    debarmentRisk: 'ପରୀକ୍ଷା ବଞ୍ଚିତ ବିପଦ',
    punchExit: 'ପ୍ରସ୍ଥାନ ଚିହ୍ନଟ (Exit)',
    punchEntry: 'ପ୍ରବେଶ ଚିହ୍ନଟ (Entry)',
    fillOnceUseEverywhere: 'ଥରେ ଲେଖନ୍ତୁ, ସର୍ବତ୍ର ବ୍ୟବହାର କରନ୍ତୁ',
    lowBandwidthActive: '୨ଜି ସ୍ୱଳ୍ପ ଡାଟା ମୋଡ୍ ସକ୍ରିୟ',
    normalBandwidth: 'ମାନକ ବ୍ୟାଣ୍ଡୱିଡ୍‌ଥ',
    dataSavedNote: 'ଡାଟା ସଞ୍ଚୟ: ୯୯.୨% (୧୪.୨ KB ପେଲୋଡ୍)'
  }
};

export function AccessibilityProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('campus_lang') || 'en');
  const [lowBandwidth, setLowBandwidth] = useState(() => localStorage.getItem('campus_low_bandwidth') === 'true');

  useEffect(() => {
    localStorage.setItem('campus_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('campus_low_bandwidth', lowBandwidth ? 'true' : 'false');
    if (lowBandwidth) {
      document.body.classList.add('low-bandwidth-mode');
    } else {
      document.body.classList.remove('low-bandwidth-mode');
    }
  }, [lowBandwidth]);

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        setLanguage,
        lowBandwidth,
        setLowBandwidth,
        t,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
