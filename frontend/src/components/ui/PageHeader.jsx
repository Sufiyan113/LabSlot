const PageHeader = ({ title, subtitle, actions, breadcrumb }) => (
  <div className="mb-5 sm:mb-8">
    {breadcrumb && (
      <nav className="flex items-center gap-1.5 text-xs text-ink-subtle mb-2 overflow-x-auto">
        {breadcrumb}
      </nav>
    )}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="page-title break-words">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  </div>
);

export default PageHeader;
