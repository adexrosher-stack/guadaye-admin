// CompanyOverview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Utensils, FolderOpen, Package, ShoppingBag } from "lucide-react";

const hardcodedCompany = {
  name: "Tasty Bites Restaurant Group",
  branches: 4,
  categories: 8,
  dishes: 42,
  ingredients: 120,
  totalOrdersToday: 487,
  topDish: "Margherita Pizza",
  topCategory: "Italian",
};

const branches = [
  { name: "Downtown", orders: 168, topDish: "Margherita Pizza" },
  { name: "Westside", orders: 132, topDish: "Chicken Burger" },
  { name: "Uptown", orders: 109, topDish: "Spicy Ramen" },
  { name: "Suburb", orders: 78, topDish: "Classic Cheesecake" },
];

export default function CompanyOverview() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-10">

      {/* Company Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {hardcodedCompany.name}
        </h1>
        <p className="text-muted-foreground">
          Overview — Today ({new Date().toLocaleDateString()})
        </p>
      </div>

      {/* Main Company Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Building2}
          title="Branches"
          value={hardcodedCompany.branches}
        />
        <StatCard
          icon={FolderOpen}
          title="Categories"
          value={hardcodedCompany.categories}
        />
        <StatCard
          icon={Utensils}
          title="Dishes"
          value={hardcodedCompany.dishes}
        />
        <StatCard
          icon={Package}
          title="Ingredients"
          value={hardcodedCompany.ingredients}
        />
        <StatCard
          icon={ShoppingBag}
          title="Today's Orders"
          value={hardcodedCompany.totalOrdersToday}
          highlight
        />
      </div>

      {/* Today's Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Highlights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Most Popular Dish</div>
            <div className="text-2xl font-semibold">
              {hardcodedCompany.topDish}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Most Popular Category</div>
            <div className="text-2xl font-semibold">
              {hardcodedCompany.topCategory}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branches Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Branches Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {branches.map((branch) => (
              <div
                key={branch.name}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 last:border-b-0 last:pb-0"
              >
                <div className="font-medium text-lg">{branch.name}</div>

                <div className="flex flex-wrap gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Orders</div>
                    <div className="text-xl font-semibold">{branch.orders}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Top Dish</div>
                    <div className="font-medium">{branch.topDish}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable tiny stat card
function StatCard({
  icon: Icon,
  title,
  value,
  highlight = false,
}: {
  icon: any;
  title: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/50 bg-primary/5" : ""}>
      <CardContent className="p-6 flex flex-col items-center text-center gap-2">
        <Icon className="h-6 w-6 text-primary" />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  );
}