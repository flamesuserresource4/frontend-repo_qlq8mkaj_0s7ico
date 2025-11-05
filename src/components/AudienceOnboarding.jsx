import React, { useMemo, useState } from 'react';
import { User, Users, BookOpen, Star, MessageSquare, Search, MapPin, Globe, FileText, Stethoscope, FlaskConical } from 'lucide-react';

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

export default function AudienceOnboarding() {
  const [activeFlow, setActiveFlow] = useState(null); // 'patient' | 'researcher' | null
  const [patientText, setPatientText] = useState('');
  const [locations, setLocations] = useState({ city: '', country: '' });
  const [globalExperts, setGlobalExperts] = useState(false);
  const [conditions, setConditions] = useState(['Glioma']);
  const [submitted, setSubmitted] = useState(false);

  const popularConditions = ['Glioma', 'Lung Cancer', 'Breast Cancer', 'Leukemia', 'Brain Cancer'];

  const recommendations = useMemo(() => {
    if (!submitted) return null;
    const base = conditions.join(', ') || patientText || 'your interests';
    return {
      publications: [
        { title: `Recent advances in ${conditions[0] || 'oncology'}`, by: 'Journal of Clinical Medicine' },
        { title: `${conditions[0] || 'Cancer'} biomarkers overview`, by: 'Nature Reviews' },
      ],
      experts: [
        { name: 'Dr. A. Navarro', specialty: conditions[0] || 'Oncology', location: globalExperts ? 'Global' : (locations.city || 'Nearby') },
        { name: 'Dr. L. Chen', specialty: 'Immunotherapy', location: globalExperts ? 'Global' : (locations.city || 'Nearby') },
      ],
      trials: [
        { title: `${conditions[0] || 'Cancer'} Phase II Trial`, status: 'Recruiting' },
        { title: `Immunotherapy for ${conditions[0] || 'solid tumors'}`, status: 'Active' },
      ],
      context: base,
    };
  }, [submitted, conditions, patientText, locations, globalExperts]);

  const toggleCondition = (label) => {
    setConditions((prev) => (prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
              'Find collaborators and institutions',
              'Discover qualified participants',
              'Engage with topic-focused forums',
            ]}
            onPrimary={() => setActiveFlow('researcher')}
          />
        </div>

        {/* Lightweight patient setup */}
        {activeFlow === 'patient' && (
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Profile setup</h3>
                  <p className="text-sm text-slate-600">Describe your situation in natural language. We’ll detect conditions and tailor results.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  <button type="submit" className="inline-flex items-center px-5 py-3 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition">Continue</button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900">What you’ll see</h3>
              <p className="text-sm text-slate-600">A personalized dashboard with recommended publications, experts, and clinical trials.</p>

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
                          <li key={p.title}>
                            <span className="font-medium">{p.title}</span>
                            <span className="block text-xs text-slate-500">{p.by}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 text-slate-800"><Stethoscope className="h-4 w-4" /> Experts</div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {recommendations.experts.map((e) => (
                          <li key={e.name}>
                            <span className="font-medium">{e.name}</span>
                            <span className="block text-xs text-slate-500">{e.specialty} • {e.location}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 text-slate-800"><FlaskConical className="h-4 w-4" /> Trials</div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {recommendations.trials.map((t) => (
                          <li key={t.title}>
                            <span className="font-medium">{t.title}</span>
                            <span className="block text-xs text-slate-500">{t.status}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature highlights remain minimal and clear */}
        <div id="features" className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <BookOpen className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Clinical trials</h3>
            <p className="mt-1 text-sm text-slate-600">Surface studies matched to your condition and preferences.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Star className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Experts & collaborators</h3>
            <p className="mt-1 text-sm text-slate-600">Identify leaders and teams to work with or consult.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <MessageSquare className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Forums</h3>
            <p className="mt-1 text-sm text-slate-600">Join thoughtful discussions with peers and experts.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
