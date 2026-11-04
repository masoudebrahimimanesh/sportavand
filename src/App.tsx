/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  FileInput,
  GitBranch,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Layers,
  FileText,
  Copy,
  Database,
  ExternalLink,
  BookOpen,
  Package,
  Sparkles,
  Server,
  Activity,
  Award,
  Cpu,
  Sliders,
  Search,
  Download,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  User,
  Users,
  Eye,
  EyeOff,
  QrCode,
  Key,
  Share2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  SPORTAVAND_BRAND,
  IDENTIFIER_MAPPING_TABLE,
} from './config/brand';
import { Footer } from './components/Footer';
import {
  CURRENT_REALITY,
  ADR_LIST,
  ALL_INTAKE_FIELDS,
  FORM_PRESETS,
  INITIAL_PERSONS,
  INITIAL_MEMBERSHIPS,
  PersonRecord,
  MembershipRecord,
} from './data/sportavandData';
import {
  ServerTelemetryResponse,
  INITIAL_TELEMETRY_STATE,
} from './data/projectMetrics';

export interface AppProps {
  initialMode?: 'auto' | 'intake' | 'team' | 'admin' | string;
  presetId?: string;
  teamId?: string;
}

export function isValidIranianNationalCode(code: string): boolean {
  const clean = code.trim();
  if (!/^\d{10}$/.test(clean)) return false;
  if (/^(\d)\1{9}$/.test(clean)) return false;
  const check = parseInt(clean[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * (10 - i);
  }
  const remainder = sum % 11;
  return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
}

export default function App({ initialMode = 'auto', presetId = '17', teamId = 'default' }: AppProps = {}) {
  // Environment Detection: Is running inside WordPress runtime or AI Studio developer preview?
  const isWpRuntime = typeof window !== 'undefined' && (
    Boolean((window as any).sportavandSettings) ||
    Boolean((window as any).sportnovaSettings) ||
    Boolean(document.getElementById('spv-root')) ||
    Boolean(document.querySelector('.spv-mount-target')) ||
    Boolean(document.getElementById('sportnova-root')) ||
    Boolean(document.querySelector('.sportnova-mount-target'))
  );

  // Determine if mounted in intake/registration mode (e.g. from [sportavand_form] or /register URL)
  const isDefaultIntake = initialMode === 'intake' || initialMode === 'register' ||
    (typeof window !== 'undefined' && window.location.pathname.includes('register'));

  const [viewMode, setViewMode] = useState<'public_intake' | 'admin_cartable'>(
    isDefaultIntake ? 'public_intake' : 'admin_cartable'
  );

  const [publicSubTab, setPublicSubTab] = useState<'register' | 'track'>('register');
  const [trackSearchCode, setTrackSearchCode] = useState<string>('');
  const [registeredSuccessMember, setRegisteredSuccessMember] = useState<{
    person: PersonRecord;
    membership: MembershipRecord;
    trackingCode: string;
  } | null>(null);

  // Environment Mode: in WordPress default to 'wordpress', in AI Studio default to 'aistudio'
  const [envMode, setEnvMode] = useState<'wordpress' | 'aistudio'>(isWpRuntime ? 'wordpress' : 'aistudio');

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'team' | 'player' | 'intake' | 'plugin' | 'brain' | 'database' | 'brand'>(
    isWpRuntime ? 'team' : 'plugin'
  );
  const [copiedPluginShortcode, setCopiedPluginShortcode] = useState<string>('');
  const [showPlayerRegisterSimulator, setShowPlayerRegisterSimulator] = useState<boolean>(false);
  const [copiedShareMessage, setCopiedShareMessage] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Core Data State
  const [persons, setPersons] = useState<PersonRecord[]>(INITIAL_PERSONS);
  const [memberships, setMemberships] = useState<MembershipRecord[]>(INITIAL_MEMBERSHIPS);
  const [isPublicRoster, setIsPublicRoster] = useState<boolean>(true);

  // Sample Avatars for public registration
  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  ];
  const [selectedAvatar, setSelectedAvatar] = useState<string>(sampleAvatars[0]);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);

  // Active Player in Player Dashboard
  const [activePersonId, setActivePersonId] = useState<string>('P-101');
  const [playerEditNotice, setPlayerEditNotice] = useState<string>('');

  // Team Dashboard State
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedDossierMember, setSelectedDossierMember] = useState<{ person: PersonRecord; membership: MembershipRecord } | null>(null);

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [addStep, setAddStep] = useState<'check_national_code' | 'select_role' | 'full_form'>('check_national_code');
  const [checkNationalCodeInput, setCheckNationalCodeInput] = useState<string>('');
  const [existingPersonFound, setExistingPersonFound] = useState<PersonRecord | null>(null);
  const [newMemberForm, setNewMemberForm] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    birthDate: '',
    gender: 'پسران / آقایان',
    role: 'بازیکن',
    jerseyNumber: '10',
    position: 'پست ۲ (شوتینگ گارد)',
    teamCategory: 'نوجوانان (زیر ۱۶ سال)',
    phone: '',
    parentPhone: '',
    emergencyPhone: '',
    address: 'اهواز',
    insuranceNumber: 'MED-1405-99881',
    insuranceExpiry: '1405/12/29',
  });

  // Form Studio State
  const [selectedPresetId, setSelectedPresetId] = useState<string>(`form-${presetId === '10' || presetId === '21' ? presetId : '17'}`);
  const [activeFieldIds, setActiveFieldIds] = useState<string[]>(FORM_PRESETS[0].activeFieldIds);

  // Brain & Handoff State
  const [copiedHandoff, setCopiedHandoff] = useState<boolean>(false);
  const [brainSubTab, setBrainSubTab] = useState<'handoff' | 'migration' | 'github' | 'adrs' | 'reality'>('handoff');

  // Real-Time Server Disk & Tokenizer Telemetry State (Polled every 1 second from GET /api/status)
  const [serverTelemetry, setServerTelemetry] = useState<ServerTelemetryResponse>(INITIAL_TELEMETRY_STATE);
  const [disabledDocPaths, setDisabledDocPaths] = useState<string[]>([]);
  const [liveDraftMarkdown, setLiveDraftMarkdown] = useState<string>('');
  const [isScanningMetrics, setIsScanningMetrics] = useState<boolean>(false);

  // Compute combined user typing text across all inputs + markdown draft pad in real time
  const combinedTypingText = useMemo(() => {
    const formValues = [
      liveDraftMarkdown,
      checkNationalCodeInput,
      trackSearchCode,
      rosterSearch,
      newMemberForm.firstName,
      newMemberForm.lastName,
      newMemberForm.fatherName,
      newMemberForm.phone,
      newMemberForm.parentPhone,
    ].filter(Boolean).join(' ');
    return formValues;
  }, [
    liveDraftMarkdown,
    checkNationalCodeInput,
    trackSearchCode,
    rosterSearch,
    newMemberForm.firstName,
    newMemberForm.lastName,
    newMemberForm.fatherName,
    newMemberForm.phone,
    newMemberForm.parentPhone,
  ]);

  const liveDraftBytes = useMemo(() => {
    if (!combinedTypingText) return 0;
    return new TextEncoder().encode(combinedTypingText).length;
  }, [combinedTypingText]);

  const liveDraftChars = combinedTypingText.length;
  const liveDraftTokens = Math.ceil(liveDraftBytes / 3.4);

  // Instant client+server reactive telemetry calculation
  const telemetry = useMemo(() => {
    const disabledSet = new Set(disabledDocPaths);
    const docsFiles = serverTelemetry.categories.docs.files.map((f) => ({
      ...f,
      enabled: !disabledSet.has(f.path),
    }));
    const enabledDocs = docsFiles.filter((f) => f.enabled);
    const docsActiveBytes = enabledDocs.reduce((sum, f) => sum + f.sizeBytes, 0);
    const docsActiveTokens = enabledDocs.reduce((sum, f) => sum + f.tokens, 0);

    const dataIndexTokens = serverTelemetry.categories.dataIndex.tokens;
    const sourceCodeTokens = serverTelemetry.categories.sourceCode.tokens;
    const sessionBaseBytes = serverTelemetry.categories.liveSession.sessionTrafficBytes;
    const sessionBaseTokens = Math.ceil(sessionBaseBytes / 3.4);

    const totalLiveSessionBytes = sessionBaseBytes + liveDraftBytes;
    const totalLiveSessionTokens = sessionBaseTokens + liveDraftTokens;

    const maxTokens = 1000000;
    const totalActiveTokens =
      docsActiveTokens + dataIndexTokens + sourceCodeTokens + totalLiveSessionTokens;
    const freeTokens = Math.max(0, maxTokens - totalActiveTokens);
    const percentUsed = Number(((totalActiveTokens / maxTokens) * 100).toFixed(2));
    const freePercent = Number((100 - percentUsed).toFixed(2));

    let statusLevel: 'optimal' | 'warning' | 'critical' = 'optimal';
    let statusLabel = 'سبز بهینه (ظرفیت کاملاً پایدار و آماده توسعه)';
    if (percentUsed >= 75) {
      statusLevel = 'critical';
      statusLabel = 'قرمز بحرانی (نزدیک به سقف Handoff — نیازمند انتقال نشست)';
    } else if (percentUsed >= 50) {
      statusLevel = 'warning';
      statusLabel = 'کهربایی هشدار (عبور از نیمه ظرفیت کانتکست)';
    }

    return {
      ...serverTelemetry,
      capacity: {
        ...serverTelemetry.capacity,
        maxTokens,
        totalActiveTokens,
        freeTokens,
        percentUsed,
        freePercent,
        draftTokens: liveDraftTokens,
        draftBytes: liveDraftBytes,
        draftChars: liveDraftChars,
        statusLevel,
        statusLabel,
      },
      categories: {
        ...serverTelemetry.categories,
        docs: {
          ...serverTelemetry.categories.docs,
          activeCount: enabledDocs.length,
          totalCount: docsFiles.length,
          activeBytes: docsActiveBytes,
          activeKB: Number((docsActiveBytes / 1024).toFixed(1)),
          tokens: docsActiveTokens,
          files: docsFiles,
        },
        liveSession: {
          ...serverTelemetry.categories.liveSession,
          draftBytes: liveDraftBytes,
          draftChars: liveDraftChars,
          draftTokens: liveDraftTokens,
          totalBytes: totalLiveSessionBytes,
          totalKB: Number((totalLiveSessionBytes / 1024).toFixed(1)),
          tokens: totalLiveSessionTokens,
        },
      },
    };
  }, [serverTelemetry, disabledDocPaths, liveDraftBytes, liveDraftChars, liveDraftTokens]);

  // Poll GET /api/status every 1 second for real-time disk & memory telemetry
  const fetchLiveStatus = async () => {
    try {
      const params = new URLSearchParams({
        disabledDocs: disabledDocPaths.join(','),
        draftBytes: String(liveDraftBytes),
        draftChars: String(liveDraftChars),
      });
      const res = await fetch(`/api/status?${params.toString()}`);
      if (res.ok) {
        const data: ServerTelemetryResponse = await res.json();
        setServerTelemetry(data);
      }
    } catch {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setServerTelemetry((prev) => ({
        ...prev,
        serverTime: `${hh}:${mm}:${ss}`,
      }));
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const timer = setInterval(() => {
      fetchLiveStatus();
    }, 1000);
    return () => clearInterval(timer);
  }, [disabledDocPaths, liveDraftBytes, liveDraftChars]);

  const handleToggleDocumentActive = (docPath: string) => {
    setDisabledDocPaths((prev) =>
      prev.includes(docPath) ? prev.filter((p) => p !== docPath) : [...prev, docPath]
    );
  };

  const handleRescanLiveMetrics = async () => {
    setIsScanningMetrics(true);
    await fetchLiveStatus();
    setTimeout(() => {
      setIsScanningMetrics(false);
    }, 350);
  };

  // GitHub Interactive Integration State
  const [githubToken, setGithubToken] = useState<string>('');
  const [githubLoading, setGithubLoading] = useState<boolean>(false);
  const [githubUser, setGithubUser] = useState<{ login: string; avatar_url: string; name: string; html_url?: string } | null>({
    login: 'masoudebrahimimanesh',
    name: 'Massoud Ebrahimimanesh',
    avatar_url: 'https://github.com/masoudebrahimimanesh.png',
    html_url: 'https://github.com/masoudebrahimimanesh',
  });
  const [githubError, setGithubError] = useState<string>('');

  const handleTestGitHubConnection = async () => {
    const trimmed = githubToken.trim();
    if (!trimmed) {
      setGithubError('لطفاً توکن دسترسی شخصی (PAT) گیت‌هاب را در کادر زیر وارد کنید.');
      return;
    }
    setGithubLoading(true);
    setGithubError('');
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${trimmed}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (!userRes.ok) {
        throw new Error(`احراز هویت در گیت‌هاب ناموفق بود (کد ${userRes.status}). توکن واردشده نامعتبر یا منقضی است.`);
      }
      const userData = await userRes.json();
      setGithubUser(userData);
    } catch (err: any) {
      setGithubError(err.message || 'خطا در برقراری ارتباط با سرورهای گیت‌هاب.');
    } finally {
      setGithubLoading(false);
    }
  };

  // Helpers
  const activePerson = persons.find((p) => p.id === activePersonId) || persons[0];
  const activePersonMemberships = memberships.filter((m) => m.personId === activePerson.id);
  const primaryMembership = activePersonMemberships[0] || memberships[0];

  // Dynamic current section/module for Footer (never hardcoded to Basketball on general core views)
  const currentFooterSection = useMemo(() => {
    if (viewMode === 'public_intake') {
      return {
        fa: 'ماژول اسپورتاوند بسکتبال — درگاه ثبت‌نام و کارت دیجیتال',
        en: 'Sportavand Basketball — Athlete Registration & Digital ID',
      };
    }
    switch (activeTab) {
      case 'team':
        return {
          fa: 'ماژول اسپورتاوند بسکتبال — مدیریت تیم و روستر',
          en: 'Sportavand Basketball — Team & Roster Management',
        };
      case 'player':
        return {
          fa: 'ماژول اسپورتاوند بسکتبال — پرونده و کارت دیجیتال ورزشکار',
          en: 'Sportavand Basketball — Athlete Dossier & Digital ID',
        };
      case 'intake':
        return {
          fa: 'هسته اسپورتاوند — استودیو فرم‌ساز و شورت‌کدها',
          en: 'Sportavand Core — Intake Form Studio & Shortcodes',
        };
      case 'database':
        return {
          fa: 'هسته اسپورتاوند — پایگاه‌داده ۹ جدول رابطه‌ای',
          en: 'Sportavand Core — 9-Table Relational Database Engine',
        };
      case 'brand':
        return {
          fa: 'هویت برند اسپورتاوند و جدول نگاشت مهاجرت',
          en: 'Sportavand Brand Identity & Migration Mapping',
        };
      case 'brain':
        return {
          fa: 'هسته اسپورتاوند — پایش زنده ظرفیت و مرکز معماری',
          en: 'Sportavand Core — Live Telemetry & Architecture Center',
        };
      case 'plugin':
      default:
        return {
          fa: 'هسته پلتفرم اسپورتاوند — بسته نصبی وردپرس',
          en: 'Sportavand Core Platform — WordPress Plugin Package',
        };
    }
  }, [viewMode, activeTab, teamId]);

  // Handler: Update editable player profile fields
  const handleUpdatePlayerEditableFields = (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerEditNotice('تغییرات با موفقیت در اسپورتاوند ذخیره شد. فیلدهای هویتی قفل‌شده دست‌نخورده باقی ماندند.');
    setTimeout(() => setPlayerEditNotice(''), 4000);
  };

  // Handler: Check National Code in Modal
  const handleCheckNationalCode = () => {
    const trimmed = checkNationalCodeInput.trim();
    if (trimmed.length < 10) {
      showToast('لطفاً کد ملی ۱۰ رقمی معتبر وارد کنید.');
      return;
    }
    const found = persons.find((p) => p.nationalCode === trimmed);
    if (found) {
      setExistingPersonFound(found);
      setAddStep('select_role');
    } else {
      setExistingPersonFound(null);
      setNewMemberForm({
        ...newMemberForm,
        firstName: '',
        lastName: '',
        fatherName: '',
        phone: '',
      });
      setAddStep('full_form');
    }
  };

  // Handler: Add new membership (supporting multi-role without duplicate person)
  const handleConfirmAddMember = () => {
    if (existingPersonFound) {
      const newM: MembershipRecord = {
        id: `M-${Date.now()}`,
        personId: existingPersonFound.id,
        clubName: 'باشگاه فرهنگی ورزشی اروند خوزستان',
        teamCategory: newMemberForm.teamCategory,
        role: newMemberForm.role,
        jerseyNumber: newMemberForm.role === 'بازیکن' ? newMemberForm.jerseyNumber : '—',
        position: newMemberForm.role === 'بازیکن' ? newMemberForm.position : `کادر فنی (${newMemberForm.role})`,
        height: '185',
        weight: '80',
        dominantHand: 'راست‌دست',
        phone: existingPersonFound.username,
        parentPhone: '—',
        emergencyPhone: '—',
        address: 'اهواز',
        insuranceNumber: newMemberForm.insuranceNumber,
        insuranceExpiry: newMemberForm.insuranceExpiry,
        insuranceValid: true,
        status: 'تأیید مدارک',
        joinedSeason: 'فصل ۱۴۰۵-۱۴۰۶',
        isPublishedPublic: true,
      };
      setMemberships([newM, ...memberships]);
      showToast(`سمت جدید (${newMemberForm.role}) برای «${existingPersonFound.firstName} ${existingPersonFound.lastName}» با موفقیت در اسپورتاوند ثبت شد.`);
    } else {
      const newPId = `P-${Date.now()}`;
      const newP: PersonRecord = {
        id: newPId,
        nationalCode: checkNationalCodeInput,
        firstName: newMemberForm.firstName || 'کاربر',
        lastName: newMemberForm.lastName || 'جدید',
        fatherName: newMemberForm.fatherName || 'نامشخص',
        birthDate: newMemberForm.birthDate || '1386/01/01',
        gender: newMemberForm.gender,
        bloodGroup: 'A+',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isIdentityVerified: true,
        canEditPhoto: false,
        username: checkNationalCodeInput,
        passwordHash: 'pass123',
      };
      const newM: MembershipRecord = {
        id: `M-${Date.now()}`,
        personId: newPId,
        clubName: 'باشگاه فرهنگی ورزشی اروند خوزستان',
        teamCategory: newMemberForm.teamCategory,
        role: newMemberForm.role,
        jerseyNumber: newMemberForm.role === 'بازیکن' ? newMemberForm.jerseyNumber : '—',
        position: newMemberForm.role === 'بازیکن' ? newMemberForm.position : `کادر فنی (${newMemberForm.role})`,
        height: '182',
        weight: '75',
        dominantHand: 'راست‌دست',
        phone: newMemberForm.phone || '09160000000',
        parentPhone: newMemberForm.parentPhone,
        emergencyPhone: newMemberForm.emergencyPhone,
        address: newMemberForm.address,
        insuranceNumber: newMemberForm.insuranceNumber,
        insuranceExpiry: newMemberForm.insuranceExpiry,
        insuranceValid: true,
        status: 'در انتظار بررسی',
        joinedSeason: 'فصل ۱۴۰۵-۱۴۰۶',
        isPublishedPublic: true,
      };
      setPersons([newP, ...persons]);
      setMemberships([newM, ...memberships]);
      showToast(`عضو جدید «${newP.firstName} ${newP.lastName}» با کد ملی ${newP.nationalCode} در اسپورتاوند ثبت شد.`);
    }

    setShowAddMemberModal(false);
    setAddStep('check_national_code');
    setCheckNationalCodeInput('');
    setExistingPersonFound(null);
  };

  const handlePublicRegistrationSubmit = () => {
    const code = checkNationalCodeInput.trim();
    if (!code || code.length !== 10) {
      showToast('لطفاً کد ملی ۱۰ رقمی بازیکن را به صورت صحیح و کامل وارد فرمایید.');
      return;
    }
    if (!newMemberForm.firstName.trim() || !newMemberForm.lastName.trim()) {
      showToast('لطفاً نام و نام خانوادگی بازیکن را وارد نمایید.');
      return;
    }
    if (!agreedToTerms) {
      showToast('لطفاً تأییدیه منشور انضباطی باشگاه و فدراسیون را علامت بزنید.');
      return;
    }

    let p = persons.find((item) => item.nationalCode === code);
    const pId = p ? p.id : `P-${Date.now()}`;

    if (!p) {
      p = {
        id: pId,
        nationalCode: code,
        firstName: newMemberForm.firstName.trim(),
        lastName: newMemberForm.lastName.trim(),
        fatherName: newMemberForm.fatherName.trim() || 'محمد',
        birthDate: newMemberForm.birthDate.trim() || '1387/04/10',
        gender: newMemberForm.gender,
        bloodGroup: 'O+',
        photo: selectedAvatar,
        isIdentityVerified: true,
        canEditPhoto: false,
        username: code,
        passwordHash: 'sportavand_pass',
      };
      setPersons((prev) => [p!, ...prev]);
    }

    const mId = `M-${Date.now()}`;
    const tracking = `SPV-${new Date().getFullYear()}-REG-${Math.floor(10000 + Math.random() * 90000)}`;

    const m: MembershipRecord = {
      id: mId,
      personId: p.id,
      clubName: 'باشگاه فرهنگی ورزشی اروند خوزستان',
      teamCategory: newMemberForm.teamCategory || 'نوجوانان (زیر ۱۶ سال)',
      role: 'بازیکن',
      jerseyNumber: newMemberForm.jerseyNumber || '7',
      position: newMemberForm.position || 'پست ۲ (شوتینگ گارد)',
      height: '184',
      weight: '76',
      dominantHand: 'راست‌دست',
      phone: newMemberForm.phone || '09160000000',
      parentPhone: newMemberForm.parentPhone || '09161112233',
      emergencyPhone: newMemberForm.emergencyPhone || '09161112233',
      address: newMemberForm.address || 'اهواز',
      insuranceNumber: newMemberForm.insuranceNumber || 'MED-1405-99881',
      insuranceExpiry: newMemberForm.insuranceExpiry || '1405/12/29',
      insuranceValid: true,
      status: 'در انتظار بررسی',
      joinedSeason: 'فصل ۱۴۰۵-۱۴۰۶',
      isPublishedPublic: true,
    };

    setMemberships((prev) => [m, ...prev]);
    setRegisteredSuccessMember({
      person: p,
      membership: m,
      trackingCode: tracking,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Non-blocking status notification toast */}
      {statusMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 border border-amber-500/50 text-amber-300 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  اسپورتاوند | Sportavand
                </h1>
                <span className="text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  {SPORTAVAND_BRAND.sloganFa}
                </span>
                <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  نسخه {SPORTAVAND_BRAND.versionFa}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                سامانه جامع مدیریت ورزش · ماژول اول: {SPORTAVAND_BRAND.firstModule.nameFa} ({SPORTAVAND_BRAND.firstModule.nameEn})
              </p>
            </div>
          </div>

          {/* Primary View Switcher, Direct Plugin Download & Live Real-Time Chat Capacity Badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* 1. LIVE HEADER CAPACITY BADGE (Updated every 1 second from GET /api/status) */}
            {!isWpRuntime && (
              <button
                onClick={() => {
                  setViewMode('admin_cartable');
                  setEnvMode('aistudio');
                  setActiveTab('brain');
                  setBrainSubTab('handoff');
                }}
                className={`px-3.5 py-2 rounded-xl border font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                  telemetry.capacity.percentUsed < 50
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
                    : telemetry.capacity.percentUsed <= 75
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300 shadow-amber-500/10'
                    : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/50 text-rose-300 shadow-rose-500/15 animate-pulse'
                }`}
                title="کلیک کنید تا به تب «حافظه و ظرفیت زنده» هدایت شوید (بروزرسانی زنده هر ۱ ثانیه از سرور)"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      telemetry.capacity.percentUsed < 50
                        ? 'bg-emerald-400'
                        : telemetry.capacity.percentUsed <= 75
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      telemetry.capacity.percentUsed < 50
                        ? 'bg-emerald-500'
                        : telemetry.capacity.percentUsed <= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  ></span>
                </span>
                <span>ظرفیت زنده چت: {telemetry.capacity.percentUsed.toFixed(2)}%</span>
                {telemetry.capacity.draftTokens > 0 && (
                  <span className="text-[10px] font-mono bg-slate-950/70 px-1.5 py-0.5 rounded text-amber-300">
                    +{telemetry.capacity.draftTokens}
                  </span>
                )}
              </button>
            )}

            {/* 2. DIRECT ONE-CLICK PLUGIN ZIP DOWNLOAD IN HEADER */}
            {!isWpRuntime && (
              <a
                href={`/downloads/${SPORTAVAND_BRAND.technicalStandards.zipFilename}`}
                download={SPORTAVAND_BRAND.technicalStandards.zipFilename}
                onClick={() => {
                  setViewMode('admin_cartable');
                  setEnvMode('aistudio');
                  setActiveTab('plugin');
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                title={`دانلود مستقیم فایل زیپ افزونه وردپرس (${SPORTAVAND_BRAND.technicalStandards.zipFilename})`}
              >
                <Download className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>دانلود افزونه Sportavand (v{SPORTAVAND_BRAND.version} ZIP)</span>
              </a>
            )}

            {/* 3. Primary View Switcher */}
            <div className="flex items-center bg-slate-950/95 border border-slate-700/80 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('public_intake')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'public_intake'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="نمایش فرم ثبت‌نام و دریافت کارت از نگاه بازیکن و عموم"
              >
                <FileInput className="w-3.5 h-3.5" />
                <span>فرم ثبت‌نام بازیکنان</span>
              </button>
              <button
                onClick={() => setViewMode('admin_cartable')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'admin_cartable'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="پیشخوان مدیریت اعضا، تأیید مدارک، روستر مسابقات و پایگاه‌داده"
              >
                <Users className="w-3.5 h-3.5" />
                <span>پیشخوان مدیریت اسپورتاوند</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        {viewMode === 'admin_cartable' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 flex overflow-x-auto no-scrollbar gap-1 pt-1">
            {(envMode === 'wordpress' ? [
              { id: 'team', label: 'داشبورد تیم و باشگاه (اسپورتاوند بسکتبال)', icon: Users, highlight: false },
              { id: 'intake', label: 'استودیو فرم و شورت‌کدها', icon: FileInput, highlight: false },
              { id: 'player', label: 'پرونده و کارت دیجیتال بازیکنان', icon: User, highlight: false },
              { id: 'database', label: 'وضعیت پایگاه‌داده (۹ جدول)', icon: Database, highlight: false },
              { id: 'brand', label: 'درباره اسپورتاوند و مهاجرت ایمن', icon: BookOpen, highlight: false },
            ] : [
              { id: 'plugin', label: `دانلود افزونه وردپرس (v${SPORTAVAND_BRAND.version})`, icon: Package, highlight: true, badge: 'ZIP' },
              { id: 'brain', label: 'حافظه و ظرفیت زنده', icon: Activity, highlight: true, badge: `${telemetry.capacity.percentUsed.toFixed(1)}%` },
              { id: 'brand', label: 'هویت برند و نگاشت مهاجرت', icon: BookOpen, highlight: true, badge: 'Sportavand' },
              { id: 'team', label: 'داشبورد تیم (اسپورتاوند بسکتبال)', icon: Users, highlight: false },
              { id: 'player', label: 'داشبورد اختصاصی بازیکن', icon: User, highlight: false },
              { id: 'intake', label: 'استودیو ساخت فرم و شورت‌کد', icon: FileInput, highlight: false },
              { id: 'database', label: 'وضعیت پایگاه‌داده (۹ جدول)', icon: Database, highlight: false },
            ]).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                      : tab.highlight
                      ? 'border-transparent text-amber-300 hover:text-amber-200 hover:border-amber-500/40 bg-amber-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : tab.highlight ? 'text-amber-300' : 'text-slate-400'}`} />
                  {tab.label}
                  {tab.badge && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 flex overflow-x-auto no-scrollbar gap-2 pt-1.5 pb-1">
            <button
              onClick={() => setPublicSubTab('register')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                publicSubTab === 'register'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileInput className="w-4 h-4" />
              فرم ثبت‌نام رسمی بازیکن جدید در تیم (اسپورتاوند بسکتبال)
            </button>
            <button
              onClick={() => setPublicSubTab('track')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                publicSubTab === 'track'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              پیگیری وضعیت پرونده و استعلام کارت با کد ملی
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'public_intake' ? (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            {/* Public Hero / Welcome Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    اسپورتاوند بسکتبال (Sportavand Basketball) · باشگاه فرهنگی ورزشی اروند خوزستان
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    سامانه ثبت‌نام و پذیرش الکترونیکی ورزشکاران — اسپورتاوند
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    ثبت آنلاین مشخصات هویتی، استعلام خودکار کد ملی ۱۰ رقمی در جدول یکتای اشخاص، بارگذاری مدارک و صدور آنی کارت دیجیتال با کد رهگیری
                  </p>
                </div>

                {/* Portal SubTab Switcher */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-1 flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setPublicSubTab('register')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      publicSubTab === 'register'
                        ? 'bg-amber-500 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileInput className="w-3.5 h-3.5" />
                    <span>ثبت‌نام جدید بازیکن</span>
                  </button>
                  <button
                    onClick={() => setPublicSubTab('track')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      publicSubTab === 'track'
                        ? 'bg-amber-500 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>پیگیری کارت با کد ملی</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SUB-TAB 1: REGISTRATION FORM */}
            {publicSubTab === 'register' && (
              <div>
                {registeredSuccessMember ? (
                  <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        ثبت‌نام شما در سامانه اسپورتاوند با موفقیت انجام شد و کارت دیجیتال صادر گردید!
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300">
                        کد رهگیری اختصاصی پرونده شما جهت استعلام و پیگیری‌های بعدی:
                      </p>
                      <div className="font-mono text-base sm:text-lg font-black text-amber-400 bg-slate-950 border border-amber-500/30 inline-block px-4 py-1.5 rounded-xl mt-1">
                        {registeredSuccessMember.trackingCode}
                      </div>
                    </div>

                    {/* Digital Player Card */}
                    <div className="max-w-md mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl text-right relative overflow-hidden">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">اسپورتاوند بسکتبال · باشگاه اروند</div>
                            <div className="text-[10px] text-amber-400 font-mono">Sportavand Digital ID · sportavand.ir</div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          کارت موقت بازیکن
                        </span>
                      </div>

                      <div className="py-4 flex items-center gap-4">
                        <img
                          src={registeredSuccessMember.person.photo}
                          alt={registeredSuccessMember.person.firstName}
                          className="w-20 h-24 rounded-xl object-cover border border-amber-500/40 shadow-md shrink-0 bg-slate-800"
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-base font-black text-white">
                              {registeredSuccessMember.person.firstName} {registeredSuccessMember.person.lastName}
                            </div>
                            <div className="text-lg font-black font-mono text-amber-400">
                              #{registeredSuccessMember.membership.jerseyNumber}
                            </div>
                          </div>
                          <div className="text-xs text-slate-300">
                            {registeredSuccessMember.membership.teamCategory} · {registeredSuccessMember.membership.position}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            کد ملی: {registeredSuccessMember.person.nationalCode.slice(0, 3)}****{registeredSuccessMember.person.nationalCode.slice(7)}
                          </div>
                          <div className="flex items-center gap-2 pt-1 text-[10px]">
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                              بیمه ورزشی: معتبر
                            </span>
                            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                              {registeredSuccessMember.membership.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <div className="space-y-0.5">
                          <div className="text-slate-400 text-[10px]">کد رهگیری استعلام اسپورتاوند:</div>
                          <div className="font-mono text-amber-300 font-bold">{registeredSuccessMember.trackingCode}</div>
                        </div>
                        <div className="w-10 h-10 rounded bg-white p-1 flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-slate-950" />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => window.print()}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        <Download className="w-4 h-4" />
                        چاپ / ذخیره کارت دیجیتال
                      </button>
                      <button
                        onClick={() => {
                          setRegisteredSuccessMember(null);
                          setCheckNationalCodeInput('');
                          setNewMemberForm({
                            firstName: '',
                            lastName: '',
                            fatherName: '',
                            birthDate: '',
                            gender: 'پسران / آقایان',
                            role: 'بازیکن',
                            jerseyNumber: '7',
                            position: 'پست ۲ (شوتینگ گارد)',
                            teamCategory: 'نوجوانان (زیر ۱۶ سال)',
                            phone: '',
                            parentPhone: '',
                            emergencyPhone: '',
                            address: 'اهواز',
                            insuranceNumber: 'MED-1405-99881',
                            insuranceExpiry: '1405/12/29',
                          });
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition text-xs flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        ثبت‌نام بازیکن دیگر
                      </button>
                      <button
                        onClick={() => setViewMode('admin_cartable')}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold transition text-xs flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        مشاهده در کارتابل تیم
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl">
                    {/* Section 1: National Code Check */}
                    <div className="space-y-3 pb-5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                          ۱
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          استعلام کد ملی ۱۰ رقمی (احراز یکتایی هویت در wp_sportavand_persons)
                        </h3>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          کد ملی ۱۰ رقمی بازیکن:
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type="text"
                            maxLength={10}
                            placeholder="مثال: 1740001122"
                            value={checkNationalCodeInput}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setCheckNationalCodeInput(val);
                              if (val.length === 10) {
                                const p = persons.find((item) => item.nationalCode === val);
                                if (p) {
                                  setNewMemberForm((prev) => ({
                                    ...prev,
                                    firstName: p.firstName,
                                    lastName: p.lastName,
                                    fatherName: p.fatherName,
                                    birthDate: p.birthDate,
                                    gender: p.gender,
                                  }));
                                }
                              }
                            }}
                            className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none transition ${
                              checkNationalCodeInput.length === 10
                                ? isValidIranianNationalCode(checkNationalCodeInput)
                                  ? 'border-emerald-500 focus:border-emerald-400'
                                  : 'border-rose-500 focus:border-rose-400'
                                : 'border-slate-700 focus:border-amber-500'
                            }`}
                          />
                          {checkNationalCodeInput.length === 10 && (
                            <div className="absolute left-3 top-2.5">
                              {isValidIranianNationalCode(checkNationalCodeInput) ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-rose-400" />
                              )}
                            </div>
                          )}
                        </div>

                        {checkNationalCodeInput.length === 10 && (
                          <div className="mt-1.5 text-xs">
                            {isValidIranianNationalCode(checkNationalCodeInput) ? (
                              <span className="text-emerald-400 font-medium">✓ ساختار و رقم کنترل کد ملی صحیح است.</span>
                            ) : (
                              <span className="text-rose-400 font-medium">⚠ فرمت یا رقم کنترل کد ملی نامعتبر است؛ لطفاً رقم‌ها را مجدد بررسی کنید.</span>
                            )}
                          </div>
                        )}

                        {persons.find((item) => item.nationalCode === checkNationalCodeInput) && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                            <Check className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              پرونده هویتی برای «{persons.find((item) => item.nationalCode === checkNationalCodeInput)?.firstName} {persons.find((item) => item.nationalCode === checkNationalCodeInput)?.lastName}» در اسپورتاوند شناسایی شد؛ مشخصات شناسنامه‌ای بازخوانی گردید تا رکورد تکراری ایجاد نشود.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Personal Info */}
                    <div className="space-y-4 pb-5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                          ۲
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          مشخصات شناسنامه‌ای و شماره‌های تماس
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">نام:</label>
                          <input
                            type="text"
                            placeholder="مثال: آرش"
                            value={newMemberForm.firstName}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, firstName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">نام خانوادگی:</label>
                          <input
                            type="text"
                            placeholder="مثال: رضایی"
                            value={newMemberForm.lastName}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, lastName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">نام پدر:</label>
                          <input
                            type="text"
                            placeholder="مثال: هوشنگ"
                            value={newMemberForm.fatherName}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, fatherName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">تاریخ تولد (شمسی):</label>
                          <input
                            type="text"
                            placeholder="1387/03/15"
                            value={newMemberForm.birthDate}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, birthDate: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">شماره همراه بازیکن (جهت پیامک):</label>
                          <input
                            type="text"
                            placeholder="09160000000"
                            value={newMemberForm.phone}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">شماره تماس ولی / اضطراری:</label>
                          <input
                            type="text"
                            placeholder="09161112233"
                            value={newMemberForm.parentPhone}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, parentPhone: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Sports Info */}
                    <div className="space-y-4 pb-5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                          ۳
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          رده سنی، پست تخصصی (اسپورتاوند بسکتبال) و شماره پیراهن
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">رده سنی مسابقات:</label>
                          <select
                            value={newMemberForm.teamCategory}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, teamCategory: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                          >
                            <option value="نونهالان (زیر ۱۴ سال)">نونهالان (زیر ۱۴ سال)</option>
                            <option value="نوجوانان (زیر ۱۶ سال)">نوجوانان (زیر ۱۶ سال)</option>
                            <option value="جوانان (زیر ۱۸ سال)">جوانان (زیر ۱۸ سال)</option>
                            <option value="امید (زیر ۲۱ سال)">امید (زیر ۲۱ سال)</option>
                            <option value="بزرگسالان">بزرگسالان</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">پست تخصصی بسکتبال:</label>
                          <select
                            value={newMemberForm.position}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, position: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                          >
                            <option value="پست ۱ (پوینت گارد / گارد رأس)">پست ۱ (گارد رأس / Point Guard)</option>
                            <option value="پست ۲ (شوتینگ گارد)">پست ۲ (شوتینگ گارد / Shooting Guard)</option>
                            <option value="پست ۳ (اسمال فوروارد)">پست ۳ (اسمال فوروارد / Small Forward)</option>
                            <option value="پست ۴ (پاور فوروارد)">پست ۴ (پاور فوروارد / Power Forward)</option>
                            <option value="پست ۵ (سنتر / سنتر فوروارد)">پست ۵ (سنتر / Center)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">شماره پیشنهادی پیراهن:</label>
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="مثال: 7"
                            value={newMemberForm.jerseyNumber}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, jerseyNumber: e.target.value.replace(/\D/g, '') })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">قد و وزن تقریبی:</label>
                          <input
                            type="text"
                            placeholder="قد: 186cm / وزن: 74kg"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Photo & Documents */}
                    <div className="space-y-4 pb-5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                          ۴
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          تصویر پرسنلی و مدارک بیمه ورزشی
                        </h3>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-2">انتخاب عکس چهره جهت کارت دیجیتال:</label>
                        <div className="flex flex-wrap items-center gap-3">
                          {sampleAvatars.map((url, idx) => (
                            <div
                              key={url}
                              onClick={() => setSelectedAvatar(url)}
                              className={`w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                                selectedAvatar === url ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={url} alt={`نمونه ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">شماره کارت بیمه ورزشی فدراسیون:</label>
                          <input
                            type="text"
                            value={newMemberForm.insuranceNumber}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, insuranceNumber: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">تاریخ اعتبار بیمه:</label>
                          <input
                            type="text"
                            value={newMemberForm.insuranceExpiry}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, insuranceExpiry: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Agreement & Submit */}
                    <div className="space-y-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-0"
                        />
                        <span className="text-xs text-slate-300">
                          صحت کلیه اطلاعات شناسنامه‌ای و بیمه‌ای فوق را تأیید کرده و تعهد به رعایت مرام‌نامه و آیین‌نامه انضباطی باشگاه فرهنگی ورزشی اروند و فدراسیون بسکتبال را دارم.
                        </span>
                      </label>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <div className="text-[11px] text-emerald-400">
                          ✓ به محض ثبت، کارت موقت اسپورتاوند با بارکد QR و کد رهگیری صادر می‌گردد.
                        </div>
                        <button
                          onClick={handlePublicRegistrationSubmit}
                          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          ثبت نهایی و دریافت کارت الکترونیکی اسپورتاوند
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: TRACKING WITH NATIONAL CODE */}
            {publicSubTab === 'track' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    پیگیری وضعیت پرونده و استعلام کارت دیجیتال اسپورتاوند
                  </h3>
                  <p className="text-xs text-slate-400">
                    با وارد کردن کد ملی ۱۰ رقمی، از وضعیت تأیید مدارک توسط سرپرست تیم و کارت صادرشده مطلع شوید:
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="کد ملی ۱۰ رقمی بازیکن..."
                    value={trackSearchCode}
                    onChange={(e) => setTrackSearchCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full sm:max-w-md bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (!trackSearchCode || trackSearchCode.length !== 10) {
                        showToast('لطفاً کد ملی ۱۰ رقمی را وارد کنید.');
                      }
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Search className="w-4 h-4" />
                    استعلام پرونده
                  </button>
                </div>

                {/* Results Display */}
                {trackSearchCode.length === 10 && (() => {
                  const matchedPerson = persons.find((p) => p.nationalCode === trackSearchCode);
                  const matchedMembership = matchedPerson ? memberships.find((m) => m.personId === matchedPerson.id) : null;

                  if (matchedPerson && matchedMembership) {
                    return (
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <img
                              src={matchedPerson.photo}
                              alt={matchedPerson.firstName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <div className="text-sm font-bold text-white">
                                {matchedPerson.firstName} {matchedPerson.lastName}
                              </div>
                              <div className="text-xs text-slate-400">
                                کد ملی: <span className="font-mono text-amber-300">{matchedPerson.nationalCode}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
                            {matchedMembership.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-slate-900 p-2.5 rounded-xl">
                            <div className="text-[10px] text-slate-400">سمت / نقش:</div>
                            <div className="font-bold text-white mt-0.5">{matchedMembership.role}</div>
                          </div>
                          <div className="bg-slate-900 p-2.5 rounded-xl">
                            <div className="text-[10px] text-slate-400">شماره پیراهن:</div>
                            <div className="font-bold font-mono text-amber-400 mt-0.5">#{matchedMembership.jerseyNumber}</div>
                          </div>
                          <div className="bg-slate-900 p-2.5 rounded-xl">
                            <div className="text-[10px] text-slate-400">رده سنی:</div>
                            <div className="font-bold text-white mt-0.5">{matchedMembership.teamCategory}</div>
                          </div>
                          <div className="bg-slate-900 p-2.5 rounded-xl">
                            <div className="text-[10px] text-slate-400">بیمه ورزشی:</div>
                            <div className="font-bold text-emerald-400 mt-0.5">
                              {matchedMembership.insuranceValid ? 'معتبر' : 'منقضی'}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => window.print()}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5" />
                            دریافت کارت دیجیتال
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                      <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                      <div className="text-sm font-bold text-white">پرونده‌ای با این کد ملی یافت نشد</div>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        احتمالاً ثبت‌نام هنوز نهایی نشده است. از تب «ثبت‌نام جدید بازیکن» مشخصات خود را تکمیل نمایید.
                      </p>
                      <button
                        onClick={() => {
                          setPublicSubTab('register');
                          setCheckNationalCodeInput(trackSearchCode);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        ورود به فرم ثبت‌نام با همین کد ملی
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* TAB: BRAND IDENTITY & MIGRATION MAPPING (هویت برند اسپورتاوند و نگاشت مهاجرت) */}
            {/* ========================================================================= */}
            {activeTab === 'brand' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Official Brand Story Card */}
                <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        هویت نهایی و قطعی برند · {SPORTAVAND_BRAND.domain}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {SPORTAVAND_BRAND.fullTitleFa} — «{SPORTAVAND_BRAND.sloganFa}»
                      </h2>
                      <p className="text-xs sm:text-sm text-amber-200/90 font-medium leading-relaxed max-w-4xl">
                        {SPORTAVAND_BRAND.shortIntroFa}
                      </p>
                    </div>
                    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs space-y-1.5 shrink-0 font-mono">
                      <div className="text-slate-400 font-sans text-[11px]">مشخصات رسمی محصول:</div>
                      <div className="text-white">Brand: <strong className="text-amber-400">{SPORTAVAND_BRAND.nameEn}</strong> ({SPORTAVAND_BRAND.nameFa})</div>
                      <div className="text-white">Domain: <strong className="text-emerald-400">{SPORTAVAND_BRAND.domain}</strong></div>
                      <div className="text-white">Version: <strong className="text-sky-400">{SPORTAVAND_BRAND.version} ({SPORTAVAND_BRAND.versionFa})</strong></div>
                      <div className="text-white">Creator: <strong className="text-indigo-300">{SPORTAVAND_BRAND.creator}</strong></div>
                    </div>
                  </div>

                  {/* 3-Paragraph Brand Story */}
                  <div className="space-y-3">
                    <h3 className="text-sm sm:text-base font-black text-amber-400">
                      داستان نام «اسپورتاوند» (Brand Story)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {SPORTAVAND_BRAND.brandStoryParagraphsFa.map((paragraph, index) => (
                        <div
                          key={index}
                          className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed space-y-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px]">
                            {index + 1}
                          </div>
                          <p className="text-slate-200 leading-7">{paragraph}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Module Naming Pattern */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white">
                      ساختار ماژولار و الگوی نام‌گذاری رشته‌ها (Module Naming Architecture)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-xl p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400">{SPORTAVAND_BRAND.firstModule.fullLabel}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            ماژول اول (فعال)
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-300" dir="ltr">
                          ID: {SPORTAVAND_BRAND.firstModule.id}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400" dir="ltr">
                          Namespace: {SPORTAVAND_BRAND.firstModule.namespace}
                        </div>
                      </div>

                      {SPORTAVAND_BRAND.futureModulesPattern.map((mod) => (
                        <div key={mod.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5 opacity-85">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{mod.fullLabel}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                              الگوی نام‌گذاری آینده
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-slate-400" dir="ltr">
                            ID: {mod.id}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500" dir="ltr">
                            Namespace: {mod.namespace}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Complete Old-to-New Identifier Mapping Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        جدول نگاشت شناسه‌های قدیم به جدید و استراتژی مهاجرت ایمن (Sportavand_Migrator)
                      </h3>
                      <p className="text-xs text-slate-400">
                        کلیه داده‌ها، جداول، شورت‌کدها و گزینه‌های نصب‌های قبلی بدون افت داده و به صورت تکرارپذیر (Idempotent) به استانداردهای زیر مهاجرت می‌کنند:
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full shrink-0">
                      class-sportavand-migrator.php
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
                        <tr>
                          <th className="p-3 font-bold">بخش / موجودیت</th>
                          <th className="p-3 font-bold">شناسه قبلی (صرفاً در لایه مهاجرت)</th>
                          <th className="p-3 font-bold">شناسه نهایی و قطعی (Sportavand)</th>
                          <th className="p-3 font-bold">استراتژی مهاجرت و سازگاری عقب‌رو</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {IDENTIFIER_MAPPING_TABLE.map((item) => (
                          <tr key={item.category} className="hover:bg-slate-800/30">
                            <td className="p-3 font-bold text-white">{item.category}</td>
                            <td className="p-3 font-mono text-slate-400" dir="ltr">{item.legacyIdentifier}</td>
                            <td className="p-3 font-mono text-emerald-400 font-bold" dir="ltr">{item.newIdentifier}</td>
                            <td className="p-3 text-slate-300 leading-relaxed">{item.migrationStrategy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 1: TEAM DASHBOARD (داشبورد تیم و باشگاه - اسپورتاوند بسکتبال) */}
            {/* ========================================================================= */}
            {activeTab === 'team' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Team Action Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                        اسپورتاوند بسکتبال · باشگاه فرهنگی ورزشی اروند خوزستان
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Module: sportavand-basketball</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      فهرست و کارتابل اعضای تیم (کادر فنی و بازیکنان)
                    </h2>
                    <p className="text-xs text-slate-400">
                      مدیریت هوشمند اعضا در جداول <code className="text-amber-300 font-mono">wp_sportavand_*</code>، جلوگیری از ثبت کد ملی تکراری، و کنترل انتشار عمومی صفحه تیم
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => setIsPublicRoster(!isPublicRoster)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                        isPublicRoster
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isPublicRoster ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                      {isPublicRoster ? 'انتشار عمومی: فعال' : 'انتشار عمومی: محرمانه'}
                    </button>

                    <button
                      onClick={() => {
                        setShowAddMemberModal(true);
                        setAddStep('check_national_code');
                        setCheckNationalCodeInput('');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-2 text-xs shadow-lg shadow-amber-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      افزودن عضو جدید به تیم
                    </button>
                  </div>
                </div>

                {/* Player Access & Registration Workflow Card */}
                <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">راهنمای دسترسی بازیکن: چطور یک بازیکن در اسپورتاوند ثبت‌نام می‌کند؟</h3>
                        <p className="text-[11px] text-slate-400">شورت‌کد رسمی <code className="text-amber-300 font-mono">[sportavand_form id="17"]</code>، پیام آماده اشتراک‌گذاری و شبیه‌ساز تست فرم</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setShowPlayerRegisterSimulator(true)}
                        className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                      >
                        <FileInput className="w-3.5 h-3.5" />
                        <span>تست فرم از نگاه بازیکن (شبیه‌ساز)</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Step Explanation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                      <div className="text-amber-400 font-bold flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-[10px] flex items-center justify-center font-mono">۱</span>
                        ارسال لینک برگه ثبت‌نام به بازیکن
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                        مدیر باشگاه شورت‌کد رسمی <code className="text-amber-300 font-mono">[sportavand_form id="17"]</code> را در برگه ثبت‌نام سایت باشگاه قرار داده و لینک را برای بازیکنان ارسال می‌کند.
                      </p>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                      <div className="text-sky-400 font-bold flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-sky-500/20 text-[10px] flex items-center justify-center font-mono">۲</span>
                        ثبت مشخصات بدون نیاز به لاگین وردپرس
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                        بازیکن بدون نیاز به حساب پیشخوان وردپرس، کدملی ۱۰ رقمی خود را وارد کرده، عکس و مدارک را بارگذاری و بلافاصله کارت دیجیتال با کد رهگیری دریافت می‌کند.
                      </p>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[10px] flex items-center justify-center font-mono">۳</span>
                        تأیید مدارک در کارتابل تیم
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                        عضو جدید بلافاصله در جدول زیر با وضعیت «در انتظار بررسی» ظاهر می‌شود؛ مدیر باشگاه با بررسی مدارک وضعیت را به «تأیید مدارک» تغییر می‌دهد.
                      </p>
                    </div>
                  </div>

                  {/* Quick Share Link & Copy Widget */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-400 text-[11px]">شورت‌کد رسمی برگه ثبت‌نام:</span>
                      <code className="text-amber-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800" dir="ltr">
                        [sportavand_form id="17"]
                      </code>
                      <span className="text-slate-500 text-[11px]">(هاست تست باشگاه: fwa.ir/register)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('[sportavand_form id="17"]');
                          setCopiedPluginShortcode('register_shortcode');
                          setTimeout(() => setCopiedPluginShortcode(''), 2500);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1 text-[11px]"
                      >
                        {copiedPluginShortcode === 'register_shortcode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>کپی شورت‌کد</span>
                      </button>
                      <button
                        onClick={() => {
                          const msg = `ورزشکار گرامی، لطفاً جهت تکمیل ثبت‌نام در سامانه اسپورتاوند (Sportavand) و دریافت کارت دیجیتال با کد ملی ۱۰ رقمی به برگه ثبت‌نام باشگاه مراجعه فرمایید.`;
                          navigator.clipboard.writeText(msg);
                          setCopiedShareMessage(true);
                          setTimeout(() => setCopiedShareMessage(false), 2500);
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition flex items-center gap-1 text-[11px] font-bold"
                      >
                        {copiedShareMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>کپی پیام آماده اطلاع‌رسانی</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-400">فیلتر رده:</span>
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">همه رده‌ها و کادر فنی</option>
                      <option value="staff">فقط کادر فنی</option>
                      <option value="player">فقط بازیکنان</option>
                    </select>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="جستجو با نام یا کد ملی..."
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white pr-8 focus:outline-none focus:border-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                {/* ROSTER TABLE / LIST */}
                <div className="space-y-4">
                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'staff') && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-indigo-400 flex items-center gap-2 uppercase tracking-wider">
                        <Award className="w-4 h-4" />
                        ارکان کادر فنی و سرپرستی (نیمکت رسمی تیم)
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {memberships
                          .filter((m) => m.role !== 'بازیکن')
                          .filter((m) => {
                            const p = persons.find((per) => per.id === m.personId);
                            if (!p) return false;
                            return (
                              p.firstName.includes(rosterSearch) ||
                              p.lastName.includes(rosterSearch) ||
                              p.nationalCode.includes(rosterSearch)
                            );
                          })
                          .map((m) => {
                            const p = persons.find((per) => per.id === m.personId)!;
                            return (
                              <div
                                key={m.id}
                                className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-indigo-500/60 transition"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.photo}
                                    alt={p.lastName}
                                    className="w-12 h-12 rounded-xl object-cover border border-indigo-500/40"
                                  />
                                  <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                      <span>{p.firstName} {p.lastName}</span>
                                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                                        {m.role}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                      <span className="font-mono">کد ملی: {p.nationalCode}</span>
                                      <span>·</span>
                                      <span>{m.position}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => setSelectedDossierMember({ person: p, membership: m })}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                                  >
                                    پرونده
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'player') && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                        <Trophy className="w-4 h-4" />
                        فهرست بازیکنان رسمی تیم — اسپورتاوند بسکتبال
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {memberships
                          .filter((m) => m.role === 'بازیکن')
                          .filter((m) => {
                            const p = persons.find((per) => per.id === m.personId);
                            if (!p) return false;
                            return (
                              p.firstName.includes(rosterSearch) ||
                              p.lastName.includes(rosterSearch) ||
                              p.nationalCode.includes(rosterSearch)
                            );
                          })
                          .map((m) => {
                            const p = persons.find((per) => per.id === m.personId)!;
                            return (
                              <div
                                key={m.id}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.photo}
                                    alt={p.lastName}
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                                  />
                                  <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                      <span>{p.firstName} {p.lastName}</span>
                                      <span className="font-mono text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-bold">
                                        #{m.jerseyNumber}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                                      <span>{m.position}</span>
                                      <span>·</span>
                                      <span>قد: {m.height}cm</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    {m.status}
                                  </span>
                                  <button
                                    onClick={() => setSelectedDossierMember({ person: p, membership: m })}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                                  >
                                    پرونده
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dossier Modal */}
                {selectedDossierMember && (
                  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 animate-scaleUp">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedDossierMember.person.photo}
                            alt="User"
                            className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                          />
                          <div>
                            <h3 className="text-base font-bold text-white">
                              پرونده {selectedDossierMember.person.firstName} {selectedDossierMember.person.lastName}
                            </h3>
                            <p className="text-xs text-slate-400 font-mono">
                              شناسه یکتا: {selectedDossierMember.person.id} · کد ملی: {selectedDossierMember.person.nationalCode}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedDossierMember(null)}
                          className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 rounded-lg"
                        >
                          بستن
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block mb-1">نام پدر:</span>
                          <span className="text-slate-200 font-bold">{selectedDossierMember.person.fatherName}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block mb-1">تاریخ تولد (شمسی):</span>
                          <span className="text-slate-200 font-mono font-bold">{selectedDossierMember.person.birthDate}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block mb-1">سمت در تیم:</span>
                          <span className="text-amber-400 font-bold">{selectedDossierMember.membership.role} ({selectedDossierMember.membership.position})</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block mb-1">شماره بیمه ورزشی:</span>
                          <span className="text-emerald-400 font-mono font-bold">{selectedDossierMember.membership.insuranceNumber}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-slate-300">تصمیم مدیر باشگاه / سرپرست:</div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {['تأیید مدارک', 'در انتظار بررسی', 'نیازمند اصلاح', 'تعلیق موقت'].map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                setMemberships(
                                  memberships.map((m) =>
                                    m.id === selectedDossierMember.membership.id ? { ...m, status: st as any } : m
                                  )
                                );
                                setSelectedDossierMember({
                                  ...selectedDossierMember,
                                  membership: { ...selectedDossierMember.membership, status: st as any },
                                });
                              }}
                              className={`px-3 py-1.5 rounded-lg border transition font-medium ${
                                selectedDossierMember.membership.status === st
                                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Member Modal */}
                {showAddMemberModal && (
                  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Plus className="w-4 h-4 text-amber-400" />
                          افزودن عضو جدید به تیم (اسپورتاوند بسکتبال)
                        </h3>
                        <button
                          onClick={() => setShowAddMemberModal(false)}
                          className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 rounded-lg"
                        >
                          بستن
                        </button>
                      </div>

                      {addStep === 'check_national_code' && (
                        <div className="space-y-4 text-xs">
                          <p className="text-slate-300 leading-relaxed">
                            ابتدا <strong>کد ملی ۱۰ رقمی</strong> فرد را وارد کنید. سیستم اسپورتاوند بررسی می‌کند آیا این شخص قبلاً در جدول <code className="text-amber-300 font-mono">wp_sportavand_persons</code> ثبت شده است یا خیر:
                          </p>
                          <div>
                            <label className="block text-slate-400 mb-1">کد ملی ۱۰ رقمی:</label>
                            <input
                              type="text"
                              value={checkNationalCodeInput}
                              onChange={(e) => setCheckNationalCodeInput(e.target.value)}
                              placeholder="مثلاً 1751234567"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={handleCheckNationalCode}
                              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs"
                            >
                              استعلام در دیتابیس اسپورتاوند
                            </button>
                          </div>
                        </div>
                      )}

                      {addStep === 'select_role' && existingPersonFound && (
                        <div className="space-y-4 text-xs">
                          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 space-y-1">
                            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              پرونده هویتی شخص در اسپورتاوند موجود است:
                            </div>
                            <div className="text-slate-200">
                              <strong>{existingPersonFound.firstName} {existingPersonFound.lastName}</strong> (فرزند {existingPersonFound.fatherName}) · متولد {existingPersonFound.birthDate}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              قانون طلایی اسپورتاوند: کد ملی تکرار نمی‌شود. می‌توانید این شخص را با سمت دوم یا رده جدید اضافه کنید.
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-slate-400 mb-1">سمت جدید در این تیم:</label>
                              <select
                                value={newMemberForm.role}
                                onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                              >
                                <option>سرمربی</option>
                                <option>مربی</option>
                                <option>کمک مربی</option>
                                <option>سرپرست</option>
                                <option>آنالیزور</option>
                                <option>بازیکن (رده دیگر)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-400 mb-1">رده سنی تیم:</label>
                              <select
                                value={newMemberForm.teamCategory}
                                onChange={(e) => setNewMemberForm({ ...newMemberForm, teamCategory: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                              >
                                <option>مینی‌بسکتبال (زیر ۱۲ سال)</option>
                                <option>نونهالان (زیر ۱۴ سال)</option>
                                <option>نوجوانان (زیر ۱۶ سال)</option>
                                <option>جوانان (زیر ۱۸ سال)</option>
                                <option>بزرگسالان</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-between">
                            <button
                              onClick={() => setAddStep('check_national_code')}
                              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                            >
                              بازگشت
                            </button>
                            <button
                              onClick={handleConfirmAddMember}
                              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs"
                            >
                              ثبت سمت جدید برای این شخص
                            </button>
                          </div>
                        </div>
                      )}

                      {addStep === 'full_form' && (
                        <div className="space-y-4 text-xs">
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-300">
                            کد ملی <strong>{checkNationalCodeInput}</strong> قبلاً در دیتابیس ثبت نشده است. مشخصات هویتی اولیه را وارد کنید:
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-400 mb-1">نام:</label>
                              <input
                                type="text"
                                value={newMemberForm.firstName}
                                onChange={(e) => setNewMemberForm({ ...newMemberForm, firstName: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-1">نام خانوادگی:</label>
                              <input
                                type="text"
                                value={newMemberForm.lastName}
                                onChange={(e) => setNewMemberForm({ ...newMemberForm, lastName: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-1">نام پدر:</label>
                              <input
                                type="text"
                                value={newMemberForm.fatherName}
                                onChange={(e) => setNewMemberForm({ ...newMemberForm, fatherName: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-1">تلفن همراه:</label>
                              <input
                                type="text"
                                value={newMemberForm.phone}
                                onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex justify-between">
                            <button
                              onClick={() => setAddStep('check_national_code')}
                              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                            >
                              بازگشت
                            </button>
                            <button
                              onClick={handleConfirmAddMember}
                              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs"
                            >
                              ثبت نهایی شخص در تیم
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: PLAYER DASHBOARD (داشبورد اختصاصی بازیکن / کادر فنی) */}
            {/* ========================================================================= */}
            {activeTab === 'player' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">شبیه‌ساز ورود اختصاصی بازیکن:</span>
                    <select
                      value={activePersonId}
                      onChange={(e) => setActivePersonId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      {persons.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} (کد ملی: {p.nationalCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    حریم خصوصی اسپورتاوند فعال: هر فرد فقط داشبورد خود را می‌بیند.
                  </div>
                </div>

                {playerEditNotice && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{playerEditNotice}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* DIGITAL SPORTS ID CARD */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            کارت شناسایی اسپورتاوند (Sportavand Basketball ID)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {primaryMembership.joinedSeason}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-5">
                        <img
                          src={activePerson.photo}
                          alt={activePerson.lastName}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/60 shadow-lg shadow-amber-500/10 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="text-base font-black text-white">
                            {activePerson.firstName} {activePerson.lastName}
                          </div>
                          <div className="text-xs text-amber-400 font-semibold">
                            {primaryMembership.clubName}
                          </div>
                          <div className="text-[11px] text-slate-300">
                            {primaryMembership.teamCategory} · {primaryMembership.position}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-5 text-center text-xs">
                        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">شماره</span>
                          <span className="text-sm font-mono font-black text-amber-400">
                            {primaryMembership.jerseyNumber}
                          </span>
                        </div>
                        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">قد</span>
                          <span className="text-xs font-mono font-bold text-slate-200">
                            {primaryMembership.height} cm
                          </span>
                        </div>
                        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">دست غالب</span>
                          <span className="text-xs font-bold text-slate-200">
                            {primaryMembership.dominantHand}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          بیمه ورزشی فدراسیون معتبر · sportavand.ir
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          شماره: {primaryMembership.insuranceNumber} (تا {primaryMembership.insuranceExpiry})
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                        <QrCode className="w-8 h-8 text-slate-950" />
                      </div>
                    </div>
                  </div>

                  {/* EDIT DOSSIER & LOCKED IDENTITY FORM */}
                  <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-400" />
                        ویرایش اطلاعات پرونده در اسپورتاوند (فیلدهای مجاز و قفل‌شده)
                      </h3>
                      <span className="text-xs font-mono text-slate-400">
                        کد ملی: {activePerson.nationalCode}
                      </span>
                    </div>

                    <form onSubmit={handleUpdatePlayerEditableFields} className="space-y-4 text-xs">
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          فیلدهای هویتی قفل‌شده (تأییدشده توسط باشگاه / هیئت):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
                          <div>
                            <span className="text-slate-500 block text-[10px]">نام و نام خانوادگی:</span>
                            <span className="font-bold">{activePerson.firstName} {activePerson.lastName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">کد ملی:</span>
                            <span className="font-mono font-bold">{activePerson.nationalCode}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">تاریخ تولد:</span>
                            <span className="font-mono font-bold">{activePerson.birthDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          فیلدهای قابل ویرایش توسط خود بازیکن:
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 mb-1">تلفن همراه ورزشکار:</label>
                            <input
                              type="text"
                              defaultValue={primaryMembership.phone}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1">شماره تماس ولی / اضطراری:</label>
                            <input
                              type="text"
                              defaultValue={primaryMembership.emergencyPhone}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1">قد فعلی (سانتی‌متر):</label>
                            <input
                              type="text"
                              defaultValue={primaryMembership.height}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1">وزن فعلی (کیلوگرم):</label>
                            <input
                              type="text"
                              defaultValue={primaryMembership.weight}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 mb-1">نشانی سکونت:</label>
                            <input
                              type="text"
                              defaultValue={primaryMembership.address}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-xs shadow-lg shadow-emerald-600/20"
                        >
                          ذخیره و به‌روزرسانی پرونده
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: INTAKE STUDIO & SHORTCODES (استودیو ساخت فرم اسپورتاوند) */}
            {/* ========================================================================= */}
            {activeTab === 'intake' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                          Sportavand Form Studio
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        استودیو ساخت و تنظیم فرم‌های ورودی اسپورتاوند (Intake Presets)
                      </h2>
                      <p className="text-xs text-slate-400">
                        انتخاب قالب، مشاهده شورت‌کد رسمی جهت قرار دادن در هر برگه سایت وردپرس، و تنظیم فیلدهای مجاز
                      </p>
                    </div>

                    {/* Shortcode Card */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 shrink-0">
                      <div>
                        <div className="text-[10px] text-slate-400">شورت‌کد رسمی اسپورتاوند:</div>
                        <div className="font-mono text-xs font-bold text-emerald-400" dir="ltr">
                          [sportavand_form id="{selectedPresetId.replace('form-', '')}"]
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`[sportavand_form id="${selectedPresetId.replace('form-', '')}"]`);
                          showToast('شورت‌کد رسمی [sportavand_form] با موفقیت کپی شد!');
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
                        title="کپی شورت‌کد"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Presets Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                    {FORM_PRESETS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedPresetId(preset.id);
                            setActiveFieldIds(preset.activeFieldIds);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field Manager */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        پالایش و مدیریت فیلدهای فعال در این فرم
                      </h3>
                      <p className="text-xs text-slate-400">
                        با کلیک روی هر فیلد، آن را در این فرم فعال یا غیرفعال کنید:
                      </p>
                    </div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {activeFieldIds.length} فیلد فعال
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                    {ALL_INTAKE_FIELDS.map((f) => {
                      const isChecked = activeFieldIds.includes(f.id);
                      return (
                        <div
                          key={f.id}
                          onClick={() => {
                            if (isChecked) {
                              setActiveFieldIds(activeFieldIds.filter((id) => id !== f.id));
                            } else {
                              setActiveFieldIds([...activeFieldIds, f.id]);
                            }
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                            isChecked
                              ? 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                              : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            isChecked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 font-black" />}
                          </div>
                          <div>
                            <div className="font-bold text-xs">{f.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{f.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 0: WORDPRESS PLUGIN PACKAGE & DOWNLOAD CENTER */}
            {/* ========================================================================= */}
            {activeTab === 'plugin' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-amber-950/40 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <Package className="w-3.5 h-3.5" />
                        نگارش رسمی بازنام‌گذاری و مهاجرت ایمن · نسخه {SPORTAVAND_BRAND.versionFa} · آماده نصب در وردپرس
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        پکیج نصبی افزونه وردپرس اسپورتاوند (Sportavand v{SPORTAVAND_BRAND.version})
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        این پکیج رسمی با نام و فضای نام یکپارچه <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">Sportavand</code>، دارای ۹ جدول اختصاصی رابطه‌ای <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">wp_sportavand_*</code>، موتور مهاجرت ایمن و نسخه‌دار <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">Sportavand_Migrator</code>، مسیرهای REST API در <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">/wp-json/sportavand/v1/</code> و شورت‌کدهای رسمی <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">[sportavand_form]</code> و <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">[sportavand_roster]</code> است.
                      </p>
                    </div>

                    {/* Primary Download Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
                      <a
                        href={`/downloads/${SPORTAVAND_BRAND.technicalStandards.zipFilename}`}
                        download={SPORTAVAND_BRAND.technicalStandards.zipFilename}
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 text-center"
                      >
                        <Download className="w-5 h-5 text-slate-950 shrink-0" />
                        <span>دانلود {SPORTAVAND_BRAND.technicalStandards.zipFilename}</span>
                      </a>

                      <button
                        onClick={() => setActiveTab('brand')}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
                      >
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        مشاهده هویت برند و جدول نگاشت مهاجرت
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Shortcode Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Form Shortcode */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileInput className="w-4 h-4 text-amber-400" />
                        <h4 className="font-bold text-sm text-white">شورت‌کد رسمی ثبت‌نام الکترونیکی ورزشکار</h4>
                      </div>
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                        اسپورتاوند بسکتبال
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      این شورت‌کد را در هر برگه وردپرس قرار دهید تا فرم هوشمند، اعتبارسنجی کدملی ۱۰ رقمی، چندنقشی و صدور کارت دیجیتال فعال شود.
                    </p>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                      <code className="text-amber-400 font-mono text-xs sm:text-sm font-bold" dir="ltr">
                        [sportavand_form id="17"]
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('[sportavand_form id="17"]');
                          setCopiedPluginShortcode('form');
                          setTimeout(() => setCopiedPluginShortcode(''), 2500);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                      >
                        {copiedPluginShortcode === 'form' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی شورت‌کد</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>سازگاری کامل هنگام ارتقا: برگه‌های قدیمی در سایت بدون نیاز به ویرایش دستی به کار خود ادامه می‌دهند.</span>
                    </div>
                  </div>

                  {/* Roster Shortcode */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-sm text-white">شورت‌کد رسمی نمایش روستر و اعضای تیم</h4>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                        نمایش عمومی
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      برای نمایش جدول بازیکنان، کادر فنی، شماره پیراهن، رده سنی و کارت دیجیتال تاییدشده تیم در صفحات عمومی سایت.
                    </p>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                      <code className="text-emerald-400 font-mono text-xs sm:text-sm font-bold" dir="ltr">
                        [sportavand_roster team_id="1"]
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('[sportavand_roster team_id="1"]');
                          setCopiedPluginShortcode('roster');
                          setTimeout(() => setCopiedPluginShortcode(''), 2500);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                      >
                        {copiedPluginShortcode === 'roster' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی شورت‌کد</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>پشتیبانی از بلوک گوتنبرگ <code className="text-emerald-300 font-mono">sportavand/team-roster</code></span>
                    </div>
                  </div>
                </div>

                {/* Package File Contents Inspector */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-sky-400" />
                      <h4 className="font-bold text-sm text-white">
                        محتویات داخل بسته فشرده {SPORTAVAND_BRAND.technicalStandards.zipFilename}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">۹ فایل استاندارد وردپرس</span>
                  </div>

                  <div className="overflow-x-auto no-scrollbar border border-slate-800 rounded-xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3 font-semibold">مسیر فایل در افزونه</th>
                          <th className="p-3 font-semibold">نوع و زبان</th>
                          <th className="p-3 font-semibold">نقش در سامانه اسپورتاوند</th>
                          <th className="p-3 font-semibold">وضعیت</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {[
                          { path: 'sportavand/sportavand.php', type: 'PHP (Sportavand)', role: 'فایل اصلی افزونه، ثابت‌های SPORTAVAND_*، رندرکننده پابرگ و هوک‌های فعال‌سازی', status: 'آماده' },
                          { path: 'sportavand/includes/class-sportavand-db.php', type: 'PHP', role: 'مدیریت ۹ جدول رابطه‌ای wp_sportavand_* با dbDelta', status: 'آماده' },
                          { path: 'sportavand/includes/class-sportavand-migrator.php', type: 'PHP', role: 'موتور مهاجرت ایمن، نسخه‌دار و تکرارپذیر جداول، گزینه‌ها، متادیتاها و کرون‌جاب', status: 'آماده' },
                          { path: 'sportavand/includes/class-sportavand-api.php', type: 'PHP / REST', role: 'مسیرهای API ثبت‌نام، روستر و استعلام کدملی در /wp-json/sportavand/v1/', status: 'آماده' },
                          { path: 'sportavand/includes/class-sportavand-shortcodes.php', type: 'PHP', role: 'شورت‌کدهای [sportavand_form] و [sportavand_roster] + بلوک‌های sportavand/*', status: 'آماده' },
                          { path: 'sportavand/includes/class-sportavand-admin.php', type: 'PHP / Admin', role: 'منوی پیشخوان وردپرس، روستر، دیتابیس و جدول نگاشت مهاجرت', status: 'آماده' },
                          { path: 'sportavand/assets/sportavand-bundle.js', type: 'Compiled JS', role: 'باندل فرانت‌اند ری‌اکت و کامپوننت‌های اسپورتاوند', status: 'کامپایل‌شده' },
                          { path: 'sportavand/assets/sportavand-bundle.css', type: 'CSS (spv-*)', role: 'استایل‌های ایزوله با پیشوند spv- و متغیرهای --spv-', status: 'کامپایل‌شده' },
                          { path: 'sportavand/readme.txt', type: 'WordPress Readme', role: 'شناسنامه رسمی استاندارد وردپرس، داستان برند و راهنمای نصب', status: 'تکمیل' },
                        ].map((f) => (
                          <tr key={f.path} className="hover:bg-slate-800/30">
                            <td className="p-3 text-amber-400 font-bold" dir="ltr">{f.path}</td>
                            <td className="p-3 text-slate-300" dir="ltr">{f.type}</td>
                            <td className="p-3 font-sans text-slate-300">{f.role}</td>
                            <td className="p-3">
                              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-sans text-[11px]">
                                {f.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: DOX & PROJECT BRAIN (مرکز مستندات، پایش زنده ظرفیت و مغز پروژه) */}
            {/* ========================================================================= */}
            {activeTab === 'brain' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/40 border border-indigo-500/40 rounded-2xl p-6 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                        <Cpu className="w-3.5 h-3.5" />
                        مرکز دانش اسپورتاوند، مستندات رسمی و پایش زنده ظرفیت
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        مغز پایدار پروژه اسپورتاوند (Sportavand) و پایش زنده دیسک و توکن
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                        تمام تصمیمات معماری، جدول نگاشت مهاجرت، وضعیت ۹ جدول <code className="text-amber-300 font-mono">wp_sportavand_*</code> و پایشگر زنده توکن در این بخش تجمیع شده‌اند.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const prompt = `تو مهندس ارشد و مشاور معمار سامانه اسپورتاوند (Sportavand — سامانه جامع مدیریت ورزش · شعار: از سامان تا اوج) هستی.
وضعیت پروژه:
۱. نام و هویت رسمی: Sportavand (اسپورتاوند) با دامنه رسمی sportavand.ir و سازنده Massoud Ebrahimimanesh.
۲. ماژول اول (فعال): Sportavand Basketball — اسپورتاوند بسکتبال (sportavand-basketball).
۳. اسناد مرجع: فایل‌های SPORTAVAND_BRAND.md، docs/UPGRADE_AND_MIGRATION.md و docs/ProjectKnowledge.md.
۴. استانداردهای فنی: پوشه و فایل افزونه sportavand/sportavand.php، فضای نام PHP به نام Sportavand، جداول دیتابیس wp_sportavand_* (۹ جدول)، مسیرهای REST API در sportavand/v1 و شورت‌کدهای رسمی [sportavand_form] و [sportavand_roster].
۵. موتور مهاجرت ایمن Sportavand_Migrator داده‌های قبلی را بدون افت داده منتقل و سازگاری برگه‌ها را حفظ می‌کند.
پروژه را دقیقاً بر اساس نسخه ${SPORTAVAND_BRAND.version} و ساختار فعلی ادامه بده.`;
                        navigator.clipboard.writeText(prompt);
                        setCopiedHandoff(true);
                        setTimeout(() => setCopiedHandoff(false), 2500);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-2 text-xs shrink-0 shadow-lg shadow-amber-500/20"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedHandoff ? 'کپی شد! آماده چت جدید' : 'کپی متن انتقال به چت جدید'}
                    </button>
                  </div>
                </div>

                {/* Sub Tabs for Brain & Telemetry Center */}
                <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar text-xs font-semibold">
                  {[
                    { id: 'handoff', label: 'پایش زنده و واقعی ظرفیت (Real-Time Telemetry)' },
                    { id: 'migration', label: 'جدول نگاشت شناسه‌ها و مهاجرت ایمن' },
                    { id: 'github', label: 'وضعیت مخزن Git و GitHub' },
                    { id: 'adrs', label: 'اسناد تصمیم معماری (ADR)' },
                    { id: 'reality', label: 'جداول دیتابیس (۹ جدول)' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setBrainSubTab(st.id as any)}
                      className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                        brainSubTab === st.id
                          ? 'bg-slate-800 text-amber-400 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* SUB-VIEW 1: REAL-TIME DISK & TOKENIZER TELEMETRY */}
                {brainSubTab === 'handoff' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl">
                      {/* 1. Top Live Status Bar */}
                      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="font-black text-emerald-400">
                            پایش زنده و واقعی ظرفیت (Real-Time Disk &amp; Tokenizer Telemetry)
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-amber-300">
                            آخرین تپش زنده سرور: <strong dir="ltr">{telemetry.serverTime}</strong>
                          </span>
                          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-sky-300">
                            موتور شمارش: شمارشگر رسمی Gemini API (countTokens ✓) / اسکنر زنده بایت دیسک و حافظه (Live UTF-8 Scanner)
                          </span>
                          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-indigo-300">
                            رم زنده سرور: <strong dir="ltr">{telemetry.memory.heapUsedMB} MB / {telemetry.memory.rssMB} MB</strong>
                          </span>
                        </div>
                      </div>

                      {/* 2. Completely Dynamic Title & Description */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                        <div className="space-y-2 max-w-4xl">
                          <h3 className="text-lg sm:text-xl font-black text-white flex flex-wrap items-center gap-2">
                            <span>
                              ظرفیت واقعی مصرف‌شده در این نشست: {telemetry.capacity.percentUsed.toFixed(2)}% — [{telemetry.capacity.statusLabel}]
                            </span>
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            پایش ۱۰۰٪ زنده و اختصاصی پروژه <strong>«{telemetry.appName}»</strong>: محاسبه‌شده از{' '}
                            <strong className="text-amber-400">{telemetry.categories.docs.activeCount} سند فعال</strong> در حافظه ({telemetry.categories.docs.activeKB} KB)،{' '}
                            <strong className="text-indigo-400">{telemetry.categories.sourceCode.sizeKB} KB سورس‌کد واقعی</strong> روی دیسک سرور ({telemetry.categories.sourceCode.fileCount} فایل کد)،{' '}
                            <strong className="text-emerald-400">{telemetry.categories.dataIndex.sizeKB} KB ایندکس داده‌ها و هسته افزونه وردپرس Sportavand</strong>، و{' '}
                            <strong className="text-sky-400">{telemetry.categories.liveSession.totalKB} KB ترافیک زنده نشست و پیش‌نویس در حال تایپ</strong>.
                          </p>
                        </div>

                        <button
                          onClick={handleRescanLiveMetrics}
                          disabled={isScanningMetrics}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-400 border border-slate-700 font-bold transition text-xs flex items-center gap-2 shrink-0 shadow-md"
                        >
                          <RefreshCw className={`w-4 h-4 ${isScanningMetrics ? 'animate-spin' : ''}`} />
                          {isScanningMetrics ? 'در حال اسکن دیسک...' : 'اسکن آنی دیسک سرور'}
                        </button>
                      </div>

                      {/* 3. Progress Bar with Warning Threshold Rulers */}
                      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white">
                              توکن‌های واقعی در حافظه فعال:{' '}
                              <strong className="font-mono text-amber-400 text-sm">
                                {telemetry.capacity.totalActiveTokens.toLocaleString('en-US')}
                              </strong>{' '}
                              از <strong className="font-mono text-slate-300">1,000,000</strong> توکن
                            </span>
                            <span className="font-mono text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                              (+{telemetry.capacity.draftTokens.toLocaleString('en-US')} توکن در حال تایپ شما)
                            </span>
                          </div>

                          <div className="font-bold text-emerald-400">
                            ظرفیت آزاد واقعی:{' '}
                            <strong className="font-mono text-sm">
                              {telemetry.capacity.freeTokens.toLocaleString('en-US')}
                            </strong>{' '}
                            توکن ({telemetry.capacity.freePercent.toFixed(2)}%)
                          </div>
                        </div>

                        <div className="relative pt-2 pb-6">
                          <div className="w-full bg-slate-900 h-5 rounded-xl overflow-hidden border border-slate-800 relative">
                            <div
                              className={`h-full transition-all duration-300 ${
                                telemetry.capacity.percentUsed < 50
                                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400'
                                  : telemetry.capacity.percentUsed <= 75
                                  ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-400'
                                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(1, telemetry.capacity.percentUsed))}%` }}
                            ></div>

                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10"
                              style={{ right: '50%' }}
                              title="50% — شروع هشدار ظرفیت"
                            />
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-rose-500/90 z-10"
                              style={{ right: '75%' }}
                              title="75% — سقف هشدار Handoff"
                            />
                          </div>

                          <div className="relative w-full text-[10px] font-mono text-slate-400 mt-1.5 flex justify-between">
                            <span className="text-emerald-400 font-bold">0%</span>
                            <span
                              className="absolute text-amber-400 font-semibold -translate-x-1/2"
                              style={{ right: '50%' }}
                            >
                              50% (شروع هشدار ظرفیت)
                            </span>
                            <span
                              className="absolute text-rose-400 font-semibold -translate-x-1/2"
                              style={{ right: '75%' }}
                            >
                              75% (سقف هشدار Handoff)
                            </span>
                            <span className="text-slate-300 font-bold">100% (1M Tokens)</span>
                          </div>
                        </div>
                      </div>

                      {/* 4. FOUR LIVE BREAKDOWN CARDS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CARD 1 */}
                        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                                <h4 className="font-bold text-xs sm:text-sm text-white">
                                  ۱. اسناد و مارک‌داون‌های فعال در حافظه
                                </h4>
                              </div>
                              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                                {telemetry.categories.docs.activeCount} / {telemetry.categories.docs.totalCount} سند فعال
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                              <div>
                                <span className="text-slate-400 text-[11px] block">حجم واقعی فعال روی دیسک:</span>
                                <span className="font-mono font-black text-white text-sm">
                                  {telemetry.categories.docs.activeKB} KB
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[11px] block">توکن‌های اسناد فعال:</span>
                                <span className="font-mono font-black text-amber-400 text-sm">
                                  {telemetry.categories.docs.tokens.toLocaleString('en-US')} توکن
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {telemetry.categories.docs.files.map((doc) => (
                                <label
                                  key={doc.path}
                                  onClick={() => handleToggleDocumentActive(doc.path)}
                                  className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition select-none ${
                                    doc.enabled
                                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-100'
                                      : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-65'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={doc.enabled}
                                      onChange={() => {}}
                                      className="rounded text-amber-500 bg-slate-950 border-slate-700"
                                    />
                                    <span className="font-mono text-[11px] truncate" dir="ltr">
                                      {doc.filename}
                                    </span>
                                  </div>
                                  <div className="font-mono text-[11px] shrink-0 flex items-center gap-2">
                                    <span className="text-slate-400">{doc.sizeKB} KB</span>
                                    <span className={doc.enabled ? 'text-amber-300 font-bold' : 'text-slate-500 line-through'}>
                                      {doc.tokens.toLocaleString('en-US')} tok
                                    </span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* CARD 2 */}
                        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                              <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                                <h4 className="font-bold text-xs sm:text-sm text-white">
                                  ۲. ایندکس داده‌ها و هسته افزونه Sportavand
                                </h4>
                              </div>
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                                {telemetry.categories.dataIndex.fileCount} فایل داده/افزونه
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                              <div>
                                <span className="text-slate-400 text-[11px] block">حجم واقعی روی دیسک:</span>
                                <span className="font-mono font-black text-white text-sm">
                                  {telemetry.categories.dataIndex.sizeKB} KB
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[11px] block">توکن‌های ایندکس داده:</span>
                                <span className="font-mono font-black text-emerald-400 text-sm">
                                  {telemetry.categories.dataIndex.tokens.toLocaleString('en-US')} توکن
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              شامل حجم واقعی فایل‌های داده، اسکیمای ۹ جدول دیتابیس (<code className="text-emerald-400 font-mono">class-sportavand-db.php</code>)، موتور مهاجرت (<code className="text-emerald-400 font-mono">class-sportavand-migrator.php</code>) و باندل‌های افزونه وردپرس.
                            </p>

                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-[11px] font-mono">
                              {telemetry.categories.dataIndex.files.map((f) => (
                                <div key={f.path} className="flex items-center justify-between py-1 border-b border-slate-900 text-slate-300">
                                  <span className="truncate" dir="ltr">{f.path}</span>
                                  <span className="text-emerald-400 shrink-0">{f.sizeKB} KB ({f.tokens.toLocaleString('en-US')} tok)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* CARD 3 */}
                        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                              <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
                                <h4 className="font-bold text-xs sm:text-sm text-white">
                                  ۳. سورس‌کد واقعی اپلیکیشن روی دیسک
                                </h4>
                              </div>
                              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                                {telemetry.categories.sourceCode.fileCount} فایل کد فعال
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                              <div>
                                <span className="text-slate-400 text-[11px] block">حجم بایت کد روی دیسک:</span>
                                <span className="font-mono font-black text-white text-sm">
                                  {telemetry.categories.sourceCode.sizeKB} KB
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[11px] block">توکن‌های سورس‌کد:</span>
                                <span className="font-mono font-black text-indigo-400 text-sm">
                                  {telemetry.categories.sourceCode.tokens.toLocaleString('en-US')} توکن
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-[11px] font-mono">
                              {telemetry.categories.sourceCode.files.map((f) => (
                                <div key={f.path} className="flex items-center justify-between py-1 border-b border-slate-900 text-slate-300">
                                  <span className="truncate" dir="ltr">{f.path}</span>
                                  <span className="text-indigo-400 shrink-0">{f.sizeKB} KB ({f.tokens.toLocaleString('en-US')} tok)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* CARD 4 */}
                        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-sky-400 shrink-0" />
                                <h4 className="font-bold text-xs sm:text-sm text-white">
                                  ۴. نشست زنده، فایل‌های باز و پیش‌نویس شما
                                </h4>
                              </div>
                              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                                +{telemetry.capacity.draftTokens.toLocaleString('en-US')} توکن تایپ زنده
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                              <div>
                                <span className="text-slate-400 text-[11px] block">حجم ترافیک نشست و تایپ:</span>
                                <span className="font-mono font-black text-white text-sm">
                                  {telemetry.categories.liveSession.totalKB} KB ({telemetry.categories.liveSession.totalBytes.toLocaleString('en-US')} B)
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[11px] block">توکن‌های نشست زنده:</span>
                                <span className="font-mono font-black text-sky-400 text-sm">
                                  {telemetry.categories.liveSession.tokens.toLocaleString('en-US')} توکن
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[11px] text-slate-300 font-semibold">
                                پیش‌نویس زنده مارک‌داون / یادداشت شما (به محض تایپ، وزن توکن در لحظه محاسبه می‌شود):
                              </label>
                              <textarea
                                rows={3}
                                value={liveDraftMarkdown}
                                onChange={(e) => setLiveDraftMarkdown(e.target.value)}
                                placeholder="هر متنی یا دستوری اینجا تایپ کنید تا وزن آنی توکن (+N توکن در حال تایپ شما) و تغییر درصد ظرفیت را در لحظه ببینید..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <span>کاراکتر در حال تایپ: {telemetry.capacity.draftChars}</span>
                                <span className="text-amber-400 font-bold">
                                  وزن زنده: +{telemetry.capacity.draftTokens} توکن ({telemetry.capacity.draftBytes} بایت UTF-8)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 2: MIGRATION MAPPING */}
                {brainSubTab === 'migration' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fadeIn">
                    <h3 className="text-base font-black text-white">
                      جدول نگاشت شناسه‌های قدیم به جدید (Sportavand v{SPORTAVAND_BRAND.version})
                    </h3>
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
                          <tr>
                            <th className="p-3 font-bold">بخش</th>
                            <th className="p-3 font-bold">شناسه قبلی</th>
                            <th className="p-3 font-bold">شناسه جدید (Sportavand)</th>
                            <th className="p-3 font-bold">استراتژی مهاجرت</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70">
                          {IDENTIFIER_MAPPING_TABLE.map((item) => (
                            <tr key={item.category}>
                              <td className="p-3 font-bold text-white">{item.category}</td>
                              <td className="p-3 font-mono text-slate-400" dir="ltr">{item.legacyIdentifier}</td>
                              <td className="p-3 font-mono text-emerald-400 font-bold" dir="ltr">{item.newIdentifier}</td>
                              <td className="p-3 text-slate-300">{item.migrationStrategy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 3: GITHUB SYNC */}
                {brainSubTab === 'github' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
                              GitHub Repository Connector
                            </span>
                            <span className="text-xs text-slate-400 font-mono">شاخه هدف: rebrand/sportavand</span>
                          </div>
                          <h3 className="text-base font-black text-white flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-indigo-400" />
                            بررسی اتصال و همگام‌سازی گیت‌هاب
                          </h3>
                        </div>

                        <a
                          href="https://github.com/settings/tokens/new?scopes=repo&description=Sportavand+AI+Studio"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-semibold transition text-xs flex items-center gap-2 shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          ساخت توکن گیت‌هاب (Scope: repo)
                        </a>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8 space-y-2">
                          <label className="block text-xs font-semibold text-slate-300">
                            توکن دسترسی شخصی (GitHub Personal Access Token):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={githubToken}
                              onChange={(e) => setGithubToken(e.target.value)}
                              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={handleTestGitHubConnection}
                              disabled={githubLoading}
                              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition text-xs flex items-center gap-2 shrink-0"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              بررسی اتصال
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
                          <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-amber-400" />
                            مالک مخزن:
                          </div>
                          <div className="font-mono text-white">{githubUser?.login || 'masoudebrahimimanesh'}</div>
                          <div className="text-[11px] text-slate-400">طراح و توسعه‌دهنده: {SPORTAVAND_BRAND.creator}</div>
                        </div>
                      </div>

                      {githubError && (
                        <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{githubError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 4: ADRS */}
                {brainSubTab === 'adrs' && (
                  <div className="space-y-4 animate-fadeIn">
                    {ADR_LIST.map((adr) => (
                      <div key={adr.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-400">{adr.id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {adr.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{adr.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{adr.decision}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* SUB-VIEW 5: DATABASE REALITY (9 TABLES) */}
                {brainSubTab === 'reality' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn text-xs">
                    {CURRENT_REALITY.tables.map((t) => (
                      <div key={t.name} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                        <div className="font-mono text-amber-400 font-bold mb-1" dir="ltr">wp_{t.name}</div>
                        <div className="text-slate-300 text-[11px]">{t.role}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: DATABASE STATUS (وضعیت پایگاه‌داده ۹ جدول اختصاصی Sportavand) */}
            {/* ========================================================================= */}
            {activeTab === 'database' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                        <Database className="w-3.5 h-3.5" />
                        پایگاه‌داده رابطه‌ای بهینه‌شده اسپورتاوند (Sportavand)
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        وضعیت ساختار ۹ جدول اختصاصی Sportavand در دیتابیس وردپرس
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                        این سامانه برای تضمین سرعت بالا در مقیاس‌های بیش از ۱۰۰ هزار ورزشکار، هیچ داده‌ای در جدول سنگین <code className="text-amber-400 font-mono">wp_postmeta</code> ذخیره نکرده و از جداول استاندارد MySQL با پیشوند <code className="text-emerald-400 font-mono">wp_sportavand_*</code> استفاده می‌کند.
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-xs font-mono shrink-0 text-center">
                      <div className="text-[11px] text-slate-400">تعداد جداول فعال:</div>
                      <div className="text-lg font-black text-emerald-300">۹ / ۹ جدول</div>
                    </div>
                  </div>
                </div>

                {/* 9 Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'wp_sportavand_migrations', role: 'ثبت لاگ و تاریخچه نسخه‌های اسکیمای پایگاه‌داده و مهاجرت‌ها', badge: 'جدول سیستمی' },
                    { name: 'wp_sportavand_installations', role: 'تنظیمات اولیه نصب، کلیدهای عمومی و اطلاعات فنی سامانه', badge: 'سیستم' },
                    { name: 'wp_sportavand_organizations', role: 'باشگاه‌ها، هیئت‌های استانی، فدراسیون و آکادمی‌های ورزشی', badge: 'سازمان‌ها' },
                    { name: 'wp_sportavand_workspaces', role: 'فضاهای کاری چندمستأجری ماژول بسکتبال (sportavand-basketball)', badge: 'چندمستأجری' },
                    { name: 'wp_sportavand_audit_events', role: 'لاگ ممیزی امنیتی، تصمیمات مأموران، ثبت تغییرات و آی‌پی', badge: 'امنیت' },
                    { name: 'wp_sportavand_persons', role: 'پرونده هویتی یکتای هر انسان با کلید کدملی ۱۰ رقمی ثبت‌احوال', badge: 'یکتایی هویت' },
                    { name: 'wp_sportavand_account_links', role: 'اتصال امن شناسه‌های کاربران وردپرس به شخص مدنی', badge: 'ورود' },
                    { name: 'wp_sportavand_memberships', role: 'عضویت‌ها، چندنقشی (بازیکن، مربی)، شماره پیراهن و رده‌های سنی', badge: 'چندنقشی' },
                    { name: 'wp_sportavand_reviewers', role: 'ناظرین و بازبین‌های مجاز جهت تأیید مدارک و استعلام‌ها', badge: 'سطوح دسترسی' },
                  ].map((tbl, idx) => (
                    <div key={tbl.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-mono">#{idx + 1}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-semibold">
                          {tbl.badge}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-amber-400" dir="ltr">
                        {tbl.name}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {tbl.role}
                      </p>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>وضعیت:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          همگام و آماده
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Player Registration Simulator Modal */}
            {showPlayerRegisterSimulator && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <FileInput className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">پیش‌نمایش فرم ثبت‌نام از نگاه بازیکن — اسپورتاوند بسکتبال</h3>
                        <p className="text-xs text-slate-400">شورت‌کد فعال: [sportavand_form id="17"]</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPlayerRegisterSimulator(false)}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">فرم ۱۷ · ثبت‌نام رسمی مسابقات بسکتبال (Sportavand Basketball)</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">باشگاه فرهنگی ورزشی اروند خوزستان</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">کد ملی ۱۰ رقمی بازیکن (استعلام هویت):</label>
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="مثال: 1740001122"
                          value={checkNationalCodeInput}
                          onChange={(e) => setCheckNationalCodeInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          * استعلام فوری در جدول wp_sportavand_persons انجام می‌شود. در صورت سابقه قبلی، مشخصات فراخوانی شده و پرونده تکراری ایجاد نمی‌شود.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 mb-1">نام:</label>
                          <input
                            type="text"
                            placeholder="علیرضا"
                            value={newMemberForm.firstName}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, firstName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1">نام خانوادگی:</label>
                          <input
                            type="text"
                            placeholder="محمدی"
                            value={newMemberForm.lastName}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, lastName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1">شماره تماس همراه:</label>
                          <input
                            type="text"
                            placeholder="09160000000"
                            value={newMemberForm.phone}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1">شماره پیراهن پیشنهادی:</label>
                          <input
                            type="text"
                            placeholder="7"
                            value={newMemberForm.jerseyNumber}
                            onChange={(e) => setNewMemberForm({ ...newMemberForm, jerseyNumber: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400">
                        ✓ پس از ارسال، کارت دیجیتال موقت اسپورتاوند با کد پیگیری صادر می‌شود.
                      </span>
                      <button
                        onClick={() => {
                          handleConfirmAddMember();
                          setShowPlayerRegisterSimulator(false);
                        }}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs"
                      >
                        ارسال آزمایشی ثبت‌نام بازیکن
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Reusable Official Footer Component (Single Source of Truth for Version, Dynamic Section/Module, Dynamic Year, FA/EN Support) */}
      <Footer
        sectionFa={currentFooterSection.fa}
        sectionEn={currentFooterSection.en}
      />
    </div>
  );
}
