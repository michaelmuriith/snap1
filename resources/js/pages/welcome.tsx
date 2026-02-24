import { Head, Link } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import AppLogoIcon from '@/components/app-logo-icon';
import { ArrowRight, MapPin, Package, ShieldCheck, Zap, Truck } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

export default function Welcome({
    auth,
    canRegister = true,
}: {
    auth: { user: any };
    canRegister?: boolean;
}) {
    const { data, setData, post, processing, reset } = useForm({
        description: '',
        pickup_address: '',
        delivery_address: '',
        price: '0.00',
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

    const submitOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.user) {
            window.location.href = login().url;
            return;
        }

        post('/orders', {
            onSuccess: () => {
                reset();
                alert('Delivery requested successfully! Please check your dashboard.');
            }
        });
    };

    return (
        <>
            <Head title="Snap - Modern Deliveries" />

            <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-rose-500 selection:text-white dark:bg-[#0a0a0a] dark:text-slate-100">

                {/* Navbar */}
                <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-[#0a0a0a]/80">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="h-8 w-8 text-rose-600" />
                            <span className="text-xl font-bold tracking-tight">Snap</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium hover:text-rose-600 dark:hover:text-rose-500"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-grow pt-16">
                    <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pb-48">
                        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
                        </div>

                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl dark:text-white">
                                Delivering <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">smiles</span> across the city.
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                                Snap connects local businesses, independent couriers, and eager customers through one seamless, transparent delivery platform. Start moving your orders faster today.
                            </p>
                            <div className="mt-10 flex flex-col items-center justify-center gap-x-6">
                                <div className="flex gap-x-6">
                                    <Link
                                        href={register()}
                                        className="rounded-full bg-rose-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 inline-flex items-center gap-2 transition-all hover:scale-105"
                                    >
                                        Join the Network
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a href="#features" className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100 hover:text-rose-600 dark:hover:text-rose-400 flex items-center">
                                        Learn more <span aria-hidden="true" className="ml-1">→</span>
                                    </a>
                                </div>

                                {/* Quick Request Form */}
                                <div className="mt-16 w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl text-left">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                                            <Truck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quick Request</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Need a pickup right now?</p>
                                        </div>
                                    </div>

                                    <form onSubmit={submitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 grid gap-2">
                                            <Label htmlFor="description">What are we delivering?</Label>
                                            <Input id="description" placeholder="e.g., Important Documents" value={data.description} onChange={e => setData('description', e.target.value)} required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="pickup">Pickup Address</Label>
                                            <Input id="pickup" placeholder="123 Origin St" value={data.pickup_address} onChange={e => setData('pickup_address', e.target.value)} required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="delivery">Drop-off Address</Label>
                                            <Input id="delivery" placeholder="456 Destination Ave" value={data.delivery_address} onChange={e => setData('delivery_address', e.target.value)} required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="distance">Distance (km)</Label>
                                                    <button type="button" onClick={calculateDistance} className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1">
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
                                        <div className="md:col-span-2 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <span className="font-medium text-slate-500 dark:text-slate-400">Estimated Delivery Fee</span>
                                            <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">KES {calculatedFee}</span>
                                        </div>
                                        <div className="md:col-span-2 mt-2">
                                            <Button type="submit" disabled={processing} className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                                                {auth.user ? 'Submit Delivery Request' : 'Sign in to Request Delivery'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Grid */}
                    <section id="features" className="bg-slate-50 py-24 sm:py-32 dark:bg-slate-900">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl lg:text-center">
                                <h2 className="text-base font-semibold leading-7 text-rose-600 dark:text-rose-400">Ship Faster</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                    Everything you need to manage local logistics.
                                </p>
                                <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                                    Whether you're a business sending packages, a carrier looking for jobs, or a customer waiting for a delivery, our app handles it all.
                                </p>
                            </div>
                            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                                    <div className="relative pl-16">
                                        <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                                            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600">
                                                <Package className="h-6 w-6 text-white" aria-hidden="true" />
                                            </div>
                                            Seamless Ordering
                                        </dt>
                                        <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                                            Create and dispatch orders in seconds. Track exactly where your packages are and who is driving them.
                                        </dd>
                                    </div>
                                    <div className="relative pl-16">
                                        <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                                            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600">
                                                <Zap className="h-6 w-6 text-white" aria-hidden="true" />
                                            </div>
                                            Live State Machine
                                        </dt>
                                        <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                                            Watch your orders move from Pending $\to$ Accepted $\to$ Picked Up $\to$ In Transit $\to$ Delivered in real time.
                                        </dd>
                                    </div>
                                    <div className="relative pl-16">
                                        <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                                            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600">
                                                <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                                            </div>
                                            Secure Hand-offs
                                        </dt>
                                        <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                                            Deliveries are confirmed using a unique 6-digit confirmation code generated upon order creation.
                                        </dd>
                                    </div>
                                    <div className="relative pl-16">
                                        <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                                            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600">
                                                <MapPin className="h-6 w-6 text-white" aria-hidden="true" />
                                            </div>
                                            Transparent Earnings
                                        </dt>
                                        <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                                            Carriers see delivery fees upfront. Money is instantly moved to their Wallet upon successful delivery.
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-white py-12 dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="h-6 w-6 text-slate-400" />
                            <span className="text-lg font-bold tracking-tight text-slate-400">Snap</span>
                        </div>
                        <p className="text-sm text-slate-500 text-center sm:text-left">
                            &copy; {new Date().getFullYear()} Snap Delivery, Inc. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
