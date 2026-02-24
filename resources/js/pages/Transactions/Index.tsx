import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Wallet, Diamond, ArrowDownToLine, TrendingUp, History } from 'lucide-react';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Wallet', href: '/transactions' },
];

export default function TransactionsIndex({ transactions, balance }: any) {
    const { auth } = usePage().props as any;
    const userRole = auth.user.role;
    const { data, setData, post, processing, reset } = useForm({
        amount: '',
    });

    const [openWithdraw, setOpenWithdraw] = useState(false);

    const submitWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();
        post('/transactions/withdraw', {
            onSuccess: () => {
                setOpenWithdraw(false);
                reset();
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet & Transactions" />

            <div className="flex h-full flex-1 flex-col gap-8 p-8 max-w-5xl mx-auto w-full">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/40 via-emerald-800/20 to-zinc-950 p-8 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
                        <div className="absolute -right-10 -top-10 text-emerald-500/10">
                            <Diamond className="w-64 h-64" />
                        </div>
                        <h2 className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Available Balance
                        </h2>
                        <div className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                            KES {Number(balance).toFixed(2)}
                        </div>
                        {userRole === 'carrier' && (
                            <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
                                <DialogTrigger asChild>
                                    <Button className="mt-8 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 rounded-xl px-8 py-6 h-auto">
                                        <ArrowDownToLine className="mr-2 h-5 w-5" /> Request Withdrawal
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[400px]">
                                    <DialogHeader>
                                        <DialogTitle>Withdraw Funds</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={submitWithdrawal} className="grid gap-4 py-4">
                                        <p className="text-sm text-muted-foreground mb-2">Available: <strong className="text-emerald-500">KES {Number(balance).toFixed(2)}</strong></p>
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">Amount to withdraw (KES)</Label>
                                            <Input id="amount" type="number" step="0.01" max={balance} placeholder="e.g. 50.00" value={data.amount} onChange={e => setData('amount', e.target.value)} required />
                                        </div>
                                        <Button type="submit" disabled={processing} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">Submit Request</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <div className="rounded-3xl border border-white/5 bg-card/40 p-8 backdrop-blur-xl flex flex-col justify-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Lifetime Earnings</p>
                                <p className="text-2xl font-bold">KES {transactions.filter((t: any) => t.type === 'earning').reduce((acc: number, t: any) => acc + Number(t.amount), 0).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Trips</p>
                                <p className="text-2xl font-bold">{transactions.filter((t: any) => t.type === 'earning').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <History className="w-5 h-5 text-muted-foreground" /> Transaction History
                    </h3>
                    <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-border/50">
                            {transactions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">No transactions yet.</div>
                            ) : transactions.map((tx: any) => (
                                <div key={tx.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earning' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                                            }`}>
                                            {tx.type === 'earning' ? <TrendingUp className="w-5 h-5" /> : <ArrowDownToLine className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground capitalize">{tx.type} <span className="text-muted-foreground text-xs uppercase ml-2 tracking-wider">#{tx.id}</span></p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${tx.type === 'earning' ? 'text-emerald-500' : 'text-foreground'}`}>
                                            {tx.type === 'earning' ? '+' : '-'}KES {Number(tx.amount).toFixed(2)}
                                        </p>
                                        <Badge variant="outline" className={`${tx.status === 'completed' ? 'border-emerald-500/30 text-emerald-500' : 'border-yellow-500/30 text-yellow-500'} text-[10px] uppercase tracking-wider`}>
                                            {tx.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
