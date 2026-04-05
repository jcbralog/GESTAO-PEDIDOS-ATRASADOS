import { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';

interface DataState {
  rows: Record<string, unknown>[];
  fileName: string;
  sheets: string[];
  activeSheet: string;
  lastUpdate: Date;
}

export default function Index() {
  const [data, setData] = useState<DataState | null>(null);
  const [showUpload, setShowUpload] = useState(true);

  const handleDataLoaded = useCallback((rows: Record<string, unknown>[], fileName: string, sheets: string[], activeSheet: string) => {
    setData({ rows, fileName, sheets, activeSheet, lastUpdate: new Date() });
    setShowUpload(false);
  }, []);

  const handleRefresh = useCallback(() => {
    setShowUpload(true);
  }, []);

  if (showUpload || !data) {
    return <FileUpload onDataLoaded={handleDataLoaded} />;
  }

  return (
    <Dashboard
      rows={data.rows}
      fileName={data.fileName}
      lastUpdate={data.lastUpdate}
      onRefresh={handleRefresh}
    />
  );
}
