export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-xl font-medium">Dormilazzo Platform</h1>
      <p className="text-sm text-neutral-600">
        Scaffold iniziale. Le aree ospiti si raggiungono via QR
        (/guest/mipa, /guest/via-nazionale), staff e admin richiedono login.
      </p>
    </main>
  );
}
