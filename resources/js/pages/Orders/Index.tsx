import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { MapPin, PackageOpen, Tag, CheckCircle, Truck, AlertTriangle, Zap } from 'lucide-react';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/orders' },
];

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrdersIndex({ orders }: any) {
    const { auth } = usePage().props as any;
    const userRole = auth.user.role;
    const { data, setData, post, processing, reset } = useForm({
        description: '',
        pickup_address: '',
        delivery_address: '',
        price: '',
        distance: '',
        carrier_type: 'bike',
    });

    const calculatedFee = React.useMemo(() => {
        const dist = parseFloat(data.distance) || 0;
        const rate = data.carrier_type === 'bike' ? 100 : 50;
        return (dist * rate).toFixed(2);
    }, [data.distance, data.carrier_type]);

    const calculateDistance = async () => {
        if (!data.pickup_address || !data.delivery_address) {
            alert("Please enter both pickup and drop-off addresses first.");
            return;
        }
        try {
            const pickupRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.pickup_address)}`);
            const pickupData = await pickupRes.json();
            const deliveryRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.delivery_address)}`);
            const deliveryData = await deliveryRes.json();

            if (pickupData.length > 0 && deliveryData.length > 0) {
                const lat1 = parseFloat(pickupData[0].lat);
                const lon1 = parseFloat(pickupData[0].lon);
                const lat2 = parseFloat(deliveryData[0].lat);
                const lon2 = parseFloat(deliveryData[0].lon);

                const R = 6371; // km
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                let distance = R * c;

                let alertMsg = "";
                if (distance < 5) {
                    distance = 5;
                    alertMsg = "Minimum testing distance applied (5km).\nWe are only testing in Nairobi and its environs.";
                } else if (distance > 10) {
                    distance = 10;
                    alertMsg = "Maximum testing distance applied (10km).\nWe are only testing in Nairobi and its environs.";
                } else {
                    alertMsg = "Distance calculated successfully.\nPlease note we are only testing in Nairobi and its environs.";
                }

                alert(alertMsg);
                setData('distance', distance.toFixed(1));
            } else {
                alert("Could not find coordinates for one or both addresses. You may need to enter the distance manually.");
            }
        } catch (e) {
            console.error(e);
            alert("Error calculating distance. Please enter it manually.");
        }
    };

    const [openNewOrder, setOpenNewOrder] = useState(false);

    const submitOrder = (e: React.FormEvent) => {
        e.preventDefault();
        post('/orders', {
            onSuccess: () => {
                setOpenNewOrder(false);
                reset();
            }
        });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
            accepted: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
            picked_up: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/50',
            in_transit: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
            delivered: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
            conflict: 'bg-rose-500/20 text-rose-500 border-rose-500/50',
        };
        return <Badge variant="outline" className={`${colors[status] || ''} capitalize px-3 py-1 font-medium tracking-wide`}>{status.replace('_', ' ')}</Badge>;
    };

    const updateStatus = (order: any, newStatus: string, code?: string) => {
        router.put(`/orders/${order.id}`, { status: newStatus, confirmation_code: code });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">System Orders</h1>
                        <p className="mt-2 text-muted-foreground font-medium">Manage and track your delivery ecosystem securely.</p>
                    </div>

                    {(userRole === 'customer' || userRole === 'business') && (
                        <Dialog open={openNewOrder} onOpenChange={setOpenNewOrder}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95 duration-200">
                                    <PackageOpen className="mr-2 h-4 w-4" /> New Delivery Order
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Delivery</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitOrder} className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Package Description</Label>
                                        <Input id="description" placeholder="e.g. 2x Electronics" value={data.description} onChange={e => setData('description', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="pickup">Pickup Address</Label>
                                        <Input id="pickup" placeholder="123 Origin St" value={data.pickup_address} onChange={e => setData('pickup_address', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="delivery">Delivery Address</Label>
                                        <Input id="delivery" placeholder="456 Destination Ave" value={data.delivery_address} onChange={e => setData('delivery_address', e.target.value)} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="distance">Distance (km)</Label>
                                                <button type="button" onClick={calculateDistance} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">
                                                    <Zap className="h-3 w-3" /> Auto-calc
                                                </button>
                                            </div>
                                            <Input id="distance" type="number" step="0.1" value={data.distance} onChange={e => setData('distance', e.target.value)} required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="carrier_type">Carrier Type</Label>
                                            <Select value={data.carrier_type} onValueChange={v => setData('carrier_type', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bike">Bike (KES 100/km)</SelectItem>
                                                    <SelectItem value="backpack">Backpack (KES 50/km)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Item Value (KES) - Optional</Label>
                                        <Input id="price" type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} />
                                    </div>
                                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg border border-border mt-2">
                                        <span className="font-medium text-muted-foreground">Calculated Fee</span>
                                        <span className="font-bold text-lg text-emerald-600">KES {calculatedFee}</span>
                                    </div>
                                    <Button type="submit" disabled={processing} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700">Submit Request</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.length === 0 ? (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-xl bg-card/50 backdrop-blur-sm">
                            <Truck className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold">No orders found</h3>
                            <p className="text-muted-foreground mt-2">There currently are no active deliveries.</p>
                        </div>
                    ) : orders.map((order: any) => (
                        <Card key={order.id} className="relative overflow-hidden group border border-border/50 bg-card/50 backdrop-blur-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 ease-out">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold">#{order.id.toString().padStart(4, '0')}</CardTitle>
                                    <StatusBadge status={order.status} />
                                </div>
                                <CardDescription className="font-medium text-foreground/80 mt-2">{order.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" /> <span className="font-medium text-foreground">Pick up:</span> {order.pickup_address}</div>
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> <span className="font-medium text-foreground">Drop off:</span> {order.delivery_address}</div>
                                    <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-blue-500" /> <span className="font-medium text-foreground">Fee:</span> KES {order.delivery_fee}</div>
                                </div>

                                <div className="pt-4 border-t border-border/50 flex gap-2">
                                    {userRole === 'carrier' && order.status === 'pending' && (
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus(order, 'accepted')}>Accept Job</Button>
                                    )}
                                    {userRole === 'carrier' && order.status === 'accepted' && (
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => updateStatus(order, 'picked_up')}>Mark Picked Up</Button>
                                    )}
                                    {userRole === 'carrier' && order.status === 'picked_up' && (
                                        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => updateStatus(order, 'in_transit')}>In Transit</Button>
                                    )}
                                    {userRole === 'carrier' && order.status === 'in_transit' && (
                                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                                            const code = prompt("Enter the 6-character confirmation code provided by the customer:");
                                            if (code) updateStatus(order, 'delivered', code);
                                        }}>Confirm Delivery</Button>
                                    )}

                                    {userRole === 'customer' && order.status !== 'delivered' && (
                                        <div className="w-full py-2 text-center rounded-md bg-muted/50 border border-border">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Receipt Code</p>
                                            <p className="font-mono text-lg font-bold tracking-widest text-emerald-500">{order.confirmation_code}</p>
                                        </div>
                                    )}

                                    {order.status === 'delivered' && (
                                        <div className="w-full py-2 flex items-center justify-center gap-2 text-emerald-500 font-medium">
                                            <CheckCircle className="w-5 h-5" /> Completed
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
