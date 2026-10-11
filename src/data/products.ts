/**
 * The six insurance products.
 *
 * Copy rules for this file (per the brief): no em dashes anywhere in
 * user-facing strings, Kenyan insurance terminology, and every claim about a
 * product stays within what an IRA Kenya licensed broker may state.
 *
 * Brokerage disclaimer: Barnabas Insurance Brokers advises and places cover.
 * The insurer pays claims. That distinction is repeated on every product page.
 */

export type ProductSlug =
  | "motor-insurance"
  | "health-and-medical"
  | "life-insurance"
  | "home-and-property"
  | "business-insurance"
  | "travel-insurance";

export type Audience = "personal" | "business" | "both";

export interface ProductFaq {
  q: string;
  a: string;
}

export interface Product {
  slug: ProductSlug;
  name: string;
  /** Short benefit line used on the home page card. */
  benefit: string;
  /** Who it is for, used on the card and the product page. */
  whoFor: string;
  audience: Audience;
  /** Indicative "from" figure in KES, rendered with a clear "indicative" note. */
  fromKes: number;
  fromUnit: string;
  /** Icon from the design source: img/icon/icon-0N-{primary,light}.png */
  icon: string;
  /** Image slot key, resolved by src/data/images.ts */
  imageSlot: string;
  metaTitle: string;
  metaDescription: string;
  hero: string;
  overview: string[];
  covered: string[];
  excluded: string[];
  whyYouNeed: { title: string; body: string }[];
  claims: { title: string; body: string }[];
  faqs: ProductFaq[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "motor-insurance",
    name: "Motor Insurance",
    benefit:
      "Comprehensive or third party cover for private cars, PSVs, motorcycles, and commercial fleets.",
    whoFor:
      "Vehicle owners, drivers, matatu and boda boda operators, and companies running a fleet.",
    audience: "both",
    fromKes: 6500,
    fromUnit: "per month",
    icon: "/img/icon/icon-01-primary.png",
    imageSlot: "eastAfricanCarOwner",
    metaTitle: "Motor Insurance in Kenya | Comprehensive Car Cover | Barnabas",
    metaDescription:
      "Compare comprehensive and third party motor insurance in Kenya. Cover for private cars, PSVs, motorcycles, and fleets. Instant quote from an IRA licensed broker.",
    hero:
      "Motor cover that pays out when it matters, priced against every major insurer in Kenya.",
    overview: [
      "Motor insurance in Kenya is split into two families of cover. Third party only is the legal minimum required by the Traffic Act and pays for injury or damage you cause to other people and their property. Comprehensive cover adds damage to your own vehicle, theft, and fire.",
      "As independent brokers we place your policy with the insurer whose terms fit your vehicle and your driving, not the insurer with the biggest marketing budget. For a private saloon car we will typically compare eight to twelve insurers before we quote you.",
      "Fleets, PSVs, school buses, and commercial vehicles are rated differently from private cars because of the higher exposure. Tell us the vehicle use in your quotation request and we will quote the correct class of cover rather than let an insurer decline a claim later for a misdescribed risk.",
    ],
    covered: [
      "Third party bodily injury and death liability",
      "Third party property damage",
      "Accidental damage to your own vehicle on comprehensive cover",
      "Theft of the vehicle and theft of parts and accessories",
      "Fire and lightning damage",
      "Towing and recovery after an accident up to the policy limit",
      "Medical expenses for occupants, subject to the policy limit",
      "Passenger legal liability for PSV and commercial vehicles",
      "Political violence and terrorism cover, where the insurer offers it",
      "Excess protector, where the insured chooses to buy it back",
    ],
    excluded: [
      "Wear, tear, and mechanical or electrical breakdown",
      "Driving without a valid licence or under the influence of alcohol or drugs",
      "Using the vehicle for a purpose not declared on the policy, for example carrying goods on a private policy",
      "Tyres, unless damaged in the same accident that damages the vehicle",
      "Depreciation and loss of value",
      "Consequential loss such as lost income, unless business interruption is arranged",
      "War and related risks, unless political violence cover is purchased",
      "Theft where keys were left in an unattended vehicle",
    ],
    whyYouNeed: [
      {
        title: "Third party cover is a legal requirement",
        body: "The Traffic Act requires every vehicle on a Kenyan road to carry at least third party cover. Driving without it exposes you to personal liability for injuries and damage you cause.",
      },
      {
        title: "One accident can cost more than the car",
        body: "A serious injury claim regularly exceeds the market value of the vehicle involved. Comprehensive cover protects your savings, not just your car.",
      },
      {
        title: "Broker leverage on claims",
        body: "When a claim is disputed we negotiate on your behalf with the insurer and, where needed, escalate to the IRA. Most of our motor clients never speak to the insurer directly.",
      },
    ],
    claims: [
      {
        title: "Report the accident immediately",
        body: "Call our claims line or WhatsApp us within 48 hours. Do not admit liability at the scene and do not agree to settle privately.",
      },
      {
        title: "Obtain a police abstract",
        body: "For any accident involving injury, a third party, or theft, obtain a police abstract from the nearest police station. The insurer cannot settle without it.",
      },
      {
        title: "Photograph everything",
        body: "Photograph the damage, the scene, the other vehicle and its number plate, and any third party documents. These images settle most disputes.",
      },
      {
        title: "Assessment and repair",
        body: "We arrange the assessor and, on comprehensive cover, confirm the approved garage. Repairs done without prior approval may be declined.",
      },
      {
        title: "We follow the claim to settlement",
        body: "You will receive the claim reference, the assessor’s decision, and the settlement date from us in writing.",
      },
    ],
    faqs: [
      {
        q: "How is the premium calculated?",
        a: "The insurer rates the vehicle’s sum insured, its age, the declared use, your claims history, and where the vehicle is kept. As brokers we then negotiate the rate and the excess.",
      },
      {
        q: "Can I pay in instalments?",
        a: "Yes. Most Kenyan insurers accept 25 to 40 percent deposit with the balance in instalments. Instalment terms are agreed in writing before cover starts.",
      },
      {
        q: "What is voluntary excess?",
        a: "The amount you agree to contribute towards each claim. A higher voluntary excess lowers the premium. We show you both figures before you decide.",
      },
      {
        q: "Is a vehicle tracking device required?",
        a: "Some insurers require tracking for high value vehicles or specific models. We will tell you before you buy rather than at claim stage.",
      },
    ],
  },
  {
    slug: "health-and-medical",
    name: "Health and Medical",
    benefit:
      "Individual, family, and employer medical cover with inpatient, outpatient, maternity, and chronic care benefits.",
    whoFor:
      "Individuals, families, and employers setting up a staff medical scheme.",
    audience: "both",
    fromKes: 3500,
    fromUnit: "per person per month",
    icon: "/img/icon/icon-02-primary.png",
    imageSlot: "kenyanFamilyMedical",
    metaTitle: "Health Insurance in Kenya | Medical Cover | Barnabas Insurance",
    metaDescription:
      "Private medical insurance in Kenya for individuals, families, and employers. Compare inpatient, outpatient, maternity, and chronic care benefits from leading providers.",
    hero:
      "Medical cover that lets you walk into a hospital in Kenya without asking about the bill first.",
    overview: [
      "Kenya has both private medical insurance and the Social Health Authority scheme. Most families and employers we work with carry private cover as their main protection, with the statutory scheme as a layer underneath or alongside.",
      "Health insurance is the most detail-sensitive product we place. Two policies that look identical at a glance can differ on waiting periods, pre-existing conditions, the hospital list, the co-payment, and whether chronic conditions such as hypertension and diabetes are covered on the outpatient limit.",
      "We place cover with providers who settle directly with the hospital through smart cards, so you are not paying cash and claiming a refund later. For employers we design the scheme around the salary bands in your organisation and present the options to your staff.",
    ],
    covered: [
      "Inpatient hospitalisation, including theatre and nursing fees",
      "Outpatient consultations, diagnostic tests, and prescribed medication",
      "Maternity, including antenatal, delivery, and postnatal care",
      "Dental and optical benefits up to the chosen limit",
      "Chronic and pre-existing conditions, where cover is granted or after the agreed waiting period",
      "Emergency evacuation and ambulance services",
      "Day care procedures and minor surgery",
      "Hospital cash benefit, where the plan includes it",
      "Dependants, including spouse and children",
      "Last expense benefit for immediate family",
    ],
    excluded: [
      "Pre-existing conditions and chronic conditions during the waiting period stated in the policy",
      "Cosmetic treatment that is not medically necessary",
      "Self-inflicted injury and attempted suicide",
      "Conditions not disclosed on the proposal form, which is the most common cause of declined claims",
      "Maternity care taken within the waiting period",
      "Experimental or unproven treatment",
      "Treatment obtained outside the insurer’s hospital network without prior authorisation, unless the plan is open",
      "Routine check-ups beyond the plan limits",
    ],
    whyYouNeed: [
      {
        title: "Hospital bills arrive in full",
        body: "A three day admission in a Nairobi private facility commonly runs into six figures. Medical cover converts that into a predictable monthly cost.",
      },
      {
        title: "Employer duty and staff retention",
        body: "A group medical scheme is the benefit employees ask about first. We design schemes that fit your headcount and your payroll, including employees on contract.",
      },
      {
        title: "Pre-existing conditions need honest underwriting",
        body: "Declaring a condition does not automatically mean it is excluded. We negotiate loadings and waiting periods openly so you know where you stand before a claim.",
      },
    ],
    claims: [
      {
        title: "Outpatient: present your smart card",
        body: "At a network facility the clinic bills the insurer directly and you pay only the stated co-payment or shortfall.",
      },
      {
        title: "Inpatient: obtain pre-authorisation",
        body: "Call the insurer’s authorisation line before admission, or notify them within 24 hours of an emergency admission. We can do this for you if you call our office first.",
      },
      {
        title: "Keep every receipt",
        body: "For reimbursement claims submit the original invoice, receipt, and a doctor’s report. Photograph the documents before posting them.",
      },
      {
        title: "Submit within the policy window",
        body: "Most Kenyan insurers require reimbursement claims within 21 to 90 days of treatment. Late claims are usually declined, so send them while they are fresh.",
      },
      {
        title: "Escalation",
        body: "If a claim is declined on a point you disagree with, we raise a formal appeal with the insurer and, where warranted, take it to the IRA complaints process.",
      },
    ],
    faqs: [
      {
        q: "Can I cover my parents?",
        a: "Some providers allow parents and parents in law on the same policy with a waiting period and a higher premium. We will tell you which providers will accept your family structure.",
      },
      {
        q: "What happens if I develop a chronic condition after joining?",
        a: "Once a condition is declared and accepted, future treatment is covered within the policy limits. Conditions that develop after cover starts are treated as new, not pre-existing.",
      },
      {
        q: "How many employees do I need for a group scheme?",
        a: "Group rates generally start from five employees, and any group of that size gets better terms than an individual buying alone. Smaller groups can be placed on an affinity scheme.",
      },
      {
        q: "Do you handle pre-authorisation for us?",
        a: "Yes. Employers on our schemes send the admission request to our office and we process it with the insurer’s authorisation team.",
      },
    ],
  },
  {
    slug: "life-insurance",
    name: "Life Insurance",
    benefit:
      "Term, whole life, and education policies that protect your family’s income and clear debts if the worst happens.",
    whoFor:
      "Breadwinners, parents planning school fees, and borrowers with a mortgage or loan.",
    audience: "personal",
    fromKes: 1500,
    fromUnit: "per month",
    icon: "/img/icon/icon-03-primary.png",
    imageSlot: "africanWomanSigning",
    metaTitle: "Life Insurance in Kenya | Term and Whole Life Cover | Barnabas",
    metaDescription:
      "Life insurance in Kenya with term, whole life, and education plans. Compare sum assured, premiums, and riders from licensed Kenyan life insurers with an IRA licensed broker.",
    hero:
      "A life policy is the only plan that keeps paying the bills after the person paying them has gone.",
    overview: [
      "Life insurance pays a lump sum to the people you nominate when you die. In Kenya, if you nominate beneficiaries on the policy, the money is paid directly to them and does not pass through the estate, which means it is not delayed by probate.",
      "Term life is the cheapest way to protect a defined need: school fees until the children finish, a mortgage balance, or five to ten years of household income. Whole life and endowment plans cost more, build a surrender value, and suit people who want cover that lasts their whole life or a savings element attached to it.",
      "We size the cover first and then choose the product. The sum assured is the number that matters, not the brochure. Under-insuring your family to save a small amount on the premium defeats the purpose of the policy.",
    ],
    covered: [
      "Death from any cause, after the waiting period stated in the policy",
      "Terminal illness acceleration on most plans",
      "Accidental death benefit, where the rider is taken",
      "Permanent and total disability, where the rider is taken",
      "Critical illness riders covering specified conditions",
      "Education benefit with staged payouts for school fees",
      "Mortgage protection that matches the outstanding loan balance",
      "Last expense benefit for immediate funeral costs",
      "Group life and group last expense for employers",
      "Premium waiver on disability, where included",
    ],
    excluded: [
      "Suicide within the waiting period, commonly the first two years, as stated in the policy",
      "Non-disclosure or misrepresentation of health and lifestyle information on the proposal form",
      "Death arising from war or from participating in illegal activity",
      "Death while the policy is lapsed for non payment",
      "Pre-existing conditions that were not declared and accepted at underwriting",
      "Hazardous pursuits such as aviation, diving, or motorsport that were not declared",
      "A nominated beneficiary who cannot be located, which delays payment rather than cancelling it",
    ],
    whyYouNeed: [
      {
        title: "Income stops, school fees do not",
        body: "A term policy on the main earner is the cheapest protection available. For a modest monthly premium you can secure a sum assured that clears debts and funds education.",
      },
      {
        title: "Nomination keeps money out of probate",
        body: "A written nomination on the policy means payment goes to the people you choose. Without it the money waits for the estate, which can take years.",
      },
      {
        title: "Borrowers need mortgage protection",
        body: "If a home loan is jointly held, mortgage protection makes sure the surviving family keeps the house instead of selling it to clear the balance.",
      },
    ],
    claims: [
      {
        title: "Notify us as soon as possible",
        body: "Call or WhatsApp us with the policy number and the date of death. We open the claim with the insurer the same working day.",
      },
      {
        title: "Collect the claim documents",
        body: "Death certificate, burial permit, the deceased’s ID, the original policy document, and the claimant’s ID. We provide a written checklist so nothing is missed.",
      },
      {
        title: "Underwriting review",
        body: "The insurer confirms the cause of death and that medical disclosures were accurate. Two years of honest disclosure is what makes payment straightforward.",
      },
      {
        title: "Payment to the nominated beneficiary",
        body: "Once approved, the sum assured is paid to the nominated beneficiaries. We confirm the payment date to the family in writing.",
      },
    ],
    faqs: [
      {
        q: "How much cover do I need?",
        a: "A common starting point in Kenya is ten times your annual income, plus any outstanding loans, plus a figure for school fees. We will calculate it with you in the quotation step.",
      },
      {
        q: "Does smoking affect my premium?",
        a: "Yes. Life insurers rate smokers and users of nicotine products higher. Declare accurately, because a claim can be declined for misrepresentation.",
      },
      {
        q: "Can I change my beneficiaries later?",
        a: "Yes. Nomination changes are made by written notice to the insurer. We process this for our clients at no charge.",
      },
      {
        q: "What if I stop paying?",
        a: "Term policies lapse when premiums stop. Whole life plans often have a grace period and a surrender or paid up value. Talk to us before you stop paying so we can restructure rather than lose the cover.",
      },
    ],
  },
  {
    slug: "home-and-property",
    name: "Home and Property",
    benefit:
      "Cover for the building, its contents, and your liability as a homeowner or landlord.",
    whoFor:
      "Homeowners, mortgagors, landlords, and tenants with valuable contents.",
    audience: "both",
    fromKes: 2000,
    fromUnit: "per month",
    icon: "/img/icon/icon-04-primary.png",
    imageSlot: "africanHomeowner",
    metaTitle: "Home and Property Insurance Kenya | Buildings and Contents | Barnabas",
    metaDescription:
      "Home insurance in Kenya covering fire, perils, burglary, contents, and landlord liability. Mortgage lenders accepted. Quote from an IRA licensed insurance broker.",
    hero:
      "Your house is insured against the price of rebuilding it, not the price you paid for it.",
    overview: [
      "Home insurance in Kenya is normally arranged as two separate sections on one policy. The building section covers the structure, and the contents section covers what is inside it. Mortgage lenders require the building to be insured at the reinstatement value, which is the cost of rebuilding, not the market or sale value.",
      "The most common mistake we see is under-insuring the building, which leaves the owner carrying the shortfall after a total loss. We calculate the reinstatement figure from the built area and current Nairobi construction rates and set the sum insured from that.",
      "Contents cover can be bought by tenants who do not own the building. Electronics, furniture, clothing, and personal effects are covered against fire, burglary, and selected perils, with all risks cover for items you carry out of the house.",
    ],
    covered: [
      "Fire, lightning, and explosion damage to the building",
      "Burglary and theft with forcible entry",
      "Storm, flood, and water damage where the insurer offers the extension",
      "Burst pipes, water tanks, and accidental damage to sanitary fittings",
      "Household contents, furniture, electronics, and personal effects",
      "All risks cover for laptops, phones, and jewellery away from the home",
      "Landlord’s liability and loss of rent following an insured event",
      "Alternative accommodation while the home is uninhabitable",
      "Homeowner’s public liability for injury or damage to third parties",
      "Political violence and terrorism, where the extension is purchased",
    ],
    excluded: [
      "Wear, tear, and gradual deterioration, including damp and rot",
      "Damage caused deliberately by the insured or with the insured’s consent",
      "Theft without evidence of forcible entry",
      "Loss of cash and documents above the small limit stated in the policy",
      "Damage while the house has been left unoccupied beyond the period stated in the policy, commonly 30 days",
      "Subsidence and landslip, unless the extension is bought",
      "Loss caused by faulty workmanship or defective design",
      "War risks and nuclear risks",
    ],
    whyYouNeed: [
      {
        title: "A mortgage requires it",
        body: "Lenders in Kenya will not release funds unless the property is insured and the lender’s interest is noted on the policy.",
      },
      {
        title: "Rebuilding costs more than people expect",
        body: "Construction costs rise each year. A sum insured set five years ago at purchase price will not rebuild the house today.",
      },
      {
        title: "Contents are usually worth more than the owner thinks",
        body: "Add up electronics, furniture, clothing, and appliances at replacement cost. Most homeowners are surprised by the total.",
      },
    ],
    claims: [
      {
        title: "Make the property safe first",
        body: "Prevent further damage, for example by covering a broken roof, and then notify us. Emergency work to limit damage is normally recoverable.",
      },
      {
        title: "Report theft to the police",
        body: "For burglary, obtain a police abstract and list the stolen items with values. Photographs and receipts speed up the assessment considerably.",
      },
      {
        title: "Loss adjuster survey",
        body: "For larger claims the insurer appoints a loss adjuster. We attend the survey with you and check the assessment report before you accept it.",
      },
      {
        title: "Repair or replace",
        body: "On agreed value contents, replacements are settled at the value stated. Keep every invoice for the reinstatement work.",
      },
    ],
    faqs: [
      {
        q: "Is my mortgage lender covered?",
        a: "Yes. We note the lender’s interest on the policy so the bank is protected alongside you, which is what they require.",
      },
      {
        q: "Rent or own, can I insure contents only?",
        a: "Yes. Tenants commonly insure contents only, which is far cheaper than covering a building they do not own.",
      },
      {
        q: "How is the building sum insured calculated?",
        a: "We use the built area and the current cost per square metre to rebuild in your area. We review this at each renewal as construction costs change.",
      },
      {
        q: "What happens if the house is empty for months?",
        a: "Most policies require notification if the home is unoccupied beyond a stated period. Tell us and we arrange an extension rather than risk a declined claim.",
      },
    ],
  },
  {
    slug: "business-insurance",
    name: "Business Insurance",
    benefit:
      "Fire, burglary, liability, business interruption, and marine cargo cover for Kenyan enterprises.",
    whoFor:
      "SMEs, manufacturers, retailers, transporters, schools, and corporates.",
    audience: "business",
    fromKes: 8000,
    fromUnit: "per month",
    icon: "/img/icon/icon-05-primary.png",
    imageSlot: "eastAfricanOfficeMeeting",
    metaTitle: "Business Insurance Kenya | SME and Corporate Cover | Barnabas",
    metaDescription:
      "Business insurance in Kenya: fire, burglary, public liability, WIBA employer liability, goods in transit, marine cargo, and directors and officers liability. Broker advice.",
    hero:
      "A business is insured for what it would cost to start again, not for what it earned last year.",
    overview: [
      "Business insurance is not one policy. It is a set of covers assembled around how your business actually operates: what you own, what you handle for clients, who visits your premises, what you transport, and what happens if a fire stops production for three months.",
      "The failure we see most often is silent under-insurance. A business insures its stock at last year’s value and its machinery at cost, then discovers after a loss that the average clause reduces the settlement in proportion to the shortfall. We review declared values at every renewal and write the rationale into the schedule.",
      "Employers also carry statutory duties. The Work Injury Benefits Act requires compensation for employees injured at work, and most corporates arrange group medical and group life alongside the liability covers. We place the whole package and manage a single renewal date for the client.",
    ],
    covered: [
      "Fire and special perils on buildings, stock, machinery, and furniture",
      "Burglary and theft, including doors, windows, and strongroom damage",
      "Business interruption covering lost gross profit and increased cost of working",
      "Public liability for injury or damage to third parties on your premises",
      "Employer’s liability and Work Injury Benefits Act cover for employees",
      "Fidelity guarantee against employee dishonesty",
      "Goods in transit and marine cargo for imports and exports",
      "Money insurance for cash in transit and on the premises",
      "Machinery breakdown and electronic equipment cover",
      "Group medical, group life, and group last expense for staff",
    ],
    excluded: [
      "Contractual liability that you accepted in a client agreement beyond normal law",
      "Fines, penalties, and punitive damages",
      "Gradual pollution and environmental damage, unless specifically bought",
      "Damage caused by defective design or faulty workmanship by the insured",
      "Loss of money or stock that cannot be substantiated by records",
      "Cyber and data breach losses, which sit on a separate policy",
      "War, terrorism, and political violence, unless the extension is purchased",
      "Consequential loss of markets or reputation",
    ],
    whyYouNeed: [
      {
        title: "One fire can end a company",
        body: "Most SMEs that lose their premises and records without interruption cover never reopen. A broker built policy keeps working capital in place while you rebuild.",
      },
      {
        title: "Employers carry statutory liability",
        body: "Work Injury Benefits Act exposure is not optional. We place the cover that satisfies the Act and defend claims on your behalf.",
      },
      {
        title: "Directors are personally exposed",
        body: "Directors and officers liability protects personal assets when management decisions are challenged. It is now standard for companies tendering for corporate and government contracts.",
      },
      {
        title: "Contracts require it",
        body: "Tenders and supply agreements in Kenya routinely demand public liability and WIBA certificates. We issue the certificates your procurement team needs.",
      },
    ],
    claims: [
      {
        title: "Notify within 48 hours",
        body: "Report the incident to us with the policy number, the date, and a description. For theft and fraud, obtain a police abstract immediately.",
      },
      {
        title: "Preserve the evidence and salvage",
        body: "Do not clear the scene or dispose of damaged stock before the insurer’s surveyor attends. Photograph everything first.",
      },
      {
        title: "Documents that settle claims",
        body: "Stock records, purchase invoices, payroll, asset registers, and financial statements establish the loss. Good records are the difference between a fast settlement and a negotiation.",
      },
      {
        title: "Business interruption proof",
        body: "For loss of profit claims the underwriter works from your audited accounts and management figures. We prepare the presentation with your accountant.",
      },
    ],
    faqs: [
      {
        q: "What is the average clause?",
        a: "If you insure stock worth 10 million shillings for 6 million, an insurer may settle only 60 percent of any partial loss. We review sums insured annually so this does not happen.",
      },
      {
        q: "Can we cover only our employees, not the premises?",
        a: "Yes. Group medical, group life, and WIBA cover can be placed independently of property covers.",
      },
      {
        q: "Do you cover goods imported from China and the region?",
        a: "Yes. Marine cargo is arranged per shipment or on an open cover for regular importers, with cover from warehouse to warehouse.",
      },
      {
        q: "How long does setting up a scheme take?",
        a: "Simple SME packages are quoted within 24 hours. Group medical schemes with staff data usually take three to five working days to place.",
      },
    ],
  },
  {
    slug: "travel-insurance",
    name: "Travel Insurance",
    benefit:
      "Emergency medical treatment, evacuation, baggage, and trip cancellation cover abroad.",
    whoFor:
      "Travellers, students abroad, business travellers, and families on holiday.",
    audience: "personal",
    fromKes: 1200,
    fromUnit: "per trip",
    icon: "/img/icon/icon-06-primary.png",
    imageSlot: "eastAfricanCoupleHealth",
    metaTitle: "Travel Insurance Kenya | Schengen Compliant Cover | Barnabas",
    metaDescription:
      "Travel insurance from Kenya for holidays, business trips, and studies abroad. Emergency medical, evacuation, baggage, and trip cancellation. Schengen compliant certificates.",
    hero:
      "Travel cover that starts the moment you leave the house and works in a language you do not speak.",
    overview: [
      "Travel insurance is the cheapest policy you will ever buy and the one most likely to be needed. A single night in a foreign hospital can cost more than a year of premiums, and most national health schemes do not pay abroad.",
      "For Schengen visa applications the cover must meet a specific minimum, including at least thirty thousand euros of medical cover and repatriation, and it must be valid for the whole trip. We issue the certificate in the format the embassy accepts.",
      "We also place student travel cover for children studying abroad, annual multi trip policies for frequent business travellers, and inbound cover for visitors to Kenya, including emergency evacuation from remote areas.",
    ],
    covered: [
      "Emergency medical treatment and hospitalisation abroad",
      "Emergency evacuation and repatriation to Kenya",
      "Repatriation of remains and associated costs",
      "Trip cancellation and curtailment for insured reasons",
      "Checked baggage loss, delay, and damage",
      "Loss of passport and travel documents",
      "Personal accident and permanent disability",
      "Personal liability for injury or damage caused to third parties abroad",
      "Travel delay and missed connection",
      "Hijack and kidnap cover on some plans",
    ],
    excluded: [
      "Pre-existing medical conditions that were not declared and accepted",
      "Adventure and extreme sports, unless the activity is named on the policy",
      "Travel against the advice of a doctor",
      "Pregnancy beyond the number of weeks stated in the policy",
      "Loss arising while under the influence of alcohol or drugs",
      "Travel to countries with an active government advisory against travel",
      "Claims where the insured did not obtain a police report for a theft abroad",
      "Non medical costs that the policy limit does not cover, such as cosmetic dentistry",
    ],
    whyYouNeed: [
      {
        title: "Schengen and other visas require it",
        body: "Most embassies require proof of medical and repatriation cover before they issue the visa. We provide the certificate in the accepted format.",
      },
      {
        title: "Home cover does not travel",
        body: "NHIF and private Kenyan medical schemes do not pay for treatment abroad. Travel insurance is the only thing standing between you and a foreign hospital bill.",
      },
      {
        title: "Baggage and delay claims are common",
        body: "Delayed luggage and missed connections are the most frequent claims we handle. Cover turns an expensive inconvenience into a reimbursement.",
      },
    ],
    claims: [
      {
        title: "Call the emergency assistance line first",
        body: "The 24 hour number on your certificate arranges treatment and guarantees payment directly to the hospital. Calling first is what keeps the claim valid.",
      },
      {
        title: "Report theft to local police",
        body: "For stolen baggage, cash, or documents you must file a report with the local police force and keep the copy.",
      },
      {
        title: "Keep every document",
        body: "Boarding passes, tickets, receipts, medical reports, and the property irregularity report from the airline. Photograph them and send them to us early.",
      },
      {
        title: "Submit within the policy window",
        body: "Most policies require the claim within 30 days of returning to Kenya. Send it to us and we submit the complete file to the insurer.",
      },
    ],
    faqs: [
      {
        q: "Is travel insurance required for a Schengen visa?",
        a: "Yes, at least thirty thousand euros of medical and repatriation cover covering the full period of stay is normally required. We issue a certificate that meets that requirement.",
      },
      {
        q: "Can I buy cover for a whole year of travel?",
        a: "Yes. Annual multi trip policies suit business travellers and cover an unlimited number of trips up to a stated number of days each.",
      },
      {
        q: "Does it cover me while studying abroad?",
        a: "Student plans cover a full academic year with medical, baggage, and interruption benefits. We arrange these for families sending children to universities overseas.",
      },
      {
        q: "Can I buy cover for a visitor coming to Kenya?",
        a: "Yes. Inbound travel cover is available for visitors, including emergency evacuation from remote areas, which is the cover that matters most for safari travel.",
      },
    ],
  },
];

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((product) => product.slug === slug);

export const PRODUCT_SLUGS = PRODUCTS.map((p) => p.slug);
