import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { get, put, post } from '@/lib/api';
import { toast } from 'sonner';
import {
  KeyRound,
  Cpu,
  Database,
  ShieldCheck,
  Play,
  Eye,
  EyeOff,
  Sparkles,
  Rows,
  Power,
} from 'lucide-react';

interface AdminAiConfig {
  id: string;
  model: string;
  allowedTables: string[];
  maxRowsPerQuery: number;
  enabled: boolean;
  systemPrompt: string | null;
  apiKeyMasked: string | null;
  hasApiKey: boolean;
  updatedAt: string;
  createdAt: string;
  supportedModels: string[];
}

const DEFAULT_TABLES_HINT = [
  'users',
  'freelancers',
  'bookings',
  'categories',
  'contact_messages',
  'audit_logs',
  'conversations',
  'reviews',
  'notify_subscribers',
];

const AdminAi: React.FC = () => {
  const [config, setConfig] = useState<AdminAiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showKeyField, setShowKeyField] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [model, setModel] = useState('claude-haiku-4-5');
  const [enabled, setEnabled] = useState(false);
  const [maxRows, setMaxRows] = useState(100);
  const [tablesCsv, setTablesCsv] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  const [testSql, setTestSql] = useState('SELECT id, email, "userType", "createdAt" FROM users ORDER BY "createdAt" DESC LIMIT 5');
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    rowCount: number;
    durationMs: number;
    query: string;
    rows: Record<string, unknown>[];
  } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get('/admin/ai/config');
      if (res.success) {
        const c: AdminAiConfig = res.data;
        setConfig(c);
        setModel(c.model);
        setEnabled(c.enabled);
        setMaxRows(c.maxRowsPerQuery);
        setTablesCsv(c.allowedTables.join(', '));
        setSystemPrompt(c.systemPrompt ?? '');
      }
    } catch {
      toast.error('Failed to load AI configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const dirty = useMemo(() => {
    if (!config) return false;
    return (
      model !== config.model ||
      enabled !== config.enabled ||
      maxRows !== config.maxRowsPerQuery ||
      tablesCsv !== config.allowedTables.join(', ') ||
      systemPrompt !== (config.systemPrompt ?? '') ||
      keyDraft.trim().length > 0
    );
  }, [config, model, enabled, maxRows, tablesCsv, systemPrompt, keyDraft]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        model,
        enabled,
        maxRowsPerQuery: maxRows,
        allowedTables: tablesCsv
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        systemPrompt: systemPrompt.trim() ? systemPrompt.trim() : null,
      };
      if (keyDraft.trim()) payload.apiKey = keyDraft.trim();
      const res = await put('/admin/ai/config', payload);
      if (res.success) {
        toast.success('AI configuration saved');
        setKeyDraft('');
        setShowKeyField(false);
        setConfig(res.data);
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleClearKey = async () => {
    if (!window.confirm('Remove the stored Anthropic API key? The admin AI chat will stop working until a new key is saved.')) {
      return;
    }
    try {
      const res = await put('/admin/ai/config', { apiKey: null });
      if (res.success) {
        toast.success('API key removed');
        setConfig(res.data);
        setKeyDraft('');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to clear key');
    }
  };

  const runTestQuery = async () => {
    try {
      setTestRunning(true);
      setTestError(null);
      setTestResult(null);
      const res = await post('/admin/ai/query', { sql: testSql });
      if (res.success) {
        setTestResult(res.data);
      } else {
        setTestError(res.message || 'Query failed');
      }
    } catch (e) {
      setTestError(e instanceof Error ? e.message : 'Query failed');
    } finally {
      setTestRunning(false);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title={<>AI <span className="italic">Assistant</span></>}
        description="Configure the internal Claude-powered assistant available on admin pages."
      >
        <div className="flex items-center gap-2">
          <Badge variant={config?.enabled ? 'default' : 'secondary'} className="rounded-full">
            <Power className="h-3 w-3 mr-1" />
            {config?.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
          <Badge variant={config?.hasApiKey ? 'default' : 'destructive'} className="rounded-full">
            <KeyRound className="h-3 w-3 mr-1" />
            {config?.hasApiKey ? 'Key set' : 'No key'}
          </Badge>
        </div>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---------- API key ---------- */}
          <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                <KeyRound className="h-4 w-4" /> Anthropic API key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-xs text-neutral-500 leading-relaxed">
                Stored AES-256 encrypted. The raw key is never returned to the browser.
                You can get one at{' '}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  console.anthropic.com
                </a>
                .
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-neutral-500">Current:</span>
                <code className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">
                  {config?.apiKeyMasked ?? 'not set'}
                </code>
              </div>
              {showKeyField ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    placeholder="sk-ant-api..."
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    className="font-mono"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowKeyField(false); setKeyDraft(''); }}
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowKeyField(true)}
                >
                  <Eye className="h-4 w-4 mr-2" /> {config?.hasApiKey ? 'Rotate key' : 'Add key'}
                </Button>
              )}
              {config?.hasApiKey && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={handleClearKey}
                >
                  Remove key
                </Button>
              )}
            </CardContent>
          </Card>

          {/* ---------- Model + toggle ---------- */}
          <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                <Cpu className="h-4 w-4" /> Model &amp; availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(config?.supportedModels ?? ['claude-haiku-4-5', 'claude-sonnet-4-5']).map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  <strong>Haiku</strong> is fast and cheap (best for quick lookups).{' '}
                  <strong>Sonnet</strong> is slower but reasons better over multi-step questions.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-neutral-100 dark:border-neutral-700 p-3">
                <div>
                  <p className="text-sm font-medium">Assistant enabled</p>
                  <p className="text-[11px] text-neutral-400">
                    When off, the admin chat widget returns 503 and is visually disabled.
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </CardContent>
          </Card>

          {/* ---------- DB access ---------- */}
          <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                <Database className="h-4 w-4" /> Database access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                  Only <strong>SELECT</strong> queries are accepted. DDL/DML, multiple
                  statements, `pg_*` and `information_schema` are rejected even if the
                  AI tries them. Every query is capped with <code>LIMIT</code>.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label className="text-xs text-neutral-500">Whitelisted tables (comma-separated)</Label>
                  <Input
                    value={tablesCsv}
                    onChange={(e) => setTablesCsv(e.target.value)}
                    className="font-mono text-xs"
                    placeholder={DEFAULT_TABLES_HINT.join(', ')}
                  />
                  <p className="text-[11px] text-neutral-400">
                    The AI can only issue SELECTs against these tables. Use the Postgres
                    table names (e.g. <code>users</code>, not <code>User</code>).
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-500 flex items-center gap-1">
                    <Rows className="h-3 w-3" /> Max rows per query
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={maxRows}
                    onChange={(e) => setMaxRows(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> System prompt (optional)
                </Label>
                <Textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Leave empty to use the default admin prompt."
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* ---------- Test query ---------- */}
          <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                <Play className="h-4 w-4" /> Test query
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Textarea
                rows={3}
                value={testSql}
                onChange={(e) => setTestSql(e.target.value)}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={runTestQuery}
                disabled={testRunning}
                className="rounded-full"
              >
                {testRunning ? 'Running…' : 'Run SELECT'}
              </Button>
              {testError && (
                <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-200 text-xs p-3 font-mono whitespace-pre-wrap">
                  {testError}
                </div>
              )}
              {testResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>
                      <strong>{testResult.rowCount}</strong> rows
                    </span>
                    <span>{testResult.durationMs}ms</span>
                  </div>
                  <div className="max-h-80 overflow-auto rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <pre className="text-[11px] font-mono p-3 text-neutral-700 dark:text-neutral-300">
                      {JSON.stringify(testResult.rows, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="sticky bottom-4 flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-full shadow-lg"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
};

export default AdminAi;
