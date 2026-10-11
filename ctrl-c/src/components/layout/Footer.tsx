import { Wordmark } from "@/components/brand/Wordmark";
import { footer, footerNav } from "@/content/copy";
import { PRIVACY_POLICY_URL, contacts, getInvolvementLinks, isExternal, site } from "@/content/site";

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await getYear();
  const links = getInvolvementLinks();

  return (
    <footer id="site-footer" className="relative overflow-clip border-t border-line bg-sunken">
      <div className="wrap grid gap-12 pt-16 pb-10 md:grid-cols-12 md:gap-8 md:pt-20">
        <div className="md:col-span-4">
          <a href="#top" className="inline-block rounded-md" aria-label="Ctrl C, back to top">
            <Wordmark decorative className="text-[1.85rem]" />
          </a>
          <p className="mt-5 max-w-[34ch] text-muted">{footer.blurb}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <p className="mono mb-4 text-faint">Sheets</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[0.95rem] md:grid-cols-1">
            {footerNav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="mono mb-4 text-faint">Contact</p>
          <ul className="grid gap-2.5 text-[0.95rem]">
            {contacts.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                  {...(isExternal(item.href) ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="mono mb-4 text-faint">Elsewhere</p>
          {links.length > 0 ? (
            <ul className="grid gap-2.5 text-[0.95rem]">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                    {...(isExternal(link.href) ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.95rem] text-muted">Links will be added here once they exist.</p>
          )}
        </div>
      </div>

      <div className="wrap" aria-hidden="true">
        <div className="footer-mark -mb-[0.06em] whitespace-nowrap">
          Ctrl <span className="footer-mark__c">C</span>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="wrap mono flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 text-faint">
          <span>
            © {year} {site.name}
          </span>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 transition-colors hover:text-fg hover:underline"
            >
              Privacy Policy
            </a>
            <span aria-hidden="true">
              {footer.revision} · Sheet 08 / 08
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
