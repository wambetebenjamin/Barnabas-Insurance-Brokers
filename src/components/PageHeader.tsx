/**
 * Page header with breadcrumbs.
 *
 * The design source’s `.page-header` is a blue overlay on carousel-1.jpg with a
 * Bootstrap breadcrumb (.page-header .breadcrumb-item a { color: #696E77 },
 * :hover and .active in --primary). This component reproduces that pattern with
 * the source’s own overlay recipe, `linear-gradient(rgba(1,95,201,.9),
 * rgba(1,95,201,.9)), url(../img/carousel-1.jpg)`, written here as
 * rgba(var(--primary) .9) equivalents so every inner page carries the same head.
 */
import Link from "next/link";
import type { ReactNode } from "react";

export interface Crumb {
  name: string;
  href: string;
}

export function PageHeader({
  title,
  intro,
  crumbs = [],
  children,
}: {
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <header className="b-pageheader">
      <div className="container">
        <nav aria-label="Breadcrumb">
          <ol className="b-crumbs">
            <li>
              <Link href="/">Home</Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.href}>
                <Link href={crumb.href}>{crumb.name}</Link>
              </li>
            ))}
            <li>
              <span aria-current="page">{title}</span>
            </li>
          </ol>
        </nav>

        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
        {children}
      </div>
    </header>
  );
}
