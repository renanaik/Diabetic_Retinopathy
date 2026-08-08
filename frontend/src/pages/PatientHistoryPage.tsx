import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { PatientTable } from '../components/history/PatientTable';
import { LoadingState } from '../components/ui/States';
import { Disclaimer } from '../components/ui/Disclaimer';
import { getAllScreenings } from '../services/api';
import type { ScreeningResult } from '../types';
import { Clock } from 'lucide-react';

export const PatientHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllScreenings().then((res) => {
      setRecords(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Patient History"
        subtitle="All screening records across patients. Click a record to view the full result."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Patient History' }]}
        action={
          <div className="flex items-center gap-2 text-xs text-clinical-muted">
            <Clock size={14} />
            Demo records only
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Loading patient records…" />
      ) : (
        <>
          <PatientTable records={records} />
          <div className="mt-6">
            <Disclaimer variant="banner" />
          </div>
        </>
      )}
    </div>
  );
};
