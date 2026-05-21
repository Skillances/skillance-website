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
                'Skillance is a South African marketplace that connects customers with local, verified freelancers for on-demand services — think plumbers, tutors, cleaners, designers and more. You search, you book, the freelancer shows up, and you pay through the app.',
            },
            {
              id: 'customer.about.diff',
              label: 'How is Skillance Personal different from a classifieds site?',
              kind: 'leaf',
              answer:
                'Skillance Personal is built for booking verified freelancers — not peer-to-peer item sales. For local buy-and-sell classifieds, use the separate Skillance Marketplace app (same login). On Personal we verify freelancer IDs, show upfront pricing, hold payments in escrow, and keep messaging and reviews tied to completed bookings.',
            },
            {
              id: 'customer.about.free',
              label: 'Is it free to use as a customer?',
              kind: 'leaf',
              answer:
                'Creating an account and browsing freelancers is free. In-app messaging opens after the freelancer accepts your booking. You pay when you confirm a booking request, and the freelancer\'s price is shown up-front.',
            },
            {
              id: 'customer.about.fees',
              label: 'Are there hidden fees?',
              kind: 'leaf',
              answer:
                'No. You\'ll see the freelancer\'s price and the Skillance service fee before you confirm a booking. VAT (where applicable) is included in the total shown at checkout.',
            },
            {
              id: 'customer.about.ops',
              label: 'Where you operate & who runs Skillance',
              kind: 'leaf',
              answer:
                'Skillance is owned by and part of Rimitso Management Services (Pty) Ltd (legal name: RIMITSO MANAGEMENT SERVICES (PTY) LTD). We launch in South Africa with freelancers in major metros — use Nearby in the app to see who is close. Billing, data handling and support follow South African consumer and data-protection law (POPIA).',
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
                    'Open the Skillance app → pick a category or search → view freelancer profiles, ratings and prices → tap "Book", choose a date/time and describe the job → submit your request. The freelancer is notified and either accepts or declines. After they accept, in-app messaging opens on that booking so you can coordinate details.',
                },
                {
                  id: 'customers.book.accept',
                  label: 'How long until a freelancer accepts?',
                  kind: 'leaf',
                  answer:
                    'Most bookings are accepted within a few minutes during working hours. If nobody accepts within 24 hours, the booking expires automatically and no money is held.',
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
                'Skillance charges a service fee of 8–9% including VAT on each confirmed booking. The exact line items (including any connection fee) are shown at checkout before you confirm — there are no surprise deductions. The fee pays for the platform, payment processing, support and freelancer verification.',
            },
            {
              id: 'cpay.methods',
              label: 'What payment methods are supported?',
              kind: 'leaf',
              answer:
                'Cards (Visa / Mastercard) and instant-EFT via our South African payment provider. Cash is not supported in-app — paying in cash outside the booking voids Skillance\'s protection.',
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
              id: 'cpay.vat',
              label: 'Are prices VAT-inclusive?',
              kind: 'leaf',
              answer:
                'Yes. All prices and service fees shown in the app are VAT-inclusive where applicable, in line with South African Consumer Protection Act requirements. Your invoice/receipt breaks down the VAT portion.',
            },
            {
              id: 'cpay.escrow',
              label: 'Does Skillance hold my money?',
              kind: 'leaf',
              answer:
                'Yes. When you confirm a booking, the payment is held by our licensed payment partner. The freelancer only receives funds after you confirm the job is complete (or the grace period expires). This protects both sides.',
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
                'Every freelancer goes through South African ID verification and profile-photo matching before they can take bookings. Skillance doesn\'t require trade certifications — we\'re a ratings-and-reviews marketplace, so anyone can register and customers judge quality from public reviews left by previous clients. A verified badge appears on profiles once ID verification is complete.',
            },
            {
              id: 'cs.privacy',
              label: 'How is my data protected?',
              kind: 'branch',
              children: [
                {
                  id: 'csp.popia',
                  label: 'POPIA compliance',
                  kind: 'leaf',
                  answer:
                    'Skillance is POPIA-compliant. We only collect personal information that\'s necessary to run the marketplace, we store it securely, and we never sell it. Full details live in our Privacy Policy at skillance.co.za/privacy-policy.',
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
                    'Open the booking → tap the 3-dot menu → "Report". A support agent will review the chat log, the booking timeline, and the freelancer/customer account, and will come back to you within one working day.',
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
                    'Use the "Contact support" link at the bottom of the app or email support@skillance.co.za. South African business hours response times apply.',
                },
                {
                  id: 'csr.fraud',
                  label: 'I think I\'ve been scammed',
                  kind: 'leaf',
                  answer:
                    'Don\'t engage further — open the booking and tap "Report", then email fraud@skillance.co.za with any screenshots. We freeze funds during investigation. Also consider reporting to SAPS if you shared banking details.',
                },
              ],
            },
            {
              id: 'cs.dispute',
              label: 'What happens if there\'s a dispute?',
              kind: 'leaf',
              answer:
                'If you and the freelancer can\'t agree, open a dispute from the booking. The funds stay frozen while our disputes team reviews the chat, payment history, and evidence from both sides. Decisions reference South African consumer law and our published Terms.',
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
                'Skillance is a South African marketplace: customers book you for on-demand work, pay through the app, and you get verified exposure, escrow protection, and payouts after jobs complete. You\'re an independent contractor — not an employee of Skillance.',
            },
            {
              id: 'fl.about.listfee',
              label: 'Is listing free? What does Skillance charge?',
              kind: 'leaf',
              answer:
                'Signing up and listing services is free. Skillance only earns when you do — we deduct a service fee of 8–9% including VAT from confirmed bookings. Exact line items appear before the customer checks out. See Payments & payouts in this menu for timing and escrow.',
            },
            {
              id: 'fl.about.download',
              label: 'Does the app cost anything to download?',
              kind: 'leaf',
              answer:
                'Skillance is free to download and install from the App Store and Google Play. Standard mobile-data charges from your network apply when you use it.',
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
                    'Download the Skillance app → choose "Join as a freelancer" → fill in your details, upload your SA ID and a profile photo → pick one or more service categories → set your rates and availability → submit for verification. Most profiles are reviewed within 24–72 hours.',
                },
                {
                  id: 'freelancers.join.docs',
                  label: 'What documents do I need?',
                  kind: 'leaf',
                  answer:
                    'A South African ID or valid work permit and a clear profile photo. That\'s it to get listed — Skillance doesn\'t gate registration on trade certifications or qualifications. You build your reputation through ratings and reviews from real jobs. Banking details are captured later so you can receive payouts.',
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
                    'We check that the photo on your SA ID matches your profile photo and that the ID number is valid. This protects customers and keeps the platform compliant with POPIA and local consumer law.',
                },
                {
                  id: 'freelancers.verify.reviews',
                  label: 'Ratings & reviews (how customers judge you)',
                  kind: 'leaf',
                  answer:
                    'Skillance doesn\'t require trade certifications or qualifications to register — we\'re a ratings-and-reviews marketplace. After each completed booking, customers rate you 1–5 stars and leave a public review on your profile. New freelancers start with no reviews; the quickest way to build a strong profile is to take early bookings, do great work, and ask satisfied customers to leave a review. Your rating is the signal customers use most when choosing who to book.',
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
                    'Typically 24–72 hours during weekdays. You\'ll get an in-app notification and an email once the review is done. You can see the status in your freelancer dashboard at any time.',
                },
              ],
            },
            {
              id: 'freelancers.payout',
              label: 'How and when do I get paid?',
              kind: 'leaf',
              answer:
                'After a customer confirms the job is complete, the payment (minus the Skillance service fee) is queued for payout. Payouts go to the bank account on your profile on a weekly schedule — most freelancers receive funds within 3–5 working days of a completed booking.',
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
          label: 'Payments, fees & escrow',
          kind: 'branch',
          children: [
            {
              id: 'fpay.fee',
              label: 'What\'s the Skillance service fee on my jobs?',
              kind: 'leaf',
              answer:
                'Skillance charges a service fee of 8–9% including VAT on each confirmed booking. It\'s deducted before your payout. The customer sees the full breakdown at checkout; there are no surprise deductions on your side beyond what\'s shown there.',
            },
            {
              id: 'fpay.payouts',
              label: 'When do payouts reach my bank?',
              kind: 'leaf',
              answer:
                'After the customer confirms completion (and any dispute window closes), your share is queued for payout on our weekly schedule — most freelancers see money within 3–5 working days. Keep your banking details up to date in your profile.',
            },
            {
              id: 'fpay.methods',
              label: 'How do customers pay?',
              kind: 'leaf',
              answer:
                'Customers pay with card or instant-EFT through our South African payment partner. Cash in-app isn\'t supported — if someone tries to take you off-platform, you lose Skillance\'s escrow and dispute protections.',
            },
            {
              id: 'fpay.vat',
              label: 'Are amounts VAT-inclusive?',
              kind: 'leaf',
              answer:
                'Yes. Prices and the platform service fee are shown VAT-inclusive where applicable. Invoices and receipts break out VAT as required for South African consumers.',
            },
            {
              id: 'fpay.after',
              label: 'Escrow, disputes & customer refunds',
              kind: 'branch',
              children: [
                {
                  id: 'fpay.after.escrow',
                  label: 'How does escrow work for my bookings?',
                  kind: 'leaf',
                  answer:
                    'The customer\'s payment is held by our licensed partner until the job is completed and undisputed (or the grace period passes). You don\'t receive the payout until that release happens — that\'s what protects you from non-payment.',
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
                'Every freelancer goes through South African ID verification and profile-photo matching before they can take bookings. Skillance doesn\'t require trade certifications — the platform runs on ratings and reviews, so anyone can register and build a reputation through real bookings. A verified badge appears on your profile once ID verification is complete.',
            },
            {
              id: 'fs.privacy',
              label: 'How is my data protected?',
              kind: 'branch',
              children: [
                {
                  id: 'fsp.popia',
                  label: 'POPIA compliance',
                  kind: 'leaf',
                  answer:
                    'Skillance is POPIA-compliant. We only collect what we need to run the marketplace and pay you, we store it securely, and we never sell it. Full details: skillance.co.za/privacy-policy.',
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
                    'Open the booking → menu → Report. Include timings, PIN/session notes, and chat context. We usually respond within one business day.',
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
                    'Use Contact support in the app or email support@skillance.co.za during South African business hours.',
                },
                {
                  id: 'fsr.fraud',
                  label: 'I think I\'m being scammed',
                  kind: 'leaf',
                  answer:
                    'Stop the job, don\'t accept off-app payments, and report the booking immediately. Email fraud@skillance.co.za with screenshots. We can freeze escrow while we investigate.',
                },
              ],
            },
            {
              id: 'fs.dispute',
              label: 'What happens in a dispute?',
              kind: 'leaf',
              answer:
                'Funds stay in escrow while our team reviews chat, PIN evidence, and both sides\' submissions. Outcomes follow our Terms and South African consumer law. Respond promptly with clear evidence.',
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
                'Skillance is a South African marketplace connecting customers with verified freelancers for on-demand services — home help, tutoring, creative work, wellness, and more — with in-app booking, escrow payments, and reviews.',
            },
            {
              id: 'other.about.diff',
              label: 'How is Skillance Personal different from Skillance Marketplace?',
              kind: 'leaf',
              answer:
                'Skillance Personal is for booking verified freelancers — search, book, pay with escrow, and leave reviews. Skillance Marketplace is a separate app for local buy-and-sell classifieds (furniture, electronics, and similar goods) with listings, favorites, and the same Skillance login. Services bookings and item listings are not mixed in one app.',
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
                'We launch in South Africa with coverage across major metros. Availability grows as more freelancers join each area.',
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
