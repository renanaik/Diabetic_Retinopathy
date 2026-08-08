import React, { useState, useMemo } from 'react';
import type { ScreeningResult } from '../../types';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/States';
import { Search, SlidersHorizontal, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DR_STAGES } from '../../types';

interface PatientTableProps {
  records: ScreeningResult[];
  className?: string;
}

const ALL_STAGES = ['All Stages', ...DR_STAGES.map(s => s.shortName)];

export const PatientTable: React.FC<PatientTableProps> = ({
  records,
  className = '',
}) => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !search ||
        r.patientId.toLowerCase().includes(search.toLowerCase()) ||
        r.screeningId.toLowerCase().includes(search.toLowerCase());

      const matchStage =
        stageFilter === 'All Stages' ||
        DR_STAGES[r.predictedStage].shortName === stageFilter;

      const matchStatus =
        statusFilter === 'All Statuses' || r.reviewStatus === statusFilter;

      return matchSearch && matchStage && matchStatus;
    });
  }, [records, search, stageFilter, statusFilter]);

  return (
    <div className={className}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-clinical-muted" />
          <input
            type="text"
            placeholder="Search by Patient ID or Screening ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="select sm:w-40"
          aria-label="Filter by stage"
        >
          {ALL_STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select sm:w-44"
          aria-label="Filter by status"
        >
          {['All Statuses', 'Pending Review', 'Reviewed', 'Flagged'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-clinical-muted mb-3">
        Showing {filtered.length} of {records.length} record{records.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={24} />}
          title="No records match your filters"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-clinical-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-clinical-bg border-b border-clinical-border">
                {['Patient ID', 'Date', 'Eye', 'Predicted Stage', 'Confidence', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-clinical-muted uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-clinical-border">
              {filtered.map((record) => {
                const date = new Date(record.examinationDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <tr
                    key={record.screeningId}
                    className="hover:bg-clinical-bg/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-800 font-mono">{record.patientId}</p>
                      <p className="text-xs text-clinical-muted font-mono">{record.screeningId}</p>
                    </td>
                    <td className="px-4 py-3 text-clinical-muted whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3 text-clinical-muted">{record.eye}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge stage={record.predictedStage} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-clinical-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${record.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-navy-700 tabular-nums">
                          {Math.round(record.confidence * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.reviewStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/results/${record.screeningId}`}
                        className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <ExternalLink size={12} />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
