import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
        vehicle_type: 'backpack',
        bike_reg_number: '',
        id_number: '',
        photo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store.url(), {
            onSuccess: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <form onSubmit={submit} className="flex flex-col gap-6" encType="multipart/form-data">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            name="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="Full name"
                        />
                        <InputError
                            message={form.errors.name}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            name="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            name="password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            name="password_confirmation"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                        />
                        <InputError
                            message={form.errors.password_confirmation}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Account Type</Label>
                        <select
                            id="role"
                            name="role"
                            value={form.data.role}
                            onChange={(e) => form.setData('role', e.target.value as any)}
                            className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            tabIndex={5}
                        >
                            <option value="customer">Customer</option>
                            <option value="business">Business</option>
                            <option value="carrier">Carrier</option>
                        </select>
                        <InputError message={form.errors.role} />
                    </div>

                    {form.data.role === 'carrier' && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                                <select
                                    id="vehicle_type"
                                    name="vehicle_type"
                                    value={form.data.vehicle_type}
                                    onChange={(e) => form.setData('vehicle_type', e.target.value as any)}
                                    className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    tabIndex={6}
                                >
                                    <option value="backpack">Backpack (Walker/Transit)</option>
                                    <option value="bike">Bike / Scooter</option>
                                </select>
                                <InputError message={form.errors.vehicle_type as string} />
                            </div>

                            {form.data.vehicle_type === 'bike' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bike_reg_number">Bike Registration Number</Label>
                                        <Input
                                            id="bike_reg_number"
                                            type="text"
                                            required
                                            tabIndex={7}
                                            name="bike_reg_number"
                                            value={form.data.bike_reg_number}
                                            onChange={(e) => form.setData('bike_reg_number', e.target.value)}
                                            placeholder="Registration Number"
                                        />
                                        <InputError message={form.errors.bike_reg_number as string} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="id_number">ID Number</Label>
                                        <Input
                                            id="id_number"
                                            type="text"
                                            required
                                            tabIndex={8}
                                            name="id_number"
                                            value={form.data.id_number}
                                            onChange={(e) => form.setData('id_number', e.target.value)}
                                            placeholder="National ID / Driver's License"
                                        />
                                        <InputError message={form.errors.id_number as string} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="photo">Profile Photo</Label>
                                        <Input
                                            id="photo"
                                            type="file"
                                            required
                                            tabIndex={9}
                                            name="photo"
                                            onChange={(e) => form.setData('photo', e.target.files?.[0] as any)}
                                            accept="image/*"
                                        />
                                        <InputError message={form.errors.photo as string} />
                                    </div>
                                </>
                            )}
                        </>
                    )}


                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        tabIndex={10}
                        data-test="register-user-button"
                        disabled={form.processing}
                    >
                        {form.processing && <Spinner />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={login()} tabIndex={11}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
