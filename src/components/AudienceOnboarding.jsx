import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  Users,
  BookOpen,
  Star,
  MessageSquare,
  Search,
  MapPin,
  Globe,
  FileText,
  Stethoscope,
  FlaskConical,
  Heart,
  Bookmark,
  Link as LinkIcon,
  Plus,
  CheckCircle,
  Shield,
  Tag,
  Mail,
  Fingerprint,
  Loader2,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function useLocalUser() {
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    let id = localStorage.getItem('curalink_user_id');
    if (!id) {
      id = uuid();
      localStorage.setItem('curalink_user_id', id);
    }
    setUserId(id);
  }, []);
  return userId;
}

function Card({ title, description, icon: Icon, items, anchor, onPrimary }) {
  return (
    <div id={anchor} className="group relative rounded-2xl border border-slate-200/60 bg-white shadow-sm hover:shadow-xl transition overflow-hidden">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-100 blur-2xl opacity-70 group-hover:opacity-100 transition" />
      <div className="p-6 sm:p-8 relative">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-600/10 text-sky-600 flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        </div>
        <p className="mt-3 text-slate-600">{description}</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {items.map((it) => (
            <li key={it} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={onPrimary} className="inline-flex items-center px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition">
            Continue as {title.split(' ')[1] || title}
          </button>
          <a href="#features" className="inline-flex items-center px-4 py-2 rounded-md border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition">
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm transition ${selected ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
    >
      {label}
    </button>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {eyebrow && (
        <span className="inline-block rounded-full bg-slate-900 text-white text-xs px-3 py-1">{eyebrow}</span>
      )}
      <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
      {description && <p className="mt-3 text-slate-600">{description}</p>}
    </div>
  );
}

function LoadingInline({ label }) {
  return (
    <span className="inline-flex items-center gap-2 text-slate-500 text-sm">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </span>
  );
}

export default function AudienceOnboarding() {
  const userId = useLocalUser();
  const [activeFlow, setActiveFlow] = useState(null); // 'patient' | 'researcher' | null

  // Shared state
  const [favorites, setFavorites] = useState([]); // persisted per user via API
  const [favLoading, setFavLoading] = useState(false);

  // Patient state
  const [patient, setPatient] = useState({ name: '', email: '' });
  const [patientText, setPatientText] = useState('');
  const [locations, setLocations] = useState({ city: '', country: '' });
  const [globalExperts, setGlobalExperts] = useState(false);
  const [conditions, setConditions] = useState(['Glioma']);
  const [submitted, setSubmitted] = useState(false);
  const [pubQuery, setPubQuery] = useState('');
  const [pubResults, setPubResults] = useState([]);
  const [pubLoading, setPubLoading] = useState(false);

  // Researcher state
  const specialtiesOpts = ['Oncology', 'Neurology', 'Immunology', 'Genetics', 'Radiology'];
  const interestOpts = ['Immunotherapy', 'Clinical AI', 'Gene Therapy', 'Precision Medicine'];
  const [specialties, setSpecialties] = useState(['Oncology']);
  const [interests, setInterests] = useState(['Immunotherapy']);
  const [orcid, setOrcid] = useState('');
  const [researchGate, setResearchGate] = useState('');
  const [availableMeetings, setAvailableMeetings] = useState(true);
  const [rgPubs, setRgPubs] = useState([]);
  const [rgLoading, setRgLoading] = useState(false);

  const popularConditions = ['Glioma', 'Lung Cancer', 'Breast Cancer', 'Leukemia', 'Brain Cancer'];

  // Simple in-memory cache for searches
  const pubCache = useRef(new Map());

  // Load favorites on mount
  useEffect(() => {
    if (!userId || !API_BASE) return;
    const fetchFavs = async () => {
      try {
        setFavLoading(true);
        const res = await fetch(`${API_BASE}/api/favorites?user_id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error('Failed to fetch favorites');
        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : data.items || []);
      } catch (e) {
        // no-op for demo
      } finally {
        setFavLoading(false);
      }
    };
    fetchFavs();
  }, [userId]);

  // Debounced PubMed search via backend
  useEffect(() => {
    const q = pubQuery.trim();
    if (!API_BASE) return;
    if (q.length < 3) {
      setPubResults([]);
      return;
    }
    const key = `pub:${q}`;
    const cached = pubCache.current.get(key);
    if (cached) {
      setPubResults(cached);
      return;
    }
    const id = setTimeout(async () => {
      try {
        setPubLoading(true);
        const res = await fetch(`${API_BASE}/api/pubmed/search?query=${encodeURIComponent(q)}&max_results=10`);
        if (!res.ok) throw new Error('PubMed search failed');
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.results || [];
        setPubResults(items);
        pubCache.current.set(key, items);
      } catch (e) {
        setPubResults([]);
      } finally {
        setPubLoading(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [pubQuery]);

  const filteredPublications = useMemo(() => {
    if (pubResults.length > 0) return pubResults;
    const corpus = [
      { id: 'nejm-glioma-1', title: 'Targeted therapies for glioma: a 2024 overview', journal: 'NEJM', url: 'https://www.nejm.org/' },
      { id: 'jama-lung-1', title: 'Screening advances in lung cancer', journal: 'JAMA', url: 'https://jamanetwork.com/' },
      { id: 'natmed-immuno-1', title: 'New frontiers in immunotherapy', journal: 'Nature Medicine', url: 'https://www.nature.com/nm/' },
      { id: 'lancet-ai-1', title: 'Clinical AI in oncology: promise and pitfalls', journal: 'The Lancet', url: 'https://www.thelancet.com/' },
      { id: 'jco-biomarkers-1', title: 'Biomarkers driving personalized cancer care', journal: 'Journal of Clinical Oncology', url: 'https://ascopubs.org/journal/jco' },
    ];
    if (!pubQuery) return corpus;
    const q = pubQuery.toLowerCase();
    return corpus.filter((p) => p.title.toLowerCase().includes(q) || p.journal.toLowerCase().includes(q));
  }, [pubResults, pubQuery]);

  const recommendations = useMemo(() => {
    if (!submitted) return null;
    const base = conditions.join(', ') || patientText || 'your interests';
    return {
      publications: [
        { id: 'rec-pub-1', title: `Recent advances in ${conditions[0] || 'oncology'}`, by: 'Journal of Clinical Medicine', url: 'https://www.ncbi.nlm.nih.gov/pubmed/' },
        { id: 'rec-pub-2', title: `${conditions[0] || 'Cancer'} biomarkers overview`, by: 'Nature Reviews', url: 'https://www.nature.com/' },
      ],
      experts: [
        { id: 'exp-1', name: 'Dr. A. Navarro', specialty: conditions[0] || 'Oncology', location: globalExperts ? 'Global' : (locations.city || 'Nearby') },
        { id: 'exp-2', name: 'Dr. L. Chen', specialty: 'Immunotherapy', location: globalExperts ? 'Global' : (locations.city || 'Nearby') },
      ],
      trials: [
        { id: 'trial-1', title: `${conditions[0] || 'Cancer'} Phase II Trial`, status: 'Recruiting' },
        { id: 'trial-2', title: `Immunotherapy for ${conditions[0] || 'solid tumors'}`, status: 'Active' },
      ],
      context: base,
    };
  }, [submitted, conditions, patientText, locations, globalExperts]);

  const toggleCondition = (label) => {
    setConditions((prev) => (prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]));
  };

  const toggleSpecialty = (label) => {
    setSpecialties((prev) => (prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]));
  };
  const toggleInterest = (label) => {
    setInterests((prev) => (prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]));
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!API_BASE || !userId) return;
    try {
      const body = {
        user_id: userId,
        name: patient.name,
        email: patient.email,
        conditions,
        city: locations.city,
        country: locations.country,
        global_experts: globalExperts,
        pub_query: pubQuery,
        submitted: true,
      };
      await fetch(`${API_BASE}/api/patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      // ignore in demo
    }
  };

  const handleResearcherSave = async () => {
    if (!API_BASE || !userId) return;
    try {
      const body = {
        user_id: userId,
        specialties,
        interests,
        orcid,
        researchgate_url: researchGate,
        available_meetings: availableMeetings,
      };
      await fetch(`${API_BASE}/api/researcher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Fetch mocked publications from ResearchGate/ORCID endpoint if provided
      if (orcid || researchGate) {
        setRgLoading(true);
        const res = await fetch(`${API_BASE}/api/researchgate/publications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orcid, profile_url: researchGate }),
        });
        const data = await res.json();
        setRgPubs(Array.isArray(data) ? data : data.items || []);
        setRgLoading(false);
      }
    } catch (e) {
      setRgLoading(false);
    }
  };

  const addFavorite = async (fav) => {
    // optimistic update then persist
    setFavorites((prev) => (prev.find((f) => f.ref_id === fav.ref_id && f.type === fav.type) ? prev : [...prev, fav]));
    if (!API_BASE || !userId) return;
    try {
      await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fav, user_id: userId, role: activeFlow || 'patient' }),
      });
    } catch (e) {
      // rollback not necessary for demo
    }
  };

  const removeFavorite = (fav) => {
    // Backend delete not implemented yet; just optimistic UI removal
    setFavorites((prev) => prev.filter((f) => !(f.ref_id === fav.ref_id && f.type === fav.type)));
  };

  const isFavorite = (fav) => favorites.some((f) => f.ref_id === fav.ref_id && f.type === fav.type);

  const postQuestion = async (text) => {
    if (!API_BASE || !userId || !text.trim()) return;
    try {
      const title = text.trim().slice(0, 60);
      await fetch(`${API_BASE}/api/forums/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role: 'patient', title, body: text, tags: conditions.slice(0, 2) }),
      });
    } catch {}
  };

  return (
    <section id="onboarding" className="relative bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <SectionTitle
          eyebrow="Onboarding"
          title="Choose your path"
          description="A minimal, guided start for patients and researchers."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            anchor="patients"
            title="For Patients"
            description="Tell us about your condition to personalize trials, experts, and publications."
            icon={User}
            items={[
              'Natural language profile (e.g., “I have Brain Cancer”)',
              'Add conditions like Glioma or Lung Cancer',
              'Filter by location or explore globally',
            ]}
            onPrimary={() => setActiveFlow('patient')}
          />
          <Card
            anchor="researchers"
            title="For Researchers"
            description="Accelerate research with collaborators and qualified participants."
            icon={Users}
            items={[
              'Create a profile with specialties and interests',
              'Auto-import publications via ORCID/ResearchGate',
              'Manage trials and engage in forums',
            ]}
            onPrimary={() => setActiveFlow('researcher')}
          />
        </div>

        {activeFlow === 'patient' && (
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Profile setup</h3>
                  <p className="text-sm text-slate-600">Describe your situation in natural language. We’ll detect conditions and tailor results.</p>
                </div>
              </div>

              <form onSubmit={handlePatientSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Name</span>
                    <input
                      type="text"
                      value={patient.name}
                      onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                      placeholder="Alex Taylor"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span>
                    <input
                      type="email"
                      value={patient.email}
                      onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-800 flex items-center gap-2"><Search className="h-4 w-4" /> Describe your condition</span>
                  <textarea
                    value={patientText}
                    onChange={(e) => setPatientText(e.target.value)}
                    placeholder="e.g., I was diagnosed with brain cancer and experiencing headaches."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent min-h-[96px]"
                  />
                </label>

                <div>
                  <span className="text-sm font-medium text-slate-800">Quick add conditions</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {popularConditions.map((c) => (
                      <Chip key={c} label={c} selected={conditions.includes(c)} onClick={() => toggleCondition(c)} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-2"><MapPin className="h-4 w-4" /> City</span>
                    <input
                      type="text"
                      value={locations.city}
                      onChange={(e) => setLocations({ ...locations, city: e.target.value })}
                      placeholder="San Francisco"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-800">Country</span>
                    <input
                      type="text"
                      value={locations.country}
                      onChange={(e) => setLocations({ ...locations, country: e.target.value })}
                      placeholder="United States"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-2"><Globe className="h-4 w-4" /> Global experts</span>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setGlobalExperts((v) => !v)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${globalExperts ? 'bg-sky-600' : 'bg-slate-200'}`}
                        aria-pressed={globalExperts}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${globalExperts ? 'translate-x-5' : 'translate-x-1'}`}
                        />
                      </button>
                      <span className="text-sm text-slate-600">{globalExperts ? 'Showing experts globally' : 'Prioritize proximity'}</span>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <button type="submit" className="inline-flex items-center px-5 py-3 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition">Save profile</button>
                </div>
              </form>

              <div className="mt-10 border-t border-slate-200 pt-6">
                <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Publications</h4>
                <p className="text-sm text-slate-600">Search via PubMed and save papers you care about. Results are cached for speed.</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={pubQuery}
                      onChange={(e) => setPubQuery(e.target.value)}
                      type="text"
                      placeholder="e.g., glioma, immunotherapy, biomarkers"
                      className="w-full rounded-xl border border-slate-200 bg-white/50 pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  {pubLoading && <LoadingInline label="Searching" />}
                </div>
                <ul className="mt-4 space-y-3">
                  {filteredPublications.map((p) => (
                    <li key={p.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-4">
                      <div>
                        <div className="font-medium text-slate-900">{p.title}</div>
                        {p.journal && <div className="text-xs text-slate-500">{p.journal}{p.year ? ` • ${p.year}` : ''}</div>}
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-sky-700 hover:text-sky-900">
                            <LinkIcon className="h-4 w-4" /> View full paper
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => (isFavorite({ type: 'publication', ref_id: p.id }) ? removeFavorite({ type: 'publication', ref_id: p.id }) : addFavorite({ type: 'publication', ref_id: p.id, title: p.title }))}
                        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${isFavorite({ type: 'publication', ref_id: p.id }) ? 'border-rose-200 text-rose-600 bg-rose-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite({ type: 'publication', ref_id: p.id }) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        {isFavorite({ type: 'publication', ref_id: p.id }) ? 'Saved' : 'Save'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 border-t border-slate-200 pt-6">
                <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Forums</h4>
                <p className="text-sm text-slate-600">Spaces for discussions. Patients can post questions; only researchers can reply.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Cancer Research', 'Clinical Trials Insights', 'Immunotherapy', 'Genetics'].map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"><Tag className="h-3.5 w-3.5" /> {c}</span>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <label className="block text-sm font-medium text-slate-800 mb-2">Ask a question</label>
                  <textarea id="patient-question" className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g., What are the eligibility criteria for glioma trials?" />
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Only researchers can reply</span>
                    <button onClick={() => {
                      const el = document.getElementById('patient-question');
                      postQuestion(el?.value || '');
                      if (el) el.value = '';
                    }} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 text-white">
                      <Plus className="h-3.5 w-3.5" /> Post question
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900">What you’ll see</h3>
              <p className="text-sm text-slate-600">A personalized dashboard with recommended publications, health experts, and clinical trials.</p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-800"><FileText className="h-4 w-4" /> Publications</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>Explainable summaries to simplify complex papers</li>
                    <li>Direct links to journals</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-800"><Stethoscope className="h-4 w-4" /> Health experts</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>Specialties and research interests</li>
                    <li>Follow or request a meeting</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                  <div className="flex items-center gap-2 text-slate-800"><FlaskConical className="h-4 w-4" /> Clinical trials</div>
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                    <li>Search by keywords and filter by status/location</li>
                    <li>Quick email contact to trial administrators</li>
                  </ul>
                </div>
              </div>

              {submitted && recommendations && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <p className="text-sm text-slate-500">Recommended based on <span className="font-medium text-slate-700">{recommendations.context}</span>:</p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 text-slate-800"><FileText className="h-4 w-4" /> Publications</div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {recommendations.publications.map((p) => (
                          <li key={p.id} className="flex items-start justify-between gap-3">
                            <div>
                              <span className="font-medium">{p.title}</span>
                              <span className="block text-xs text-slate-500">{p.by}</span>
                              <a href={p.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-900"><LinkIcon className="h-3.5 w-3.5" /> Full paper</a>
                            </div>
                            <button
                              onClick={() => (isFavorite({ type: 'publication', ref_id: p.id }) ? removeFavorite({ type: 'publication', ref_id: p.id }) : addFavorite({ type: 'publication', ref_id: p.id, title: p.title }))}
                              className={`h-8 w-8 inline-flex items-center justify-center rounded-md border ${isFavorite({ type: 'publication', ref_id: p.id }) ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                              aria-label="save publication"
                            >
                              <Heart className={`h-4 w-4 ${isFavorite({ type: 'publication', ref_id: p.id }) ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 text-slate-800"><Stethoscope className="h-4 w-4" /> Health Experts</div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {recommendations.experts.map((e) => (
                          <li key={e.id} className="flex items-start justify-between gap-3">
                            <div>
                              <span className="font-medium">{e.name}</span>
                              <span className="block text-xs text-slate-500">{e.specialty} • {e.location}</span>
                            </div>
                            <button
                              onClick={() => (isFavorite({ type: 'expert', ref_id: e.id }) ? removeFavorite({ type: 'expert', ref_id: e.id }) : addFavorite({ type: 'expert', ref_id: e.id, title: e.name }))}
                              className={`h-8 w-8 inline-flex items-center justify-center rounded-md border ${isFavorite({ type: 'expert', ref_id: e.id }) ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                              aria-label="save expert"
                            >
                              <Bookmark className={`h-4 w-4 ${isFavorite({ type: 'expert', ref_id: e.id }) ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 text-slate-800"><FlaskConical className="h-4 w-4" /> Clinical Trials</div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {recommendations.trials.map((t) => (
                          <li key={t.id} className="flex items-start justify-between gap-3">
                            <div>
                              <span className="font-medium">{t.title}</span>
                              <span className="block text-xs text-slate-500">{t.status}</span>
                            </div>
                            <button
                              onClick={() => (isFavorite({ type: 'trial', ref_id: t.id }) ? removeFavorite({ type: 'trial', ref_id: t.id }) : addFavorite({ type: 'trial', ref_id: t.id, title: t.title }))}
                              className={`h-8 w-8 inline-flex items-center justify-center rounded-md border ${isFavorite({ type: 'trial', ref_id: t.id }) ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                              aria-label="save trial"
                            >
                              <Bookmark className={`h-4 w-4 ${isFavorite({ type: 'trial', ref_id: t.id }) ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-slate-200 p-4">
                    <h5 className="font-semibold text-slate-900 flex items-center gap-2"><Star className="h-4 w-4" /> My Favorites {favLoading && <LoadingInline label="Loading" />}</h5>
                    {favorites.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-600">Save publications, clinical trials, and health experts to see them here.</p>
                    ) : (
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {favorites.map((f, idx) => (
                          <li key={`${f.type}-${f.ref_id}-${idx}`} className="flex items-center justify-between gap-2">
                            <span className="truncate">
                              <span className="uppercase text-xs text-slate-500 mr-2">{f.type}</span>
                              {f.title || f.name || f.ref_id}
                            </span>
                            <button onClick={() => removeFavorite(f)} className="text-xs text-slate-500 hover:text-rose-600">Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeFlow === 'researcher' && (
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900">Profile setup (Researcher)</h3>
              <p className="text-sm text-slate-600">Provide background and expertise to connect with collaborators and opportunities.</p>

              <div className="mt-6 space-y-5">
                <div>
                  <span className="text-sm font-medium text-slate-800">Specialties</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {specialtiesOpts.map((s) => (
                      <Chip key={s} label={s} selected={specialties.includes(s)} onClick={() => toggleSpecialty(s)} />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-800">Research Interests</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {interestOpts.map((s) => (
                      <Chip key={s} label={s} selected={interests.includes(s)} onClick={() => toggleInterest(s)} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-800">ORCID (optional)</span>
                    <input value={orcid} onChange={(e) => setOrcid(e.target.value)} placeholder="0000-0000-0000-0000" className="mt-2 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-800">ResearchGate (optional)</span>
                    <input value={researchGate} onChange={(e) => setResearchGate(e.target.value)} placeholder="https://www.researchgate.net/profile/Your-Name" className="mt-2 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </label>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-800">Availability for meetings</span>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAvailableMeetings((v) => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${availableMeetings ? 'bg-sky-600' : 'bg-slate-200'}`}
                      aria-pressed={availableMeetings}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${availableMeetings ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-slate-600">{availableMeetings ? 'Available for meetings' : 'Not available for meetings'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={handleResearcherSave} className="inline-flex items-center px-5 py-2.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition">Save profile</button>
                  {rgLoading && <LoadingInline label="Fetching publications" />}
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-800"><BookOpen className="h-4 w-4" /> Publications</div>
                  <p className="mt-1 text-xs text-slate-500">If you add ORCID or ResearchGate, we’ll fetch your publications and generate simple summaries.</p>
                  <ul className="mt-3 space-y-3 text-sm text-slate-700">
                    {(rgPubs.length ? rgPubs : [0, 1]).map((item, idx) => (
                      typeof item === 'number' ? (
                        <li key={idx} className="rounded-lg border border-slate-200 p-3">
                          <div className="font-medium">AI-generated summary: concise and clear overview of your paper #{idx + 1}.</div>
                          <div className="text-xs text-slate-500">Example journal • 2024</div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Readability optimized
                          </div>
                        </li>
                      ) : (
                        <li key={item.id || idx} className="rounded-lg border border-slate-200 p-3">
                          <div className="font-medium">{item.title || 'Publication'}</div>
                          <div className="text-xs text-slate-500">{item.journal || 'Journal'} {item.year ? `• ${item.year}` : ''}</div>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-900"><LinkIcon className="h-3.5 w-3.5" /> View</a>
                          )}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900">Researcher Dashboard</h3>
              <p className="text-sm text-slate-600">View clinical trials, discover collaborators, and manage forums.</p>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800"><Users className="h-4 w-4" /> Collaborators</div>
                    <div className="relative w-40">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input placeholder="Search by specialty" className="w-full rounded-md border border-slate-200 pl-7 pr-2 py-1.5 text-xs" />
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li className="flex items-center justify-between">
                      <span>Dr. Rivera • Oncology • Immunotherapy</span>
                      <button className="text-xs rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50">Connect</button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Dr. Kim • Neurology • Clinical AI</span>
                      <button className="text-xs rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50">Connect</button>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-800"><FlaskConical className="h-4 w-4" /> Manage Clinical Trials</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 text-white text-xs"><Plus className="h-3.5 w-3.5" /> Add trial</button>
                    <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">Update status</button>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>
                      <span className="font-medium">Phase II: Immunotherapy for glioma</span>
                      <span className="block text-xs text-slate-500">Recruiting • AI-generated summary: concise overview of eligibility and endpoints.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-800"><MessageSquare className="h-4 w-4" /> Forums</div>
                  <p className="mt-1 text-xs text-slate-500">Create communities and answer patient questions.</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">Create community</button>
                    <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">View questions</button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-800"><Star className="h-4 w-4" /> Favorites</div>
                  <p className="mt-1 text-xs text-slate-500">Save clinical trials, publications, and collaborators for quick access.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div id="features" className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <BookOpen className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Publications</h3>
            <p className="mt-1 text-sm text-slate-600">Discover papers with simple, AI-generated summaries and direct journal links.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Star className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Experts & collaborators</h3>
            <p className="mt-1 text-sm text-slate-600">Identify leaders and teams to work with or consult.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <MessageSquare className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Forums</h3>
            <p className="mt-1 text-sm text-slate-600">Patients ask questions; researchers reply. Structured and moderated.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
