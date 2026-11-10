import Link from "next/link"
import PublicFooter from "./PublicFooter"
import PublicNavbar from "./PublicNavbar"

export interface PolicySection {
  heading: string
  content: string
}

interface PublicPolicyPageProps {
  title: string
  summary: string
  sections: PolicySection[]
}

const PublicPolicyPage = ({
  title,
  summary,
  sections,
}: PublicPolicyPageProps) => (
  <>
    <PublicNavbar />
    <main className="flex-1 bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
        >
          Healora
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">{summary}</p>
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          This is an initial policy draft. It must be reviewed and updated to
          reflect Healora&apos;s actual services, data practices, and applicable
          legal requirements before being treated as a final policy.
        </p>
        <div className="mt-8 space-y-7">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-xl font-bold text-slate-950">
                {section.heading}
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {section.content}
              </p>
            </section>
          ))}
        </div>
        <section className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="font-heading text-xl font-bold text-slate-950">
            Contact
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            House 42, Road 7, Dhanmondi, Dhaka 1205, Bangladesh
            <br />
            Phone: <a className="text-emerald-800 hover:underline" href="tel:12345678">12345678</a>
          </p>
        </section>
      </article>
    </main>
    <PublicFooter />
  </>
)

export default PublicPolicyPage
