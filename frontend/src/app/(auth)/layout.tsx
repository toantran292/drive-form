export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="flex flex-col items-center">
                    {/* Logo */}
                    <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                            />
                        </svg>
                    </div>

                    {/* App Name */}
                    <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        DriveForm
                    </h1>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Your all-in-one solution for files and forms
                    </p>
                </div>

                {/* Auth Forms will be rendered here */}
                {children}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        By continuing, you agree to our{' '}
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
} 