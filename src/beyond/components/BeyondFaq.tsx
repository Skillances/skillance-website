import type { BeyondFaq } from '@/beyond/content';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function BeyondFaqList({ items }: { items: readonly BeyondFaq[] }) {
  return (
    <Accordion type="single" collapsible className="by-faq-accordion">
      {items.map((faq) => (
        <AccordionItem key={faq.question} value={faq.question} className="by-faq-item">
          <AccordionTrigger className="by-faq-trigger">
            <span className="by-faq-question">{faq.question}</span>
          </AccordionTrigger>
          <AccordionContent className="by-faq-answer">
            <p>{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
