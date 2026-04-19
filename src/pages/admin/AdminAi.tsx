import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { get, put } from '@/lib/api';
import { toast } from 'sonner';
import { KeyRound, Cpu, Eye, EyeOff, Power, Trash2 } from 'lucide-react';

interface AdminAiConfig {
  id: string;
  model: string;
  enabled: boolean;
  apiKeyMasked: string | null;
  hasApiKey: boolean;
  supportedModels: string[];
  updatedAt: string;
}

const AdminAi: React.FC = () => {
  const [config, setConfig] = useState<AdminAiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showKeyField, setShowKeyField] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [model, setModel] = useState('claude-haiku-4-5');
  const [enabled, setEnabled] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get('/admin/ai/config');
      if (res.success) {
        const c = res.data as AdminAiConfig;
        setConfig(c);
        setModel(c.model);
        setEnabled(c.enabled);
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
      keyDraft.trim().length > 0
    );
  }, [config, model, enabled, keyDraft]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: Record<string, unknown> = { model, enabled };
      if (keyDraft.trim()) payload.apiKey = keyDraft.trim();
      const res = await put('/admin/ai/config', payload);
      if (res.success) {
        toast.success('Saved');
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

  return (
    <div className="space-y-10">
      <PageHeader
        title={<>AI <span className="italic">Assistant</span></>}
        description="Configure the internal Claude-powered assistant that appears on admin pages."
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
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-48 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          <Skeleton className="h-48 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          {/* ---------- API key ---------- */}
          <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                <KeyRound className="h-4 w-4" /> Anthropic API key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-xs text-neutral-500 leading-relaxed">
                Stored AES-256 encrypted on the backend. The raw key is never returned to the browser.
                Get one at{' '}
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
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Current:</span>
                <code className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setShowKeyField(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> {config?.hasApiKey ? 'Rotate key' : 'Add key'}
                  </Button>
                  {config?.hasApiKey && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 rounded-full"
                      onClick={handleClearKey}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>
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
                  <strong>Haiku</strong> is fast and cheap. <strong>Sonnet</strong> reasons better over multi-step questions.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-neutral-100 dark:border-neutral-700 p-3">
                <div>
                  <p className="text-sm font-medium">Assistant enabled</p>
                  <p className="text-[11px] text-neutral-400">
                    When off, the admin chat widget returns 503 and is hidden on admin pages.
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </CardContent>
          </Card>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Database access (whitelisted tables, row caps and system prompt) is managed on the backend.
          </p>
        </div>
      )}

      <div className="sticky bottom-4 flex justify-end max-w-2xl">
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
