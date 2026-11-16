import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Sun,
  User,
  Users,
  Video
} from 'lucide-react';
import './auth.css';

export type UserRole = 'student' | 'mentor' | 'interviewer' | 'counsellor' | 'admin' | 'data-steward';

export interface AuthenticatedUser {
  id?: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  studentId?: string;
  courseCode?: string;
  rollNumber?: string;
}

export const DEMO_PRESETS: Record<UserRole, AuthenticatedUser> = {
  student: {
    id: 'user-std-1',
    name: 'Aanya Sharma',
    initials: 'AS',
    email: 'student1@successhub.local',
    role: 'student',
    studentId: 'std-1',
    courseCode: 'MCA204',
    rollNumber: 'SH001',
  },
  mentor: {
    id: 'user-mnt-1',
    name: 'Dr. Ritu Mehta',
    initials: 'RM',
    email: 'mentor1@successhub.local',
    role: 'mentor',
  },
  interviewer: {
    id: 'user-int-1',
    name: 'Arjun Nair',
    initials: 'AN',
    email: 'interviewer@successhub.local',
    role: 'interviewer',
  },
  counsellor: {
    id: 'user-cns-1',
    name: 'Priya Menon',
    initials: 'PM',
    email: 'counsellor@successhub.local',
    role: 'counsellor',
  },
  admin: {
    id: 'user-adm-1',
    name: 'Kavita Rao',
    initials: 'KR',
    email: 'admin@successhub.local',
    role: 'admin',
  },
  'data-steward': {
    id: 'user-dst-1',
    name: 'Nikhil Verma',
    initials: 'NV',
    email: 'datasteward@successhub.local',
    role: 'data-steward',
  },
};

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  dark: boolean;
  onToggleTheme: () => void;
  onLoginSuccess: (user: AuthenticatedUser) => void;
  onContinueGuest: () => void;
}

export function AuthPage({
  initialMode = 'login',
  dark,
  onToggleTheme,
  onLoginSuccess,
  onContinueGuest,
}: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  return (
    <div className="auth-page">
      <header className="auth-header-bar">
        <button
          className="auth-brand-logo"
          onClick={onContinueGuest}
          title="Return to Workspace"
        >
          <span className="brand-mark">S</span>
          <span>SuccessHUB</span>
        </button>

        <div className="auth-nav-actions">
          <button
            className="icon-button"
            aria-label="Toggle theme"
            onClick={onToggleTheme}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="secondary-button"
            style={{ padding: '6px 12px', fontSize: '11px' }}
            onClick={onContinueGuest}
          >
            Guest Demo Mode
          </button>
        </div>
      </header>

      <div className="auth-split-wrapper">
        {/* Left Hero Pane */}
        <div className="auth-hero-pane">
          <div className="auth-hero-content">
            <span className="auth-hero-tag">
              <GraduationCap size={14} /> University Success Platform
            </span>
            <h1 className="auth-hero-title">
              Empowering Student Success & Academic Support
            </h1>
            <p className="auth-hero-desc">
              SuccessHUB brings attendance intelligence, timed MCQ practice, verified PDF course notes, and one-to-one interview coaching under a transparent university data-governance framework.
            </p>

            <div className="auth-feature-cards">
              <div className="auth-feature-card">
                <span className="auth-feature-icon">
                  <ShieldCheck size={18} />
                </span>
                <div className="auth-feature-info">
                  <strong>Privacy-First Consent Engine</strong>
                  <p>Students retain full granular control over mentor and counsellor record sharing.</p>
                </div>
              </div>

              <div className="auth-feature-card">
                <span className="auth-feature-icon">
                  <BookOpen size={18} />
                </span>
                <div className="auth-feature-info">
                  <strong>Integrated Notes & Practice</strong>
                  <p>Curated course notes for CSE301 and MCA204 with automated topic mastery analysis.</p>
                </div>
              </div>

              <div className="auth-feature-card">
                <span className="auth-feature-icon">
                  <Video size={18} />
                </span>
                <div className="auth-feature-info">
                  <strong>Advisory Mock Interviews</strong>
                  <p>Standardized rubrics for communication, technical, and problem-solving evaluations.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span>© 2026 SuccessHUB · University Pilot Edition</span>
            <span>MongoDB Atlas Secured</span>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="auth-form-pane">
          {mode === 'login' ? (
            <LoginForm
              onSwitchToRegister={() => setMode('register')}
              onSuccess={onLoginSuccess}
              onContinueGuest={onContinueGuest}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setMode('login')}
              onSuccess={onLoginSuccess}
              onContinueGuest={onContinueGuest}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Login Form Component
   ------------------------------------------------------------------------- */
function LoginForm({
  onSwitchToRegister,
  onSuccess,
  onContinueGuest,
}: {
  onSwitchToRegister: () => void;
  onSuccess: (user: AuthenticatedUser) => void;
  onContinueGuest: () => void;
}) {
  const [tab, setTab] = useState<'demo' | 'credentials'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoSignIn = (role: UserRole) => {
    setSelectedDemoRole(role);
    setLoading(true);
    setError('');

    // Instant seamless demo login
    setTimeout(() => {
      setLoading(false);
      onSuccess(DEMO_PRESETS[role]);
    }, 250);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your university email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      const user = data.user;
      onSuccess({
        id: user.id,
        name: user.displayName,
        initials: user.displayName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        courseCode: user.courseCode,
        rollNumber: user.rollNumber,
      });
    } catch (err: any) {
      // Fallback: match known demo user email if backend isn't reached
      const matched = Object.values(DEMO_PRESETS).find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (matched) {
        onSuccess(matched);
      } else {
        // Construct user profile
        const namePart = email.split('@')[0].replace(/[._]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        onSuccess({
          name: formattedName || 'University Member',
          initials: (formattedName.slice(0, 2) || 'UM').toUpperCase(),
          email: email.trim(),
          role: 'student',
          studentId: 'std-custom',
          courseCode: 'CSE301',
          rollNumber: 'SH100',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-card">
      <div className="auth-card-header">
        <h2>Welcome back</h2>
        <p>Sign in to access your SuccessHUB workspace</p>
      </div>

      <div className="auth-tab-switch">
        <button
          className={`auth-tab-btn ${tab === 'demo' ? 'active' : ''}`}
          onClick={() => {
            setTab('demo');
            setError('');
          }}
        >
          One-Click Demo Roles
        </button>
        <button
          className={`auth-tab-btn ${tab === 'credentials' ? 'active' : ''}`}
          onClick={() => {
            setTab('credentials');
            setError('');
          }}
        >
          University Email
        </button>
      </div>

      {error && (
        <div className="auth-alert-error" style={{ marginBottom: '16px' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {tab === 'demo' ? (
        <div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 12px' }}>
            Choose a verified persona to test role-specific dashboards & workflows:
          </p>
          <div className="demo-role-grid">
            {(
              [
                ['student', 'Aanya Sharma', 'Student · MCA204'],
                ['mentor', 'Dr. Ritu Mehta', 'Faculty Mentor'],
                ['interviewer', 'Arjun Nair', 'Mock Interviewer'],
                ['counsellor', 'Priya Menon', 'Student Counsellor'],
                ['admin', 'Kavita Rao', 'Administrator'],
                ['data-steward', 'Nikhil Verma', 'Data Steward'],
              ] as [UserRole, string, string][]
            ).map(([roleKey, name, title]) => (
              <button
                key={roleKey}
                type="button"
                className={`demo-role-card ${selectedDemoRole === roleKey ? 'selected' : ''}`}
                onClick={() => handleDemoSignIn(roleKey)}
                disabled={loading}
              >
                <div className="avatar tiny" style={{ marginRight: 0 }}>
                  {DEMO_PRESETS[roleKey].initials}
                </div>
                <div className="demo-role-text">
                  <strong>{name}</strong>
                  <span>{title}</span>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="auth-submit-btn"
            onClick={() => handleDemoSignIn(selectedDemoRole)}
            disabled={loading}
          >
            {loading ? 'Launching workspace...' : `Sign In as ${DEMO_PRESETS[selectedDemoRole].name}`}
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleCredentialsSubmit}>
          <div className="form-group">
            <label>University Email</label>
            <div className="input-field-wrap">
              <Mail size={16} />
              <input
                type="email"
                required
                placeholder="name@successhub.local or roll@univ.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <span>Password</span>
              <button
                type="button"
                className="forgot-link"
                onClick={() => alert('For demo mode, any password or one-click role sign-in is accepted.')}
              >
                Forgot password?
              </button>
            </label>
            <div className="input-field-wrap">
              <Lock size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-options-row">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In with University ID'}
            <ArrowRight size={15} />
          </button>
        </form>
      )}

      <div className="auth-guest-divider">or explore without login</div>

      <button type="button" className="guest-continue-btn" onClick={onContinueGuest}>
        Open Interactive Workspace
      </button>

      <p className="auth-footer-prompt">
        Don't have an account yet?
        <button type="button" onClick={onSwitchToRegister}>
          Register here
        </button>
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Register Form Component
   ------------------------------------------------------------------------- */
function RegisterForm({
  onSwitchToLogin,
  onSuccess,
  onContinueGuest,
}: {
  onSwitchToLogin: () => void;
  onSuccess: (user: AuthenticatedUser) => void;
  onContinueGuest: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [courseCode, setCourseCode] = useState('CSE301');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedConsent, setAgreedConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill out all mandatory fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreedConsent) {
      setError('You must agree to the academic data governance framework.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: fullName.trim(),
          email: email.trim(),
          role,
          courseCode: role === 'student' ? courseCode : undefined,
          rollNumber: role === 'student' ? (rollNumber.trim() || `SH${Math.floor(100 + Math.random() * 899)}`) : undefined,
          batch: '2026',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      const user = data.user;
      onSuccess({
        id: user.id,
        name: user.displayName,
        initials: user.displayName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        courseCode: user.courseCode,
        rollNumber: user.rollNumber,
      });
    } catch (err: any) {
      // Local fallback in case the backend server is temporarily not responding
      const initials = fullName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      onSuccess({
        name: fullName.trim(),
        initials: initials || 'ST',
        email: email.trim(),
        role,
        studentId: role === 'student' ? `std-${Date.now()}` : undefined,
        courseCode: role === 'student' ? courseCode : undefined,
        rollNumber: role === 'student' ? (rollNumber.trim() || 'SH099') : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-card">
      <div className="auth-card-header">
        <h2>Create an account</h2>
        <p>Join the SuccessHUB academic support ecosystem</p>
      </div>

      {error && (
        <div className="auth-alert-error" style={{ marginBottom: '16px' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleRegisterSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <div className="input-field-wrap">
            <User size={16} />
            <input
              type="text"
              required
              placeholder="e.g. Priyanshu Roy"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>University Email</label>
          <div className="input-field-wrap">
            <Mail size={16} />
            <input
              type="email"
              required
              placeholder="e.g. priyanshu@successhub.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row-two">
          <div className="form-group">
            <label>Role</label>
            <div className="input-field-wrap">
              <Users size={16} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="student">Student</option>
                <option value="mentor">Faculty Mentor</option>
                <option value="interviewer">Interviewer</option>
                <option value="counsellor">Counsellor</option>
                <option value="admin">Administrator</option>
                <option value="data-steward">Data Steward</option>
              </select>
            </div>
          </div>

          {role === 'student' ? (
            <div className="form-group">
              <label>Course Subject</label>
              <div className="input-field-wrap">
                <BookOpen size={16} />
                <select
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                >
                  <option value="CSE301">CSE301 · Web Tech</option>
                  <option value="MCA204">MCA204 · DBMS</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label>Department / Batch</label>
              <div className="input-field-wrap">
                <BookOpen size={16} />
                <input
                  type="text"
                  placeholder="Computer Applications"
                  defaultValue="Academic Wing"
                />
              </div>
            </div>
          )}
        </div>

        {role === 'student' && (
          <div className="form-group">
            <label>Roll Number (Optional)</label>
            <div className="input-field-wrap">
              <GraduationCap size={16} />
              <input
                type="text"
                placeholder="e.g. SH045 (auto-generated if empty)"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="form-row-two">
          <div className="form-group">
            <label>Password</label>
            <div className="input-field-wrap">
              <Lock size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-field-wrap">
              <Lock size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="auth-options-row">
          <label className="remember-label" style={{ alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              required
              checked={agreedConsent}
              onChange={(e) => setAgreedConsent(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <span style={{ fontSize: '11px', lineHeight: 1.4 }}>
              I agree that academic records and mock interview recordings adhere to the university privacy policy and consent guidelines.
            </span>
          </label>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account & Enter'}
          <ArrowRight size={15} />
        </button>
      </form>

      <p className="auth-footer-prompt">
        Already have an account?
        <button type="button" onClick={onSwitchToLogin}>
          Sign in here
        </button>
      </p>
    </div>
  );
}
