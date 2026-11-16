import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  UserPlus,
  Users,
  Video,
  X
} from 'lucide-react';
import './styles.css';
import { NotesLibrary } from './notes/NotesLibrary';
import { PracticeHome } from './practice/PracticeHome';
import { InterviewsWorkspace } from './interviews/InterviewsWorkspace';
import { PricingPage } from './payments/PricingPage';
import { AuthPage, AuthenticatedUser, DEMO_PRESETS, UserRole } from './auth/AuthPages';

type Role = UserRole;
type Page =
  | 'Overview'
  | 'Students'
  | 'Interviews'
  | 'Notes library'
  | 'Practice'
  | 'Question bank'
  | 'Audit log'
  | 'Privacy settings'
  | 'Pricing'
  | 'Purchases';
type Icon = typeof LayoutDashboard;

const people: Record<Role, { name: string; initials: string; role: string }> = {
  student: { name: 'Aanya Sharma', initials: 'AS', role: 'Student' },
  mentor: { name: 'Dr. Ritu Mehta', initials: 'RM', role: 'Mentor' },
  interviewer: { name: 'Arjun Nair', initials: 'AN', role: 'Interviewer' },
  counsellor: { name: 'Priya Menon', initials: 'PM', role: 'Counsellor' },
  admin: { name: 'Kavita Rao', initials: 'KR', role: 'Administrator' },
  'data-steward': { name: 'Nikhil Verma', initials: 'NV', role: 'Data steward' },
};

const navByRole: Record<Role, { label: Page; icon: Icon }[]> = {
  student: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Practice', icon: ClipboardCheck },
    { label: 'Interviews', icon: Video },
    { label: 'Notes library', icon: BookOpen },
    { label: 'Pricing', icon: ShieldCheck },
    { label: 'Privacy settings', icon: ShieldCheck },
  ],
  mentor: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Students', icon: Users },
    { label: 'Interviews', icon: Video },
    { label: 'Notes library', icon: BookOpen },
    { label: 'Question bank', icon: FileText },
    { label: 'Audit log', icon: Activity },
  ],
  interviewer: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Interviews', icon: Video },
  ],
  counsellor: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Students', icon: Users },
    { label: 'Interviews', icon: Video },
  ],
  admin: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Students', icon: Users },
    { label: 'Interviews', icon: Video },
    { label: 'Notes library', icon: BookOpen },
    { label: 'Question bank', icon: FileText },
    { label: 'Audit log', icon: Activity },
  ],
  'data-steward': [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Privacy settings', icon: ShieldCheck },
    { label: 'Audit log', icon: Activity },
  ],
};

const students = [
  { name: 'Aanya Sharma', course: 'MCA204', attendance: '78.4%', score: '72%', checkIn: 'Today, 10:20', status: 'Review needed', reason: '3 unexplained absences in 14 days' },
  { name: 'Kabir Joshi', course: 'CSE301', attendance: '91.7%', score: '84%', checkIn: 'Yesterday', status: 'On track', reason: 'No current support prompt' },
  { name: 'Meera Iyer', course: 'MCA204', attendance: '83.2%', score: '68%', checkIn: 'Mon, 14:10', status: 'Follow-up due', reason: 'Assessment score fell by 12 points' },
  { name: 'Rohan Gupta', course: 'CSE301', attendance: '76.9%', score: '79%', checkIn: 'Fri, 16:30', status: 'On track', reason: 'No current support prompt' },
];

function App() {
  const [role, setRole] = useState<Role>('student');
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [page, setPage] = useState<Page>('Overview');
  const [authView, setAuthView] = useState<'login' | 'register' | null>(null);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // Active display user (custom logged-in user or role default)
  const activePerson = currentUser
    ? {
        name: currentUser.name,
        initials: currentUser.initials,
        role: people[currentUser.role]?.role || currentUser.role,
      }
    : people[role];

  const nav = navByRole[role];

  useEffect(() => {
    document.title = authView
      ? `${authView === 'login' ? 'Sign In' : 'Register'} · SuccessHUB`
      : `${page} · SuccessHUB`;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark, page, authView]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const go = (nextPage: Page) => {
    setPage(nextPage);
    setAuthView(null);
    setSidebarOpen(false);
  };

  const changeRole = (nextRole: Role) => {
    setRole(nextRole);
    if (currentUser) {
      setCurrentUser(DEMO_PRESETS[nextRole]);
    }
    setPage('Overview');
    setProfileOpen(false);
    setSidebarOpen(false);
  };

  const handleLoginSuccess = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    setRole(user.role);
    setAuthView(null);
    setPage('Overview');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setProfileOpen(false);
    setAuthView('login');
  };

  // Render standalone Auth page if active
  if (authView) {
    return (
      <AuthPage
        initialMode={authView}
        dark={dark}
        onToggleTheme={() => setDark(!dark)}
        onLoginSuccess={handleLoginSuccess}
        onContinueGuest={() => setAuthView(null)}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        page={page}
        open={sidebarOpen}
        nav={nav}
        person={activePerson}
        currentUser={currentUser}
        onNavigate={go}
        onOpenAuth={(mode) => setAuthView(mode)}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-main">
        <Topbar
          person={activePerson}
          currentUser={currentUser}
          dark={dark}
          onMenu={() => setSidebarOpen(true)}
          onToggleTheme={() => setDark(!dark)}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          onRoleChange={changeRole}
          onOpenAuth={(mode) => setAuthView(mode)}
          onSignOut={handleSignOut}
          onCommand={() => setCommandOpen(true)}
        />
        <main className="page-content">
          <PageHeader page={page} role={role} onOpenAuth={() => setAuthView('login')} />
          <PageContent role={role} page={page} onNavigate={go} onOpenAuth={(mode) => setAuthView(mode)} />
        </main>
      </div>

      {commandOpen && (
        <CommandPalette
          nav={nav}
          onClose={() => setCommandOpen(false)}
          onNavigate={go}
          onOpenAuth={(mode) => {
            setAuthView(mode);
            setCommandOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Sidebar({
  role,
  page,
  open,
  nav,
  person,
  currentUser,
  onNavigate,
  onOpenAuth,
  onClose,
}: {
  role: Role;
  page: Page;
  open: boolean;
  nav: { label: Page; icon: Icon }[];
  person: { name: string; initials: string; role: string };
  currentUser: AuthenticatedUser | null;
  onNavigate: (page: Page) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onClose: () => void;
}) {
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-mark">S</span>
        <span>SuccessHUB</span>
        <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <p className="sidebar-context">{person.role} workspace</p>

      <nav aria-label="Main navigation">
        {nav.map(({ label, icon: NavIcon }) => (
          <button
            key={label}
            className={`nav-item ${page === label ? 'active' : ''}`}
            onClick={() => onNavigate(label)}
          >
            <NavIcon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {label === 'Audit log' && <span className="nav-count">12</span>}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', display: 'grid', gap: '8px' }}>
        {!currentUser && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '0 8px 10px' }}>
            <button
              className="secondary-button"
              style={{ padding: '7px 8px', fontSize: '11px', justifyContent: 'center' }}
              onClick={() => onOpenAuth('login')}
            >
              <LogIn size={13} />
              Sign in
            </button>
            <button
              className="primary-button"
              style={{ padding: '7px 8px', fontSize: '11px', justifyContent: 'center' }}
              onClick={() => onOpenAuth('register')}
            >
              <UserPlus size={13} />
              Register
            </button>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="avatar small">{person.initials}</div>
          <div className="user-copy">
            <strong>{person.name}</strong>
            <span>{person.role}</span>
          </div>
          <button
            className="icon-button"
            aria-label="Account options"
            onClick={() => onOpenAuth('login')}
            title="Switch user / Sign in"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({
  person,
  currentUser,
  dark,
  onMenu,
  onToggleTheme,
  profileOpen,
  setProfileOpen,
  notificationsOpen,
  setNotificationsOpen,
  onRoleChange,
  onOpenAuth,
  onSignOut,
  onCommand,
}: {
  person: { name: string; initials: string; role: string };
  currentUser: AuthenticatedUser | null;
  dark: boolean;
  onMenu: () => void;
  onToggleTheme: () => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  onRoleChange: (role: Role) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSignOut: () => void;
  onCommand: () => void;
}) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}>
        <Menu size={20} />
      </button>

      <div className="breadcrumbs">
        <span>Workspace</span>
        <span>/</span>
        <strong>{currentUser ? `${currentUser.name} (${person.role})` : 'Demo workspace'}</strong>
      </div>

      <div className="topbar-actions">
        <button className="search-trigger" onClick={onCommand}>
          <Search size={16} />
          <span>Search anything</span>
          <kbd>Ctrl K</kbd>
        </button>

        {currentUser ? (
          <span className="badge success" style={{ fontSize: '10px' }}>
            ● Signed in
          </span>
        ) : (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="text-button"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => onOpenAuth('login')}
            >
              Sign in
            </button>
            <span className="demo-badge">Demo mode</span>
          </div>
        )}

        <div className="popover-wrap">
          <button
            className="icon-button"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell size={18} />
            <span className="notification-dot" />
          </button>
          {notificationsOpen && (
            <div className="popover notification-popover">
              <strong>Notifications</strong>
              <p>
                <b>Mentor check-in</b> is due today for Aanya Sharma.
              </p>
              <p className="muted">Updated 8 minutes ago</p>
            </div>
          )}
        </div>

        <button className="icon-button" aria-label="Toggle theme" onClick={onToggleTheme}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="popover-wrap">
          <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
            <span className="avatar">{person.initials}</span>
            <ChevronDown size={14} />
          </button>
          {profileOpen && (
            <ProfileMenu
              person={person}
              currentUser={currentUser}
              onRoleChange={onRoleChange}
              onOpenAuth={onOpenAuth}
              onSignOut={onSignOut}
            />
          )}
        </div>
      </div>
    </header>
  );
}

function ProfileMenu({
  person,
  currentUser,
  onRoleChange,
  onOpenAuth,
  onSignOut,
}: {
  person: { name: string; initials: string; role: string };
  currentUser: AuthenticatedUser | null;
  onRoleChange: (role: Role) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSignOut: () => void;
}) {
  const roles: Role[] = ['student', 'mentor', 'interviewer', 'counsellor', 'admin', 'data-steward'];

  return (
    <div className="popover profile-popover" style={{ width: '250px' }}>
      <div className="profile-heading">
        <span className="avatar">{person.initials}</span>
        <div>
          <strong>{person.name}</strong>
          <span>{person.role}</span>
        </div>
      </div>

      <div className="menu-divider" />
      <span className="menu-label">Switch Persona</span>
      {roles.map((r) => (
        <button key={r} className="role-option" onClick={() => onRoleChange(r)}>
          {people[r].role}
          <span>{r === 'student' ? 'Personal view' : 'Staff view'}</span>
        </button>
      ))}

      <div className="menu-divider" />
      <button className="menu-action" onClick={() => onOpenAuth('login')}>
        <LogIn size={15} />
        Switch account / Sign in
      </button>
      <button className="menu-action" onClick={() => onOpenAuth('register')}>
        <UserPlus size={15} />
        Register new account
      </button>

      {currentUser && (
        <>
          <div className="menu-divider" />
          <button className="menu-action" style={{ color: 'var(--accent)' }} onClick={onSignOut}>
            <span className="signout-dot" style={{ borderColor: 'var(--accent)' }} />
            Sign out
          </button>
        </>
      )}
    </div>
  );
}

function PageHeader({
  page,
  role,
  onOpenAuth,
}: {
  page: Page;
  role: Role;
  onOpenAuth: () => void;
}) {
  const descriptions: Record<Page, string> = {
    Overview: role === 'student' ? 'Your attendance, practice and upcoming commitments.' : 'The work that needs your attention today.',
    Students: 'Review separate attendance, marks and observation records.',
    Interviews: 'Schedule, join and review one-to-one interviews.',
    'Notes library': 'Course notes available to your enrolled subjects.',
    Practice: 'Timed practice sets with explanations after submission.',
    'Question bank': 'Create and review questions for practice sets.',
    'Audit log': 'A record of sensitive reads, writes and blocked access.',
    'Privacy settings': 'Choose each sharing purpose separately. You can withdraw anytime.',
    Pricing: 'Compare access to practice sets, notes and interview sessions.',
    Purchases: 'Your subscriptions, receipts and access entitlements.',
  };

  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{page === 'Overview' ? 'Today' : page}</p>
        <h1>{page}</h1>
        <p className="page-description">{descriptions[page]}</p>
      </div>

      {page !== 'Overview' && page !== 'Privacy settings' && (
        <button className="primary-button">
          {page === 'Students'
            ? 'Log observation'
            : page === 'Interviews'
            ? 'Schedule interview'
            : page === 'Notes library'
            ? 'Upload notes'
            : page === 'Question bank'
            ? 'Add question'
            : page === 'Audit log'
            ? 'Export log'
            : page === 'Pricing'
            ? 'Compare plans'
            : page === 'Purchases'
            ? 'Download receipt'
            : 'Start practice'}
          <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  );
}

function PageContent({
  role,
  page,
  onNavigate,
  onOpenAuth,
}: {
  role: Role;
  page: Page;
  onNavigate: (page: Page) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}) {
  if (page === 'Overview') return <Dashboard role={role} onNavigate={onNavigate} />;
  if (page === 'Students') return <StudentsPage role={role} />;
  if (page === 'Interviews') return <InterviewsWorkspace role={role} />;
  if (page === 'Notes library') return <NotesLibrary role={role} />;
  if (page === 'Practice') return <PracticeHome />;
  if (page === 'Pricing' || page === 'Purchases') return <PricingPage initialView={page === 'Purchases' ? 'purchases' : 'pricing'} />;
  if (page === 'Question bank') return <QuestionBankPage />;
  if (page === 'Audit log') return <AuditPage />;
  if (page === 'Privacy settings') return <PrivacyPage />;
  return <EmptyState title="Page not found" action="Return to overview" onAction={() => onNavigate('Overview')} />;
}

function Dashboard({ role, onNavigate }: { role: Role; onNavigate: (page: Page) => void }) {
  if (role === 'student') return <StudentDashboard onNavigate={onNavigate} />;
  if (role === 'mentor') return <MentorDashboard onNavigate={onNavigate} />;
  if (role === 'interviewer') return <InterviewerDashboard onNavigate={onNavigate} />;
  if (role === 'counsellor') return <CounsellorDashboard />;
  if (role === 'admin') return <AdminDashboard />;
  return <StewardDashboard />;
}

function StudentDashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="dashboard-stack">
      <div className="notice-inline">
        <div>
          <strong>Attendance this month: 78.4%</strong>
          <span>Down 6.1 points from the previous four weeks because of three unexplained absences.</span>
        </div>
        <button className="secondary-button" onClick={() => onNavigate('Privacy settings')}>
          Message my mentor
        </button>
      </div>

      <div className="metric-grid">
        <Metric
          label="Attendance this month"
          value="78.4%"
          detail="Previous: 84.5%"
          tone="warning"
          chart={<MiniChart values={[84, 86, 83, 81, 78]} />}
        />
        <Metric
          label="Current practice average"
          value="72.8%"
          detail="Across 4 attempts"
          chart={<MiniBars values={[62, 74, 68, 81]} />}
        />
        <Metric
          label="Next commitment"
          value="Thu, 3:30 PM"
          detail="Mock interview · Room 204"
          icon={<CalendarDays size={18} />}
        />
      </div>

      <div className="content-grid student-grid">
        <Panel title="Upcoming" action="View calendar">
          <List
            rows={[
              ['Mid-Term Practice · CSE301', 'Today, 7:00 PM', '45 min'],
              ['Mock interview with Prof. R. Mehta', 'Thu, 3:30 PM', 'Room 204'],
              ['End-Term Practice · MCA204', '18 Oct, 10:00 AM', '60 min'],
            ]}
          />
        </Panel>
        <Panel title="Practice by subject" action="Open practice" onAction={() => onNavigate('Practice')}>
          <ProgressRow label="Web Technologies · CSE301" value={76} detail="3 of 4 sets" />
          <ProgressRow label="Database Management · MCA204" value={61} detail="2 of 4 sets" />
          <ProgressRow label="Operating Systems · CSE302" value={48} detail="1 of 3 sets" />
        </Panel>
      </div>

      <div className="content-grid student-grid">
        <Panel title="Recent scores" action="See all scores">
          <ScoreTable />
        </Panel>
        <Panel title="Bookmarked notes" action="Open library" onAction={() => onNavigate('Notes library')}>
          <List
            rows={[
              ['Normalisation in DBMS', 'Unit 2 · MCA204', 'Viewed yesterday'],
              ['HTTP request lifecycle', 'Unit 3 · CSE301', 'Viewed 4 days ago'],
              ['Indexing strategies', 'Unit 4 · MCA204', 'Viewed 8 days ago'],
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

function MentorDashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="dashboard-stack">
      <div className="metric-grid four">
        <Metric label="Assigned students" value="24" detail="3 check-ins due" />
        <Metric label="Flags waiting for review" value="4" detail="Oldest: 2 days" tone="warning" />
        <Metric label="Follow-ups this week" value="7" detail="2 due today" />
        <Metric label="Average attendance" value="84.6%" detail="Across your students" />
      </div>

      <div className="content-grid mentor-grid">
        <Panel title="Students needing a review" action="Open students">
          <StudentTable compact />
        </Panel>
        <div className="side-stack">
          <Panel title="Follow-ups due">
            <List
              rows={[
                ['Aanya Sharma', 'Today · Attendance check-in', 'Due 10:20'],
                ['Meera Iyer', 'Tomorrow · Assessment review', 'Due 14:00'],
                ['Vikram Shah', 'Fri · Mentor conversation', 'Due 16:30'],
              ]}
            />
          </Panel>
          <button className="quick-action" onClick={() => onNavigate('Students')}>
            <MessageCircle size={18} />
            <span>
              <strong>Log an observation</strong>
              <small>Add a dated note to a student record</small>
            </span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function InterviewerDashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="dashboard-stack">
      <div className="metric-grid three">
        <Metric label="Today’s interviews" value="3" detail="Next at 3:30 PM" icon={<Video size={18} />} />
        <Metric label="Pending feedback" value="2" detail="Oldest: yesterday" tone="warning" />
        <Metric label="This month" value="18" detail="12 mock · 6 real" />
      </div>

      <div className="content-grid interviewer-grid">
        <Panel title="Today’s schedule" action="Open interviews">
          <ScheduleTable />
        </Panel>
        <Panel title="Pending feedback">
          <List
            rows={[
              ['Aanya Sharma', 'Mock interview · 12 Oct', 'Complete form'],
              ['Rohan Gupta', 'Real interview · 11 Oct', 'Complete form'],
            ]}
          />
        </Panel>
      </div>

      <Panel title="Recent candidates">
        <StudentTable compact interviewer />
      </Panel>
      <button className="primary-button inline-action" onClick={() => onNavigate('Interviews')}>
        Schedule interview <ArrowUpRight size={16} />
      </button>
    </div>
  );
}

function CounsellorDashboard() {
  return (
    <div className="dashboard-stack">
      <div className="metric-grid three">
        <Metric label="Open referrals" value="8" detail="2 received this week" />
        <Metric label="Follow-ups due" value="5" detail="Next: today, 15:00" tone="warning" />
        <Metric label="Shared feedback" value="11" detail="With student consent" />
      </div>

      <div className="content-grid counsellor-grid">
        <Panel title="Referral queue" action="View all">
          <StudentTable counsellor />
        </Panel>
        <Panel title="Today’s follow-ups">
          <List
            rows={[
              ['Aanya Sharma', 'Attendance conversation', '15:00'],
              ['Meera Iyer', 'Assessment support', '16:15'],
              ['Kabir Joshi', 'Course planning', '17:00'],
            ]}
          />
        </Panel>
      </div>

      <Panel title="Recent shared interview feedback">
        <div className="feedback-row">
          <span className="avatar small">AS</span>
          <div>
            <strong>Aanya Sharma · Mock interview</strong>
            <p>Shared by the student on 12 Oct. Communication and confidence comments available.</p>
          </div>
          <span className="badge success">Consent active</span>
        </div>
        <div className="feedback-row">
          <span className="avatar small">MI</span>
          <div>
            <strong>Meera Iyer · Mock interview</strong>
            <p>Shared by the student on 10 Oct. Review requested.</p>
          </div>
          <span className="badge success">Consent active</span>
        </div>
      </Panel>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="dashboard-stack">
      <div className="metric-grid four">
        <Metric label="Active students" value="126" detail="Across 4 batches" />
        <Metric label="Practice attempts" value="348" detail="Last 30 days" />
        <Metric label="Notes viewed" value="1,284" detail="Last 30 days" />
        <Metric label="Interviews completed" value="42" detail="Last 30 days" />
      </div>

      <div className="content-grid admin-grid">
        <Panel title="Attendance by course" action="View report">
          <BarChart
            rows={[
              ['MCA204', 84],
              ['CSE301', 88],
              ['CSE302', 79],
              ['BCA205', 91],
            ]}
          />
        </Panel>
        <Panel title="Practice activity">
          <DonutStat
            value="68%"
            label="Students active this month"
            detail="Groups with fewer than 5 students are hidden."
          />
        </Panel>
      </div>

      <Panel title="Administration">
        <div className="admin-actions">
          <button>
            <Users size={17} />
            Manage users <ArrowUpRight size={15} />
          </button>
          <button>
            <ShieldCheck size={17} />
            Review permissions <ArrowUpRight size={15} />
          </button>
          <button>
            <Settings size={17} />
            System settings <ArrowUpRight size={15} />
          </button>
        </div>
      </Panel>
    </div>
  );
}

function StewardDashboard() {
  return (
    <div className="dashboard-stack">
      <div className="metric-grid four">
        <Metric label="Consent coverage" value="82.6%" detail="Across active students" />
        <Metric label="Retention jobs" value="2" detail="Next run: tonight" />
        <Metric label="Audit events today" value="1,842" detail="14 blocked requests" tone="warning" />
        <Metric label="Governance versions" value="6" detail="All drafts pending approval" />
      </div>

      <div className="content-grid steward-grid">
        <Panel title="Governance configuration" action="Open settings">
          <div className="config-list">
            <ConfigRow label="Consent text" version="v1" />
            <ConfigRow label="Retention schedule" version="v1" />
            <ConfigRow label="Anonymisation method" version="v1" />
            <ConfigRow label="Student messages" version="v1" />
          </div>
        </Panel>
        <Panel title="Recent audit summary">
          <List
            rows={[
              ['Blocked note download', 'Student not enrolled', '09:42'],
              ['Feedback viewed', 'Student consent active', '09:38'],
              ['Consent withdrawn', 'Recording purpose', '09:17'],
              ['Retention job completed', '38 recordings removed', '02:00'],
            ]}
          />
        </Panel>
      </div>

      <div className="draft-banner">
        <ShieldCheck size={18} />
        <span>
          <strong>DRAFT - not approved</strong> Governance text cannot be shown to students in production until committee sign-off.
        </span>
      </div>
    </div>
  );
}

function StudentsPage({ role }: { role: Role }) {
  const [selected, setSelected] = useState<string | null>(null);
  if (selected) return <StudentCase name={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div className="input-wrap">
          <Search size={16} />
          <input id="global-search" aria-label="Search students" placeholder="Search students" />
        </div>
        <button className="filter-button">
          <SlidersHorizontal size={16} />
          Filters
        </button>
        <span className="muted">{role === 'counsellor' ? '8 referrals' : '24 assigned students'}</span>
      </div>
      <Panel title="Student records">
        <StudentTable onSelect={setSelected} />
      </Panel>
    </div>
  );
}

function StudentCase({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div className="page-stack">
      <button className="back-link" onClick={onBack}>
        ← Back to students
      </button>
      <div className="case-header">
        <span className="avatar large">{name.split(' ').map((part) => part[0]).join('')}</span>
        <div>
          <h2>{name}</h2>
          <p className="muted">MCA204 · Semester 3 · Last updated today, 10:20</p>
        </div>
        <button className="secondary-button">Message student</button>
      </div>

      <div className="content-grid case-grid">
        <Panel title="Support prompts">
          <div className="flag-item">
            <span className="flag-dot warning" />
            <div>
              <strong>3 or more unexplained absences in 14 days</strong>
              <p>Rule: unexplained_absences_14_days · Created 12 Oct</p>
              <p>
                Review status: <span className="badge warning">Waiting for review</span>
              </p>
            </div>
            <button className="icon-button" aria-label="More flag actions">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </Panel>
        <Panel title="Record timeline">
          <Timeline />
        </Panel>
      </div>

      <Panel title="Separate records">
        <div className="tabs">
          <button className="tab active">Attendance</button>
          <button className="tab">Assessments</button>
          <button className="tab">Mentor observations</button>
        </div>
        <ScoreTable detailed />
      </Panel>
    </div>
  );
}

function QuestionBankPage() {
  return (
    <div className="page-stack">
      <div className="toolbar">
        <div className="input-wrap wide">
          <Search size={16} />
          <input aria-label="Search questions" placeholder="Search by question, topic or unit" />
        </div>
        <select aria-label="Question type">
          <option>All types</option>
          <option>MCQ</option>
          <option>Short answer</option>
          <option>Long answer</option>
        </select>
        <button className="primary-button">
          Add question <ArrowUpRight size={15} />
        </button>
      </div>
      <Panel title="Question bank">
        <div className="questions-table">
          <div className="table-head">
            <span>Question</span>
            <span>Topic</span>
            <span>Type</span>
            <span>Difficulty</span>
            <span />
          </div>
          {[
            ['Which HTTP status represents a successful response?', 'HTTP Basics', 'MCQ', 'Easy'],
            ['Explain database normalisation from 1NF to 3NF.', 'Relational design', 'Long answer', 'Hard'],
            ['What does a primary key provide in a relational table?', 'SQL basics', 'MCQ', 'Easy'],
            ['Compare clustered and non-clustered indexes.', 'Indexing', 'Short answer', 'Hard'],
          ].map(([question, topic, type, difficulty]) => (
            <div className="question-row" key={question}>
              <strong>{question}</strong>
              <span>{topic}</span>
              <span className="badge neutral">{type}</span>
              <span>{difficulty}</span>
              <button className="icon-button" aria-label={`Edit ${question}`}>
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AuditPage() {
  return (
    <div className="page-stack">
      <div className="toolbar">
        <div className="input-wrap wide">
          <Search size={16} />
          <input aria-label="Search audit log" placeholder="Search actor, action or resource" />
        </div>
        <select aria-label="Audit outcome">
          <option>All outcomes</option>
          <option>Allowed</option>
          <option>Blocked</option>
        </select>
        <button className="secondary-button">Export CSV</button>
      </div>
      <Panel title="Audit events">
        <div className="audit-table">
          <div className="table-head">
            <span>Actor</span>
            <span>Action</span>
            <span>Resource</span>
            <span>When</span>
            <span>Outcome</span>
          </div>
          {[
            ['Aanya Sharma', 'consent.withdraw', 'Interview recording', '09:17', 'Allowed'],
            ['Unknown session', 'note.download', 'Normalisation in DBMS', '09:42', 'Blocked'],
            ['Dr. Ritu Mehta', 'attendance.read', 'Aanya Sharma', '09:38', 'Allowed'],
            ['Nikhil Verma', 'retention.run', '38 recordings', '02:00', 'Allowed'],
          ].map(([actor, action, resource, when, outcome]) => (
            <div className="audit-row" key={`${actor}-${when}`}>
              <span>
                <span className="avatar tiny">
                  {actor.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </span>
                {actor}
              </span>
              <span>{action}</span>
              <span>{resource}</span>
              <span className="muted">Today, {when}</span>
              <span className={`badge ${outcome === 'Blocked' ? 'warning' : 'success'}`}>{outcome}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PrivacyPage() {
  const [choices, setChoices] = useState({ attendance: true, recording: false, feedback: false });

  return (
    <div className="page-stack">
      <div className="draft-banner">
        <ShieldCheck size={18} />
        <span>
          <strong>DRAFT - not approved</strong> These consent texts are awaiting university privacy and faculty committee approval.
        </span>
      </div>

      <Panel title="Consent choices">
        <ConsentRow
          title="Share attendance and marks with mentors"
          description="Allows your assigned mentor to view these records for support conversations."
          version="v1 · given 8 Oct 2026"
          value={choices.attendance}
          onChange={() => setChoices({ ...choices, attendance: !choices.attendance })}
        />
        <ConsentRow
          title="Record interviews"
          description="Recording stays off unless you give this separate permission. Recording is deleted after the approved retention period."
          version="v1 · not given"
          value={choices.recording}
          onChange={() => setChoices({ ...choices, recording: !choices.recording })}
        />
        <ConsentRow
          title="Share interview feedback with counsellors"
          description="Your interviewer feedback remains private unless you choose to share it."
          version="v1 · not given"
          value={choices.feedback}
          onChange={() => setChoices({ ...choices, feedback: !choices.feedback })}
        />
      </Panel>
      <p className="muted small-copy">
        You can withdraw any choice at any time. A change affects future access and is recorded in the audit log.
      </p>
    </div>
  );
}

function Panel({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        {action && (
          <button className="text-button" onClick={onAction}>
            {action}
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
  chart,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
  chart?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`metric ${tone ?? ''}`}>
      <div className="metric-top">
        <span>{label}</span>
        {icon ?? <MoreHorizontal size={16} className="muted-icon" />}
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
      {chart}
    </div>
  );
}

function List({ rows }: { rows: string[][] }) {
  return (
    <div className="simple-list">
      {rows.map((row) => (
        <div className="list-row" key={row.join('-')}>
          <div>
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
          </div>
          <small>{row[2]}</small>
        </div>
      ))}
    </div>
  );
}

function ProgressRow({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="progress-row">
      <div>
        <span>{label}</span>
        <small>{detail}</small>
      </div>
      <strong>{value}%</strong>
      <div className="progress-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ScoreTable({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="score-table">
      <div className="table-head">
        <span>Assessment</span>
        <span>Subject</span>
        <span>Score</span>
        <span>{detailed ? 'Date' : 'Trend'}</span>
      </div>
      {[
        ['Mid-Term Practice', 'CSE301', '76%', '12 Oct'],
        ['Topic quiz · Unit 2', 'MCA204', '68%', '8 Oct'],
        ['End-Term Practice', 'CSE301', '74%', '2 Oct'],
      ].map((row) => (
        <div className="table-row" key={row[0]}>
          <strong>{row[0]}</strong>
          <span>{row[1]}</span>
          <span className="score-value">{row[2]}</span>
          <span className="muted">{row[3]}</span>
        </div>
      ))}
    </div>
  );
}

function StudentTable({
  compact = false,
  interviewer = false,
  counsellor = false,
  onSelect,
}: {
  compact?: boolean;
  interviewer?: boolean;
  counsellor?: boolean;
  onSelect?: (name: string) => void;
}) {
  const rows = counsellor ? students.slice(0, 3) : compact ? students.slice(0, 3) : students;
  return (
    <div className="student-table">
      <div className="table-head">
        <span>Student</span>
        <span>Course</span>
        <span>Attendance</span>
        <span>{interviewer ? 'Feedback' : 'Last check-in'}</span>
        <span>Status</span>
      </div>
      {rows.map((student) => (
        <button className="student-row" key={student.name} onClick={() => onSelect?.(student.name)}>
          <span>
            <span className="avatar tiny">{student.name.split(' ').map((part) => part[0]).join('')}</span>
            <strong>{student.name}</strong>
          </span>
          <span>{student.course}</span>
          <span>{student.attendance}</span>
          <span>{interviewer ? '2 summaries' : student.checkIn}</span>
          <span className={`badge ${student.status === 'On track' ? 'success' : 'warning'}`}>
            {student.status}
          </span>
        </button>
      ))}
    </div>
  );
}

function ScheduleTable() {
  return (
    <div className="schedule">
      <div className="schedule-item">
        <span className="time">09:30</span>
        <div>
          <strong>Rohan Gupta</strong>
          <span>Mock · CSE301 · Room 204</span>
        </div>
        <span className="badge success">Completed</span>
      </div>
      <div className="schedule-item current">
        <span className="time">15:30</span>
        <div>
          <strong>Aanya Sharma</strong>
          <span>Mock · MCA204 · Room 204</span>
        </div>
        <span className="badge neutral">Upcoming</span>
      </div>
      <div className="schedule-item">
        <span className="time">17:00</span>
        <div>
          <strong>Meera Iyer</strong>
          <span>Real · MCA204 · Room 108</span>
        </div>
        <span className="badge neutral">Upcoming</span>
      </div>
    </div>
  );
}

function MiniChart({ values }: { values: number[] }) {
  return (
    <div className="mini-chart" aria-label="Attendance trend">
      {values.map((value, index) => (
        <span key={index} style={{ height: `${value - 60}%` }} />
      ))}
    </div>
  );
}

function MiniBars({ values }: { values: number[] }) {
  return (
    <div className="mini-bars">
      {values.map((value, index) => (
        <span key={index} style={{ height: `${value}%` }} />
      ))}
    </div>
  );
}

function BarChart({ rows }: { rows: [string, number][] }) {
  return (
    <div className="bar-chart">
      {rows.map(([label, value]) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <div>
            <i style={{ width: `${value}%` }} />
          </div>
          <strong>{value}%</strong>
        </div>
      ))}
    </div>
  );
}

function DonutStat({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <div className="donut-stat">
      <div className="donut">
        <strong>{value}</strong>
      </div>
      <div>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function Timeline() {
  return (
    <div className="timeline">
      <div>
        <span className="timeline-dot" />
        <strong>Attendance record updated</strong>
        <small>Today, 10:20 · 78.4% this month</small>
      </div>
      <div>
        <span className="timeline-dot" />
        <strong>Mentor observation added</strong>
        <small>10 Oct · “Asked for extra API examples.”</small>
      </div>
      <div>
        <span className="timeline-dot" />
        <strong>Assessment score recorded</strong>
        <small>8 Oct · CSE301 Mid-Term Practice · 76%</small>
      </div>
    </div>
  );
}

function ConsentRow({
  title,
  description,
  version,
  value,
  onChange,
}: {
  title: string;
  description: string;
  version: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="consent-row">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
        <small>{version}</small>
      </div>
      <button className={`toggle ${value ? 'on' : ''}`} aria-pressed={value} onClick={onChange}>
        <span />
      </button>
    </div>
  );
}

function ConfigRow({ label, version }: { label: string; version: string }) {
  return (
    <div className="config-row">
      <span>{label}</span>
      <span>{version}</span>
      <span className="badge warning">Pending approval</span>
    </div>
  );
}

function EmptyState({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return (
    <div className="empty-state">
      <FileText size={28} />
      <h2>{title}</h2>
      <p>There is nothing to display here yet.</p>
      <button className="primary-button" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}

function CommandPalette({
  nav,
  onClose,
  onNavigate,
  onOpenAuth,
}: {
  nav: { label: Page; icon: Icon }[];
  onClose: () => void;
  onNavigate: (page: Page) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="command-palette" onMouseDown={(event) => event.stopPropagation()}>
        <div className="input-wrap wide">
          <Search size={17} />
          <input autoFocus placeholder="Search pages, actions and records" />
        </div>

        <p className="menu-label">Authentication</p>
        <button
          className="command-row"
          onClick={() => {
            onOpenAuth('login');
            onClose();
          }}
        >
          <LogIn size={17} />
          Sign in to your account
          <kbd>↵</kbd>
        </button>
        <button
          className="command-row"
          onClick={() => {
            onOpenAuth('register');
            onClose();
          }}
        >
          <UserPlus size={17} />
          Create new account (Student / Staff)
          <kbd>↵</kbd>
        </button>

        <p className="menu-label">Workspace Navigation</p>
        {nav.map(({ label, icon: NavIcon }) => (
          <button
            key={label}
            className="command-row"
            onClick={() => {
              onNavigate(label);
              onClose();
            }}
          >
            <NavIcon size={17} />
            {label}
            <kbd>↵</kbd>
          </button>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
