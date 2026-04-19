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
  label: 'What do you want to know?',
  kind: 'branch',
  children: [
    // =======================================================================
    // 1. ABOUT SKILLANCE
    // =======================================================================
    {
      id: 'about',
      label: 'About Skillance',
      kind: 'branch',
      children: [
        {
          id: 'about.what',
          label: 'What is Skillance?',
          kind: 'leaf',
          answer:
            'Skillance is a South African marketplace that connects customers with local, verified freelancers for on-demand services — think plumbers, tutors, cleaners, designers and more. You search, you book, the freelancer shows up, and you pay through the app.',
        },
        {
          id: 'about.diff',
          label: 'How is Skillance different from a classifieds site?',
          kind: 'leaf',
          answer:
            'We verify every freelancer\'s ID, contact details and category fit before they can take bookings. Pricing, reviews and in-app chat all live inside Skillance, so both sides know what they\'re getting into and there\'s a record if anything goes wrong.',
        },
        {
          id: 'about.free',
          label: 'Is Skillance free to use?',
          kind: 'branch',
          children: [
            {
              id: 'about.free.customer',
              label: 'As a customer',
              kind: 'leaf',
              answer:
                'Creating an account, browsing freelancers and chatting with them before a booking is 100% free. You only pay when you confirm a booking, and the freelancer\'s price is always shown up-front.',
            },
            {
              id: 'about.free.freelancer',
              label: 'As a freelancer',
              kind: 'leaf',
              answer:
                'Signing up and listing services is free. Skillance only earns money when you earn money — we deduct a small service fee from confirmed bookings (see the "Payments, fees & refunds" section for the exact number).',
            },
            {
              id: 'about.free.hidden',
              label: 'Are there any hidden fees?',
              kind: 'leaf',
              answer:
                'No. You\'ll see the freelancer\'s price and the Skillance service fee before you confirm a booking. VAT (where applicable) is included in the total shown at checkout.',
            },
            {
              id: 'about.free.cancel',
              label: 'Is cancelling free?',
              kind: 'leaf',
              answer:
                'Cancellations are free up to 4 hours before the booking starts. Inside that window a small protection fee is kept by the freelancer for the slot they reserved.',
            },
            {
              id: 'about.free.download',
              label: 'Does the app cost anything to download?',
              kind: 'leaf',
              answer:
                'Skillance is free to download and install from the App Store and Google Play. Standard mobile-data charges from your network apply when you use it.',
            },
          ],
        },
        {
          id: 'about.where',
          label: 'Where does Skillance operate?',
          kind: 'leaf',
          answer:
            'Skillance currently launches in South Africa, with freelancers across all major metros. You can browse who is near you by using "Nearby" in the app — if no one is close enough yet, you\'ll see an empty state and we\'ll notify you when coverage expands.',
        },
        {
          id: 'about.who',
          label: 'Who operates Skillance?',
          kind: 'leaf',
          answer:
            'Skillance is operated by RIMITSO MANAGEMENT SERVICES (PTY) LTD, a South African company. All billing, data handling and customer support are provided by this entity in line with South African consumer and data-protection law (POPIA).',
        },
      ],
    },

    // =======================================================================
    // 2. FOR CUSTOMERS
    // =======================================================================
    {
      id: 'customers',
      label: 'I\'m a customer',
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
                'Open the Skillance app → pick a category or search → view freelancer profiles, ratings and prices → tap "Book", choose a date/time and describe the job → confirm. The freelancer is notified immediately and either accepts or suggests a different slot.',
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
              label: 'Can I talk to a freelancer before booking?',
              kind: 'leaf',
              answer:
                'Yes. Every freelancer profile has a "Chat" button. Messages stay inside Skillance so there\'s a record if you need to reference what was agreed.',
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
                'Yes. Start a chat with the freelancer from their profile and describe the job. Once they reply with a figure, they can send you a one-tap booking link with that exact price locked in.',
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

    // =======================================================================
    // 3. FOR FREELANCERS
    // =======================================================================
    {
      id: 'freelancers',
      label: 'I want to join as a freelancer',
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
                'A South African ID or valid work permit, a clear profile photo, and (for some categories) a trade certification or proof of qualification. Banking details are captured later so you can receive payouts.',
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
              id: 'freelancers.verify.trade',
              label: 'Trade certification',
              kind: 'leaf',
              answer:
                'Regulated categories (e.g. electrical, plumbing) require proof of qualification. Upload it during sign-up — until it\'s approved your profile shows as "Unverified trade" and some customers may filter you out.',
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

    // =======================================================================
    // 4. PAYMENTS, FEES & REFUNDS
    // =======================================================================
    {
      id: 'payments',
      label: 'Payments, fees & refunds',
      kind: 'branch',
      children: [
        {
          id: 'payments.fee',
          label: 'What\'s the Skillance service fee?',
          kind: 'leaf',
          answer:
            'Skillance takes a percentage of each confirmed booking as a service fee. The exact percentage and any fixed connection fee are shown at checkout before you confirm — there are no surprise deductions. The fee pays for the platform, payment processing, support and freelancer verification.',
        },
        {
          id: 'payments.methods',
          label: 'What payment methods are supported?',
          kind: 'leaf',
          answer:
            'Cards (Visa / Mastercard) and instant-EFT via our South African payment provider. Cash is not supported in-app — paying in cash outside the booking voids Skillance\'s protection.',
        },
        {
          id: 'payments.refunds',
          label: 'How do refunds work?',
          kind: 'branch',
          children: [
            {
              id: 'payments.refunds.flow',
              label: 'When am I eligible for a refund?',
              kind: 'leaf',
              answer:
                'You\'re eligible if the freelancer no-shows, cancels on you, or if the work is clearly not what was agreed (and the freelancer won\'t fix it). Cancellations inside the 4-hour window are partially refundable — the rest goes to the freelancer as a protection fee.',
            },
            {
              id: 'payments.refunds.timeline',
              label: 'How long does a refund take?',
              kind: 'leaf',
              answer:
                'Once approved, refunds are issued to your original payment method within 3–5 working days. Your bank may add another 1–2 business days before the money reflects.',
            },
            {
              id: 'payments.refunds.connection',
              label: 'What\'s non-refundable?',
              kind: 'leaf',
              answer:
                'The small connection fee (used to run the matching and messaging infrastructure) is not refundable once a freelancer has accepted the booking. Everything else is eligible under our refund policy.',
            },
            {
              id: 'payments.refunds.partial',
              label: 'Can I get a partial refund?',
              kind: 'leaf',
              answer:
                'Yes — for example if the freelancer delivered part of the job but not all of it. Open a dispute and attach photos or a description; our team reviews evidence from both sides before deciding.',
            },
            {
              id: 'payments.refunds.chargeback',
              label: 'What if I raise a chargeback with my bank?',
              kind: 'leaf',
              answer:
                'Please talk to Skillance support first — our in-app refund is usually faster. A bank chargeback doesn\'t bypass our Terms, and abuse of chargebacks can lead to account suspension.',
            },
          ],
        },
        {
          id: 'payments.vat',
          label: 'Are prices VAT-inclusive?',
          kind: 'leaf',
          answer:
            'Yes. All prices and service fees shown in the app are VAT-inclusive where applicable, in line with South African Consumer Protection Act requirements. Your invoice/receipt breaks down the VAT portion.',
        },
        {
          id: 'payments.escrow',
          label: 'Does Skillance hold my money?',
          kind: 'leaf',
          answer:
            'Yes. When you confirm a booking, the payment is held by our licensed payment partner. The freelancer only receives funds after you confirm the job is complete (or the grace period expires). This protects both sides.',
        },
      ],
    },

    // =======================================================================
    // 5. SAFETY, PRIVACY & SUPPORT
    // =======================================================================
    {
      id: 'safety',
      label: 'Safety, privacy & support',
      kind: 'branch',
      children: [
        {
          id: 'safety.verify',
          label: 'How do you verify freelancers?',
          kind: 'leaf',
          answer:
            'Every freelancer goes through ID verification, profile-photo matching, and (for regulated trades) certification checks. Verified badges appear on their profile so you can see at a glance who has passed the full review.',
        },
        {
          id: 'safety.privacy',
          label: 'How is my data protected?',
          kind: 'branch',
          children: [
            {
              id: 'safety.privacy.popia',
              label: 'POPIA compliance',
              kind: 'leaf',
              answer:
                'Skillance is POPIA-compliant. We only collect personal information that\'s necessary to run the marketplace, we store it securely, and we never sell it. Full details live in our Privacy Policy at skillance.co.za/privacy-policy.',
            },
            {
              id: 'safety.privacy.share',
              label: 'Who can see my details?',
              kind: 'leaf',
              answer:
                'Freelancers only see your first name and booking details until you accept a match. Customers only see the freelancer\'s profile info. Your banking details, phone number and address are never exposed publicly.',
            },
            {
              id: 'safety.privacy.delete',
              label: 'Can I delete my data?',
              kind: 'leaf',
              answer:
                'Yes. You can request deletion from the "Delete account" option in the app, or by emailing support. We retain the legal minimum (e.g. tax-relevant invoices) and purge everything else within 30 days.',
            },
            {
              id: 'safety.privacy.cookies',
              label: 'What cookies does the website use?',
              kind: 'leaf',
              answer:
                'We use strictly necessary cookies for the site to work, and (with your consent) basic analytics to improve it. Manage everything on our Cookie Policy page at skillance.co.za/cookie-policy.',
            },
          ],
        },
        {
          id: 'safety.report',
          label: 'How do I report an issue?',
          kind: 'branch',
          children: [
            {
              id: 'safety.report.booking',
              label: 'About a specific booking',
              kind: 'leaf',
              answer:
                'Open the booking → tap the 3-dot menu → "Report". A support agent will review the chat log, the booking timeline, and the freelancer/customer account, and will come back to you within one working day.',
            },
            {
              id: 'safety.report.freelancer',
              label: 'About a freelancer\'s behaviour',
              kind: 'leaf',
              answer:
                'Use the "Report profile" action on the freelancer\'s profile page. Serious reports (safety, harassment, fraud) are escalated to the trust-and-safety team immediately.',
            },
            {
              id: 'safety.report.support',
              label: 'General question for support',
              kind: 'leaf',
              answer:
                'Use the "Contact support" link at the bottom of the app or email support@skillance.co.za. South African business hours response times apply.',
            },
            {
              id: 'safety.report.fraud',
              label: 'I think I\'ve been scammed',
              kind: 'leaf',
              answer:
                'Don\'t engage further — open the booking and tap "Report", then email fraud@skillance.co.za with any screenshots. We freeze funds during investigation. Also consider reporting to SAPS if you shared banking details.',
            },
          ],
        },
        {
          id: 'safety.dispute',
          label: 'What happens if there\'s a dispute?',
          kind: 'leaf',
          answer:
            'If you and the freelancer can\'t agree, open a dispute from the booking. The funds stay frozen while our disputes team reviews the chat, payment history, and evidence from both sides. Decisions reference South African consumer law and our published Terms.',
        },
        {
          id: 'safety.delete',
          label: 'How do I delete my account?',
          kind: 'leaf',
          answer:
            'Go to Profile → Settings → Delete account. Any confirmed future bookings must be cancelled first. Deleted accounts cannot be recovered; email records required by law (e.g. tax invoices) are kept for the statutory retention period.',
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
