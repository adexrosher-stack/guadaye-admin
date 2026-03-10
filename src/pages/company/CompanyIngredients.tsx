import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";

const CompanyIngredients = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Leaf className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Ingredients</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingredient Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage ingredients for this company's dishes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyIngredients;
