"use client";

/**
 * Client portal dashboard.
 *
 * Tabs: policies, claim notification, and messages to the broker. The tab strip
 * scrolls horizontally on mobile (brief: "Client portal: tabs scroll horizontally on
 * mobile"). Policy data is fetched from the session-guarded route and never cached,
 * and the schedule PDF is streamed from /api/portal/documents.
 */
import { useCallback, useEffect, useState } from "react";
import { ClaimForm } from "@/components/ClaimForm";
import { Field, Input, Select, Textarea } from "@/components/forms/Fields";
import { formatDate, formatKes, daysUntil } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

interface Policy {
  reference: string;
  policyNumber: string;
  insurer: string;
  product: string;
  coverSummary: string;
  sumInsured: number;
  premium: number;
  premiumFrequency: string;
  startDate: string;
  renewalDate: string;
  status: "active" | "due-for-renewal" | "lapsed";
  dependants?: string[];
  benefits: string[];
  documents: { name: string; kind: string; updatedAt: string }[];
}

interface Message {
  id: string;
  createdAt: string;
  from: "client" | "broker";
  subject: string;
  body: string;
  policyReference?: string;
}

const TABS = [
  { id: "policies", label: "Active policies", icon: "bi-shield-check" },
  { id: "claim", label: "Notify a claim", icon: "bi-clipboard2-pulse" },
  { id: "messages", label: "Message my broker", icon: "bi-chat-dots" },
] as const;

export function PortalDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("policies");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [sampleLabel, setSampleLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messagePolicy, setMessagePolicy] = useState("");
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [policiesResponse, messagesResponse] = await Promise.all([
        fetch("/api/portal/policies", { cache: "no-store" }),
        fetch("/api/portal/messages", { cache: "no-store" }),
      ]);

      const policiesData = (await policiesResponse.json()) as {
        ok: boolean;
        policies?: Policy[];
        sampleLabel?: string;
        error?: string;
      };
      const messagesData = (await messagesResponse.json()) as {
        ok: boolean;
        messages?: Message[];
        error?: string;
      };

      if (!policiesData.ok) {
        setError(policiesData.error ?? "We could not load your policies. Please sign in again.");
      } else {
        setPolicies(policiesData.policies ?? []);
        setSampleLabel(policiesData.sampleLabel ?? null);
      }

      if (messagesData.ok) setMessages(messagesData.messages ?? []);
    } catch {
      setError("We could not reach the portal. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (messageSubject.trim().length < 3) next.subject = "Give your message a subject";
    if (messageBody.trim().length < 10) next.body = "Tell your broker what you need";
    setMessageError(next);
    if (Object.keys(next).length > 0) return;

    setMessageStatus("sending");
    try {
      const response = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: messageSubject,
          body: messageBody,
          policyReference: messagePolicy || undefined,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

      if (!data.ok) {
        setMessageError(data.fieldErrors ?? {});
        setMessageStatus(data.error ?? "The message could not be sent.");
        return;
      }

      setMessageStatus("sent");
      setMessageSubject("");
      setMessageBody("");
      await load();
    } catch {
      setMessageStatus("The message could not be sent. Please call us instead.");
    }
  };

  const statusPill = (policy: Policy) => {
    const days = daysUntil(policy.renewalDate);
    if (policy.status === "lapsed") return <span className="b-pill b-pill--lapsed">Lapsed</span>;
    if (days <= 45) {
      return (
        <span className="b-pill b-pill--due">
          Renews in {days} {days === 1 ? "day" : "days"}
        </span>
      );
    }
    return <span className="b-pill b-pill--active">Active</span>;
  };

  return (
    <div>
      <div className="b-tabs" role="tablist" aria-label="Portal sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            className="b-tab"
            onClick={() => setTab(item.id)}
          >
            <i className={`bi ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Policies */}
      <div
        className="b-panel"
        role="tabpanel"
        id="panel-policies"
        aria-labelledby="tab-policies"
        hidden={tab !== "policies"}
      >
        {loading ? (
          <p className="b-fs-body-sm" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            Loading your policies
          </p>
        ) : error ? (
          <div className="b-alert b-alert--error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {sampleLabel ? (
              <div className="b-alert b-alert--info" style={{ marginBottom: 20 }}>
                <i className="bi bi-info-circle" aria-hidden="true" />
                <span>{sampleLabel}</span>
              </div>
            ) : null}

            {policies.length === 0 ? (
              <div className="b-policy">
                <h2 style={{ fontSize: 18 }}>No policies on this account yet</h2>
                <p className="b-fs-body-sm mb-0">
                  Once your cover is placed your schedules appear here. If you expected to see a policy,
                  call us on +254 112 272 061 and we will link it to your email address.
                </p>
              </div>
            ) : (
              <div className="b-grid-2">
                {policies.map((policy) => (
                  <div className="b-policy" key={policy.reference}>
                    <div className="b-policy__top">
                      <div>
                        <h3>{policy.product}</h3>
                        <p className="b-meta mb-0" style={{ color: "var(--b-ink-muted)" }}>
                          {policy.insurer} &middot; {policy.policyNumber}
                        </p>
                      </div>
                      {statusPill(policy)}
                    </div>

                    <p className="b-fs-body-sm" style={{ marginTop: 12 }}>
                      {policy.coverSummary}
                    </p>

                    <dl>
                      <dt>Sum insured</dt>
                      <dd>{formatKes(policy.sumInsured)}</dd>
                      <dt>Premium</dt>
                      <dd>
                        {formatKes(policy.premium)} {policy.premiumFrequency}
                      </dd>
                      <dt>Cover start</dt>
                      <dd>{formatDate(policy.startDate)}</dd>
                      <dt>Renewal date</dt>
                      <dd>{formatDate(policy.renewalDate)}</dd>
                      {policy.dependants && policy.dependants.length > 0 ? (
                        <>
                          <dt>Dependants</dt>
                          <dd>{policy.dependants.join(", ")}</dd>
                        </>
                      ) : null}
                    </dl>

                    <div className="d-flex flex-wrap gap-2">
                      <a
                        className="btn btn-primary"
                        style={{ minHeight: 44 }}
                        href={`/api/portal/documents?policy=${encodeURIComponent(policy.reference)}`}
                      >
                        <i className="bi bi-file-earmark-pdf me-2" aria-hidden="true" />
                        Policy schedule PDF
                      </a>
                      <a
                        className="btn b-btn-ghost"
                        style={{ minHeight: 44 }}
                        href={whatsappLink(
                          `Hello Barnabas Insurance Brokers. I have a question about policy ${policy.policyNumber}.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ask about this policy
                      </a>
                    </div>

                    {policy.documents.length > 0 ? (
                      <p className="b-meta" style={{ marginTop: 14, color: "var(--b-ink-muted)" }}>
                        On file: {policy.documents.map((document) => document.name).join(", ")}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Claim */}
      <div
        className="b-panel"
        role="tabpanel"
        id="panel-claim"
        aria-labelledby="tab-claim"
        hidden={tab !== "claim"}
      >
        {policies.length > 0 ? (
          <p className="b-fs-body-sm" style={{ marginBottom: 18 }}>
            Your policy numbers are already on file, so quote the one you are claiming on and we will
            match it automatically.
          </p>
        ) : null}
        <ClaimForm portalMode />
      </div>

      {/* Messages */}
      <div
        className="b-panel"
        role="tabpanel"
        id="panel-messages"
        aria-labelledby="tab-messages"
        hidden={tab !== "messages"}
      >
        <div className="row g-4">
          <div className="col-lg-7">
            <h2 className="h4 mb-3">Send your broker a message</h2>
            <form className="b-form" onSubmit={sendMessage} noValidate>
              <Field label="Which policy?" htmlFor="message-policy" hint="Optional. Leave blank for a general question.">
                <Select
                  id="message-policy"
                  value={messagePolicy}
                  onChange={(event) => setMessagePolicy(event.target.value)}
                >
                  <option value="">General question</option>
                  {policies.map((policy) => (
                    <option key={policy.reference} value={policy.reference}>
                      {policy.product} ({policy.policyNumber})
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Subject" htmlFor="message-subject" required error={messageError.subject}>
                <Input
                  id="message-subject"
                  value={messageSubject}
                  onChange={(event) => setMessageSubject(event.target.value)}
                  invalid={Boolean(messageError.subject)}
                />
              </Field>

              <Field label="Message" htmlFor="message-body" required error={messageError.body}>
                <Textarea
                  id="message-body"
                  rows={5}
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  invalid={Boolean(messageError.body)}
                />
              </Field>

              <div className="b-formnav">
                <p className="b-captcha-note mb-0" style={{ maxWidth: "40ch" }}>
                  Your message goes to the broker desk and is copied to your email address.
                </p>
                <button type="submit" className="btn btn-primary" disabled={messageStatus === "sending"}>
                  {messageStatus === "sending" ? "Sending" : "Send message"}
                </button>
              </div>

              {messageStatus && messageStatus !== "sending" && messageStatus !== "sent" ? (
                <p className="b-error" role="alert">
                  {messageStatus}
                </p>
              ) : null}
              {messageStatus === "sent" ? (
                <div className="b-alert b-alert--ok" role="status" style={{ marginTop: 14 }}>
                  <i className="bi bi-check-circle-fill" aria-hidden="true" />
                  <span>Your message has been sent to your broker.</span>
                </div>
              ) : null}
            </form>
          </div>

          <div className="col-lg-5">
            <h2 className="h4 mb-3">Conversation</h2>
            {messages.length === 0 ? (
              <p className="b-fs-body-sm">
                No messages yet. Anything you send from here, and our replies, appear in this list.
              </p>
            ) : (
              messages.map((message) => (
                <div className="b-msg" key={message.id}>
                  <p className="b-msg__meta">
                    {message.from === "client" ? "You" : "Barnabas broker desk"} &middot;{" "}
                    {formatDate(message.createdAt)}
                    {message.policyReference ? ` \u00b7 ${message.policyReference}` : ""}
                  </p>
                  <strong style={{ display: "block", color: "var(--b-dark)" }}>{message.subject}</strong>
                  <p>{message.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
