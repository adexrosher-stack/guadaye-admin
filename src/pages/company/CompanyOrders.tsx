import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

const CompanyOrders = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Orders</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            View and manage orders for this company.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyOrders;
