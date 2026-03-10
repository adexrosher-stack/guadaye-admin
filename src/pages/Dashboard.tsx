import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UtensilsCrossed, 
  FolderOpen, 
  Leaf, 
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Activity
} from "lucide-react";

const Dashboard = () => {
  // Mock data - in a real app, this would come from your backend
  const stats = [
    {
      title: "Total Dishes",
      value: "124",
      change: "+12%",
      changeType: "positive" as const,
      icon: UtensilsCrossed,
      description: "from last month"
    },
    {
      title: "Categories",
      value: "8",
      change: "+1",
      changeType: "positive" as const,
      icon: FolderOpen,
      description: "active categories"
    },
    {
      title: "Ingredients",
      value: "287",
      change: "+23",
      changeType: "positive" as const,
      icon: Leaf,
      description: "in inventory"
    },
    {
      title: "Revenue Today",
      value: "$2,847",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "from yesterday"
    },
  ];

  const popularDishes = [
    { name: "Grilled Salmon", orders: 45, revenue: "$675" },
    { name: "Caesar Salad", orders: 38, revenue: "$456" },
    { name: "Beef Burger", orders: 35, revenue: "$525" },
    { name: "Pasta Carbonara", orders: 29, revenue: "$435" },
    { name: "Chicken Wings", orders: 27, revenue: "$324" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your restaurant.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overview-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${
                  stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                }`}>
                  {stat.changeType === 'positive' && <TrendingUp className="mr-1 h-3 w-3" />}
                  {stat.change}
                </span>
                {' '}{stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Popular Dishes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Popular Dishes Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularDishes.map((dish, index) => (
                <div key={dish.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{dish.name}</p>
                      <p className="text-sm text-muted-foreground">{dish.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{dish.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Add New Dish</p>
                <p className="text-sm text-muted-foreground">Create a new menu item</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <FolderOpen className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Manage Categories</p>
                <p className="text-sm text-muted-foreground">Organize your menu</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <Leaf className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Update Ingredients</p>
                <p className="text-sm text-muted-foreground">Manage inventory</p>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;