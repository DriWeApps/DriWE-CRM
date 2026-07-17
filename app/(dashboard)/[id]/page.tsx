'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Edit3, User, Mail, Phone, MapPin, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Company {
  id: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  status?: string;
  city?: string;
  notes?: string;
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function CompanyDetailsPage({ params }: Props) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Partial<Company>>({});

  const { id } = React.use(params);

  useEffect(() => {
    async function fetchCompany() {
      try {
        const res = await fetch(`/api/companies/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error('Failed to fetch company');

        const data = await res.json();
        setCompany(data.company);
        setEditedCompany(data.company || {});
      } catch (err) {
        setError('Failed to load company details');
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [id]);

  const copyToClipboard = async (text: string, field: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'inactive':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedCompany),
      });

      if (!res.ok) throw new Error('Failed to update');

      const updated = await res.json();
      setCompany(updated.company);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save changes');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-800 bg-zinc-950 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
          <p className="text-slate-400">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="rounded-3xl border border-red-900/50 bg-zinc-950 p-8 text-red-400">
        {error || 'Company not found.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Companies
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all active:scale-95 border border-white/10"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>

            {isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-all active:scale-95"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-8">
        {/* Header */}
        <div className="mb-10 flex items-start gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-slate-700">
            <User className="h-12 w-12 text-slate-400" />
          </div>

          <div className="flex-1 pt-2">
            <div className="flex items-center gap-3">
              <p className="text-xs font-mono uppercase tracking-[0.125em] text-emerald-400">CLIENT PROFILE</p>
              {company.status && (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium ${getStatusColor(company.status)}`}>
                  {company.status === 'active' && <CheckCircle className="h-3 w-3" />}
                  {company.status === 'inactive' && <AlertCircle className="h-3 w-3" />}
                  {company.status}
                </span>
              )}
            </div>
            <h1 className="mt-1 text-5xl font-semibold tracking-tight text-white">
              {isEditing ? (
                <input
                  type="text"
                  value={editedCompany.companyName || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, companyName: e.target.value })}
                  className="w-full bg-transparent border-b border-slate-700 focus:border-emerald-500 outline-none text-5xl font-semibold tracking-tight"
                />
              ) : (
                company.companyName
              )}
            </h1>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Information Card */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-400" />
                  Contact Information
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Contact Person */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Contact Person</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCompany.contactPerson || ''}
                      onChange={(e) => setEditedCompany({ ...editedCompany, contactPerson: e.target.value })}
                      className="mt-2 w-full bg-zinc-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <p className="mt-2 text-xl text-white">{company.contactPerson || '—'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Email Address</label>
                  <div className="mt-2 flex items-center gap-3">
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedCompany.email || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, email: e.target.value })}
                        className="flex-1 bg-zinc-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <>
                        <p className="flex-1 text-xl text-white break-all">{company.email || '—'}</p>
                        {company.email && (
                          <button
                            onClick={() => copyToClipboard(company.email!, 'email')}
                            className="rounded-xl p-3 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedField === 'email' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Mobile Number</label>
                  <div className="mt-2 flex items-center gap-3">
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedCompany.mobile || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, mobile: e.target.value })}
                        className="flex-1 bg-zinc-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <>
                        <p className="flex-1 text-xl text-white">{company.mobile || '—'}</p>
                        {company.mobile && (
                          <button
                            onClick={() => copyToClipboard(company.mobile!, 'mobile')}
                            className="rounded-xl p-3 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedField === 'mobile' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCompany.city || ''}
                      onChange={(e) => setEditedCompany({ ...editedCompany, city: e.target.value })}
                      className="mt-2 w-full bg-zinc-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <p className="mt-2 text-xl text-white flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-slate-400" />
                      {company.city || '—'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 p-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Internal Notes</h2>
              </div>
              {isEditing ? (
                <textarea
                  value={editedCompany.notes || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, notes: e.target.value })}
                  rows={6}
                  className="w-full resize-y bg-zinc-950 border border-slate-700 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:border-emerald-500 font-light"
                />
              ) : (
                <div className="prose prose-invert text-slate-300 leading-relaxed">
                  {company.notes || <span className="italic opacity-60">No notes available.</span>}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 p-6">
              <div className="text-xs uppercase tracking-[0.125em] text-slate-500 mb-4">QUICK ACTIONS</div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between rounded-2xl bg-white/5 hover:bg-white/10 p-4 text-left transition-all group">
                  <div>
                    <div className="font-medium">Create New Project</div>
                    <div className="text-xs text-slate-400">For this client</div>
                  </div>
                  <div className="text-emerald-400 group-hover:translate-x-0.5 transition">→</div>
                </button>

                <button className="w-full flex items-center justify-between rounded-2xl bg-white/5 hover:bg-white/10 p-4 text-left transition-all group">
                  <div>
                    <div className="font-medium">Send Email</div>
                    <div className="text-xs text-slate-400">Quick outreach</div>
                  </div>
                  <div className="text-emerald-400 group-hover:translate-x-0.5 transition">→</div>
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 p-6 text-center">
              <div className="text-xs text-slate-500 mb-1">LAST UPDATED</div>
              <div className="text-sm text-slate-400">Just now</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}