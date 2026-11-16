import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import PDFDocument from 'pdfkit';
import { connectDB } from './connection.js';
import {
  User, Student, GovernanceConfig, Consent, AttendanceRecord, AssessmentScore,
  MentorObservation, RiskFlag, Intervention, FollowUp, Outcome,
  Interview, InterviewFeedback, Subject, Note, NoteBookmark, NoteAccessLog,
  Question, Exam, ExamAttempt, Answer, Result, AuditLog, PseudonymMapping,
  Plan, Price, Subscription, Purchase, Payment, Entitlement, Coupon, Refund, Invoice, WebhookEvent,
} from './models/index.js';

// ---------------------------------------------------------------------------
// PDF Helper
// ---------------------------------------------------------------------------
async function makePdf(filePath: string, title: string, subject: string): Promise<number> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 54 });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(22).fillColor('#185b49').text(title);
    doc.moveDown().fontSize(12).fillColor('#202820').text(`${subject} · SuccessHUB Sample Notes`);
    doc.moveDown().text(
      'This study note contains definitions, examples and review prompts for the university pilot. ' +
      'It is sample material and should be reviewed by faculty before academic use.',
    );
    doc.moveDown().fontSize(16).fillColor('#185b49').text('Key Concepts');
    doc.fontSize(12).fillColor('#202820').list([
      'Understand the core terminology before memorising examples.',
      'Compare examples with your own course notes.',
      'Use the practice questions at the end to check understanding.',
    ]);
    doc.moveDown().fontSize(16).fillColor('#185b49').text('Worked Example');
    doc.fontSize(12).fillColor('#202820').text(
      'Start with the problem statement, identify the relevant principle, then explain each step clearly. ' +
      'A well-explained answer demonstrates understanding better than a bare result.',
    );
    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
  const stat = await fs.stat(filePath);
  return stat.size;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ---------------------------------------------------------------------------
// Main Seed Function
// ---------------------------------------------------------------------------
async function seed() {
  await connectDB();

  // -------------------------------------------------------------------------
  // 0. Clear all collections
  // -------------------------------------------------------------------------
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    GovernanceConfig.deleteMany({}),
    Consent.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    AssessmentScore.deleteMany({}),
    MentorObservation.deleteMany({}),
    RiskFlag.deleteMany({}),
    Intervention.deleteMany({}),
    FollowUp.deleteMany({}),
    Outcome.deleteMany({}),
    Interview.deleteMany({}),
    InterviewFeedback.deleteMany({}),
    Subject.deleteMany({}),
    Note.deleteMany({}),
    NoteBookmark.deleteMany({}),
    NoteAccessLog.deleteMany({}),
    Question.deleteMany({}),
    Exam.deleteMany({}),
    ExamAttempt.deleteMany({}),
    Answer.deleteMany({}),
    Result.deleteMany({}),
    AuditLog.deleteMany({}),
    PseudonymMapping.deleteMany({}),
    Plan.deleteMany({}),
    Price.deleteMany({}),
    Subscription.deleteMany({}),
    Purchase.deleteMany({}),
    Payment.deleteMany({}),
    Entitlement.deleteMany({}),
    Coupon.deleteMany({}),
    Refund.deleteMany({}),
    Invoice.deleteMany({}),
    WebhookEvent.deleteMany({}),
  ]);
  console.log('✓ All collections cleared');

  // -------------------------------------------------------------------------
  // 1. Users — Staff & Students
  // -------------------------------------------------------------------------
  const staffData = [
    { email: 'mentor1@successhub.local', displayName: 'Dr. Ritu Mehta', role: 'mentor' as const },
    { email: 'mentor2@successhub.local', displayName: 'Prof. Sanjay Kulkarni', role: 'mentor' as const },
    { email: 'mentor3@successhub.local', displayName: 'Dr. Anjali Singh', role: 'mentor' as const },
    { email: 'interviewer@successhub.local', displayName: 'Arjun Nair', role: 'interviewer' as const },
    { email: 'counsellor@successhub.local', displayName: 'Priya Menon', role: 'counsellor' as const },
    { email: 'admin@successhub.local', displayName: 'Kavita Rao', role: 'admin' as const },
    { email: 'datasteward@successhub.local', displayName: 'Nikhil Verma', role: 'data-steward' as const },
    { email: 'interviewer2@successhub.local', displayName: 'Deepa Krishnan', role: 'interviewer' as const },
  ];

  const studentNames = [
    'Aanya Sharma', 'Rohan Gupta', 'Meera Iyer', 'Kabir Joshi', 'Priya Nair',
    'Aryan Patel', 'Sneha Reddy', 'Vikram Singh', 'Anjali Kumar', 'Rahul Verma',
    'Divya Menon', 'Nikhil Bose', 'Pooja Agarwal', 'Siddharth Rao', 'Kavya Pillai',
    'Amit Chaudhary', 'Riya Shah', 'Karan Malhotra', 'Deepika Nambiar', 'Yash Pandey',
    'Tanvi Desai', 'Rohit Mishra', 'Shreya Bhatt', 'Aakash Tiwari', 'Nisha Kapoor',
    'Varun Saxena', 'Ananya Mukherjee', 'Gaurav Sharma', 'Kritika Jain', 'Manish Kumar',
  ];

  // Dates of birth between 2001-01-15 and 2003-12-20
  const dobs = [
    new Date('2001-03-12'), new Date('2001-07-25'), new Date('2002-01-08'), new Date('2002-05-14'), new Date('2001-11-30'),
    new Date('2003-02-18'), new Date('2002-09-05'), new Date('2001-04-22'), new Date('2003-07-11'), new Date('2002-12-01'),
    new Date('2001-08-19'), new Date('2003-03-27'), new Date('2002-06-15'), new Date('2001-01-15'), new Date('2003-10-04'),
    new Date('2002-02-28'), new Date('2001-12-20'), new Date('2003-04-09'), new Date('2002-08-17'), new Date('2001-06-03'),
    new Date('2003-01-14'), new Date('2002-11-22'), new Date('2001-09-30'), new Date('2003-05-16'), new Date('2002-03-07'),
    new Date('2001-10-25'), new Date('2003-08-13'), new Date('2002-04-19'), new Date('2001-02-14'), new Date('2003-12-02'),
  ];

  const studentUsersData = studentNames.map((name, i) => ({
    email: `student${i + 1}@successhub.local`,
    displayName: name,
    role: 'student' as const,
    dateOfBirth: dobs[i],
  }));

  const createdStaff = await User.insertMany(staffData);
  const createdStudentUsers = await User.insertMany(studentUsersData);

  const mentor1 = createdStaff[0];
  const mentor2 = createdStaff[1];
  const interviewer1 = createdStaff[3];
  const interviewer2 = createdStaff[7];

  console.log(`✓ Users: ${createdStaff.length + createdStudentUsers.length} created (${createdStaff.length} staff, ${createdStudentUsers.length} students)`);

  // -------------------------------------------------------------------------
  // 2. Students
  // -------------------------------------------------------------------------
  const studentRecordsData = createdStudentUsers.map((u: any, i: number) => ({
    userId: u._id,
    rollNumber: `SH${String(i + 1).padStart(3, '0')}`,
    // Alternate CSE301 (odd 1-based index 1,3,5...) and MCA204 (even 2,4,6...)
    courseCode: (i + 1) % 2 === 1 ? 'CSE301' : 'MCA204',
    batch: '2026',
  }));

  const createdStudents = await Student.insertMany(studentRecordsData);
  console.log(`✓ Students: ${createdStudents.length} created`);

  // -------------------------------------------------------------------------
  // 3. Subjects
  // -------------------------------------------------------------------------
  const createdSubjects = await Subject.insertMany([
    { code: 'CSE301', name: 'Web Technologies' },
    { code: 'MCA204', name: 'Database Management' },
  ]);
  const cseSubject = createdSubjects[0];
  const mcaSubject = createdSubjects[1];
  console.log(`✓ Subjects: ${createdSubjects.length} created`);

  // -------------------------------------------------------------------------
  // 4. GovernanceConfigs
  // -------------------------------------------------------------------------
  const govConfigsData = [
    {
      configKey: 'consent_attendance_marks_sharing',
      version: 1,
      approved: false,
      required: true,
      value: { text: 'I agree that SuccessHUB may share my attendance and assessment information with my assigned mentor.' },
    },
    {
      configKey: 'consent_interview_recording',
      version: 1,
      approved: false,
      required: true,
      value: { text: 'I agree that my SuccessHUB interview may be recorded for interview-support purposes.' },
    },
    {
      configKey: 'consent_interview_feedback_counsellor_sharing',
      version: 1,
      approved: false,
      required: true,
      value: { text: 'I agree that my interview feedback may be shared with my assigned counsellor.' },
    },
    {
      configKey: 'retention_schedule',
      version: 1,
      approved: false,
      required: true,
      value: { recordingDays: 30, feedback: 'course_end', exams: 'academic_year', auditDays: 365 },
    },
    {
      configKey: 'anonymisation_policy',
      version: 1,
      approved: false,
      required: true,
      value: { minimumGroupSize: 5, directIdentifiersRemoved: true },
    },
    {
      configKey: 'student_messages',
      version: 1,
      approved: false,
      required: true,
      value: { templates: [{ key: 'attendance_drop', text: 'Your attendance dropped in the last 2 weeks. Would you like to talk to your mentor?' }] },
    },
  ];
  const createdGovConfigs = await GovernanceConfig.insertMany(govConfigsData);
  console.log(`✓ GovernanceConfigs: ${createdGovConfigs.length} created`);

  // -------------------------------------------------------------------------
  // 5. Consents
  // -------------------------------------------------------------------------
  const consentDocs: object[] = [];
  // Students 0-14 (first 15): attendance_marks_sharing
  for (let i = 0; i < 15; i++) {
    consentDocs.push({
      studentId: createdStudents[i]._id,
      purpose: 'attendance_marks_sharing',
      status: 'granted',
      textVersion: 1,
      approvedVersion: false,
      grantedAt: new Date(),
    });
  }
  // Students 0-9 (first 10): interview_recording
  for (let i = 0; i < 10; i++) {
    consentDocs.push({
      studentId: createdStudents[i]._id,
      purpose: 'interview_recording',
      status: 'granted',
      textVersion: 1,
      approvedVersion: false,
      grantedAt: new Date(),
    });
  }
  // Students 0-7 (first 8): interview_feedback_counsellor_sharing
  for (let i = 0; i < 8; i++) {
    consentDocs.push({
      studentId: createdStudents[i]._id,
      purpose: 'interview_feedback_counsellor_sharing',
      status: 'granted',
      textVersion: 1,
      approvedVersion: false,
      grantedAt: new Date(),
    });
  }
  const createdConsents = await Consent.insertMany(consentDocs);
  console.log(`✓ Consents: ${createdConsents.length} created`);

  // -------------------------------------------------------------------------
  // 6. AttendanceRecords
  // -------------------------------------------------------------------------
  const attendanceDocs: object[] = [];
  for (const student of createdStudents) {
    for (let day = 0; day < 56; day++) {
      attendanceDocs.push({
        studentId: student._id,
        attendedOn: daysAgo(day),
        status: day % 11 === 0 ? 'absent' : 'present',
        reason: undefined,
        recordedBy: mentor1._id,
      });
    }
  }
  await AttendanceRecord.insertMany(attendanceDocs);
  console.log(`✓ AttendanceRecords: ${attendanceDocs.length} created (56 days × 30 students)`);

  // -------------------------------------------------------------------------
  // 7. AssessmentScores
  // -------------------------------------------------------------------------
  const assessmentDocs: object[] = [];
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    const courseCode = (i + 1) % 2 === 1 ? 'CSE301' : 'MCA204';
    assessmentDocs.push(
      {
        studentId: student._id,
        subject: courseCode,
        assessmentName: 'Mid-Term Test',
        score: 55 + ((i * 7) % 40),
        assessedAt: daysAgo(14),
        recordedBy: mentor1._id,
      },
      {
        studentId: student._id,
        subject: courseCode,
        assessmentName: 'Lab Assignment',
        score: 62 + ((i * 11) % 33),
        assessedAt: daysAgo(28),
        recordedBy: mentor1._id,
      },
      {
        studentId: student._id,
        subject: courseCode,
        assessmentName: 'Internal Assessment',
        score: 50 + ((i * 9) % 35),
        assessedAt: daysAgo(42),
        recordedBy: mentor1._id,
      },
    );
  }
  await AssessmentScore.insertMany(assessmentDocs);
  console.log(`✓ AssessmentScores: ${assessmentDocs.length} created (3 assessments × 30 students)`);

  // -------------------------------------------------------------------------
  // 8. MentorObservations
  // -------------------------------------------------------------------------
  const observationTemplates = [
    'Student asked clarifying questions about REST API design during the lab session.',
    'Showed notable improvement in SQL query writing this week. Completed all exercises.',
    'Requested additional examples on database normalisation concepts.',
    'Participated actively in the group discussion on HTTP security headers.',
    'Struggled with asynchronous JavaScript. Recommended extra practice resources.',
    'Demonstrated strong understanding of ER diagrams in today\'s check-in.',
    'Missed two lab sessions due to health reasons. Follow-up scheduled.',
    'Asked insightful questions about indexing strategies in PostgreSQL.',
    'Expressed interest in full-stack development beyond the course curriculum.',
    'Performance improving steadily. Confidence in SQL queries has grown.',
  ];

  const observationDocs: object[] = [];
  for (let i = 0; i < createdStudents.length; i++) {
    const count = i % 3 === 0 ? 3 : 2;
    for (let j = 0; j < count; j++) {
      observationDocs.push({
        studentId: createdStudents[i]._id,
        mentorId: j % 2 === 0 ? mentor1._id : mentor2._id,
        observation: observationTemplates[(i + j) % observationTemplates.length],
        observedAt: daysAgo((j + 1) * 7),
      });
    }
  }
  await MentorObservation.insertMany(observationDocs);
  console.log(`✓ MentorObservations: ${observationDocs.length} created`);

  // -------------------------------------------------------------------------
  // 9. RiskFlags
  // -------------------------------------------------------------------------
  const riskFlagDocs = [];
  for (let i = 0; i < 5; i++) {
    riskFlagDocs.push({
      studentId: createdStudents[i]._id,
      ruleKey: 'unexplained_absences_14_days',
      ruleVersion: 1,
      explanation: '3 or more unexplained absences in the last 14 days. Mentor review required before any support action.',
      status: 'pending_review' as const,
    });
  }
  const createdRiskFlags = await RiskFlag.insertMany(riskFlagDocs);
  console.log(`✓ RiskFlags: ${createdRiskFlags.length} created (first 5 students)`);

  // -------------------------------------------------------------------------
  // 10. Interventions
  // -------------------------------------------------------------------------
  const interventionPlans = [
    'Weekly mentor check-in sessions scheduled. Focus on attendance pattern and study support.',
    'Counsellor referral initiated. Student to meet counsellor twice this month.',
    'Peer study group assignment. Monitor attendance for next 4 weeks.',
  ];
  const interventionDocs = [];
  for (let i = 0; i < 3; i++) {
    interventionDocs.push({
      studentId: createdStudents[i]._id,
      flagId: createdRiskFlags[i]._id,
      ownerId: mentor1._id,
      plan: interventionPlans[i],
    });
  }
  const createdInterventions = await Intervention.insertMany(interventionDocs);
  console.log(`✓ Interventions: ${createdInterventions.length} created (first 3 flagged students)`);

  // -------------------------------------------------------------------------
  // 11. FollowUps
  // -------------------------------------------------------------------------
  const followUpDocs: object[] = [];
  for (const intervention of createdInterventions) {
    followUpDocs.push(
      {
        interventionId: intervention._id,
        dueOn: daysFromNow(7),
        notes: 'First check-in after intervention initiation.',
        completedAt: null,
      },
      {
        interventionId: intervention._id,
        dueOn: daysFromNow(14),
        notes: 'Two-week progress review.',
        completedAt: null,
      },
    );
  }
  const createdFollowUps = await FollowUp.insertMany(followUpDocs);
  console.log(`✓ FollowUps: ${createdFollowUps.length} created`);

  // -------------------------------------------------------------------------
  // 12. Outcomes
  // -------------------------------------------------------------------------
  const outcomeSummaries = [
    'Initial meeting completed. Student engaged positively. Regular check-ins scheduled.',
    'Counsellor confirmed first session. Student open to support.',
    'Peer group formed. Student attended first session successfully.',
  ];
  const outcomeDocs = createdInterventions.map((intervention: any, i: number) => ({
    interventionId: intervention._id,
    summary: outcomeSummaries[i],
    recordedAt: new Date(),
  }));
  const createdOutcomes = await Outcome.insertMany(outcomeDocs);
  console.log(`✓ Outcomes: ${createdOutcomes.length} created`);

  // -------------------------------------------------------------------------
  // 13. Questions — 20 for CSE301, 20 for MCA204
  // -------------------------------------------------------------------------
  const rawCseQuestions = [
    { topic: 'HTTP Basics', unit: 1, prompt: 'Which HTTP method is used to retrieve a resource without side effects?', options: ['POST', 'GET', 'PATCH', 'DELETE'], correctAnswer: 'GET', explanation: 'GET retrieves a resource without modifying server state.' },
    { topic: 'HTTP Basics', unit: 1, prompt: 'What HTTP status code indicates a successful response?', options: ['201', '301', '404', '200'], correctAnswer: '200', explanation: '200 OK indicates the request completed successfully.' },
    { topic: 'HTTP Basics', unit: 1, prompt: 'Which status code means "resource created"?', options: ['200', '201', '204', '400'], correctAnswer: '201', explanation: '201 Created is returned when a new resource is successfully created.' },
    { topic: 'HTTP Basics', unit: 1, prompt: 'What does the HTTP 404 status mean?', options: ['Server error', 'Redirect', 'Not found', 'Unauthorized'], correctAnswer: 'Not found', explanation: '404 Not Found means the requested resource does not exist on the server.' },
    { topic: 'REST APIs', unit: 2, prompt: 'What does REST stand for?', options: ['Remote Exchange of State Transfer', 'Representational State Transfer', 'Resource Extended Service Type', 'Reliable Endpoint Service Technology'], correctAnswer: 'Representational State Transfer', explanation: 'REST stands for Representational State Transfer, an architectural style for web services.' },
    { topic: 'REST APIs', unit: 2, prompt: 'Which HTTP method should be used for a full resource update in REST?', options: ['POST', 'GET', 'PUT', 'PATCH'], correctAnswer: 'PUT', explanation: 'PUT replaces the entire resource at the specified URI.' },
    { topic: 'REST APIs', unit: 2, prompt: 'What is the correct media type for JSON responses?', options: ['text/json', 'application/json', 'text/html', 'application/xml'], correctAnswer: 'application/json', explanation: 'application/json is the standard MIME type for JSON data.' },
    { topic: 'JavaScript', unit: 3, prompt: 'Which browser API stores key-value data locally without expiry?', options: ['sessionStorage', 'localStorage', 'IndexedDB', 'Cookie'], correctAnswer: 'localStorage', explanation: 'localStorage persists data until explicitly cleared, without expiry.' },
    { topic: 'JavaScript', unit: 3, prompt: 'What does the fetch() API return?', options: ['An XMLHttpRequest', 'A Promise', 'A callback', 'A socket'], correctAnswer: 'A Promise', explanation: 'fetch() returns a Promise that resolves to the Response object.' },
    { topic: 'JavaScript', unit: 3, prompt: 'What is the purpose of async/await in JavaScript?', options: ['To create loops', 'To handle Promises more readably', 'To declare variables', 'To define classes'], correctAnswer: 'To handle Promises more readably', explanation: 'async/await is syntactic sugar over Promises that makes asynchronous code look synchronous.' },
    { topic: 'Security', unit: 4, prompt: 'What does CORS stand for?', options: ['Cross-Origin Resource Sharing', 'Client-Origin Request Security', 'Cross-Object Resource Serialisation', 'Common Open Rest Standards'], correctAnswer: 'Cross-Origin Resource Sharing', explanation: 'CORS is a browser mechanism that controls how resources are shared across different origins.' },
    { topic: 'Security', unit: 4, prompt: 'What attack does the Content-Security-Policy header help prevent?', options: ['SQL injection', 'CSRF', 'XSS', 'DDoS'], correctAnswer: 'XSS', explanation: 'CSP restricts the sources from which scripts can be loaded, mitigating XSS.' },
    { topic: 'Security', unit: 4, prompt: 'What does HTTPS provide over HTTP?', options: ['Faster speeds', 'Data encryption and integrity', 'Unlimited bandwidth', 'Server-side rendering'], correctAnswer: 'Data encryption and integrity', explanation: 'HTTPS uses TLS to encrypt data in transit and verify server identity.' },
    { topic: 'HTML & CSS', unit: 2, prompt: 'Which CSS property controls the layout model for an element?', options: ['position', 'display', 'float', 'visibility'], correctAnswer: 'display', explanation: 'The display property determines how an element participates in the layout (block, flex, grid, etc.).' },
    { topic: 'HTML & CSS', unit: 2, prompt: 'Which HTML element is used for the main navigation of a page?', options: ['<section>', '<header>', '<nav>', '<aside>'], correctAnswer: '<nav>', explanation: '<nav> is a semantic element that represents a block of navigation links.' },
    { topic: 'REST APIs', unit: 2, prompt: 'What does idempotent mean for an HTTP method?', options: ['It is always fast', 'Making the same request multiple times has the same result', 'It returns no body', 'It requires authentication'], correctAnswer: 'Making the same request multiple times has the same result', explanation: 'Idempotency means repeated identical requests have the same effect as a single one (e.g., PUT, DELETE, GET).' },
    { topic: 'JavaScript', unit: 3, prompt: 'What does JSON.stringify() do?', options: ['Parses a JSON string', 'Converts an object to a JSON string', 'Validates JSON', 'Encrypts an object'], correctAnswer: 'Converts an object to a JSON string', explanation: 'JSON.stringify() serialises a JavaScript object into a JSON-formatted string.' },
    { topic: 'Security', unit: 4, prompt: "What type of attack sends a forged request using an authenticated user's session?", options: ['XSS', 'CSRF', 'SQL injection', 'Phishing'], correctAnswer: 'CSRF', explanation: 'Cross-Site Request Forgery tricks an authenticated user into submitting a request they did not intend.' },
    { topic: 'HTML & CSS', unit: 2, prompt: 'Which CSS layout model allows items in a one-dimensional axis?', options: ['Grid', 'Flexbox', 'Table', 'Block'], correctAnswer: 'Flexbox', explanation: 'Flexbox lays out items along a single axis (row or column) with flexible sizing.' },
    { topic: 'REST APIs', unit: 2, prompt: 'Which HTTP method is typically used to partially update a resource?', options: ['PUT', 'DELETE', 'PATCH', 'POST'], correctAnswer: 'PATCH', explanation: 'PATCH sends a partial modification to the resource, unlike PUT which replaces it entirely.' },
  ];

  const rawMcaQuestions = [
    { topic: 'SQL Basics', unit: 1, prompt: 'What does a primary key provide in a relational table?', options: ['A unique row identity', 'A sorted index', 'A backup copy', 'A permission level'], correctAnswer: 'A unique row identity', explanation: 'A primary key uniquely identifies each row in a table and cannot be NULL.' },
    { topic: 'SQL Basics', unit: 1, prompt: 'Which SQL command retrieves data from a table?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctAnswer: 'SELECT', explanation: 'SELECT is used to query and retrieve data from one or more tables.' },
    { topic: 'SQL Basics', unit: 1, prompt: 'What does the WHERE clause do in SQL?', options: ['Sorts results', 'Filters rows based on a condition', 'Groups rows', 'Joins tables'], correctAnswer: 'Filters rows based on a condition', explanation: 'WHERE filters the rows returned by a query based on a specified condition.' },
    { topic: 'SQL Basics', unit: 1, prompt: 'Which SQL keyword removes duplicate rows from results?', options: ['UNIQUE', 'FILTER', 'DISTINCT', 'GROUP'], correctAnswer: 'DISTINCT', explanation: 'SELECT DISTINCT eliminates duplicate rows from the result set.' },
    { topic: 'Normalisation', unit: 2, prompt: 'Which normal form removes repeating groups?', options: ['1NF', '2NF', '3NF', 'BCNF'], correctAnswer: '1NF', explanation: 'First Normal Form (1NF) requires atomic values and eliminates repeating groups in a relation.' },
    { topic: 'Normalisation', unit: 2, prompt: 'What does 2NF require beyond 1NF?', options: ['No transitive dependencies', 'No partial dependencies on the primary key', 'Atomic values', 'No multi-valued attributes'], correctAnswer: 'No partial dependencies on the primary key', explanation: '2NF eliminates partial functional dependencies — every non-key attribute must depend on the full primary key.' },
    { topic: 'Normalisation', unit: 2, prompt: 'Which normal form removes transitive dependencies?', options: ['1NF', '2NF', '3NF', '4NF'], correctAnswer: '3NF', explanation: '3NF ensures that non-key attributes depend only on the primary key and not on other non-key attributes.' },
    { topic: 'Transactions', unit: 3, prompt: 'What does ACID stand for in database transactions?', options: ['Access, Control, Integrity, Data', 'Atomicity, Consistency, Isolation, Durability', 'Automatic, Concurrent, Indexed, Dynamic', 'Abstract, Computed, Incremental, Durable'], correctAnswer: 'Atomicity, Consistency, Isolation, Durability', explanation: 'ACID properties guarantee that database transactions are processed reliably.' },
    { topic: 'Transactions', unit: 3, prompt: 'What does the ROLLBACK command do?', options: ['Saves the transaction', 'Reverses uncommitted changes', 'Drops the table', 'Creates a savepoint'], correctAnswer: 'Reverses uncommitted changes', explanation: 'ROLLBACK undoes all changes made in the current transaction and returns to the last COMMIT state.' },
    { topic: 'Transactions', unit: 3, prompt: 'Which isolation level prevents dirty reads?', options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'], correctAnswer: 'READ COMMITTED', explanation: 'READ COMMITTED ensures a transaction only sees data that has been committed, preventing dirty reads.' },
    { topic: 'Indexing', unit: 4, prompt: 'What is the primary benefit of a database index?', options: ['Reduces storage space', 'Speeds up data retrieval', 'Enforces data types', 'Creates backups'], correctAnswer: 'Speeds up data retrieval', explanation: 'Indexes allow the database to find rows faster without scanning the entire table.' },
    { topic: 'Indexing', unit: 4, prompt: 'Which index type is best for equality and range queries on ordered data?', options: ['Hash index', 'Bitmap index', 'B-tree index', 'Full-text index'], correctAnswer: 'B-tree index', explanation: 'B-tree indexes efficiently support both equality lookups and range queries on ordered data.' },
    { topic: 'ER Diagrams', unit: 1, prompt: 'What does a diamond shape represent in an ER diagram?', options: ['Entity', 'Attribute', 'Relationship', 'Key'], correctAnswer: 'Relationship', explanation: 'In an ER diagram, a diamond represents a relationship between two or more entities.' },
    { topic: 'ER Diagrams', unit: 1, prompt: 'What is a weak entity?', options: ['An entity with few attributes', 'An entity that cannot exist without another entity', 'An entity with no primary key', 'An entity with optional attributes'], correctAnswer: 'An entity that cannot exist without another entity', explanation: 'A weak entity depends on a strong entity for its existence and cannot be uniquely identified by its own attributes alone.' },
    { topic: 'SQL Joins', unit: 2, prompt: 'Which join returns all rows from both tables, with NULLs for non-matching rows?', options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'], correctAnswer: 'FULL OUTER JOIN', explanation: 'FULL OUTER JOIN returns all rows from both tables, filling NULLs where there is no match.' },
    { topic: 'SQL Joins', unit: 2, prompt: 'What does an INNER JOIN return?', options: ['All rows from both tables', 'Only matching rows from both tables', 'All rows from the left table', 'All rows from the right table'], correctAnswer: 'Only matching rows from both tables', explanation: 'INNER JOIN returns only the rows where the join condition is met in both tables.' },
    { topic: 'Transactions', unit: 3, prompt: 'What does COMMIT do in a transaction?', options: ['Reverses all changes', 'Permanently saves all changes', 'Locks the table', 'Starts a new transaction'], correctAnswer: 'Permanently saves all changes', explanation: 'COMMIT makes all changes in the current transaction permanent and visible to other transactions.' },
    { topic: 'Normalisation', unit: 2, prompt: 'What is a functional dependency?', options: ['A table referencing another table', "A column whose values determine another column's values", 'Two tables sharing a key', 'An attribute with multiple values'], correctAnswer: "A column whose values determine another column's values", explanation: 'A functional dependency A → B means knowing A uniquely determines the value of B.' },
    { topic: 'Indexing', unit: 4, prompt: 'What is a composite index?', options: ['An index on multiple tables', 'An index on two or more columns', 'An index with no duplicates', 'An index sorted in reverse'], correctAnswer: 'An index on two or more columns', explanation: 'A composite index covers multiple columns and can speed up queries that filter or sort on those columns together.' },
    { topic: 'SQL Basics', unit: 1, prompt: 'Which aggregate function returns the number of rows?', options: ['SUM()', 'AVG()', 'COUNT()', 'MAX()'], correctAnswer: 'COUNT()', explanation: 'COUNT() returns the number of rows that match the query condition.' },
  ];

  const cseQDocs = rawCseQuestions.map(q => ({
    subjectId: cseSubject._id,
    unit: q.unit,
    topic: q.topic,
    difficulty: 'medium',
    questionType: 'mcq' as const,
    prompt: q.prompt,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    createdBy: mentor1._id,
  }));

  const mcaQDocs = rawMcaQuestions.map(q => ({
    subjectId: mcaSubject._id,
    unit: q.unit,
    topic: q.topic,
    difficulty: 'medium',
    questionType: 'mcq' as const,
    prompt: q.prompt,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    createdBy: mentor1._id,
  }));

  const createdCseQuestions = await Question.insertMany(cseQDocs);
  const createdMcaQuestions = await Question.insertMany(mcaQDocs);
  console.log(`✓ Questions: ${createdCseQuestions.length + createdMcaQuestions.length} created (20 CSE301, 20 MCA204)`);

  // -------------------------------------------------------------------------
  // 14. Exams
  // -------------------------------------------------------------------------
  const examsData = [
    {
      subjectId: cseSubject._id,
      name: 'CSE301 Mid-Term Exam',
      mode: 'mid_term' as const,
      durationSeconds: 2700,
      published: true,
      questions: createdCseQuestions.slice(0, 10).map((q: any, i: number) => ({ questionId: q._id, position: i + 1 })),
    },
    {
      subjectId: cseSubject._id,
      name: 'CSE301 End-Term Exam',
      mode: 'end_term' as const,
      durationSeconds: 3600,
      published: true,
      questions: createdCseQuestions.map((q: any, i: number) => ({ questionId: q._id, position: i + 1 })),
    },
    {
      subjectId: mcaSubject._id,
      name: 'MCA204 Mid-Term Exam',
      mode: 'mid_term' as const,
      durationSeconds: 2700,
      published: true,
      questions: createdMcaQuestions.slice(0, 10).map((q: any, i: number) => ({ questionId: q._id, position: i + 1 })),
    },
    {
      subjectId: mcaSubject._id,
      name: 'MCA204 End-Term Exam',
      mode: 'end_term' as const,
      durationSeconds: 3600,
      published: true,
      questions: createdMcaQuestions.map((q: any, i: number) => ({ questionId: q._id, position: i + 1 })),
    },
  ];
  const createdExams = await Exam.insertMany(examsData);
  const cseMidTermExam = createdExams[0];
  const mcaMidTermExam = createdExams[2];
  console.log(`✓ Exams: ${createdExams.length} created`);

  // -------------------------------------------------------------------------
  // 15. ExamAttempts + Answers + Results
  // -------------------------------------------------------------------------
  // Students 0-4 attempt CSE301 Mid-Term; students 5-9 attempt MCA204 Mid-Term
  // Target correct:
  // students 0,1,2: 7/10
  // students 3,4: 5/10
  // students 5,6,7: 8/10
  // students 8,9: 6/10
  const correctTargets: Record<number, number> = { 0: 7, 1: 7, 2: 7, 3: 5, 4: 5, 5: 8, 6: 8, 7: 8, 8: 6, 9: 6 };

  for (let idx = 0; idx < 10; idx++) {
    const isCse = idx < 5;
    const student = createdStudents[idx];
    const exam = isCse ? cseMidTermExam : mcaMidTermExam;
    const questions = isCse ? createdCseQuestions.slice(0, 10) : createdMcaQuestions.slice(0, 10);
    const numCorrect = correctTargets[idx];

    const attempt = await ExamAttempt.create({
      examId: exam._id,
      studentId: student._id,
      status: 'submitted',
      startedAt: daysAgo(7),
      submittedAt: daysAgo(7),
      score: numCorrect * 10,
    });

    const answersToInsert: object[] = [];
    const topicStats: Record<string, { correct: number; total: number }> = {};
    const questionExplanations: Record<string, string> = {};
    const weakTopicReasons: string[] = [];

    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      const isCorrect = qi < numCorrect;
      const wrongOption = (q.options || []).find((opt: string) => opt !== q.correctAnswer) || 'Option B';
      const answerText = isCorrect ? q.correctAnswer : wrongOption;

      answersToInsert.push({
        attemptId: attempt._id,
        questionId: q._id,
        answerText,
        isCorrect,
        awardedMarks: isCorrect ? 1 : 0,
        timeSpentSeconds: 90,
        savedAt: daysAgo(7),
      });

      const topic = q.topic;
      if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
      topicStats[topic].total++;
      if (isCorrect) topicStats[topic].correct++;
      questionExplanations[q._id.toString()] = q.explanation || '';
    }

    await Answer.insertMany(answersToInsert);

    for (const [topic, stats] of Object.entries(topicStats)) {
      if (stats.correct / stats.total < 0.6) {
        weakTopicReasons.push(`${topic}: answered ${stats.correct}/${stats.total} correctly. Review recommended.`);
      }
    }

    await Result.create({
      attemptId: attempt._id,
      topicSummary: topicStats,
      questionExplanations,
      weakTopicReasons,
      generatedAt: daysAgo(7),
    });
  }
  console.log('✓ ExamAttempts, Answers, and Results created (10 attempts scored)');

  // -------------------------------------------------------------------------
  // 16. Plans + Prices
  // -------------------------------------------------------------------------
  const plansData = [
    { code: 'free', name: 'Free', description: 'Core support and sample content.', active: true },
    { code: 'plus', name: 'Plus', description: 'All notes and practice sets.', active: true },
    { code: 'pro', name: 'Pro', description: 'Plus with one mock interview each month.', active: true },
  ];
  const createdPlans = await Plan.insertMany(plansData);
  const freePlan = createdPlans[0];
  const plusPlan = createdPlans[1];
  const proPlan = createdPlans[2];

  const pricesData = [
    { planId: freePlan._id, productType: 'plan', amountPaise: 0, interval: 'month', currency: 'INR', active: true },
    { planId: plusPlan._id, productType: 'plan', amountPaise: 14900, interval: 'month', currency: 'INR', active: true },
    { planId: plusPlan._id, productType: 'plan', amountPaise: 119900, interval: 'year', currency: 'INR', active: true },
    { planId: proPlan._id, productType: 'plan', amountPaise: 29900, interval: 'month', currency: 'INR', active: true },
  ];
  const createdPrices = await Price.insertMany(pricesData);
  const plusMonthlyPrice = createdPrices[1];
  console.log(`✓ Plans: ${createdPlans.length}, Prices: ${createdPrices.length} created`);

  // -------------------------------------------------------------------------
  // 17. Purchases + Payments + Entitlements
  // -------------------------------------------------------------------------
  for (let i = 0; i < 5; i++) {
    const studentUser = createdStudentUsers[i];
    const purchase = await Purchase.create({
      userId: studentUser._id,
      priceId: plusMonthlyPrice._id,
      providerOrderId: `order_test_demo_${i + 1}`,
      amountPaise: 14900,
      currency: 'INR',
      status: 'completed',
    });

    await Payment.create({
      purchaseId: purchase._id,
      providerPaymentId: `pay_test_demo_${i + 1}`,
      amountPaise: 14900,
      status: 'paid',
      paidAt: daysAgo(30),
    });

    await Entitlement.create({
      userId: studentUser._id,
      entitlementKey: 'premium_content',
      sourceType: 'purchase',
      sourceId: purchase._id.toString(),
      validFrom: daysAgo(30),
      validUntil: daysFromNow(335),
    });
  }
  console.log('✓ Purchases, Payments, and Entitlements created (5 students)');

  // -------------------------------------------------------------------------
  // 18. Notes (with PDFs generated via pdfkit)
  // -------------------------------------------------------------------------
  const storageRoot = path.resolve(process.cwd(), 'storage', 'notes');
  const uploadsRoot = path.resolve(process.cwd(), 'uploads', 'notes');

  const cseNoteTitles = [
    'HTTP Methods and Status Codes',
    'REST API Design Principles',
    'JavaScript Async Patterns',
    'Web Security Fundamentals',
    'CSS Flexbox and Grid',
    'Browser Storage APIs',
  ];

  const mcaNoteTitles = [
    'Introduction to Relational Databases',
    'SQL Query Fundamentals',
    'Database Normalisation',
    'Transactions and Concurrency',
    'Indexing and Query Optimisation',
    'Entity-Relationship Modelling',
  ];

  const noteEntries = [
    ...cseNoteTitles.map((title, i) => ({
      title,
      subjectId: cseSubject._id,
      courseCode: 'CSE301',
      unit: Math.floor(i / 2) + 1,
      subjectName: 'Web Technologies',
    })),
    ...mcaNoteTitles.map((title, i) => ({
      title,
      subjectId: mcaSubject._id,
      courseCode: 'MCA204',
      unit: Math.floor(i / 2) + 1,
      subjectName: 'Database Management',
    })),
  ];

  const createdNotes = [];
  for (let i = 0; i < noteEntries.length; i++) {
    const item = noteEntries[i];
    const slug = slugify(item.title);
    const objectKey = `${item.courseCode}-unit${item.unit}-${slug}.pdf`;
    const storagePath = path.join(storageRoot, objectKey);
    const uploadsPath = path.join(uploadsRoot, objectKey);

    // Write PDF to both storage locations
    const fileSize = await makePdf(storagePath, item.title, item.subjectName);
    try {
      await fs.mkdir(path.dirname(uploadsPath), { recursive: true });
      await fs.copyFile(storagePath, uploadsPath);
    } catch {
      // ignore copy errors if directory already matches
    }

    const noteDoc = await Note.create({
      uploaderId: mentor1._id,
      subjectId: item.subjectId,
      courseCode: item.courseCode,
      semester: 'Semester 3',
      unit: item.unit,
      title: item.title,
      objectKey,
      fileSize,
      mimeType: 'application/pdf',
      downloadAllowed: i % 2 === 0,
      scanStatus: 'clean',
    });
    createdNotes.push(noteDoc);
  }
  console.log(`✓ Notes: ${createdNotes.length} created with PDF files`);

  // -------------------------------------------------------------------------
  // 19. NoteBookmarks
  // -------------------------------------------------------------------------
  const bookmarkDocs: object[] = [];
  for (let i = 0; i < 10; i++) {
    const count = i % 3 === 0 ? 3 : 2;
    for (let j = 0; j < count; j++) {
      const noteIdx = (i * 3 + j) % createdNotes.length;
      bookmarkDocs.push({
        studentId: createdStudents[i]._id,
        noteId: createdNotes[noteIdx]._id,
      });
    }
  }
  const createdBookmarks = await NoteBookmark.insertMany(bookmarkDocs);
  console.log(`✓ NoteBookmarks: ${createdBookmarks.length} created`);

  // -------------------------------------------------------------------------
  // 20. NoteAccessLogs
  // -------------------------------------------------------------------------
  const accessLogDocs: object[] = [];
  for (let i = 0; i < 15; i++) {
    accessLogDocs.push({
      noteId: createdNotes[i % createdNotes.length]._id,
      userId: createdStudentUsers[i % createdStudentUsers.length]._id,
      action: 'view' as const,
      occurredAt: daysAgo(i + 1),
    });
  }
  for (let i = 0; i < 5; i++) {
    accessLogDocs.push({
      noteId: createdNotes[(i * 2) % createdNotes.length]._id,
      userId: createdStudentUsers[i]._id,
      action: 'download' as const,
      occurredAt: daysAgo(i + 2),
    });
  }
  const createdAccessLogs = await NoteAccessLog.insertMany(accessLogDocs);
  console.log(`✓ NoteAccessLogs: ${createdAccessLogs.length} created (15 views, 5 downloads)`);

  // -------------------------------------------------------------------------
  // 21. Interviews (10 total)
  // -------------------------------------------------------------------------
  const interviewDocs: object[] = [];
  const upcomingOffsets = [2, 4, 6, 10, 14];
  const upcomingKinds: Array<'mock' | 'real'> = ['mock', 'real', 'mock', 'real', 'mock'];
  for (let i = 0; i < 5; i++) {
    const scheduledStart = daysFromNow(upcomingOffsets[i]);
    const scheduledEnd = new Date(scheduledStart.getTime() + 60 * 60 * 1000);
    interviewDocs.push({
      studentId: createdStudents[i]._id,
      interviewerId: i % 2 === 0 ? interviewer1._id : interviewer2._id,
      kind: upcomingKinds[i],
      status: 'scheduled',
      scheduledStart,
      scheduledEnd,
      providerRoomId: 'successhub-' + randomUUID(),
    });
  }

  const completedOffsets = [7, 10, 14, 21, 30];
  const completedKinds: Array<'mock' | 'real'> = ['mock', 'mock', 'real', 'mock', 'real'];
  for (let i = 0; i < 5; i++) {
    const scheduledStart = daysAgo(completedOffsets[i]);
    const scheduledEnd = new Date(scheduledStart.getTime() + 60 * 60 * 1000);
    interviewDocs.push({
      studentId: createdStudents[i + 5]._id,
      interviewerId: i % 2 === 0 ? interviewer1._id : interviewer2._id,
      kind: completedKinds[i],
      status: 'completed',
      scheduledStart,
      scheduledEnd,
      providerRoomId: 'successhub-' + randomUUID(),
    });
  }
  const createdInterviews = await Interview.insertMany(interviewDocs);
  console.log(`✓ Interviews: ${createdInterviews.length} created (5 upcoming, 5 completed)`);

  // -------------------------------------------------------------------------
  // 22. InterviewFeedback (for 5 completed interviews)
  // -------------------------------------------------------------------------
  const completedInterviews = createdInterviews.slice(5);
  const feedbackData = [
    {
      communicationScore: 4,
      communicationComment: 'Communicated ideas clearly but needs to slow down when explaining complex topics.',
      technicalScore: 3,
      technicalComment: 'Good understanding of REST principles. Needs practice with edge cases.',
      problemSolvingScore: 4,
      problemSolvingComment: 'Approached the problem systematically. Could improve on time estimation.',
      confidenceScore: 3,
      confidenceComment: 'Appeared nervous initially but gained confidence during the session.',
      overallComment: 'Strong candidate with clear analytical instincts. Continued practice on live coding and pacing recommended.',
    },
    {
      communicationScore: 5,
      communicationComment: 'Excellent articulation of technical ideas. Maintained eye contact and structured answers well.',
      technicalScore: 4,
      technicalComment: 'Solid understanding of database normalisation. Minor gaps in advanced query optimisation.',
      problemSolvingScore: 5,
      problemSolvingComment: 'Broke down complex scenarios efficiently and checked edge cases proactively.',
      confidenceScore: 5,
      confidenceComment: 'Confident and composed throughout. Handled challenging follow-up questions gracefully.',
      overallComment: 'Outstanding session. Demonstrates mature problem solving and clear communication under pressure.',
    },
    {
      communicationScore: 3,
      communicationComment: 'Communication was adequate but could be more structured. Recommend adopting the STAR methodology.',
      technicalScore: 3,
      technicalComment: 'Basic SQL knowledge is sound. Needs to deepen understanding of transaction isolation levels.',
      problemSolvingScore: 3,
      problemSolvingComment: 'Identified the initial approach but struggled when constraints were added.',
      confidenceScore: 2,
      confidenceComment: 'Noticeable hesitation when asked follow-up questions. Needs confidence-building mock sessions.',
      overallComment: 'Good foundation. Regular mock interviews will help build confidence and fluency.',
    },
    {
      communicationScore: 4,
      communicationComment: 'Clear and concise explanations. Good use of technical vocabulary appropriate for graduate level.',
      technicalScore: 5,
      technicalComment: 'Exceptional knowledge of web security headers, HTTPS handshake, and CSRF mitigation.',
      problemSolvingScore: 4,
      problemSolvingComment: 'Well-structured analysis of trade-offs between symmetric and asymmetric encryption.',
      confidenceScore: 4,
      confidenceComment: 'Comfortable under pressure. Recovered smoothly from an initial uncertain answer.',
      overallComment: 'Very promising technical depth in web security and networking.',
    },
    {
      communicationScore: 2,
      communicationComment: 'Struggled to articulate reasoning clearly. Recommend practising verbal walkthroughs of solutions.',
      technicalScore: 3,
      technicalComment: 'Understands basic concepts but syntax errors occurred in SQL join queries under time pressure.',
      problemSolvingScore: 2,
      problemSolvingComment: 'Rushed to write code before planning the solution structure.',
      confidenceScore: 3,
      confidenceComment: 'Moderate confidence. Became uncertain when the interviewer challenged an assumption.',
      overallComment: 'Needs to focus on structured problem decomposition before jumping straight to implementation.',
    },
  ];

  const feedbackDocs = completedInterviews.map((interview: any, i: number) => ({
    interviewId: interview._id,
    interviewerId: interview.interviewerId,
    ...feedbackData[i],
    createdAt: daysAgo(5 - i),
  }));
  const createdFeedback = await InterviewFeedback.insertMany(feedbackDocs);
  console.log(`✓ InterviewFeedback: ${createdFeedback.length} created`);

  // -------------------------------------------------------------------------
  // 23. Coupons
  // -------------------------------------------------------------------------
  const createdCoupons = await Coupon.insertMany([
    { code: 'PILOT10', discountPercent: 10, active: true },
    { code: 'WELCOME20', discountPercent: 20, active: true },
    { code: 'FACULTY50', discountPercent: 50, active: false },
  ]);
  console.log(`✓ Coupons: ${createdCoupons.length} created`);

  // -------------------------------------------------------------------------
  // 24. AuditLog (20 entries)
  // -------------------------------------------------------------------------
  const auditActions = [
    { action: 'attendance.read', resourceType: 'AttendanceRecord' },
    { action: 'exam.start', resourceType: 'ExamAttempt' },
    { action: 'note.access', resourceType: 'Note' },
    { action: 'consent.write', resourceType: 'Consent' },
    { action: 'interview.schedule', resourceType: 'Interview' },
    { action: 'riskflag.create', resourceType: 'RiskFlag' },
    { action: 'intervention.create', resourceType: 'Intervention' },
    { action: 'assessment.read', resourceType: 'AssessmentScore' },
    { action: 'note.download', resourceType: 'Note' },
    { action: 'exam.submit', resourceType: 'ExamAttempt' },
  ];

  const auditDocs: object[] = [];
  for (let i = 0; i < 20; i++) {
    const tmpl = auditActions[i % auditActions.length];
    auditDocs.push({
      actorUserId: i % 3 === 0 ? mentor1._id : createdStudentUsers[i % createdStudentUsers.length]._id,
      action: tmpl.action,
      resourceType: tmpl.resourceType,
      resourceId: new mongoose.Types.ObjectId().toString(),
      outcome: 'success',
      metadata: { ip: `10.0.0.${(i % 50) + 1}`, userAgent: 'Mozilla/5.0 SuccessHUB/1.0' },
      occurredAt: daysAgo(i),
    });
  }
  const createdAuditLogs = await AuditLog.insertMany(auditDocs);
  console.log(`✓ AuditLogs: ${createdAuditLogs.length} created`);

  // -------------------------------------------------------------------------
  // 25. WebhookEvents (3 Razorpay events)
  // -------------------------------------------------------------------------
  const webhookDocs = [
    {
      provider: 'razorpay',
      eventType: 'payment.captured',
      providerEventId: 'evt_razorpay_demo_001',
      payload: {
        entity: 'event',
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test_demo_1',
              amount: 14900,
              currency: 'INR',
              status: 'captured',
              order_id: 'order_test_demo_1',
            },
          },
        },
      },
      processedAt: daysAgo(30),
      status: 'processed',
    },
    {
      provider: 'razorpay',
      eventType: 'payment.captured',
      providerEventId: 'evt_razorpay_demo_002',
      payload: {
        entity: 'event',
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test_demo_2',
              amount: 14900,
              currency: 'INR',
              status: 'captured',
              order_id: 'order_test_demo_2',
            },
          },
        },
      },
      processedAt: daysAgo(29),
      status: 'processed',
    },
    {
      provider: 'razorpay',
      eventType: 'refund.created',
      providerEventId: 'evt_razorpay_demo_003',
      payload: {
        entity: 'event',
        event: 'refund.created',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_test_demo_1',
              amount: 14900,
              currency: 'INR',
              payment_id: 'pay_test_demo_3',
            },
          },
        },
      },
      processedAt: daysAgo(15),
      status: 'processed',
    },
  ];
  const createdWebhooks = await WebhookEvent.insertMany(webhookDocs);
  console.log(`✓ WebhookEvents: ${createdWebhooks.length} created`);

  // -------------------------------------------------------------------------
  // Done
  // -------------------------------------------------------------------------
  await mongoose.disconnect();
  console.log('\n✅ Seed complete! Demo data ready for all components.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
