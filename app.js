// ---------- Constants ----------
const REQUESTS_KEY = 'registrarRequests';
const COUNTER_KEY = 'registrarReferenceCounter';

const DOCUMENT_TYPES = {
  'Certificate of Enrollment': { fee: 50, workingDays: 2 },
  'Transcript of Records':     { fee: 150, workingDays: 5 },
  'Good Moral Certificate':    { fee: 100, workingDays: 3 }
};

// ---------- Date helper ----------
function addWorkingDays(startDate, n) {
  const result = new Date(startDate);
  let remaining = n;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();            // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) remaining--;
  }
  return result;
}

// ---------- Reference number ----------
function generateReferenceNumber() {
  const lastCounter = parseInt(localStorage.getItem(COUNTER_KEY), 10) || 0;
  const nextCounter = lastCounter + 1;
  localStorage.setItem(COUNTER_KEY, String(nextCounter));
  const year = new Date().getFullYear();
  return 'REQ-' + year + '-' + String(nextCounter).padStart(4, '0');
}

// ---------- Storage ----------
function loadRequests() {
  try {
    const stored = localStorage.getItem(REQUESTS_KEY);
    if (stored === null) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveRequests(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

// ---------- Creating a request ----------
function createRequest(data) {
  const docInfo = DOCUMENT_TYPES[data.documentType];
  const now = new Date();
  const request = {
    referenceNumber: generateReferenceNumber(),
    studentName: data.studentName,
    studentId: data.studentId,
    course: data.course,
    documentType: data.documentType,
    purpose: data.purpose,
    dateRequested: now.toISOString(),
    status: 'Submitted',
    fee: docInfo.fee,
    expectedReleaseDate: addWorkingDays(now, docInfo.workingDays).toISOString(),
    claimDate: null,
    rejectionReason: null
  };
  const requests = loadRequests();
  requests.push(request);
  saveRequests(requests);
  return request;
}