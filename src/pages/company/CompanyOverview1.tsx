import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Globe,
  Hash,
  DollarSign,
  ShoppingBag,
  Utensils,
  Calendar,
  Loader2,
  Store,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

// ────────────────────────────────────────────────
// Types (unchanged)
interface CompanyInfo {
  id: string;
  name: string;
  tin?: string;
  company_website?: string;
  company_logo?: string;
}

interface DailyStats {
  totalOrders: number;
  totalSales: number;
  totalIncome: number;
  topDish: string;
  topCategory: string;
  ordersBy: {
    customer: number;
    waiter: number;
    cashier: number;
  };
}

interface BranchDailyStats {
  id: string;
  name: string;
  totalOrders: number;
  totalSales: number;
  income: number;
  topDish: string;
  topCategory: string;
  status?: "Active" | "Suspended" | "Trial" | "Terminated";
  ordersBy: {
    customer: number;
    waiter: number;
    cashier: number;
  };
}

// ────────────────────────────────────────────────
// Mock data (unchanged)
const mockCompanyInfo: CompanyInfo = {
  id: "1",
  name: "Tasty Bites Restaurant Group",
  tin: "123-45-6789",
  company_website: "https://tastybites.com",
  company_logo: "",
};

const mockDailyStats: DailyStats = {
  totalOrders: 1247,
  totalSales: 45890,
  totalIncome: 38120,
  topDish: "Truffle Margherita",
  topCategory: "Pizza",
  ordersBy: {
    customer: 600,
    waiter: 400,
    cashier: 247,
  },
};

const mockBranches: BranchDailyStats[] = [
  {
    id: "1",
    name: "Downtown Branch",
    totalOrders: 512,
    totalSales: 19870,
    income: 16450,
    topDish: "Truffle Margherita",
    topCategory: "Pizza",
    status: "Active",
    ordersBy: { customer: 250, waiter: 180, cashier: 82 },
  },
  {
    id: "2",
    name: "Westside Branch",
    totalOrders: 389,
    totalSales: 14230,
    income: 11890,
    topDish: "Spicy Ramen",
    topCategory: "Asian",
    status: "Trial",
    ordersBy: { customer: 190, waiter: 130, cashier: 69 },
  },
  {
    id: "3",
    name: "Uptown Branch",
    totalOrders: 346,
    totalSales: 11790,
    income: 9780,
    topDish: "Classic Burger",
    topCategory: "Burger",
    status: "Suspended",
    ordersBy: { customer: 160, waiter: 120, cashier: 66 },
  },
];

export default function CompanyOverview(props?: { companyId?: string }) {
  const params = useParams<{ id: string }>();
  const id = props?.companyId ?? params.id ?? "1";

  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [branches, setBranches] = useState<BranchDailyStats[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
  }, []);

  // Load company info
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      setCompany(mockCompanyInfo);
    } catch {
      setError("Failed to load company information");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load daily stats (company + branches)
  useEffect(() => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    setError(null);

    try {
      setDailyStats(mockDailyStats);
      setBranches(mockBranches);
    } catch {
      setError("Failed to load daily overview");
    } finally {
      setLoading(false);
    }
  }, [id, fromDate, toDate]);

  const pieData = dailyStats
    ? [
        { name: "Customer", value: dailyStats.ordersBy.customer },
        { name: "Waiter", value: dailyStats.ordersBy.waiter },
        { name: "Cashier", value: dailyStats.ordersBy.cashier },
      ]
    : [];

  const COLORS = ["#FF4500", "#FFA500", "#FFD700"];

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (loading || !company || !dailyStats) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-800">
        {company.company_logo ? (
          <img
            src={company.company_logo}
            alt={company.name}
            className="h-16 w-16 rounded-full object-cover border border-orange-500/30"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-orange-950 flex items-center justify-center text-3xl font-bold text-orange-400">
            {company.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{company.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
            {company.tin && (
              <span className="flex items-center gap-1.5">
                <Hash className="h-4 w-4" /> TIN: {company.tin}
              </span>
            )}
            {company.company_website && (
              <a
                href={company.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange-400 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <Calendar className="h-5 w-5" />
              Daily Performance
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40 bg-gray-900 border-gray-700 text-white"
              />
              <span className="text-gray-400">–</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40 bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Company Summary Panel */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <CardTitle className="text-orange-400">Company Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-400" />
                <span className="text-gray-300">Daily Performance</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <span>Sales</span>
                <span className="text-right font-medium">
                  ${mockDailyStats.totalSales.toLocaleString()}
                </span>
                <span>Income</span>
                <span className="text-right font-medium">
                  ${mockDailyStats.totalIncome.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-orange-400" />
                <span className="text-gray-300">By Individual Branches</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <span>Total Sales</span>
                <span className="text-right font-medium">
                  ${branches.reduce((a, b) => a + b.totalSales, 0).toLocaleString()}
                </span>
                <span>Total Income</span>
                <span className="text-right font-medium">
                  ${branches.reduce((a, b) => a + b.income, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Overview */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-orange-400">
          <Store className="h-5 w-5" />
          Company Summary – {fromDate}
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={ShoppingBag} title="Total Orders" value={dailyStats.totalOrders} />
          <StatCard icon={DollarSign} title="Total Sales" value={`$${dailyStats.totalSales.toLocaleString()}`} />
          <StatCard icon={DollarSign} title="Net Income" value={`$${dailyStats.totalIncome.toLocaleString()}`} />
          <StatCard icon={Utensils} title="Top Dish" value={dailyStats.topDish} />
          <StatCard icon={Building2} title="Top Category" value={dailyStats.topCategory} />
        </div>

      </section>

      {/* Branch Performance – summary cards */}
      <section className="space-y-8">
        <h2 className="text-xl font-semibold text-orange-400">Branch Performance – {fromDate}</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {branches.map((b) => (
            <BranchSummaryCard
              key={b.id}
              name={b.name}
              sales={`$${b.totalSales.toLocaleString()}`}
              income={`$${b.income.toLocaleString()}`}
              orders={b.totalOrders}
              category={b.topCategory}
            />
          ))}
        </div>
      </section>

      {/* Orders by Source */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <CardTitle className="text-orange-300">Orders by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable Stat Card
function StatCard({
  icon: Icon,
  title,
  value,
}: {
  icon: any;
  title: string;
  value: string | number;
}) {
  return (
    <Card className="bg-black border border-orange-900/40 hover:border-orange-600/60 transition-colors">
      <CardContent className="p-5 text-center space-y-2">
        <Icon className="h-6 w-6 mx-auto text-orange-500" />
        <div className="text-sm text-gray-400">{title}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  );
}

function BranchSummaryCard({
  name,
  sales,
  income,
  orders,
  category,
}: {
  name: string;
  sales: string;
  income: string;
  orders: number;
  category: string;
}) {
  return (
    <Card className="bg-black border border-orange-900/40 hover:border-orange-600/60 transition-colors">
      <CardContent className="p-5 space-y-3">
        <div className="text-base font-semibold text-white">{name}</div>
        <div className="space-y-1 text-sm">
          <div className="text-gray-400">Sales</div>
          <div className="text-xl font-bold text-orange-300">{sales}</div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="text-gray-400">Net Income</div>
          <div className="text-lg font-semibold text-white">{income}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-400">Orders</div>
            <div className="font-medium text-white">{orders}</div>
          </div>
          <div>
            <div className="text-gray-400">Category</div>
            <div className="font-medium text-white">{category}</div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 text-orange-400">
          <ShoppingBag className="h-4 w-4" />
          <DollarSign className="h-4 w-4" />
          <Utensils className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
