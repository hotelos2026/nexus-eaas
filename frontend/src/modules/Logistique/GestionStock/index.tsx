'use client';

import StockDashboard from './components/StockDashboard';

export default function GestionStockModule({ tenant }: { tenant: string | null }) {
  return <StockDashboard tenant={tenant} />;
}