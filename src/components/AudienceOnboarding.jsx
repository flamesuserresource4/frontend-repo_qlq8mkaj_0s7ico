import React from 'react';
import { User, Users, BookOpen, Star, MessageSquare } from 'lucide-react';

function Card({ title, description, icon: Icon, items, anchor }) {
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
          <button className="inline-flex items-center px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition">
            Continue as {title.split(' ')[1] || title}
          </button>
          <button className="inline-flex items-center px-4 py-2 rounded-md border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition">
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AudienceOnboarding() {
  return (
    <section id="onboarding" className="relative bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-slate-900 text-white text-xs px-3 py-1">Onboarding</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Choose your path
          </h2>
          <p className="mt-3 text-slate-600">
            Tailored experiences for patients and researchers to discover what matters most.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            anchor="patients"
            title="For Patients"
            description="Find clinical trials, trusted experts, and supportive communities."
            icon={User}
            items={[
              'Personalized trial recommendations',
              'Top health experts and centers',
              'Relevant publications and explainers',
              'Community forums to ask questions',
            ]}
          />
          <Card
            anchor="researchers"
            title="For Researchers"
            description="Accelerate your work with the right collaborators and participants."
            icon={Users}
            items={[
              'Discover qualified participants',
              'Find collaborators and institutions',
              'Track relevant publications',
              'Join topic-focused forums',
            ]}
          />
        </div>

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
