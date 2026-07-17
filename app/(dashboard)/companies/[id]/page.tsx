'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Edit3, User, Mail, Phone, MapPin, FileText, CheckCircle } from 'lucide-react';

interface Company {
  companyName: string;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  city?: string;
  status?: string;
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Company>>({});

  const { id } = React.use(params);

  useEffect(() => {
    async function fetchCompany() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/companies/${id}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        setCompany(data.company || data);
        setEditedData(data.company || data);
      } catch (error) {
        console.error("Failed to fetch company", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [id]);

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'inactive': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });

      if (res.ok) {
        const updated = await res.json();
        setCompany(updated.company || updated);
        setIsEditing(false);
      }
    } catch (error) {
      alert("Failed to save changes");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-800 bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
          <p className="text-slate-400">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="rounded-3xl border border-red-900/50 bg-zinc-950 p-8 text-red-400">
        Company not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Companies
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm hover:bg-white/10 transition"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? "Cancel" : "Edit"}
            </button>

            {isEditing && (
              <button
                onClick={handleSave}
                className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition"
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
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-slate-700">
            <User className="h-12 w-12 text-slate-400" />
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3">
              <p className="text-xs font-mono uppercase tracking-[0.125em] text-emerald-400">CLIENT PROFILE</p>
              {company.status && (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(company.status)}`}>
                  {company.status}
                </span>
              )}
            </div>

            <h1 className="mt-2 text-5xl font-semibold tracking-tight text-white">
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.companyName || ''}
                  onChange={(e) => setEditedData({ ...editedData, companyName: e.target.value })}
                  className="bg-transparent border-b border-slate-700 focus:border-emerald-500 outline-none w-full"
                />
              ) : (
                company.companyName
              )}
            </h1>
          </div>
        </div>

        {/* Details Card */}
        <div className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-8 shadow-2xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Person */}
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500">Contact Person</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.contactPerson || ''}
                  onChange={(e) => setEditedData({ ...editedData, contactPerson: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-white focus:border-emerald-500 outline-none"
                />
              ) : (
                <p className="mt-2 text-xl text-white">{company.contactPerson || '—'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500">Email</p>
              <div className="mt-2 flex items-center gap-3">
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email || ''}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    className="flex-1 rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                ) : (
                  <>
                    <p className="flex-1 text-xl text-white break-all">{company.email || '—'}</p>
                    {company.email && (
                      <button
                        onClick={() => copyToClipboard(company.email!, 'email')}
                        className="rounded-xl p-3 hover:bg-white/5 transition"
                      >
                        {copiedField === 'email' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5 text-slate-400" />}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Mobile */}
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500">Mobile</p>
              <div className="mt-2 flex items-center gap-3">
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.mobile || ''}
                    onChange={(e) => setEditedData({ ...editedData, mobile: e.target.value })}
                    className="flex-1 rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                ) : (
                  <>
                    <p className="flex-1 text-xl text-white">{company.mobile || '—'}</p>
                    {company.mobile && (
                      <button
                        onClick={() => copyToClipboard(company.mobile!, 'mobile')}
                        className="rounded-xl p-3 hover:bg-white/5 transition"
                      >
                        {copiedField === 'mobile' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5 text-slate-400" />}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* City */}
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500">City</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.city || ''}
                  onChange={(e) => setEditedData({ ...editedData, city: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-white focus:border-emerald-500 outline-none"
                />
              ) : (
                <p className="mt-2 text-xl text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  {company.city || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-emerald-400" />
              <p className="text-sm uppercase tracking-widest text-slate-500">Notes</p>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.notes || ''}
                onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
                rows={5}
                className="w-full rounded-2xl border border-slate-700 bg-zinc-950 p-5 text-slate-200 focus:border-emerald-500 outline-none"
              />
            ) : (
              <p className="text-slate-300 leading-relaxed">
                {company.notes || <span className="italic text-slate-500">No notes available.</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}