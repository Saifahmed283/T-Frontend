import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Mail, X, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

import SitePage from "@/pages/site/SitePage";
import { Heading, Button, Prose, GoldLine, Card, CardContent } from "@/components/ui";
import { MARKETING_LISTS } from "@/content/marketing-consent";

type UnsubscribeStatus = 'idle' | 'loading' | 'success' | 'error';

function UnsubscribePage() {
  const { urlParsed } = usePageContext();
  const email = urlParsed.search.email ?? '';
  const list = urlParsed.search.list ?? '';
  const token = urlParsed.search.token ?? '';

  const [status, setStatus] = useState<UnsubscribeStatus>('idle');
  const [message, setMessage] = useState('');
  const [unsubscribedLists, setUnsubscribedLists] = useState<string[]>([]);

  useEffect(() => {
    if (!email || !list || !token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link. Please check the link or contact us.');
      return;
    }

    const performUnsubscribe = async () => {
      setStatus('loading');
      try {
        // In production, call your API endpoint
        // const res = await fetch('/api/unsubscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email, list, token })
        // });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For demo, we'll just mark as success
        const lists = list === 'all' ? MARKETING_LISTS.map(l => l.value) : [list];
        setUnsubscribedLists(lists);
        setStatus('success');
        setMessage(list === 'all'
          ? 'You have been unsubscribed from all marketing communications.'
          : `You have been unsubscribed from ${MARKETING_LISTS.find(l => l.value === list)?.label ?? list}.`);
      } catch (e) {
        setStatus('error');
        setMessage('Something went wrong. Please try again or contact us.');
      }
    };

    performUnsubscribe();
  }, [email, list, token]);

  const targetList = list === 'all'
    ? 'all marketing communications'
    : MARKETING_LISTS.find(l => l.value === list)?.label ?? list;

  return (
    <SitePage lang="en">
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20">
        <div className="text-center mb-8">
          <Mail className="mx-auto h-12 w-12 text-navy-2" aria-hidden="true" />
          <Heading level={1} className="mt-4 text-h2">
            Unsubscribe
          </Heading>
          <p className="mt-2 text-navy-2">
            Manage your subscription to <strong>{targetList}</strong>
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-8 w-8 text-gold animate-spin" aria-hidden="true" />
                <p className="text-navy-2">Processing your request...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <CheckCircle className="h-12 w-12 text-green-600" aria-hidden="true" />
                <Heading level={2} className="text-xl">You're unsubscribed</Heading>
                <Prose className="text-center text-navy-2 max-w-xs">
                  <p>{message}</p>
                  <p className="mt-2 text-sm">
                    {list === 'all'
                      ? 'You will no longer receive any marketing emails from us.'
                      : `You may still receive other communications you've consented to.`}
                  </p>
                </Prose>
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="secondary" asChild>
                    <a href="/join/newsletter">Manage other subscriptions</a>
                  </Button>
                  <Button variant="ghost" asChild>
                    <a href="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back to home</a>
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <AlertCircle className="h-12 w-12 text-red-600" aria-hidden="true" />
                <Heading level={2} className="text-xl">Unable to unsubscribe</Heading>
                <Prose className="text-center text-navy-2 max-w-xs">
                  <p>{message || 'The unsubscribe link is invalid or has expired.'}</p>
                  <p className="mt-2 text-sm">
                    Please check the link in your email or{' '}
                    <a href="mailto:info@askterramorph.com" className="underline decoration-gold underline-offset-2 hover:text-navy">
                      contact us
                    </a>
                    {' '}for assistance.
                  </p>
                </Prose>
                <Button variant="ghost" asChild>
                  <a href="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back to home</a>
                </Button>
              </div>
            )}

            {status === 'idle' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <AlertCircle className="h-12 w-12 text-yellow-600" aria-hidden="true" />
                <Heading level={2} className="text-xl">Invalid link</Heading>
                <Prose className="text-center text-navy-2 max-w-xs">
                  <p>This unsubscribe link is missing required parameters.</p>
                  <p className="mt-2 text-sm">
                    Please use the link from your email or{' '}
                    <a href="mailto:info@askterramorph.com" className="underline decoration-gold underline-offset-2 hover:text-navy">
                      contact us
                    </a>
                    {' '}for assistance.
                  </p>
                </Prose>
                <Button variant="ghost" asChild>
                  <a href="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back to home</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="mt-10 text-center">
          <p className="text-sm text-navy-2">
            TerraMorph Advisory LLC · CR No. 184 562 · Cairo
          </p>
          <p className="mt-1 text-sm text-navy-2">
            <a href="/legal/privacy-policy" className="underline decoration-gold underline-offset-2 hover:text-navy">Privacy Policy</a>
            {' '}·{' '}
            <a href="/legal/terms-of-service" className="underline decoration-gold underline-offset-2 hover:text-navy">Terms of Service</a>
          </p>
        </footer>
      </div>
    </SitePage>
  );
}

export default UnsubscribePage;