function ErrorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
        404 Error
      </h1>
      <div className="bg-card p-6 sm:p-8 rounded-lg shadow-sm border">
        <p className="text-muted-foreground text-sm sm:text-base">
          Error page here.
        </p>
      </div>
    </div>
  );
}

export default ErrorPage;
