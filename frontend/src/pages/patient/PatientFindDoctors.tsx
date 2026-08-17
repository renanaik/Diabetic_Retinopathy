import React, { useState, useEffect, useCallback } from 'react';
import { Search, Stethoscope, Building2, Award, CheckCircle2, Clock, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DoctorProfile {
  licenseNumber?: string;
  medicalCouncil?: string;
  specialization?: string;
  hospital?: string;
  yearsOfExperience?: number;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  verificationStatus: string;
  connectionStatus: 'none' | 'pending' | 'accepted' | 'rejected';
  connectionId: string | null;
  profile: DoctorProfile | null;
}

export const PatientFindDoctors: React.FC = () => {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/connections/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDoctors(data.data.doctors || []);
      } else {
        setError(data.message || 'Failed to load verified doctors.');
      }
    } catch {
      setError('Network error while connecting to server.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  async function handleRequestConnection(doctorId: string, doctorName: string) {
    setRequestingId(doctorId);
    setActionMessage(null);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doctorId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `Connection request sent successfully to Dr. ${doctorName}.`,
        });
        setDoctors((prev) =>
          prev.map((doc) =>
            doc.id === doctorId ? { ...doc, connectionStatus: 'pending' } : doc
          )
        );
      } else {
        setActionMessage({
          type: 'error',
          text: data.message || 'Failed to send connection request.',
        });
      }
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Network error while sending connection request.',
      });
    } finally {
      setRequestingId(null);
    }
  }

  const filteredDoctors = doctors.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = doc.name.toLowerCase().includes(q);
    const specMatch = doc.profile?.specialization?.toLowerCase().includes(q) || false;
    const hospMatch = doc.profile?.hospital?.toLowerCase().includes(q) || false;
    return nameMatch || specMatch || hospMatch;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          Find Verified Doctors
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Connect with certified ophthalmologists and retina specialists to perform AI-assisted fundus screenings.
        </p>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm">{actionMessage.text}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by doctor name, specialization, or hospital..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading verified ophthalmologists...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchDoctors}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="card p-12 text-center">
          <Stethoscope className="w-10 h-10 text-[var(--color-text-subtle)] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[var(--color-text)]">No doctors found</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {searchQuery
              ? 'Try refining your search keyword.'
              : 'No verified doctors are currently registered on the platform.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDoctors.map((doc) => {
            const isPending = doc.connectionStatus === 'pending';
            const isAccepted = doc.connectionStatus === 'accepted';
            const isRequesting = requestingId === doc.id;

            return (
              <div
                key={doc.id}
                className="card p-6 flex flex-col justify-between border border-[var(--color-border)] hover:border-brand-500/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">
                          Dr. {doc.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Verified
                        </span>
                      </div>
                      <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">
                        {doc.profile?.specialization || 'Ophthalmology & Retina Specialist'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
                    {doc.profile?.hospital && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{doc.profile.hospital}</span>
                      </div>
                    )}
                    {doc.profile?.yearsOfExperience !== undefined && (
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>{doc.profile.yearsOfExperience} Years Clinical Experience</span>
                      </div>
                    )}
                    {doc.profile?.medicalCouncil && (
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                        <span>Council: {doc.profile.medicalCouncil}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  {isAccepted ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Connected</span>
                    </div>
                  ) : isPending ? (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                      <Clock className="w-4 h-4" />
                      <span>Request Pending</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestConnection(doc.id, doc.name)}
                      disabled={isRequesting}
                      className="btn btn-primary btn-sm flex items-center gap-2 ml-auto"
                    >
                      {isRequesting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Requesting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Request Connection</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

