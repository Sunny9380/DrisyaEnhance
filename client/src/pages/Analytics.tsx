import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function Analytics() {
  return (
    <div className="space-y-6" data-testid="page-analytics">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
        <p className="text-muted-foreground">
          Track your usage, performance, and optimize your workflow
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
