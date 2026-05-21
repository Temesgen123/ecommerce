import { getAnalyticsData } from '@/lib/analytics';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics' };

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsDashboard data={data} />;
}
