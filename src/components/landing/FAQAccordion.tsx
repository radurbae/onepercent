'use client';

import { ChevronDown } from 'lucide-react';

const FAQS = [
    {
        question: 'Is it free?',
        answer: 'Yes. You can start free and upgrade later if you want more features or cosmetics.',
    },
    {
        question: 'Does it work offline?',
        answer: 'Yes. The PWA caches core screens so you can log check-ins even without a connection.',
    },
    {
        question: 'How do I install on iPhone?',
        answer: 'Open the site in Safari → tap Share → Add to Home Screen. You’ll get an app-like experience.',
    },
    {
        question: 'What if I miss a day?',
        answer: 'No guilt. Just follow the “never miss twice” rule—reset quickly and keep the streak alive.',
    },
];

export default function FAQAccordion() {
    return (
        <div className="space-y-3">
            {FAQS.map((faq) => (
                <details
                    key={faq.question}
                    className="card group px-4 py-3"
                >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[var(--foreground)]">
                        <span>{faq.question}</span>
                        <ChevronDown className="h-4 w-4 text-[var(--foreground-muted)] transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                        {faq.answer}
                    </p>
                </details>
            ))}
        </div>
    );
}
