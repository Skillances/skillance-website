/**
 * Pre-defined question tree for the public (non-admin) Skillance help widget.
 *
 * RULES:
 *   - Each node is either a branch (has `children`) or a leaf (has `answer`).
 *   - Each branch exposes AT MOST 5 children (UX constraint from product).
 *   - Every `answer` is a plain-language response an end-user can understand.
 *
 * There is NO AI involved on the public side. The widget simply walks this
 * tree and prints the chosen leaf's `answer`.
 *
 * FLOW: Root always asks who the user is (customer, freelancer, or other)
 * before topic-specific questions, so refund and payment answers match the role.
 */

export type FaqNode =
  | {
      id: string;
      label: string;
      kind: 'branch';
      children: FaqNode[];
    }
  | {
      id: string;
      label: string;
      kind: 'leaf';
      answer: string;
    };

export const PUBLIC_FAQ: FaqNode = {
  id: 'root',
  label: 'Who are you here as?',
  kind: 'branch',
  children: [
    // =======================================================================
    // CUSTOMER PATH
    // =======================================================================
    {
      id: 'role.customer',
      label: 'Customer — I\'m booking a service',
      kind: 'branch',
      children: [
        {
          id: 'customer.about',
          label: 'About Skillance (for customers)',
          kind: 'branch',
          children: [
            {
              id: 'customer.about.what',
              label: 'What is Skillance?',
              kind: 'leaf',
              answer:
                'Skillance is a South African marketplace that connects customers with local freelancers whose identity document has been checked and matched to their profile photo — plumbers, tutors, cleaners, designers and more. You search and book in the app. The Skillance app for iOS and Android is coming soon.',
            },
            {
              id: 'customer.about.diff',
              label: 'How is Skillance Personal different from a classifieds site?',
              kind: 'leaf',
              answer:
                'Skillance Personal is built for booking ID-checked freelancers — not peer-to-peer item sales. For local buy-and-sell classifieds, use the separate Skillance Marketplace app (same login). Before a provider can take bookings, we check their identity document and match it to their profile photo. This confirms who they are. It doesn\'t assess their skills. Messaging and reviews stay tied to bookings.',
            },
            {
              id: 'customer.about.free',
              label: 'Is it free to use as a customer?',
              kind: 'leaf',
              answer:
                'Creating an account and browsing freelancers is free. In-app messaging opens after the freelancer accepts your booking. The freelancer\'s price and the service fee are shown before you confirm a booking.',
            },
            {
              id: 'customer.about.fees',
              label: 'Are there hidden fees?',
              kind: 'leaf',
              answer:
                'No. You\'ll see the freelancer\'s price and the Skillance service fee before you confirm a booking.',
            },
            {
              id: 'customer.about.ops',
              label: 'Where you operate & who runs Skillance',
              kind: 'leaf',
              answer:
                'Skillance is a trading name of Rimitso Management Services (Pty) Ltd, 6 Dwars Street, Krugersdorp, 1739. We\'re launching first in one area. Tell us your area and we\'ll let you know if we reach you.',
            },
          ],
        },
        {
          id: 'customers',
          label: 'Bookings, pricing & reviews',
          kind: 'branch',
          children: [
            {
              id: 'customers.book',
              label: 'How do I book a freelancer?',
              kind: 'branch',
              children: [
                {
                  id: 'customers.book.flow',
                  label: 'Quick step-by-step',
                  kind: 'leaf',
                  answer:
                    'Open the Skillance app → pick a category or search → view freelancer profiles, ratings and prices → tap "Book", choose a date/time and describe the job → submit your request. The freelancer is notified and either accepts or declines. After they accept, in-app messaging opens on that booking so you can coordinate details. At the start of the session, the customer shows a session PIN and the provider submits it to confirm the session has begun. The PIN does not mark the job as complete.',
                },
                {
                  id: 'customers.book.accept',
                  label: 'How long until a freelancer accepts?',
                  kind: 'leaf',
                  answer:
                    'Most bookings are accepted within a few minutes during working hours. If nobody accepts within 24 hours, the booking expires automatically.',
                },
                {
                  id: 'customers.book.multiple',
                  label: 'Can I book more than one freelancer?',
                  kind: 'leaf',
                  answer:
                    'Yes. Each booking is independent — a plumber and an electrician for the same day are two separate bookings with two separate prices, schedules and receipts.',
                },
                {
                  id: 'customers.book.contact',
                  label: 'When can I message a freelancer?',
                  kind: 'leaf',
                  answer:
                    'After the freelancer accepts your booking. Skillance opens the chat thread at that point so messages are tied to a confirmed job and there\'s a clear record. Before acceptance, put the important details in your booking request (scope, access, timing). There is no separate "chat from profile" for strangers.',
                },
                {
                  id: 'customers.book.future',
                  label: 'Can I book for a later date?',
                  kind: 'leaf',
                  answer:
                    'Yes. Pick any date within the freelancer\'s published availability up to 30 days out. Recurring bookings (e.g. weekly cleaning) are supported in the booking detail screen.',
                },
              ],
            },
            {
              id: 'customers.pricing',
              label: 'How does pricing work?',
              kind: 'branch',
              children: [
                {
                  id: 'customers.pricing.set',
                  label: 'Who decides the price?',
                  kind: 'leaf',
                  answer:
                    'The freelancer sets their own rate (flat, hourly or per-visit). You can compare profiles in the app — nobody can change the price after you\'ve confirmed a booking without your agreement.',
                },
                {
                  id: 'customers.pricing.change',
                  label: 'What if the job turns out to be bigger than expected?',
                  kind: 'leaf',
                  answer:
                    'The freelancer must send you a price-update request through the app. You can accept or decline — you\'re never charged extra silently.',
                },
                {
                  id: 'customers.pricing.tip',
                  label: 'Can I tip?',
                  kind: 'leaf',
                  answer:
                    'Tipping is optional and is never taken by the platform. If the app supports tipping in your region you\'ll see the option after the booking is marked complete; otherwise you\'re free to tip outside the app.',
                },
                {
                  id: 'customers.pricing.quote',
                  label: 'Can I ask for a quote before booking?',
                  kind: 'leaf',
                  answer:
                    'You agree on scope using the booking flow: submit a request with a clear description and the freelancer\'s listed rate. After they accept, use in-app messages on that booking to clarify details. If the job changes, the freelancer can send a price update through the app for you to approve — nothing changes silently.',
                },
              ],
            },
            {
              id: 'customers.noshow',
              label: 'What if the freelancer doesn\'t show up?',
              kind: 'leaf',
              answer:
                'Mark the booking as "No-show" in the app. The freelancer\'s payout is cancelled automatically and you\'ll get a full refund within 3–5 working days. Repeat no-shows cause the freelancer\'s account to be suspended.',
            },
            {
              id: 'customers.reschedule',
              label: 'Can I reschedule or cancel?',
              kind: 'leaf',
              answer:
                'Yes. Free cancellation up to 4 hours before the booking start time. Inside that window the freelancer keeps a small protection fee to cover their reserved time. You can always reschedule from inside the booking details screen.',
            },
            {
              id: 'customers.review',
              label: 'How do I leave a review?',
              kind: 'leaf',
              answer:
                'After the freelancer marks the booking complete, you\'ll be prompted to rate them 1–5 stars and leave a short note. Reviews are public on the freelancer\'s profile and can\'t be edited by the freelancer — they keep the marketplace honest.',
            },
          ],
        },
        {
          id: 'customer.payments',
          label: 'Payments, fees & refunds',
          kind: 'branch',
          children: [
            {
              id: 'cpay.fee',
              label: 'What\'s the Skillance service fee?',
              kind: 'leaf',
              answer:
                'Skillance charges a service fee of 8–9% on each confirmed booking. The exact amount, including any connection fee, is shown before you book.',
            },
            {
              id: 'cpay.methods',
              label: 'What payment methods are supported?',
              kind: 'leaf',
              answer:
                'Payments aren\'t live yet. We\'ll explain exactly how paying works here before bookings open.',
            },
            {
              id: 'cpay.refunds',
              label: 'How do refunds work?',
              kind: 'branch',
              children: [
                {
                  id: 'cpay.refunds.flow',
                  label: 'When am I eligible for a refund?',
                  kind: 'leaf',
                  answer:
                    'You\'re eligible if the freelancer no-shows, cancels on you, or if the work is clearly not what was agreed (and the freelancer won\'t fix it). Cancellations inside the 4-hour window are partially refundable — the rest goes to the freelancer as a protection fee.',
                },
                {
                  id: 'cpay.refunds.timeline',
                  label: 'How long does a refund take?',
                  kind: 'leaf',
                  answer:
                    'Once approved, refunds are issued to your original payment method within 3–5 working days. Your bank may add another 1–2 business days before the money reflects.',
                },
                {
                  id: 'cpay.refunds.connection',
                  label: 'What\'s non-refundable?',
                  kind: 'leaf',
                  answer:
                    'The small connection fee (used to run the matching and messaging infrastructure) is not refundable once a freelancer has accepted the booking. Everything else is eligible under our refund policy.',
                },
                {
                  id: 'cpay.refunds.partial',
                  label: 'Can I get a partial refund?',
                  kind: 'leaf',
                  answer:
                    'Yes — for example if the freelancer delivered part of the job but not all of it. Open a dispute and attach photos or a description; our team reviews evidence from both sides before deciding.',
                },
                {
                  id: 'cpay.refunds.chargeback',
                  label: 'What if I raise a chargeback with my bank?',
                  kind: 'leaf',
                  answer:
                    'Please talk to Skillance support first — our in-app refund is usually faster. A bank chargeback doesn\'t bypass our Terms, and abuse of chargebacks can lead to account suspension.',
                },
              ],
            },
            {
              id: 'cpay.escrow',
              label: 'How do payments work?',
              kind: 'leaf',
              answer:
                'Payments aren\'t live yet. We\'ll explain exactly how paying works here before bookings open.',
            },
          ],
        },
        {
          id: 'customer.safety',
          label: 'Safety, privacy & support',
          kind: 'branch',
          children: [
            {
              id: 'cs.verify',
              label: 'How do you verify freelancers?',
              kind: 'leaf',
              answer:
                'Before a provider can take bookings, we check their identity document and match it to their profile photo. This confirms who they are. It doesn\'t assess their skills. We don\'t check trade qualifications or references, so reviews from customers are an important guide.',
            },
            {
              id: 'cs.privacy',
              label: 'How is my data protected?',
              kind: 'branch',
              children: [
                {
                  id: 'csp.popia',
                  label: 'Your personal information',
                  kind: 'leaf',
                  answer:
                    'We collect the personal information we need to run the marketplace. Full details are in our Privacy Policy at skillance.co.za/privacy-policy.',
                },
                {
                  id: 'csp.share',
                  label: 'Who can see my details?',
                  kind: 'leaf',
                  answer:
                    'Freelancers only see your first name and booking details until you accept a match. Customers only see the freelancer\'s profile info. Your banking details, phone number and address are never exposed publicly.',
                },
                {
                  id: 'csp.delete',
                  label: 'Can I delete my data?',
                  kind: 'leaf',
                  answer:
                    'Yes. You can request deletion from the "Delete account" option in the app, or by emailing support. We retain the legal minimum (e.g. tax-relevant invoices) and purge everything else within 30 days.',
                },
                {
                  id: 'csp.cookies',
                  label: 'What cookies does the website use?',
                  kind: 'leaf',
                  answer:
                    'We use strictly necessary cookies for the site to work, and (with your consent) basic analytics to improve it. Manage everything on our Cookie Policy page at skillance.co.za/cookie-policy.',
                },
              ],
            },
            {
              id: 'cs.report',
              label: 'How do I report an issue?',
              kind: 'branch',
              children: [
                {
                  id: 'csr.booking',
                  label: 'About a specific booking',
                  kind: 'leaf',
                  answer:
                    'Open the booking → tap the 3-dot menu → "Report". Email support@skillance.co.za if you need help. Support hours are Mon-Fri 09:00-17:00.',
                },
                {
                  id: 'csr.freelancer',
                  label: 'About a freelancer\'s behaviour',
                  kind: 'leaf',
                  answer:
                    'Use the "Report profile" action on the freelancer\'s profile page. Serious reports (safety, harassment, fraud) are escalated to the trust-and-safety team immediately.',
                },
                {
                  id: 'csr.support',
                  label: 'General question for support',
                  kind: 'leaf',
                  answer:
                    'Use the "Contact support" link at the bottom of the app or email support@skillance.co.za. Support hours are Mon-Fri 09:00-17:00.',
                },
                {
                  id: 'csr.fraud',
                  label: 'I think I\'ve been scammed',
                  kind: 'leaf',
                  answer:
                    'Don\'t engage further — open the booking and tap "Report", then email fraud@skillance.co.za with any screenshots and our team will investigate. Also consider reporting to SAPS if you shared banking details.',
                },
              ],
            },
            {
              id: 'cs.dispute',
              label: 'What happens if there\'s a dispute?',
              kind: 'leaf',
              answer:
                'If you and the freelancer can\'t agree, open a dispute from the booking. Our team reviews the chat, booking timeline and both sides\' submissions. Outcomes follow our Terms.',
            },
            {
              id: 'cs.delete',
              label: 'How do I delete my account?',
              kind: 'leaf',
              answer:
                'Go to Profile → Settings → Delete account. Any confirmed future bookings must be cancelled first. Deleted accounts cannot be recovered; email records required by law (e.g. tax invoices) are kept for the statutory retention period.',
            },
          ],
        },
      ],
    },

    // =======================================================================
    // FREELANCER PATH
    // =======================================================================
    {
      id: 'role.freelancer',
      label: 'Freelancer — I offer services here',
      kind: 'branch',
      children: [
        {
          id: 'freelancer.about',
          label: 'Skillance in brief (fees & listing)',
          kind: 'branch',
          children: [
            {
              id: 'fl.about.what',
              label: 'What is Skillance for me?',
              kind: 'leaf',
              answer:
                'Skillance is a South African marketplace: customers book you for local work, and you build your reputation through reviews. You\'re an independent contractor — not an employee of Skillance.',
            },
            {
              id: 'fl.about.listfee',
              label: 'Is listing free? What does Skillance charge?',
              kind: 'leaf',
              answer:
                'Skillance charges a service fee of 8–9% on confirmed bookings. The exact amount is shown before the customer books.',
            },
            {
              id: 'fl.about.download',
              label: 'Does the app cost anything to download?',
              kind: 'leaf',
              answer:
                'The Skillance app for iOS and Android is coming soon. Standard mobile-data charges from your network apply when you use it.',
            },
            {
              id: 'fl.about.cancelpolicy',
              label: 'How do cancellations work (both sides)?',
              kind: 'leaf',
              answer:
                'Cancellations are free more than 4 hours before the start time. Inside that window a small protection fee can go to the freelancer to cover the reserved slot — whether you or the customer cancels follows the same time rules. Repeated late cancels by a customer are flagged internally.',
            },
          ],
        },
        {
          id: 'freelancers',
          label: 'Sign-up, verification & day-to-day',
          kind: 'branch',
          children: [
            {
              id: 'freelancers.join',
              label: 'How do I sign up?',
              kind: 'branch',
              children: [
                {
                  id: 'freelancers.join.steps',
                  label: 'Quick step-by-step',
                  kind: 'leaf',
                  answer:
                    'Register as a provider, upload your identity document and a clear profile photo, and choose your service categories. Once your ID check is approved, you can start taking bookings. The Skillance app for iOS and Android is coming soon.',
                },
                {
                  id: 'freelancers.join.docs',
                  label: 'What documents do I need?',
                  kind: 'leaf',
                  answer:
                    'An identity document and a clear profile photo. That\'s it to get listed — Skillance doesn\'t check trade qualifications or references. You build your reputation through reviews from customers.',
                },
                {
                  id: 'freelancers.join.categories',
                  label: 'Which categories can I join?',
                  kind: 'leaf',
                  answer:
                    'Skillance supports dozens of categories — from home services to personal tutoring, design, events and wellness. The full list is shown in the sign-up flow and can be updated later from your freelancer profile.',
                },
              ],
            },
            {
              id: 'freelancers.verify',
              label: 'What does verification involve?',
              kind: 'branch',
              children: [
                {
                  id: 'freelancers.verify.id',
                  label: 'ID verification',
                  kind: 'leaf',
                  answer:
                    'We check that the photo on your ID document matches your profile photo and that the ID number is valid.',
                },
                {
                  id: 'freelancers.verify.reviews',
                  label: 'Ratings & reviews (how customers judge you)',
                  kind: 'leaf',
                  answer:
                    'Skillance doesn\'t check trade qualifications or references. After a booking, customers can rate you 1–5 stars and leave a public review on your profile. New freelancers start with no reviews. Reviews from customers are a guide for the next person choosing who to book. We moderate reviews under our Terms.',
                },
                {
                  id: 'freelancers.verify.reject',
                  label: 'What if I\'m rejected?',
                  kind: 'leaf',
                  answer:
                    'We\'ll email you the reason and the step you can take to fix it (usually a clearer photo of a document). Rejection is not permanent — most freelancers are approved on their second submission.',
                },
                {
                  id: 'freelancers.verify.time',
                  label: 'How long does verification take?',
                  kind: 'leaf',
                  answer:
                    'You\'ll get an in-app notification and an email once the review is done. You can see the status in your freelancer dashboard. We don\'t promise how long the check takes.',
                },
              ],
            },
            {
              id: 'freelancers.payout',
              label: 'How and when do I get paid?',
              kind: 'leaf',
              answer:
                'Payments aren\'t live yet. We\'ll explain exactly how paying works here before bookings open.',
            },
            {
              id: 'freelancers.control',
              label: 'Can I set my own prices and hours?',
              kind: 'leaf',
              answer:
                'Yes. You choose your rate (flat, hourly or per-visit) and you publish the hours you\'re available. You can pause your account at any time without losing your reviews or history.',
            },
            {
              id: 'freelancers.cancel',
              label: 'What if a customer cancels on me?',
              kind: 'leaf',
              answer:
                'Free cancellations more than 4 hours before the booking. Inside that window, a small protection fee is paid to you automatically to cover the slot you reserved. Repeated late cancels flag the customer\'s account internally.',
            },
          ],
        },
        {
          id: 'freelancer.payments',
          label: 'Payments & fees',
          kind: 'branch',
          children: [
            {
              id: 'fpay.fee',
              label: 'What\'s the Skillance service fee on my jobs?',
              kind: 'leaf',
              answer:
                'Skillance charges a service fee of 8–9% on each confirmed booking. The exact amount is shown before the customer books.',
            },
            {
              id: 'fpay.payouts',
              label: 'When do payouts reach my bank?',
              kind: 'leaf',
              answer:
                'Payments aren\'t live yet. We\'ll explain exactly how paying works here before bookings open.',
            },
            {
              id: 'fpay.methods',
              label: 'How do customers pay?',
              kind: 'leaf',
              answer:
                'Don\'t accept payment outside the app. Report it to support@skillance.co.za.',
            },
            {
              id: 'fpay.after',
              label: 'Disputes',
              kind: 'branch',
              children: [
                {
                  id: 'fpay.after.escrow',
                  label: 'How do payments work for my bookings?',
                  kind: 'leaf',
                  answer:
                    'Payments aren\'t live yet. We\'ll explain exactly how paying works here before bookings open.',
                },
                {
                  id: 'fpay.after.refund',
                  label: 'What if the customer gets a refund?',
                  kind: 'leaf',
                  answer:
                    'If a booking is fully refunded, Skillance doesn\'t keep a commission on that booking and you don\'t receive that payout. If it\'s partial, platform commission is calculated only on the amount the customer ultimately pays — not on the refunded slice. Open disputes are decided using the evidence in the app.',
                },
                {
                  id: 'fpay.after.chargeback',
                  label: 'What if a customer chargebacks?',
                  kind: 'leaf',
                  answer:
                    'Tell us immediately via support. We review the booking record, chat, and PIN logs. Chargebacks don\'t override our Terms; abuse can lead to account action. Cooperate with any evidence request so we can defend valid payouts.',
                },
              ],
            },
          ],
        },
        {
          id: 'freelancer.safety',
          label: 'Safety, privacy & support',
          kind: 'branch',
          children: [
            {
              id: 'fs.verify',
              label: 'How does Skillance verify freelancers?',
              kind: 'leaf',
              answer:
                'Before a provider can take bookings, we check their identity document and match it to their profile photo. This confirms who they are. It doesn\'t assess their skills. We don\'t check trade qualifications or references.',
            },
            {
              id: 'fs.privacy',
              label: 'How is my data protected?',
              kind: 'branch',
              children: [
                {
                  id: 'fsp.popia',
                  label: 'Your personal information',
                  kind: 'leaf',
                  answer:
                    'We collect the personal information we need to run the marketplace. Full details are in our Privacy Policy at skillance.co.za/privacy-policy.',
                },
                {
                  id: 'fsp.share',
                  label: 'What do customers see about me?',
                  kind: 'leaf',
                  answer:
                    'Customers see your public profile, ratings, and booking-relevant details — not your private banking or ID documents. Share personal contact details only in line with our rules so bookings stay on-platform.',
                },
                {
                  id: 'fsp.delete',
                  label: 'Can I delete my data?',
                  kind: 'leaf',
                  answer:
                    'Yes — use Delete account in Settings or email support. We keep the legal minimum (e.g. tax records) and remove the rest on schedule.',
                },
                {
                  id: 'fsp.cookies',
                  label: 'What cookies does the website use?',
                  kind: 'leaf',
                  answer:
                    'Strictly necessary cookies plus optional analytics with consent. Manage choices at skillance.co.za/cookie-policy.',
                },
              ],
            },
            {
              id: 'fs.report',
              label: 'How do I report an issue?',
              kind: 'branch',
              children: [
                {
                  id: 'fsr.booking',
                  label: 'About a specific booking',
                  kind: 'leaf',
                  answer:
                    'Open the booking → menu → Report. Include timings, session notes, and chat context. The session PIN is entered at the start: the customer shows it and the provider submits it to confirm the session has begun. It does not mark the job as complete. Email support@skillance.co.za. Support hours are Mon-Fri 09:00-17:00.',
                },
                {
                  id: 'fsr.customer',
                  label: 'About a customer\'s behaviour',
                  kind: 'leaf',
                  answer:
                    'Report from the booking or email services@skillance.co.za with the booking ID. Harassment, safety risks, or fraud are escalated to trust & safety.',
                },
                {
                  id: 'fsr.support',
                  label: 'General support',
                  kind: 'leaf',
                  answer:
                    'Use Contact support in the app or email support@skillance.co.za. Support hours are Mon-Fri 09:00-17:00.',
                },
                {
                  id: 'fsr.fraud',
                  label: 'I think I\'m being scammed',
                  kind: 'leaf',
                  answer:
                    'Stop the job, don\'t accept off-app payments, and report the booking immediately. Email fraud@skillance.co.za with screenshots and our team will investigate.',
                },
              ],
            },
            {
              id: 'fs.dispute',
              label: 'What happens in a dispute?',
              kind: 'leaf',
              answer:
                'Our team reviews the chat, booking timeline and both sides\' submissions. Outcomes follow our Terms. The session PIN is entered at the start of the session, when the customer shows it and the provider submits it to confirm the session has begun. It does not mark the job as complete.',
            },
            {
              id: 'fs.delete',
              label: 'How do I delete my account?',
              kind: 'leaf',
              answer:
                'Profile → Settings → Delete account. Cancel or complete outstanding bookings first. Some financial records are retained as required by law.',
            },
          ],
        },
      ],
    },

    // =======================================================================
    // OTHER (investor, press, general)
    // =======================================================================
    {
      id: 'role.other',
      label: 'Something else — investor, press, or general',
      kind: 'branch',
      children: [
        {
          id: 'other.about',
          label: 'About the company & platform',
          kind: 'branch',
          children: [
            {
              id: 'other.about.what',
              label: 'What is Skillance?',
              kind: 'leaf',
              answer:
                'Skillance is a South African marketplace connecting customers with ID-checked freelancers for on-demand services — home help, tutoring, creative work, wellness, and more — with in-app booking and reviews.',
            },
            {
              id: 'other.about.diff',
              label: 'How is Skillance Personal different from Skillance Marketplace?',
              kind: 'leaf',
              answer:
                'Skillance Personal is for booking ID-checked freelancers — search, book and leave reviews. Skillance Marketplace is a separate app for local buy-and-sell classifieds (furniture, electronics, and similar goods) with listings, favorites, and the same Skillance login. Services bookings and item listings are not mixed in one app.',
            },
            {
              id: 'other.about.marketplace',
              label: 'What is Skillance Marketplace?',
              kind: 'leaf',
              answer:
                'Skillance Marketplace is our classifieds app: browse listings near you, post items with photos and price, save favorites, and agree pickup or payment directly with the seller. It uses your existing Skillance account but is separate from booking freelancers on Skillance Personal.',
            },
            {
              id: 'other.about.where',
              label: 'Where does Skillance operate?',
              kind: 'leaf',
              answer:
                'We\'re launching first in one area. Tell us your area and we\'ll let you know if we reach you.',
            },
            {
              id: 'other.about.who',
              label: 'Who operates Skillance?',
              kind: 'leaf',
              answer:
                'Skillance is owned by and part of Rimitso Management Services (Pty) Ltd (RIMITSO MANAGEMENT SERVICES (PTY) LTD), trading as Skillance — registered in South Africa. Billing, data processing, and support are handled under South African law including POPIA and the CPA.',
            },
          ],
        },
        {
          id: 'other.media',
          label: 'Press, media & brand',
          kind: 'leaf',
          answer:
            'For press enquiries, interviews, or media assets email services@skillance.co.za with "Press" in the subject line and we\'ll route you to the right person.',
        },
        {
          id: 'other.investors',
          label: 'Investment & fundraising',
          kind: 'leaf',
          answer:
            'For investment or fundraising conversations email services@skillance.co.za with "Investment" in the subject line. Include a short introduction and we\'ll respond if there\'s a fit.',
        },
        {
          id: 'other.partners',
          label: 'Partnerships & enterprise',
          kind: 'leaf',
          answer:
            'For partnerships, integrations, or bulk/enterprise use cases email services@skillance.co.za with "Partnership" in the subject and a one-paragraph description of what you have in mind.',
        },
        {
          id: 'other.contact',
          label: 'General contact & legal',
          kind: 'leaf',
          answer:
            'General help: support@skillance.co.za or WhatsApp +27 64 872 8174. Legal/privacy: services@skillance.co.za. Registered office (RIMITSO MANAGEMENT SERVICES (PTY) LTD): 6 DWARS STREET, KRUGERSDORP, KRUGERSDORP, GAUTENG, 1739. Policies: skillance.co.za/terms, /privacy-policy, /refund-policy.',
        },
      ],
    },
  ],
};

// Utility: find a node by id by walking the tree.
export function findNodeById(id: string, node: FaqNode = PUBLIC_FAQ): FaqNode | null {
  if (node.id === id) return node;
  if (node.kind === 'branch') {
    for (const child of node.children) {
      const found = findNodeById(id, child);
      if (found) return found;
    }
  }
  return null;
}
