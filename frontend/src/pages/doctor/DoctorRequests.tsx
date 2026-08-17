import React, { useState, useEffect, useCallback } from 'react';
import { Inbox, CheckCircle2, XCircle, User, Activity, Eye, Phone, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PatientRequest {
  id: string;
  doctorId: string;
  patientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    email: string;
    profile: {
      dateOfBirth?: string;
      gender?: string;
      phone?: string;
      medicalHistory?: string;
      diabetesHistory?: string;
      eyeHistory?: string;
    } | null;
  } | null;
}

export const DoctorRequests: React.FC = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<PatientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/connections/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.data.requests || []);
      } else {
        setError(data.message || 'Failed to load connection requests.');
      }
    } catch {
      setError('Network error while loading connection requests.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleAction(connectionId: string, action: 'accept' | 'reject', patientName: string) {
    setProcessingId(connectionId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/connections/${connectionId}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `Connection request from ${patientName} ${action === 'accept' ? 'accepted' : 'rejected'}.`,
        });
        setRequests((prev) => prev.filter((r) => r.id !== connectionId));
      } else {
        setActionMessage({
          type: 'error',
          text: data.message || `Failed to ${action} connection request.`,
        });
      }
    } catch {
      setActionMessage({
        type: 'error',
        text: `Network error while attempting to ${action} request.`,
      });
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          Incoming Patient Connection Requests
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Review and approve connection requests from patients seeking diabetic retinopathy screening and monitoring.
        </p>
      </div>

      {/* Action banner */}
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

      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading connection requests...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchRequests}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center bg-[var(--color-surface)]">
          <Inbox className="w-12 h-12 text-[var(--color-text-subtle)] mx-auto mb-3" />
          <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">
            No Pending Requests
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto mt-1">
            When patients request you as their ophthalmologist, their connection requests will appear here for verification.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Pending Requests ({requests.length})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => {
              const p = req.patient;
              if (!p) return null;
              const isProcessing = processingId === req.id;

              return (
                <div
                  key={req.id}
                  className="card p-6 border border-[var(--color-border)] shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
                          {p.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                          <span>{p.email}</span>
                          {p.profile?.phone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {p.profile.phone}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleAction(req.id, 'reject', p.name)}
                        disabled={isProcessing}
                        className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'accept', p.name)}
                        disabled={isProcessing}
                        className="btn btn-primary btn-sm flex items-center gap-1.5"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept Patient</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Medical Background Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs">
                    <div>
                      <span className="text-[var(--color-text-muted)] flex items-center gap-1 mb-0.5">
                        <Activity className="w-3 h-3 text-amber-500" /> Diabetes History
                      </span>
                      <p className="font-medium text-[var(--color-text)]">
                        {p.profile?.diabetesHistory || 'No records provided'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] flex items-center gap-1 mb-0.5">
                        <Eye className="w-3 h-3 text-brand-500" /> Ocular History
                      </span>
                      <p className="font-medium text-[var(--color-text)]">
                        {p.profile?.eyeHistory || 'No prior conditions noted'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] flex items-center gap-1 mb-0.5">
                        <Calendar className="w-3 h-3 text-indigo-500" /> Requested Date
                      </span>
                      <p className="font-medium text-[var(--color-text)]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

