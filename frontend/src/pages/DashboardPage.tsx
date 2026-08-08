import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Disclaimer } from '../components/ui/Disclaimer';
import { LoadingState } from '../components/ui/States';
import {
  ScanLine, Users, ClipboardCheck, Clock,
  TrendingUp, Plus, ExternalLink,
} from 'lucide-react';
import { getAllScreenings } from '../services/api';
import type { ScreeningResult } from '../types';
import { DR_STAGES } from '../types';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardPage: React.FC = () => {
  const [records, setRecords] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllScreenings().then((res) => {
      setRecords(res.data);
      setLoading(false);
    });
  }, []);

  const totalScreenings = records.length;
  const uniquePatients = new Set(records.map((r) => r.patientId)).size;
  const pendingReviews = records.filter((r) => r.reviewStatus === 'Pending Review').length;
  const flagged = records.filter((r) => r.reviewStatus === 'Flagged').length;

  const recent = [...records]
    .sort((a, b) => new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime())
    .slice(0, 6);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-xs text-clinical-muted font-medium uppercase tracking-wide">
          {getGreeting()}
        </p>
        <div className="flex items-start justify-between mt-1">
          <h1 className="text-xl font-semibold text-navy-800">AI Screening Overview</h1>
          <Link to="/screening">
            <Button variant="primary" size="sm" icon={<Plus size={14} />}>
              New Screening
            </Button>
          </Link>
        </div>
        <p className="text-sm text-clinical-muted mt-1">
          Demo data — not real patient records
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading screening data…" />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Screenings"
              value={totalScreenings}
              icon={ScanLine}
              iconColor="text-teal-600"
              iconBg="bg-teal-50"
            />
            <StatCard
              label="Patients Tracked"
              value={uniquePatients}
              icon={Users}
              iconColor="text-navy-600"
              iconBg="bg-navy-50"
            />
            <StatCard
              label="Pending Reviews"
              value={pendingReviews}
              icon={ClipboardCheck}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
            />
            <StatCard
              label="Flagged Cases"
              value={flagged}
              icon={TrendingUp}
              iconColor="text-red-500"
              iconBg="bg-red-50"
            />
          </div>

          {/* Recent screenings */}
          <div className="bg-white border border-clinical-border rounded-lg shadow-clinical">
            <div className="px-5 py-4 border-b border-clinical-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-navy-800">Recent Examinations</h2>
                <p className="text-xs text-clinical-muted mt-0.5">Last {recent.length} screening records</p>
              </div>
              <Link to="/history" className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors">
                View all →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-clinical-bg border-b border-clinical-border">
                    {['Patient ID', 'Date', 'Eye', 'Predicted Stage', 'Confidence', 'Status', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-clinical-muted uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-clinical-border">
                  {recent.map((r) => (
                    <tr key={r.screeningId} className="hover:bg-clinical-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-800 font-mono">{r.patientId}</p>
                        <p className="text-xs text-clinical-muted font-mono">{r.screeningId}</p>
                      </td>
                      <td className="px-4 py-3 text-clinical-muted whitespace-nowrap">
                        {new Date(r.examinationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-clinical-muted">{r.eye}</td>
                      <td className="px-4 py-3">
                        <SeverityBadge stage={r.predictedStage} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-navy-700">
                          {Math.round(r.confidence * 100)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.reviewStatus} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/results/${r.screeningId}`}
                          className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          <ExternalLink size={12} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <Disclaimer variant="compact" />
          </div>
        </>
      )}
    </div>
  );
};
