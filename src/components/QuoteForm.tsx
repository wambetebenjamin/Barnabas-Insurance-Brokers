"use client";

/**
 * Quotation request form (brief section 6).
 *
 * Four steps:
 *   1. select the insurance type
 *   2. product specific questions (motor: registration, make, model, year, value in
 *      KES. health: number of persons, ages, pre-existing conditions. life: age,
 *      smoker status, sum assured. property: value, location, type)
 *   3. personal details: full name, ID number, phone, email, county
 *   4. confirm, with reCAPTCHA v3 running invisibly
 *
 * On submit: POST /api/quote saves the request to Vercel KV, WhatsApps the broker
 * the lead details and WhatsApps the client a confirmation with their reference
 * number. The broker then calls or WhatsApps within 24 hours, which the success
 * panel states in those words.
 */
import { useState } from "react";
import Link from "next/link";
import { PRODUCTS, type ProductSlug } from "@/data/products";
import { COUNTIES, SITE, whatsappLink } from "@/lib/site";
import { formatKes, isValidKenyanId, isValidKenyanPhone } from "@/lib/format";
import { Field, Input, Select, Textarea, Option, ConsentCheckbox } from "@/components/forms/Fields";
import { CaptchaV2 } from "@/components/forms/CaptchaV2";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";

type DetailValue = string | number | string[];
type Details = Record<string, DetailValue>;

const STEPS = [
  { title: "Cover type", caption: "What do you need?" },
  { title: "Your details", caption: "Tell us about the risk" },
  { title: "Contact", caption: "How we reach you" },
  { title: "Confirm", caption: "Check and send" },
];

const COVER_OPTIONS: { value: ProductSlug; title: string; description: string }[] = PRODUCTS.map(
  (product) => ({
    value: product.slug,
    title: product.name,
    description: product.benefit,
  }),
);

export function QuoteForm({ initialProduct }: { initialProduct?: ProductSlug }) {
  const [step, setStep] = useState(initialProduct ? 2 : 1);
  const [insuranceType, setInsuranceType] = useState<ProductSlug | "">(initialProduct ?? "");
  const [details, setDetails] = useState<Details>({});
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");
  const [preferredContact, setPreferredContact] = useState<"whatsapp" | "phone" | "email">("whatsapp");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { status, submit, submitWithV2Token, result, error, fieldErrors, isSending, reset } =
    useLeadSubmit<{
      ok: boolean;
      reference?: string;
      message?: string;
      error?: string;
      fieldErrors?: Record<string, string>;
      captcha?: { ok: boolean; reason: string; needsV2?: boolean; detail?: string };
      delivery?: {
        brokerWhatsApp?: string;
        clientWhatsApp?: string;
        email?: string;
        storage?: string;
        notes?: string[];
      };
      whatsappLink?: string;
    }>({ endpoint: "/api/quote", action: "quote_request" });

  const set = (key: string, value: DetailValue) =>
    setDetails((current) => ({ ...current, [key]: value }));

  const product = PRODUCTS.find((item) => item.slug === insuranceType);

  /* ------------------------------------------------------------ validation */

  const validateStep = (target: number): boolean => {
    const next: Record<string, string> = {};

    if (target === 2) {
      if (!insuranceType) next.insuranceType = "Select the type of cover you need";
      const d = details as Record<string, DetailValue>;

      if (insuranceType === "motor-insurance") {
        if (!String(d.registrationNumber ?? "").trim()) next.registrationNumber = "Enter the vehicle registration number";
        if (!String(d.make ?? "").trim()) next.make = "Enter the make, for example Toyota";
        if (!String(d.model ?? "").trim()) next.model = "Enter the model, for example Premio";
        const year = Number(d.year);
        if (!year || year < 1970 || year > new Date().getFullYear() + 1) next.year = "Enter the year of manufacture";
        if (!Number(d.vehicleValue)) next.vehicleValue = "Enter the current value of the vehicle in KES";
        if (!d.vehicleUse) next.vehicleUse = "Tell us how the vehicle is used";
      }

      if (insuranceType === "health-and-medical") {
        if (!Number(d.numberOfPersons)) next.numberOfPersons = "How many people should be covered?";
        if (!String(d.ages ?? "").trim()) next.ages = "List the ages of everyone to be covered";
      }

      if (insuranceType === "life-insurance") {
        const age = Number(d.age);
        if (!age || age < 18 || age > 75) next.age = "Enter an age between 18 and 75";
        if (!d.smoker) next.smoker = "Tell us whether you smoke, it affects the premium";
        if (!Number(d.sumAssured)) next.sumAssured = "How much cover do you need, in KES?";
      }

      if (insuranceType === "home-and-property") {
        if (!Number(d.propertyValue)) next.propertyValue = "Enter the value to be insured in KES";
        if (!d.propertyType) next.propertyType = "What type of property is it?";
        if (!d.occupancy) next.occupancy = "Is it owner occupied, rented out, or tenanted?";
        if (!String(d.location ?? "").trim()) next.location = "Where is the property?";
      }

      if (insuranceType === "business-insurance") {
        if (!String(d.companyName ?? "").trim()) next.companyName = "Enter the business name";
        if (!String(d.industry ?? "").trim()) next.industry = "What industry are you in?";
        if (!Number.isFinite(Number(d.employees))) next.employees = "How many employees do you have?";
        if (!Array.isArray(d.coversNeeded) || d.coversNeeded.length === 0)
          next.coversNeeded = "Select at least one cover";
      }

      if (insuranceType === "travel-insurance") {
        if (!String(d.destination ?? "").trim()) next.destination = "Where are you travelling to?";
        if (!String(d.departureDate ?? "").trim()) next.departureDate = "When do you leave?";
        if (!String(d.returnDate ?? "").trim()) next.returnDate = "When do you return?";
        if (!Number(d.travellers)) next.travellers = "How many people are travelling?";
        if (!d.purpose) next.purpose = "What is the purpose of the trip?";
      }
    }

    if (target === 3) {
      if (fullName.trim().length < 2) next.fullName = "Enter your full name as it appears on your ID";
      if (!isValidKenyanId(idNumber)) next.idNumber = "Enter a valid Kenyan ID or passport number";
      if (!isValidKenyanPhone(phone)) next.phone = "Enter a Kenyan phone number, for example 0712 345 678";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
      if (!county) next.county = "Select your county";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step + 1)) return;
    setStep((current) => Math.min(4, current + 1));
  };

  const goBack = () => setStep((current) => Math.max(1, current - 1));

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const allErrors: Record<string, string> = {};
    if (!insuranceType) allErrors.insuranceType = "Select the type of cover you need";
    if (fullName.trim().length < 2) allErrors.fullName = "Enter your full name";
    if (!isValidKenyanPhone(phone)) allErrors.phone = "Enter a Kenyan phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) allErrors.email = "Enter a valid email address";
    if (!county) allErrors.county = "Select your county";
    if (!consent) allErrors.consent = "Please give your consent so we can process this request";

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setStep(4);
      return;
    }
    setErrors({});

    void submit({
      insuranceType,
      details,
      fullName,
      idNumber,
      phone,
      email,
      county,
      preferredContact,
      notes,
      consent: true,
      source: "website-quote-form",
    });
  };

  /* --------------------------------------------------------------- success */

  if (status === "success" && result) {
    const clientLink =
      result.delivery?.clientWhatsApp === "sent"
        ? null
        : whatsappLink(
            `Hello Barnabas Insurance Brokers. I submitted quotation request ${result.reference} for ${product?.name}.`,
          );

    return (
      <div className="b-form" role="status" aria-live="polite">
        <div className="b-alert b-alert--ok" style={{ marginBottom: 20 }}>
          <i className="bi bi-check-circle-fill" aria-hidden="true" />
          <span>
            <strong>{result.message ?? "Your quotation request has been received."}</strong>
          </span>
        </div>

        <dl className="b-kv">
          <dt>Your reference number</dt>
          <dd>
            <span className="b-ref">{result.reference}</span>
          </dd>
          <dt>Cover requested</dt>
          <dd>{product?.name}</dd>
          <dt>What happens next</dt>
          <dd>
            A licensed broker will call or WhatsApp you on {phone} within 24 hours with options and
            prices from the insurers we have compared for you.
          </dd>
          <dt>Who we sent it to</dt>
          <dd>
            Your request went to our broker desk at {SITE.email}.
            {result.delivery?.brokerWhatsApp === "sent"
              ? " The broker has been notified on WhatsApp."
              : " The broker desk has the details in the portal."}
          </dd>
        </dl>

        <div className="b-alert b-alert--info" style={{ marginBottom: 18 }}>
          <i className="bi bi-whatsapp" aria-hidden="true" />
          <span>
            {result.delivery?.clientWhatsApp === "sent"
              ? "We have sent a WhatsApp confirmation with your reference number to the number you gave us."
              : "Keep your reference number. Tap below to open WhatsApp with your reference already written for you."}
          </span>
        </div>

        <div className="b-formnav" style={{ justifyContent: "flex-start", gap: 12 }}>
          {clientLink ? (
            <a className="btn btn-primary" href={clientLink} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp" aria-hidden="true" /> Continue on WhatsApp
            </a>
          ) : null}
          <Link className="btn b-btn-ghost" href="/compare">
            Compare insurers while you wait
          </Link>
          <button
            type="button"
            className="btn b-btn-ghost"
            onClick={() => {
              reset();
              setStep(1);
              setInsuranceType("");
              setDetails({});
              setConsent(false);
            }}
          >
            Start another quotation
          </button>
        </div>

        <p className="b-legal-note">
          Barnabas Insurance Brokers advises and places cover. The insurer pays claims. Quotations
          are valid for 30 days from the date of issue and are subject to underwriting by the
          insurer. Our licence number with the Insurance Regulatory Authority is{" "}
          {SITE.iraLicenseNumber}.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------------ form */

  const detailError = (key: string) => errors[key] ?? fieldErrors[`details.${key}`] ?? fieldErrors[key];

  return (
    <form className="b-form" onSubmit={onSubmit} noValidate>
      <ol className="b-steps">
        {STEPS.map((item, index) => {
          const number = index + 1;
          return (
            <li
              key={item.title}
              className={number === step ? "is-active" : number < step ? "is-done" : ""}
              aria-current={number === step ? "step" : undefined}
            >
              <strong>
                {number}. {item.title}
              </strong>
              {item.caption}
            </li>
          );
        })}
      </ol>

      {/* Step 1: cover type */}
      {step === 1 && (
        <fieldset className="b-fieldset b-step-panel">
          <legend className="b-visually-hidden">Select the type of insurance you need</legend>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>What cover do you need?</h2>
          <p className="b-lead" style={{ marginBottom: 18 }}>
            Pick a product and we will ask only the questions that product needs. It takes about two
            minutes.
          </p>
          <div className="b-option-grid">
            {COVER_OPTIONS.map((option) => (
              <Option
                key={option.value}
                name="insuranceType"
                value={option.value}
                checked={insuranceType === option.value}
                onChange={(value) => {
                  setInsuranceType(value as ProductSlug);
                  setDetails({});
                }}
                title={option.title}
                description={option.description}
              />
            ))}
          </div>
          {errors.insuranceType ? (
            <span className="b-error" role="alert">
              {errors.insuranceType}
            </span>
          ) : null}
        </fieldset>
      )}

      {/* Step 2: product specific */}
      {step === 2 && insuranceType && (
        <div className="b-step-panel">
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>{product?.name} details</h2>
          <p className="b-lead" style={{ marginBottom: 18 }}>
            {product?.benefit}
          </p>

          {insuranceType === "motor-insurance" && (
            <>
              <Field label="Vehicle registration number" htmlFor="registrationNumber" required error={detailError("registrationNumber")}>
                <Input
                  id="registrationNumber"
                  placeholder="KDA 123A"
                  value={String(details.registrationNumber ?? "")}
                  onChange={(event) => set("registrationNumber", event.target.value.toUpperCase())}
                  invalid={Boolean(detailError("registrationNumber"))}
                />
              </Field>
              <div className="b-option-grid">
                <Field label="Make" htmlFor="make" required error={detailError("make")}>
                  <Input id="make" placeholder="Toyota" value={String(details.make ?? "")} onChange={(event) => set("make", event.target.value)} invalid={Boolean(detailError("make"))} />
                </Field>
                <Field label="Model" htmlFor="model" required error={detailError("model")}>
                  <Input id="model" placeholder="Premio" value={String(details.model ?? "")} onChange={(event) => set("model", event.target.value)} invalid={Boolean(detailError("model"))} />
                </Field>
              </div>
              <div className="b-option-grid">
                <Field label="Year of manufacture" htmlFor="year" required error={detailError("year")}>
                  <Input id="year" type="number" inputMode="numeric" min={1970} max={new Date().getFullYear() + 1} placeholder="2016" value={String(details.year ?? "")} onChange={(event) => set("year", event.target.value)} invalid={Boolean(detailError("year"))} />
                </Field>
                <Field label="Current value (KES)" htmlFor="vehicleValue" required hint="The market value today, not the purchase price." error={detailError("vehicleValue")}>
                  <Input id="vehicleValue" type="number" inputMode="numeric" min={50000} step={10000} placeholder="2500000" value={String(details.vehicleValue ?? "")} onChange={(event) => set("vehicleValue", event.target.value)} invalid={Boolean(detailError("vehicleValue"))} />
                </Field>
              </div>
              <Field label="How is the vehicle used?" htmlFor="vehicleUse" required error={detailError("vehicleUse")}>
                <div className="b-option-grid" id="vehicleUse">
                  {[
                    { value: "private", title: "Private use", description: "Family and personal travel only" },
                    { value: "commercial", title: "Commercial", description: "Deliveries, sales, or business travel" },
                    { value: "psv", title: "PSV", description: "Matatu, taxi, or ride hailing" },
                    { value: "motorcycle", title: "Motorcycle", description: "Boda boda or personal motorbike" },
                  ].map((option) => (
                    <Option
                      key={option.value}
                      name="vehicleUse"
                      value={option.value}
                      checked={details.vehicleUse === option.value}
                      onChange={(value) => set("vehicleUse", value)}
                      title={option.title}
                      description={option.description}
                    />
                  ))}
                </div>
              </Field>
            </>
          )}

          {insuranceType === "health-and-medical" && (
            <>
              <div className="b-option-grid">
                <Field label="Number of people to cover" htmlFor="numberOfPersons" required error={detailError("numberOfPersons")}>
                  <Input id="numberOfPersons" type="number" inputMode="numeric" min={1} max={30} placeholder="4" value={String(details.numberOfPersons ?? "")} onChange={(event) => set("numberOfPersons", event.target.value)} invalid={Boolean(detailError("numberOfPersons"))} />
                </Field>
                <Field label="Ages of everyone to be covered" htmlFor="ages" required hint="Separate with commas, for example 38, 35, 8, 5." error={detailError("ages")}>
                  <Input id="ages" placeholder="38, 35, 8, 5" value={String(details.ages ?? "")} onChange={(event) => set("ages", event.target.value)} invalid={Boolean(detailError("ages"))} />
                </Field>
              </div>
              <Field label="Pre-existing conditions" htmlFor="preExistingConditions" hint="Declare hypertension, diabetes, asthma, or any condition under treatment. Declaring a condition does not exclude it, not declaring it can void a claim.">
                <Textarea id="preExistingConditions" rows={3} placeholder="None, or list the conditions and who they affect" value={String(details.preExistingConditions ?? "")} onChange={(event) => set("preExistingConditions", event.target.value)} />
              </Field>
              <Field label="Inpatient limit you are aiming for" htmlFor="inpatientLimit">
                <Select id="inpatientLimit" value={String(details.inpatientLimit ?? "")} onChange={(event) => set("inpatientLimit", event.target.value)}>
                  <option value="">No preference, advise me</option>
                  <option value="1000000">KES 1,000,000</option>
                  <option value="3000000">KES 3,000,000</option>
                  <option value="5000000">KES 5,000,000</option>
                  <option value="10000000">KES 10,000,000 or more</option>
                  <option value="not-sure">Not sure, compare options for me</option>
                </Select>
              </Field>
            </>
          )}

          {insuranceType === "life-insurance" && (
            <>
              <div className="b-option-grid">
                <Field label="Your age" htmlFor="age" required error={detailError("age")}>
                  <Input id="age" type="number" inputMode="numeric" min={18} max={75} placeholder="35" value={String(details.age ?? "")} onChange={(event) => set("age", event.target.value)} invalid={Boolean(detailError("age"))} />
                </Field>
                <Field label="Sum assured you need (KES)" htmlFor="sumAssured" required hint="We can calculate this with you. Ten times your annual income plus loans is a common starting point." error={detailError("sumAssured")}>
                  <Input id="sumAssured" type="number" inputMode="numeric" min={500000} step={500000} placeholder="5000000" value={String(details.sumAssured ?? "")} onChange={(event) => set("sumAssured", event.target.value)} invalid={Boolean(detailError("sumAssured"))} />
                </Field>
              </div>
              <Field label="Do you smoke or use nicotine products?" htmlFor="smoker" required error={detailError("smoker")}>
                <div className="b-option-grid" id="smoker">
                  {[
                    { value: "no", title: "No", description: "Never smoked, or not in the last 12 months" },
                    { value: "quit", title: "I quit", description: "Stopped more than 12 months ago" },
                    { value: "yes", title: "Yes", description: "Cigarettes, vaping, or other nicotine" },
                  ].map((option) => (
                    <Option key={option.value} name="smoker" value={option.value} checked={details.smoker === option.value} onChange={(value) => set("smoker", value)} title={option.title} description={option.description} />
                  ))}
                </div>
              </Field>
              <div className="b-option-grid">
                <Field label="Cover for" htmlFor="coverFor">
                  <Select id="coverFor" value={String(details.coverFor ?? "myself")} onChange={(event) => set("coverFor", event.target.value)}>
                    <option value="myself">Myself</option>
                    <option value="myself-and-spouse">Myself and my spouse</option>
                    <option value="family">The whole family</option>
                  </Select>
                </Field>
                <Field label="Preferred term (years)" htmlFor="term" hint="Optional. Leave blank and we will suggest a term.">
                  <Input id="term" type="number" inputMode="numeric" min={5} max={40} placeholder="20" value={String(details.term ?? "")} onChange={(event) => set("term", event.target.value)} />
                </Field>
              </div>
            </>
          )}

          {insuranceType === "home-and-property" && (
            <>
              <div className="b-option-grid">
                <Field label="Value to be insured (KES)" htmlFor="propertyValue" required hint="For the building, use the reinstatement cost, which is what it would cost to rebuild, not the sale price." error={detailError("propertyValue")}>
                  <Input id="propertyValue" type="number" inputMode="numeric" min={100000} step={100000} placeholder="8000000" value={String(details.propertyValue ?? "")} onChange={(event) => set("propertyValue", event.target.value)} invalid={Boolean(detailError("propertyValue"))} />
                </Field>
                <Field label="Contents value (KES)" htmlFor="contentsValue" hint="Optional. Electronics, furniture, and personal effects at replacement cost.">
                  <Input id="contentsValue" type="number" inputMode="numeric" min={0} step={50000} placeholder="1500000" value={String(details.contentsValue ?? "")} onChange={(event) => set("contentsValue", event.target.value)} />
                </Field>
              </div>
              <Field label="Where is the property?" htmlFor="location" required error={detailError("location")}>
                <Input id="location" placeholder="Kiambu, or Nairobi, Kilimani" value={String(details.location ?? "")} onChange={(event) => set("location", event.target.value)} invalid={Boolean(detailError("location"))} />
              </Field>
              <Field label="Type of property" htmlFor="propertyType" required error={detailError("propertyType")}>
                <div className="b-option-grid" id="propertyType">
                  {[
                    { value: "house", title: "House or maisonette" },
                    { value: "apartment", title: "Apartment" },
                    { value: "townhouse", title: "Townhouse" },
                    { value: "commercial", title: "Commercial property" },
                    { value: "other", title: "Something else" },
                  ].map((option) => (
                    <Option key={option.value} name="propertyType" value={option.value} checked={details.propertyType === option.value} onChange={(value) => set("propertyType", value)} title={option.title} />
                  ))}
                </div>
              </Field>
              <Field label="Occupancy" htmlFor="occupancy" required error={detailError("occupancy")}>
                <div className="b-option-grid" id="occupancy">
                  {[
                    { value: "owner-occupied", title: "I live there", description: "Owner occupied" },
                    { value: "rented-out", title: "Rented out", description: "Landlord cover, including loss of rent" },
                    { value: "tenant", title: "I rent it", description: "Contents cover for a tenant" },
                    { value: "vacant", title: "Currently vacant", description: "We will arrange the unoccupancy extension" },
                  ].map((option) => (
                    <Option key={option.value} name="occupancy" value={option.value} checked={details.occupancy === option.value} onChange={(value) => set("occupancy", value)} title={option.title} description={option.description} />
                  ))}
                </div>
              </Field>
              <Field label="Mortgage provider" htmlFor="mortgageProvider" hint="Optional. The lender’s interest is noted on the policy, which is what they require.">
                <Input id="mortgageProvider" placeholder="For example KCB, Equity, NCBA" value={String(details.mortgageProvider ?? "")} onChange={(event) => set("mortgageProvider", event.target.value)} />
              </Field>
            </>
          )}

          {insuranceType === "business-insurance" && (
            <>
              <div className="b-option-grid">
                <Field label="Business name" htmlFor="companyName" required error={detailError("companyName")}>
                  <Input id="companyName" placeholder="Registered or trading name" value={String(details.companyName ?? "")} onChange={(event) => set("companyName", event.target.value)} invalid={Boolean(detailError("companyName"))} />
                </Field>
                <Field label="Industry" htmlFor="industry" required error={detailError("industry")}>
                  <Input id="industry" placeholder="Distribution, manufacturing, school" value={String(details.industry ?? "")} onChange={(event) => set("industry", event.target.value)} invalid={Boolean(detailError("industry"))} />
                </Field>
              </div>
              <div className="b-option-grid">
                <Field label="Number of employees" htmlFor="employees" required error={detailError("employees")}>
                  <Input id="employees" type="number" inputMode="numeric" min={0} placeholder="12" value={String(details.employees ?? "")} onChange={(event) => set("employees", event.target.value)} invalid={Boolean(detailError("employees"))} />
                </Field>
                <Field label="Annual turnover" htmlFor="turnoverBand">
                  <Select id="turnoverBand" value={String(details.turnoverBand ?? "")} onChange={(event) => set("turnoverBand", event.target.value)}>
                    <option value="">Prefer not to say</option>
                    <option value="under-5m">Under KES 5 million</option>
                    <option value="5m-20m">KES 5 million to 20 million</option>
                    <option value="20m-100m">KES 20 million to 100 million</option>
                    <option value="over-100m">Over KES 100 million</option>
                  </Select>
                </Field>
              </div>
              <Field label="Which covers do you need?" htmlFor="coversNeeded" required hint="Select everything that applies. We will price them together on one schedule." error={detailError("coversNeeded")}>
                <div className="b-option-grid" id="coversNeeded">
                  {[
                    "Fire and special perils",
                    "Burglary and theft",
                    "Public liability",
                    "Employer’s liability and WIBA",
                    "Goods in transit and marine cargo",
                    "Business interruption",
                    "Group medical scheme",
                    "Group life and last expense",
                    "Directors and officers liability",
                    "Machinery breakdown",
                    "Money insurance",
                    "Cyber liability",
                  ].map((cover) => {
                    const selected = Array.isArray(details.coversNeeded)
                      ? (details.coversNeeded as string[]).includes(cover)
                      : false;
                    return (
                      <Option
                        key={cover}
                        type="checkbox"
                        name="coversNeeded"
                        value={cover}
                        checked={selected}
                        onChange={() => {
                          const current = Array.isArray(details.coversNeeded)
                            ? (details.coversNeeded as string[])
                            : [];
                          set(
                            "coversNeeded",
                            selected ? current.filter((item) => item !== cover) : [...current, cover],
                          );
                        }}
                        title={cover}
                      />
                    );
                  })}
                </div>
              </Field>
            </>
          )}

          {insuranceType === "travel-insurance" && (
            <>
              <Field label="Destination" htmlFor="destination" required error={detailError("destination")}>
                <Input id="destination" placeholder="Schengen area, Dubai, United Kingdom" value={String(details.destination ?? "")} onChange={(event) => set("destination", event.target.value)} invalid={Boolean(detailError("destination"))} />
              </Field>
              <div className="b-option-grid">
                <Field label="Departure date" htmlFor="departureDate" required error={detailError("departureDate")}>
                  <Input id="departureDate" type="date" value={String(details.departureDate ?? "")} onChange={(event) => set("departureDate", event.target.value)} invalid={Boolean(detailError("departureDate"))} />
                </Field>
                <Field label="Return date" htmlFor="returnDate" required error={detailError("returnDate")}>
                  <Input id="returnDate" type="date" value={String(details.returnDate ?? "")} onChange={(event) => set("returnDate", event.target.value)} invalid={Boolean(detailError("returnDate"))} />
                </Field>
              </div>
              <div className="b-option-grid">
                <Field label="Number of travellers" htmlFor="travellers" required error={detailError("travellers")}>
                  <Input id="travellers" type="number" inputMode="numeric" min={1} max={30} placeholder="1" value={String(details.travellers ?? "")} onChange={(event) => set("travellers", event.target.value)} invalid={Boolean(detailError("travellers"))} />
                </Field>
                <Field label="Purpose of travel" htmlFor="purpose" required error={detailError("purpose")}>
                  <Select id="purpose" value={String(details.purpose ?? "")} onChange={(event) => set("purpose", event.target.value)}>
                    <option value="">Select</option>
                    <option value="holiday">Holiday</option>
                    <option value="business">Business</option>
                    <option value="study">Study</option>
                    <option value="medical">Medical treatment</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>
              </div>
            </>
          )}

          {product ? (
            <p className="b-hint" style={{ marginTop: 4 }}>
              Indicative {product.name.toLowerCase()} cover starts from about{" "}
              {formatKes(product.fromKes)} {product.fromUnit}. The exact premium is confirmed by the
              insurer after underwriting.
            </p>
          ) : null}
        </div>
      )}

      {/* Step 3: personal details */}
      {step === 3 && (
        <div className="b-step-panel">
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>Your details</h2>
          <p className="b-lead" style={{ marginBottom: 18 }}>
            We need these to place cover and to reach you. Your ID number is used only for
            underwriting and is never stored on a public route.
          </p>

          <Field label="Full name" htmlFor="fullName" required error={errors.fullName ?? fieldErrors.fullName}>
            <Input id="fullName" autoComplete="name" placeholder="As it appears on your ID" value={fullName} onChange={(event) => setFullName(event.target.value)} invalid={Boolean(errors.fullName ?? fieldErrors.fullName)} />
          </Field>
          <div className="b-option-grid">
            <Field label="ID or passport number" htmlFor="idNumber" required error={errors.idNumber ?? fieldErrors.idNumber}>
              <Input id="idNumber" inputMode="numeric" placeholder="12345678" value={idNumber} onChange={(event) => setIdNumber(event.target.value)} invalid={Boolean(errors.idNumber ?? fieldErrors.idNumber)} />
            </Field>
            <Field label="Phone number" htmlFor="phone" required hint="WhatsApp preferred, we will use it to confirm your quote." error={errors.phone ?? fieldErrors.phone}>
              <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="0712 345 678" value={phone} onChange={(event) => setPhone(event.target.value)} invalid={Boolean(errors.phone ?? fieldErrors.phone)} />
            </Field>
          </div>
          <div className="b-option-grid">
            <Field label="Email address" htmlFor="email" required error={errors.email ?? fieldErrors.email}>
              <Input id="email" type="email" autoComplete="email" inputMode="email" placeholder="your.name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} invalid={Boolean(errors.email ?? fieldErrors.email)} />
            </Field>
            <Field label="County" htmlFor="county" required error={errors.county ?? fieldErrors.county}>
              <Select id="county" value={county} onChange={(event) => setCounty(event.target.value)} invalid={Boolean(errors.county ?? fieldErrors.county)}>
                <option value="">Select your county</option>
                {COUNTIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="How should we contact you first?" htmlFor="preferredContact">
            <Select id="preferredContact" value={preferredContact} onChange={(event) => setPreferredContact(event.target.value as "whatsapp" | "phone" | "email")}>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone call</option>
              <option value="email">Email</option>
            </Select>
          </Field>
          <Field label="Anything else we should know?" htmlFor="notes" hint="Optional. Existing cover, a renewal date, or a specific insurer you want compared.">
            <Textarea id="notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Field>
        </div>
      )}

      {/* Step 4: confirm */}
      {step === 4 && (
        <div className="b-step-panel">
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>Check and send</h2>
          <p className="b-lead" style={{ marginBottom: 18 }}>
            Confirm the details below. A licensed broker will come back to you within 24 hours.
          </p>

          <div className="b-review">
            <dl>
              <dt>Cover</dt>
              <dd>{product?.name ?? "Not selected"}</dd>
              {Object.entries(details).map(([key, value]) => (
                <div key={key} style={{ display: "contents" }}>
                  <dt>{key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}</dt>
                  <dd>
                    {Array.isArray(value)
                      ? value.join(", ")
                      : /value|Value|assured|premium/.test(key) && Number(value)
                        ? formatKes(Number(value))
                        : String(value)}
                  </dd>
                </div>
              ))}
              <dt>Full name</dt>
              <dd>{fullName}</dd>
              <dt>ID number</dt>
              <dd>{idNumber}</dd>
              <dt>Phone</dt>
              <dd>{phone}</dd>
              <dt>Email</dt>
              <dd>{email}</dd>
              <dt>County</dt>
              <dd>{county}</dd>
              <dt>Preferred contact</dt>
              <dd>{preferredContact}</dd>
            </dl>
          </div>

          <div style={{ marginTop: 18 }}>
            <ConsentCheckbox
              id="quote-consent"
              checked={consent}
              onChange={setConsent}
              error={errors.consent}
            >
              I agree that Barnabas Insurance Brokers may use the information above to obtain
              quotations from insurers and to contact me. I have read the{" "}
              <Link href="/legal/privacy-policy" style={{ color: "inherit" }}>
                Privacy Policy
              </Link>
              , including how health and personal data are handled under the Kenya Data Protection
              Act 2019.
            </ConsentCheckbox>
          </div>

          <CaptchaV2
            active={status === "captcha"}
            onToken={(token) => {
              if (token) void submitWithV2Token(token);
            }}
          />

          <p className="b-captcha-note">
            This form is protected by reCAPTCHA. The Google{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{" "}
            apply.
          </p>
        </div>
      )}

      {error ? (
        <div className="b-alert b-alert--error" role="alert" style={{ marginTop: 16 }}>
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
          <span>
            {error}
            {status === "error" && result === null ? (
              <>
                {" "}
                You can also <a href={whatsappLink()}>reach us on WhatsApp</a> or call{" "}
                <a href={SITE.phoneHref}>{SITE.phone}</a>.
              </>
            ) : null}
          </span>
        </div>
      ) : null}

      <div className="b-formnav">
        <div className="d-flex gap-2 flex-wrap">
          {step > 1 ? (
            <button type="button" className="btn b-btn-ghost" onClick={goBack} disabled={isSending}>
              <i className="bi bi-arrow-left" aria-hidden="true" /> Back
            </button>
          ) : null}
        </div>

        {step < 4 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={goNext}
            disabled={step === 1 && !insuranceType}
          >
            Continue <i className="bi bi-arrow-right" aria-hidden="true" />
          </button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={isSending}>
            {isSending ? (
              <>
                <span className="spinner-border spinner-border-sm" aria-hidden="true" /> Sending
              </>
            ) : (
              <>
                <i className="bi bi-send" aria-hidden="true" /> Send my request
              </>
            )}
          </button>
        )}
      </div>

      <p className="b-captcha-note">
        Your details are sent to our broker desk only. We do not sell client data, and financial or
        health information is never placed on a public route.
      </p>
    </form>
  );
}
