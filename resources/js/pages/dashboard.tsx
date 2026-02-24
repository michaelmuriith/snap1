import { Head, usePage } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { PageProps } from '@inertiajs/core';
import type { Auth } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps extends PageProps {
    auth: Auth;
    stats: Record<string, any>;
}

export default function Dashboard() {
    const { auth, stats } = usePage<DashboardProps>().props;
    const userRole = auth.user.role;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {auth.user.name}</h2>
                        <p className="text-muted-foreground">
                            Here's an overview of your {userRole} account.
                        </p>
                    </div>
                </div>

                {userRole === 'customer' && (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Active Orders</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{stats.active_orders || 0}</div>
                                <p className="text-xs text-muted-foreground">Track your ongoing deliveries</p>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Order History</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{stats.order_history || 0}</div>
                                <p className="text-xs text-muted-foreground">Past deliveries</p>
                            </div>
                        </div>
                    </div>
                )}

                {userRole === 'business' && (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Pending Shipments</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{stats.pending_shipments || 0}</div>
                                <p className="text-xs text-muted-foreground">Waiting for carrier pickup</p>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Active Deliveries</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{stats.active_deliveries || 0}</div>
                                <p className="text-xs text-muted-foreground">Currently in transit</p>
                            </div>
                        </div>
                    </div>
                )}

                {userRole === 'carrier' && (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Available Jobs</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{stats.available_jobs || 0}</div>
                                <p className="text-xs text-muted-foreground">Orders awaiting pickup</p>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Current Route</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{stats.current_route || 0}</div>
                                <p className="text-xs text-muted-foreground">Your active deliveries</p>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Today's Earnings</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">KES {Number(stats.todays_earnings || 0).toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
                            </div>
                        </div>
                    </div>
                )}

                {userRole === 'admin' && (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Total Orders</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{stats.total_orders || 0}</div>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Active Carriers</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{stats.active_carriers || 0}</div>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow hover:border-destructive/50 transition-colors">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium text-destructive">Conflicts</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold text-destructive">{stats.conflicts || 0}</div>
                                <p className="text-xs text-muted-foreground">Require attention</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
