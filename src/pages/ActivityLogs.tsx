import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

const ActivityLogs = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">User Management - Activity Logs</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Audit and security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Monitor admin actions for auditing and security purposes.
            This is a placeholder screen; plug in your logs data source and filters here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;


